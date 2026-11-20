"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(ownerUserId, filters) {
        const where = { ownerUserId };
        if (filters?.entityType)
            where.entityType = filters.entityType;
        if (filters?.entityId)
            where.entityId = filters.entityId;
        if (filters?.action)
            where.action = filters.action;
        if (filters?.actorUserId)
            where.actorUserId = filters.actorUserId;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate)
                where.createdAt.gte = filters.startDate;
            if (filters.endDate)
                where.createdAt.lte = filters.endDate;
        }
        return this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 500,
            include: {
                actorUser: { select: { id: true, name: true, email: true } },
                ownerUser: { select: { id: true, name: true } },
            },
        });
    }
    async findByEntity(ownerUserId, entityType, entityId) {
        return this.prisma.auditLog.findMany({
            where: { ownerUserId, entityType, entityId },
            orderBy: { createdAt: 'desc' },
            include: {
                actorUser: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async getAuditStats(ownerUserId) {
        const [totalLogs, byAction, byEntity, recentActivity] = await Promise.all([
            this.prisma.auditLog.count({ where: { ownerUserId } }),
            this.prisma.auditLog.groupBy({ by: ['action'], where: { ownerUserId }, _count: { action: true } }),
            this.prisma.auditLog.groupBy({ by: ['entityType'], where: { ownerUserId }, _count: { entityType: true } }),
            this.prisma.auditLog.findMany({
                where: { ownerUserId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { actorUser: { select: { name: true } } },
            }),
        ]);
        return {
            totalLogs,
            byAction: byAction.map(a => ({ action: a.action, count: a._count.action })),
            byEntity: byEntity.map(e => ({ entityType: e.entityType, count: e._count.entityType })),
            recentActivity,
        };
    }
    async log(ownerUserId, actorUserId, entityType, entityId, action, oldValues, newValues, reason) {
        return this.prisma.auditLog.create({
            data: {
                ownerUserId,
                actorUserId,
                entityType,
                entityId,
                action,
                oldValues,
                newValues,
                reason,
            },
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map