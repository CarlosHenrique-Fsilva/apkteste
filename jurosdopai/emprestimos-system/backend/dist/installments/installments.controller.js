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
exports.InstallmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const installments_service_1 = require("./installments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let InstallmentsController = class InstallmentsController {
    constructor(installmentsService) {
        this.installmentsService = installmentsService;
    }
    async findAll(req, loanId, status) {
        return this.installmentsService.findAll(req.user.sub, { loanId, status });
    }
    async getLoanInstallmentsSummary(req, loanId) {
        return this.installmentsService.getLoanInstallmentsSummary(req.user.sub, loanId);
    }
    async findById(req, id) {
        return this.installmentsService.findById(req.user.sub, id);
    }
    async updateAmountReceived(req, id, body) {
        return this.installmentsService.updateAmountReceived(req.user.sub, id, body.amountReceived);
    }
};
exports.InstallmentsController = InstallmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar parcelas' }),
    (0, swagger_1.ApiQuery)({ name: 'loanId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('loanId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InstallmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('loan/:loanId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter resumo de parcelas de um empréstimo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('loanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InstallmentsController.prototype, "getLoanInstallmentsSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter parcela por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InstallmentsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id/amount-received'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar valor recebido da parcela' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InstallmentsController.prototype, "updateAmountReceived", null);
exports.InstallmentsController = InstallmentsController = __decorate([
    (0, swagger_1.ApiTags)('Parcelas'),
    (0, common_1.Controller)('installments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [installments_service_1.InstallmentsService])
], InstallmentsController);
//# sourceMappingURL=installments.controller.js.map