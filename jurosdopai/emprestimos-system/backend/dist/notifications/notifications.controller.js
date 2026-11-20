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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsController = class NotificationsController {
    constructor(notificationsService, prisma) {
        this.notificationsService = notificationsService;
        this.prisma = prisma;
    }
    async findAll(req, clientId, status, unreadOnly) {
        return this.notificationsService.findAll(req.user.sub, { clientId, status, unreadOnly });
    }
    async getUnreadCount(req) {
        const count = await this.prisma.notification.count({
            where: { ownerUserId: req.user.sub, readAt: null },
        });
        return { count };
    }
    async markAsRead(req, id) {
        return this.notificationsService.markAsRead(req.user.sub, id);
    }
    async markAllAsRead(req) {
        return this.notificationsService.markAllAsRead(req.user.sub);
    }
    async generateDueSoon(req) {
        return this.notificationsService.createDueSoonNotifications(req.user.sub);
    }
    async generateOverdue(req) {
        return this.notificationsService.createOverdueNotifications(req.user.sub);
    }
    async delete(req, id) {
        return this.notificationsService.delete(req.user.sub, id);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar notificações' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['SCHEDULED', 'SENT', 'READ', 'FAILED'] }),
    (0, swagger_1.ApiQuery)({ name: 'unreadOnly', required: false, type: Boolean }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('unreadOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Contar notificações não lidas' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Put)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar notificação como lida' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Put)('read-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar todas as notificações como lidas' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    Post('generate/due-soon'),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar notificações de vencimento próximo' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "generateDueSoon", null);
__decorate([
    Post('generate/overdue'),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar notificações de atraso' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "generateOverdue", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir notificação' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "delete", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notificações'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        prisma_service_1.PrismaService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map