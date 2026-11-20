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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(ownerUserId, data) {
        return this.prisma.notification.create({
            data: {
                ...data,
                ownerUserId,
                status: client_1.NotificationStatus.SCHEDULED,
            },
        });
    }
    async findAll(ownerUserId, filters) {
        const where = { ownerUserId };
        if (filters?.clientId)
            where.clientId = filters.clientId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.unreadOnly)
            where.readAt = null;
        return this.prisma.notification.findMany({
            where,
            orderBy: { scheduledAt: 'desc' },
            include: {
                client: { select: { id: true, fullName: true } },
            },
        });
    }
    async findById(ownerUserId, id) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, ownerUserId },
            include: { client: true },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notificação não encontrada');
        }
        return notification;
    }
    async markAsRead(ownerUserId, id) {
        await this.findById(ownerUserId, id);
        return this.prisma.notification.update({
            where: { id },
            data: { readAt: new Date(), status: client_1.NotificationStatus.READ },
        });
    }
    async markAllAsRead(ownerUserId) {
        return this.prisma.notification.updateMany({
            where: { ownerUserId, readAt: null },
            data: { readAt: new Date(), status: client_1.NotificationStatus.READ },
        });
    }
    async delete(ownerUserId, id) {
        await this.findById(ownerUserId, id);
        return this.prisma.notification.delete({ where: { id } });
    }
    async createDueSoonNotifications(ownerUserId) {
        const upcoming = await this.prisma.receivable.findMany({
            where: {
                ownerUserId,
                status: { in: ['PENDING', 'PARTIAL'] },
                dueDate: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
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
                    notificationType: client_1.NotificationType.DUE_SOON,
                    title: { contains: rec.id },
                    status: { in: [client_1.NotificationStatus.SCHEDULED, client_1.NotificationStatus.SENT] },
                },
            });
            if (!existing) {
                const notification = await this.create(ownerUserId, {
                    clientId: rec.clientId,
                    notificationType: client_1.NotificationType.DUE_SOON,
                    title: `Vencimento próximo: ${rec.sourceType}`,
                    message: `O recebível de R$ ${Number(rec.outstandingAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vence em ${new Date(rec.dueDate).toLocaleDateString('pt-BR')}`,
                    scheduledAt: new Date(),
                });
                notifications.push(notification);
            }
        }
        return notifications;
    }
    async createOverdueNotifications(ownerUserId) {
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
                    notificationType: client_1.NotificationType.OVERDUE,
                    title: { contains: rec.id },
                    status: { in: [client_1.NotificationStatus.SCHEDULED, client_1.NotificationStatus.SENT] },
                },
            });
            if (!existing) {
                const notification = await this.create(ownerUserId, {
                    clientId: rec.clientId,
                    notificationType: client_1.NotificationType.OVERDUE,
                    title: `Em atraso: ${rec.sourceType}`,
                    message: `O recebível de R$ ${Number(rec.outstandingAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} estava com vencimento em ${new Date(rec.dueDate).toLocaleDateString('pt-BR')}`,
                    scheduledAt: new Date(),
                });
                notifications.push(notification);
            }
        }
        return notifications;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map