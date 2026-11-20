import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(ownerUserId: string, filters?: {
        entityType?: string;
        entityId?: string;
        action?: string;
        actorUserId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<({
        ownerUser: {
            id: string;
            name: string;
        };
        actorUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ownerUserId: string;
        entityType: string;
        entityId: string;
        action: import(".prisma/client").$Enums.AuditAction;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue | null;
        reason: string | null;
        actorUserId: string;
    })[]>;
    findByEntity(ownerUserId: string, entityType: string, entityId: string): Promise<({
        actorUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ownerUserId: string;
        entityType: string;
        entityId: string;
        action: import(".prisma/client").$Enums.AuditAction;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue | null;
        reason: string | null;
        actorUserId: string;
    })[]>;
    getAuditStats(ownerUserId: string): Promise<{
        totalLogs: number;
        byAction: {
            action: import(".prisma/client").$Enums.AuditAction;
            count: number;
        }[];
        byEntity: {
            entityType: string;
            count: number;
        }[];
        recentActivity: ({
            actorUser: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            ownerUserId: string;
            entityType: string;
            entityId: string;
            action: import(".prisma/client").$Enums.AuditAction;
            oldValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue | null;
            reason: string | null;
            actorUserId: string;
        })[];
    }>;
    log(ownerUserId: string, actorUserId: string, entityType: string, entityId: string, action: AuditAction, oldValues?: any, newValues?: any, reason?: string): Promise<{
        id: string;
        createdAt: Date;
        ownerUserId: string;
        entityType: string;
        entityId: string;
        action: import(".prisma/client").$Enums.AuditAction;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue | null;
        reason: string | null;
        actorUserId: string;
    }>;
}
