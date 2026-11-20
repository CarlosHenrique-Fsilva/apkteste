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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_service_1 = require("./audit.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async findAll(req, entityType, entityId, action, actorUserId, startDate, endDate) {
        return this.auditService.findAll(req.user.sub, {
            entityType,
            entityId,
            action: action,
            actorUserId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    async getStats(req) {
        return this.auditService.getAuditStats(req.user.sub);
    }
    async findByEntity(req, entityType, entityId) {
        return this.auditService.findByEntity(req.user.sub, entityType, entityId);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar logs de auditoria' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'entityId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, enum: ['CREATE', 'UPDATE', 'DELETE', 'CONFIRM_PAYMENT', 'REVERSE_PAYMENT', 'GENERATE_DOCUMENT', 'LOGIN', 'LOGOUT'] }),
    (0, swagger_1.ApiQuery)({ name: 'actorUserId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('entityId')),
    __param(3, (0, common_1.Query)('action')),
    __param(4, (0, common_1.Query)('actorUserId')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Estatísticas de auditoria' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Histórico de auditoria de uma entidade' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findByEntity", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('Auditoria'),
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map