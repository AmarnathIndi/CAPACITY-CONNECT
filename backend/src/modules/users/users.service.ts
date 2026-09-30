import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto, ApproveUserDto, RejectUserDto, BulkImportConfirmDto } from './dto/users.dto';
import { UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skills: { include: { skill: true } },
        certificates: { where: { status: 'VALID' } },
        pointsLedger: true,
        userBadges: { include: { badge: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const totalPoints = user.pointsLedger.reduce((sum, item) => sum + item.points, 0);

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role.toLowerCase(),
      office: user.office,
      region: user.region,
      status: user.status.toLowerCase(),
      designation: user.profile?.designation,
      phone: user.profile?.phone,
      preferredLanguage: user.profile?.preferredLanguage,
      avatarUrl: user.profile?.avatarUrl,
      qualifications: user.profile?.qualifications || [],
      experience: user.profile?.experience || [],
      interests: user.profile?.interests || [],
      skills: user.skills.map((s) => ({
        name: s.skill.name,
        category: s.skill.category,
        level: s.level,
        verified: s.verified,
      })),
      badges: user.userBadges.map((b) => ({
        id: b.badge.id,
        title: b.badge.titleEn,
        icon: b.badge.icon,
      })),
      points: totalPoints,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.name) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fullName: dto.name },
      });
    }

    const updatedProfile = await this.prisma.profile.upsert({
      where: { userId },
      update: {
        designation: dto.designation,
        phone: dto.phone,
        preferredLanguage: dto.preferredLanguage,
        qualifications: dto.qualifications,
        experience: dto.experience,
        interests: dto.interests,
      },
      create: {
        userId,
        designation: dto.designation,
        phone: dto.phone,
        preferredLanguage: dto.preferredLanguage || 'en',
        qualifications: dto.qualifications || [],
        experience: dto.experience || [],
        interests: dto.interests || [],
      },
    });

    // Update skills if provided
    if (dto.skills && Array.isArray(dto.skills)) {
      for (const s of dto.skills) {
        if (!s.name) continue;
        const skill = await this.prisma.skill.upsert({
          where: { name: s.name },
          update: {},
          create: { name: s.name, category: 'Meteorology' },
        });

        await this.prisma.userSkill.upsert({
          where: {
            userId_skillId: {
              userId,
              skillId: skill.id,
            },
          },
          update: { level: s.level || 'Intermediate' },
          create: {
            userId,
            skillId: skill.id,
            level: s.level || 'Intermediate',
            verified: false,
          },
        });
      }
    }

    return { success: true, profile: updatedProfile };
  }

  async getPendingUsers() {
    const pendingUsers = await this.prisma.user.findMany({
      where: { status: UserStatus.PENDING },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    return pendingUsers.map((u) => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      office: u.office,
      requestedRole: u.role.toLowerCase(),
      designation: u.profile?.designation || 'Pending Officer',
      submittedAt: u.createdAt,
    }));
  }

  async approveUser(userId: string, dto: ApproveUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User record not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.APPROVED,
        role: dto.role,
        office: dto.office || user.office,
      },
    });

    return {
      success: true,
      message: `User ${updated.fullName} approved with role ${updated.role}`,
      user: updated,
    };
  }

  async rejectUser(userId: string, dto: RejectUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User record not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.REJECTED,
        rejectionReason: dto.reason,
      },
    });

    return {
      success: true,
      message: `User ${updated.fullName} registration rejected`,
    };
  }

  async getAllUsers(search?: string, role?: string, office?: string, status?: string) {
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      whereClause.role = role.toUpperCase() as UserRole;
    }

    if (office) {
      whereClause.office = office;
    }

    if (status) {
      whereClause.status = status.toUpperCase() as UserStatus;
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      role: u.role.toLowerCase(),
      status: u.status.toLowerCase(),
      office: u.office,
      region: u.region,
      designation: u.profile?.designation,
      createdAt: u.createdAt,
    }));
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true, message: 'User record removed from database' };
  }

  async previewBulkImport(rows: any[]) {
    const preview = [];
    const existingEmails = new Set(
      (await this.prisma.user.findMany({ select: { email: true } })).map((u) => u.email.toLowerCase()),
    );

    const validRoles = ['trainee', 'trainer', 'admin'];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];

      const name = row.name || row['Name'] || row['Full Name'] || '';
      const email = (row.email || row['Email'] || row['Email Address'] || '').toLowerCase().trim();
      const role = (row.role || row['Role'] || 'trainee').toLowerCase().trim();
      const office = row.office || row['Office'] || row['Location'] || 'Delhi HQ';
      const designation = row.designation || row['Designation'] || 'Meteorologist';

      if (!name) errors.push('Missing officer name');
      if (!email || !email.includes('@')) errors.push('Invalid email format');
      if (email && existingEmails.has(email)) errors.push('Email already registered');
      if (!validRoles.includes(role)) errors.push(`Role must be one of: ${validRoles.join(', ')}`);

      preview.push({
        rowNumber: i + 1,
        name,
        email,
        role,
        office,
        designation,
        isValid: errors.length === 0,
        errors,
      });
    }

    return {
      totalRows: preview.length,
      validCount: preview.filter((r) => r.isValid).length,
      invalidCount: preview.filter((r) => !r.isValid).length,
      rows: preview,
    };
  }

  async confirmBulkImport(dto: BulkImportConfirmDto) {
    const defaultPasswordHash = await argon2.hash('imd@123');
    const createdUsers = [];

    await this.prisma.$transaction(async (tx) => {
      for (const u of dto.users) {
        const roleEnum = (u.role.toUpperCase() as UserRole) || UserRole.TRAINEE;

        const user = await tx.user.create({
          data: {
            email: u.email.toLowerCase().trim(),
            passwordHash: defaultPasswordHash,
            fullName: u.name,
            role: roleEnum,
            status: UserStatus.APPROVED,
            office: u.office,
            region: u.office?.includes('Chennai') ? 'South' : u.office?.includes('Guwahati') ? 'North-East' : 'North',
            profile: {
              create: {
                designation: u.designation || 'Meteorologist',
                preferredLanguage: 'en',
              },
            },
          },
        });
        createdUsers.push(user);
      }
    });

    return {
      success: true,
      message: `Successfully imported ${createdUsers.length} staff records. Default password set to 'imd@123'.`,
      importedCount: createdUsers.length,
    };
  }
}
