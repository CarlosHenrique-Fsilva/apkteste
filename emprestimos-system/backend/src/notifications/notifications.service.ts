import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerUserId: string, data: {
    clientId?: string;
    notificationType: NotificationType;
    title: string;
    message: string;
    scheduledAt: Date;
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
        ownerUserId,
        status: NotificationStatus.SCHEDULED,
      },
    });
  }

  async findAll(ownerUserId: string, filters?: { clientId?: string; status?: string; unreadOnly?: boolean }) {
    const where: any = { ownerUserId };
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.status) where.status = filters.status;
    if (filters?.unreadOnly) where.readAt = null;

    return this.prisma.notification.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      include: {
        client: { select: { id: true, fullName: true } },
      },
    });
  }

  async findById(ownerUserId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, ownerUserId },
      include: { client: true },
    });
    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }
    return notification;
  }

  async markAsRead(ownerUserId: string, id: string) {
    await this.findById(ownerUserId, id);
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date(), status: NotificationStatus.READ },
    });
  }

  async markAllAsRead(ownerUserId: string) {
    return this.prisma.notification.updateMany({
      where: { ownerUserId, readAt: null },
      data: { readAt: new Date(), status: NotificationStatus.READ },
    });
  }

  async delete(ownerUserId: string, id: string) {
    await this.findById(ownerUserId, id);
    return this.prisma.notification.delete({ where: { id } });
  }

  // Create notifications for upcoming due dates
  async createDueSoonNotifications(ownerUserId: string) {
    const upcoming = await this.prisma.receivable.findMany({
      where: {
        ownerUserId,
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        },
      },
      include: { client: true, loan: true },
    });

    const notifications = [];
    for (const rec of upcoming) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          ownerUserId,
          clientId: rec.clientId,
          notificationType: NotificationType.DUE_SOON,
          title: { contains: rec.id },
          status: { in: [NotificationStatus.SCHEDULED, NotificationStatus.SENT] },
        },
      });

      if (!existing) {
        const notification = await this.create(ownerUserId, {
          clientId: rec.clientId,
          notificationType: NotificationType.DUE_SOON,
          title: `Vencimento próximo: ${rec.sourceType}`,
          message: `O recebível de R$ ${Number(rec.outstandingAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vence em ${new Date(rec.dueDate).toLocaleDateString('pt-BR')}`,
          scheduledAt: new Date(),
        });
        notifications.push(notification);
      }
    }

    return notifications;
  }

  // Create notifications for overdue receivables
  async createOverdueNotifications(ownerUserId: string) {
    const overdue = await this.prisma.receivable.findMany({
      where: {
        ownerUserId,
        status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
        dueDate: { lt: new Date() },
      },
      include: { client: true, loan: true },
    });

    const notifications = [];
    for (const rec of overdue) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          ownerUserId,
          clientId: rec.clientId,
          notificationType: NotificationType.OVERDUE,
          title: { contains: rec.id },
          status: { in: [NotificationStatus.SCHEDULED, NotificationStatus.SENT] },
        },
      });

      if (!existing) {
        const notification = await this.create(ownerUserId, {
          clientId: rec.clientId,
          notificationType: NotificationType.OVERDUE,
          title: `Em atraso: ${rec.sourceType}`,
          message: `O recebível de R$ ${Number(rec.outstandingAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} estava com vencimento em ${new Date(rec.dueDate).toLocaleDateString('pt-BR')}`,
          scheduledAt: new Date(),
        });
        notifications.push(notification);
      }
    }

    return notifications;
  }
}