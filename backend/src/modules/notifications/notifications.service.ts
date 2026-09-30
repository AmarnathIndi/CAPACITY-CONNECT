import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.titleEn,
        titleHi: n.titleHi,
        message: n.bodyEn,
        messageHi: n.bodyHi,
        type: n.type.toLowerCase(),
        read: n.read,
        link: n.linkUrl,
        date: n.createdAt.toISOString().split('T')[0],
      })),
      unreadCount,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return { success: true, notification: updated };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { success: true, message: 'All notifications marked as read' };
  }

  async getAnnouncements() {
    const announcements = await this.prisma.announcement.findMany({
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    });

    return announcements.map((a) => ({
      id: a.id,
      title: a.titleEn,
      titleHi: a.titleHi,
      summary: a.summaryEn,
      summaryHi: a.summaryHi,
      category: a.category,
      date: a.publishedAt.toISOString().split('T')[0],
      isPinned: a.isPinned,
    }));
  }

  async createAnnouncement(dto: {
    titleEn: string;
    titleHi?: string;
    summaryEn: string;
    summaryHi?: string;
    category?: string;
    isPinned?: boolean;
  }) {
    const announcement = await this.prisma.announcement.create({
      data: {
        id: `ann-${Date.now()}`,
        titleEn: dto.titleEn,
        titleHi: dto.titleHi || dto.titleEn,
        summaryEn: dto.summaryEn,
        summaryHi: dto.summaryHi || dto.summaryEn,
        category: dto.category || 'Official Circular',
        isPinned: !!dto.isPinned,
      },
    });

    return { success: true, announcement };
  }
}
