import { AuditService } from './audit.service';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    findAll(req: any, entityType?: string, entityId?: string, action?: string, actorUserId?: string, startDate?: string, endDate?: string): Promise<({
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
    getStats(req: any): Promise<{
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
    findByEntity(req: any, entityType: string, entityId: string): Promise<({
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
}
