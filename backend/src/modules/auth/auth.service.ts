import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as argon2 from 'argon2';
import { authenticator } from 'otplib';
import { LoginDto, SignUpDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email credentials or account does not exist');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(
        `Account temporarily locked due to repeated failed login attempts. Please retry after ${waitMinutes} minutes.`,
      );
    }

    // Verify Argon2 password hash
    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = failedAttempts >= 5;
      const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      if (shouldLock) {
        throw new ForbiddenException(
          'Account locked for 15 minutes due to 5 consecutive failed login attempts.',
        );
      }

      throw new UnauthorizedException(
        `Invalid password credentials. ${5 - failedAttempts} attempts remaining before account lockout.`,
      );
    }

    // Check Approval Status
    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException(
        'Your registration is currently pending clearance by an IMD Administrator.',
      );
    }

    if (user.status === UserStatus.REJECTED) {
      throw new ForbiddenException(
        `Account access denied. Reason: ${user.rejectionReason || 'Security screening non-compliance'}`,
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Account access has been administratively suspended.');
    }

    // 2FA Verification for Admin or accounts with 2FA enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!dto.totpCode) {
        return {
          requires2FA: true,
          message: 'Two-factor authentication code required',
        };
      }
      const is2FAValid = authenticator.verify({
        token: dto.totpCode,
        secret: user.twoFactorSecret,
      });
      if (!is2FAValid) {
        throw new UnauthorizedException('Invalid 2FA TOTP code');
      }
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    // Issue Tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role.toLowerCase(),
        office: user.office,
        status: user.status.toLowerCase(),
        designation: user.profile?.designation,
        avatarUrl: user.profile?.avatarUrl,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      ...tokens,
    };
  }

  async signup(dto: SignUpDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new BadRequestException('An account with this official email address already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        fullName: dto.name,
        role: UserRole.TRAINEE,
        status: UserStatus.PENDING,
        office: dto.office || 'Delhi HQ',
        region: dto.office?.includes('Chennai') ? 'South' : dto.office?.includes('Guwahati') ? 'North-East' : 'North',
        profile: {
          create: {
            designation: dto.designation || 'Trainee Officer',
            preferredLanguage: 'en',
          },
        },
      },
      include: { profile: true },
    });

    return {
      message: 'Registration successful! Your account has been placed in the IMD Administrator verification queue.',
      userId: newUser.id,
      status: 'pending',
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'IMD_Super_Secret_Jwt_Refresh_Key_Minimum_32_Chars_2026!',
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.status !== UserStatus.APPROVED) {
        throw new UnauthorizedException('User session revoked or status invalid');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      // Return success anyway to avoid user enumeration attacks
      return { message: 'If an account is associated with this email, a reset link has been dispatched.' };
    }

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'password_reset' },
      { expiresIn: '30m', secret: process.env.JWT_ACCESS_SECRET || 'IMD_Super_Secret_Jwt_Access_Key_Minimum_32_Chars_2026!' },
    );

    return {
      message: 'Password reset token generated successfully. In production, this link is sent to the official IMD email.',
      resetToken, // Returned in prototype for quick testing
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token, {
        secret: process.env.JWT_ACCESS_SECRET || 'IMD_Super_Secret_Jwt_Access_Key_Minimum_32_Chars_2026!',
      });

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid token purpose');
      }

      const passwordHash = await argon2.hash(dto.newPassword);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
      });

      return { message: 'Password has been successfully updated. You may now log in.' };
    } catch {
      throw new BadRequestException('Password reset link is expired or invalid');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User record not found');
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.oldPassword);
    if (!isMatch) {
      throw new BadRequestException('Current password does not match records');
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  }

  async setup2FA(userId: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri('IMD-Officer', 'IMD-Capacity-Connect', secret);

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return {
      secret,
      otpauth,
      message: 'Scan the OTP QR code or enter secret into your government authenticator application.',
    };
  }

  async verify2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA setup was not initiated');
    }

    const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
    if (!isValid) {
      throw new BadRequestException('Invalid TOTP verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { success: true, message: '2FA has been successfully activated on your account.' };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      office: user.office,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_ACCESS_SECRET || 'IMD_Super_Secret_Jwt_Access_Key_Minimum_32_Chars_2026!',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'IMD_Super_Secret_Jwt_Refresh_Key_Minimum_32_Chars_2026!',
    });

    return { accessToken, refreshToken };
  }
}
