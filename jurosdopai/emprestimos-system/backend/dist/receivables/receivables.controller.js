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
exports.ReceivablesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const receivables_service_1 = require("./receivables.service");
const update_receivable_dto_1 = require("./dto/update-receivable.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ReceivablesController = class ReceivablesController {
    constructor(receivablesService) {
        this.receivablesService = receivablesService;
    }
    async findAll(req, clientId, loanId, status, sourceType, startDate, endDate, overdueOnly) {
        return this.receivablesService.findAll(req.user.sub, {
            clientId,
            loanId,
            status,
            sourceType,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            overdueOnly,
        });
    }
    async getDashboard(req) {
        return this.receivablesService.getFinancialDashboard(req.user.sub);
    }
    async getOverdue(req) {
        return this.receivablesService.getOverdueSummary(req.user.sub);
    }
    async getUpcoming(req, days) {
        return this.receivablesService.getUpcomingDue(req.user.sub, days || 7);
    }
    async findById(req, id) {
        return this.receivablesService.findById(req.user.sub, id);
    }
    async update(req, id, updateReceivableDto) {
        return this.receivablesService.update(req.user.sub, id, updateReceivableDto);
    }
    async updateDueDate(req, id, body) {
        return this.receivablesService.updateDueDate(req.user.sub, id, new Date(body.newDueDate), body.reason);
    }
    async addLateFee(req, id, body) {
        return this.receivablesService.addLateFee(req.user.sub, id, body.feeType, body.calculationMethod, body.amount, new Date(body.referenceDate));
    }
};
exports.ReceivablesController = ReceivablesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar recebíveis' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'loanId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] }),
    (0, swagger_1.ApiQuery)({ name: 'sourceType', required: false, enum: ['INTEREST_CHARGE', 'INSTALLMENT', 'LATE_FEE', 'MANUAL_ADJUSTMENT'] }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'overdueOnly', required: false, type: Boolean }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Query)('loanId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('sourceType')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __param(7, (0, common_1.Query)('overdueOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter dashboard financeiro' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('overdue'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter resumo de recebíveis em atraso' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "getOverdue", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter recebíveis com vencimento próximo' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "getUpcoming", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter recebível por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar recebível' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_receivable_dto_1.UpdateReceivableDto]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/due-date'),
    (0, swagger_1.ApiOperation)({ summary: 'Alterar data de vencimento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "updateDueDate", null);
__decorate([
    Post(':id/late-fee'),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar multa por atraso' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "addLateFee", null);
exports.ReceivablesController = ReceivablesController = __decorate([
    (0, swagger_1.ApiTags)('Recebíveis'),
    (0, common_1.Controller)('receivables'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [receivables_service_1.ReceivablesService])
], ReceivablesController);
//# sourceMappingURL=receivables.controller.js.map