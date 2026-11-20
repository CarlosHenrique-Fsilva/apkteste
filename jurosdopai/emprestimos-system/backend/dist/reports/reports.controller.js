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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getFinancialReport(req, startDate, endDate) {
        return this.reportsService.getFinancialReport(req.user.sub, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async getClientsReport(req) {
        return this.reportsService.getClientsReport(req.user.sub);
    }
    async getLoansReport(req) {
        return this.reportsService.getLoansReport(req.user.sub);
    }
    async getReceivablesReport(req, status, overdueOnly) {
        return this.reportsService.getReceivablesReport(req.user.sub, { status, overdueOnly });
    }
    async getPaymentsReport(req, startDate, endDate) {
        return this.reportsService.getPaymentsReport(req.user.sub, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async getAgingReport(req) {
        return this.reportsService.getAgingReport(req.user.sub);
    }
    async exportCSV(req, type, res) {
        const csv = await this.reportsService.exportToCSV(req.user.sub, type);
        const fileName = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send('﻿' + csv);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('financial'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório financeiro consolidado' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getFinancialReport", null);
__decorate([
    (0, common_1.Get)('clients'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório de clientes' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getClientsReport", null);
__decorate([
    (0, common_1.Get)('loans'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório de empréstimos' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getLoansReport", null);
__decorate([
    (0, common_1.Get)('receivables'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório de recebíveis' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] }),
    (0, swagger_1.ApiQuery)({ name: 'overdueOnly', required: false, type: Boolean }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('overdueOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReceivablesReport", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório de pagamentos' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPaymentsReport", null);
__decorate([
    (0, common_1.Get)('aging'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório de envelhecimento de recebíveis' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAgingReport", null);
__decorate([
    (0, common_1.Get)('export/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar relatório em CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, Param('type')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportCSV", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Relatórios'),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map