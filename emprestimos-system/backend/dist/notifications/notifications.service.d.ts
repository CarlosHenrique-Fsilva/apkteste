import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(ownerUserId: string, data: {
        clientId?: string;
        notificationType: NotificationType;
        title: string;
        message: string;
        scheduledAt: Date;
    }): Promise<{
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
    findAll(ownerUserId: string, filters?: {
        clientId?: string;
        status?: string;
        unreadOnly?: boolean;
    }): Promise<({
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
    findById(ownerUserId: string, id: string): Promise<{
        client: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            whatsapp: string | null;
            notes: string | null;
            administrativeStatus: import(".prisma/client").$Enums.ClientAdministrativeStatus;
            archivedAt: Date | null;
            ownerUserId: string;
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
    }>;
    markAsRead(ownerUserId: string, id: string): Promise<{
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
    markAllAsRead(ownerUserId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    delete(ownerUserId: string, id: string): Promise<{
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
    createDueSoonNotifications(ownerUserId: string): Promise<{
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
    createOverdueNotifications(ownerUserId: string): Promise<{
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
}
