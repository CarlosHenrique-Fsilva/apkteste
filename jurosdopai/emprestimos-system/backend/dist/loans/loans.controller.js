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
exports.LoansController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const loans_service_1 = require("./loans.service");
const create_loan_dto_1 = require("./dto/create-loan.dto");
const update_loan_dto_1 = require("./dto/update-loan.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let LoansController = class LoansController {
    constructor(loansService) {
        this.loansService = loansService;
    }
    async create(req, createLoanDto) {
        return this.loansService.create(req.user.sub, createLoanDto);
    }
    async findAll(req, status, clientId) {
        return this.loansService.findAll(req.user.sub, { status, clientId });
    }
    async findById(req, id) {
        return this.loansService.findById(req.user.sub, id);
    }
    async getLoanSummary(req, id) {
        return this.loansService.getLoanSummary(req.user.sub, id);
    }
    async update(req, id, updateLoanDto) {
        return this.loansService.update(req.user.sub, id, updateLoanDto);
    }
    async applyAmortization(req, id, body) {
        return this.loansService.applyExtraordinaryAmortization(req.user.sub, id, body.amount);
    }
    async delete(req, id) {
        return this.loansService.delete(req.user.sub, id);
    }
};
exports.LoansController = LoansController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo empréstimo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_loan_dto_1.CreateLoanDto]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar empréstimos' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['ACTIVE', 'PAID_OFF', 'OVERDUE', 'RESTRUCTURED', 'CANCELLED'] }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter empréstimo por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(':id/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter resumo financeiro do empréstimo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "getLoanSummary", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar empréstimo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_loan_dto_1.UpdateLoanDto]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/amortization'),
    (0, swagger_1.ApiOperation)({ summary: 'Aplicar amortização extraordinária (juros periódicos)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "applyAmortization", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir empréstimo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "delete", null);
exports.LoansController = LoansController = __decorate([
    (0, swagger_1.ApiTags)('Empréstimos'),
    (0, common_1.Controller)('loans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [loans_service_1.LoansService])
], LoansController);
//# sourceMappingURL=loans.controller.js.map