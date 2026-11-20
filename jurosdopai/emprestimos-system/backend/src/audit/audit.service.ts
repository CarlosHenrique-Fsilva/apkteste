import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(ownerUserId: string, filters?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    actorUserId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { ownerUserId };
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.entityId) where.entityId = filters.entityId;
    if (filters?.action) where.action = filters.action;
    if (filters?.actorUserId) where.actorUserId = filters.actorUserId;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
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

  async findByEntity(ownerUserId: string, entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { ownerUserId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
      include: {
        actorUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getAuditStats(ownerUserId: string) {
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

  // Method to be called by other services for audit logging
  async log(ownerUserId: string, actorUserId: string, entityType: string, entityId: string, action: AuditAction, oldValues?: any, newValues?: any, reason?: string) {
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
}