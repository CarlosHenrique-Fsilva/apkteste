import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsController {
    private notificationsService;
    private prisma;
    constructor(notificationsService: NotificationsService, prisma: PrismaService);
    findAll(req: any, clientId?: string, status?: string, unreadOnly?: boolean): Promise<({
        client: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        createdAt: Date;
        title: string;
        ownerUserId: string;
        clientId: string | null;
        notificationType: import(".prisma/client").$Enums.NotificationType;
        message: string;
        scheduledAt: Date;
        sentAt: Date | null;
        readAt: Date | null;
    })[]>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(req: any, id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        createdAt: Date;
        title: string;
        ownerUserId: string;
        clientId: string | null;
        notificationType: import(".prisma/client").$Enums.NotificationType;
        message: string;
        scheduledAt: Date;
        sentAt: Date | null;
        readAt: Date | null;
    }>;
    markAllAsRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    generateDueSoon(req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        createdAt: Date;
        title: string;
        ownerUserId: string;
        clientId: string | null;
        notificationType: import(".prisma/client").$Enums.NotificationType;
        message: string;
        scheduledAt: Date;
        sentAt: Date | null;
        readAt: Date | null;
    }[]>;
    generateOverdue(req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        createdAt: Date;
        title: string;
        ownerUserId: string;
        clientId: string | null;
        notificationType: import(".prisma/client").$Enums.NotificationType;
        message: string;
        scheduledAt: Date;
        sentAt: Date | null;
        readAt: Date | null;
    }[]>;
    delete(req: any, id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        createdAt: Date;
        title: string;
        ownerUserId: string;
        clientId: string | null;
        notificationType: import(".prisma/client").$Enums.NotificationType;
        message: string;
        scheduledAt: Date;
        sentAt: Date | null;
        readAt: Date | null;
    }>;
}
