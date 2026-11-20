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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const reverse_payment_dto_1 = require("./dto/reverse-payment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async confirmPayment(req, createPaymentDto) {
        return this.paymentsService.confirmPayment(req.user.sub, createPaymentDto);
    }
    async confirmPartialPayment(req, receivableId, body) {
        return this.paymentsService.confirmPartialPayment(req.user.sub, receivableId, body.amount, body.paymentMethod, body.notes);
    }
    async findAll(req, clientId, loanId, status, startDate, endDate) {
        return this.paymentsService.findAll(req.user.sub, {
            clientId,
            loanId,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    async getSummary(req, startDate, endDate) {
        return this.paymentsService.getPaymentSummary(req.user.sub, {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    async findById(req, id) {
        return this.paymentsService.findById(req.user.sub, id);
    }
    async reversePayment(req, id, reversePaymentDto) {
        return this.paymentsService.reversePayment(req.user.sub, id, reversePaymentDto);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Confirmar pagamento manual' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Post)('partial/:receivableId'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirmar pagamento parcial de um recebível' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('receivableId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmPartialPayment", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar pagamentos' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'loanId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['CONFIRMED', 'PENDING_CONFIRMATION', 'REVERSED', 'PARTIAL'] }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Query)('loanId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter resumo de pagamentos' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter pagamento por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id/reverse'),
    (0, swagger_1.ApiOperation)({ summary: 'Estornar pagamento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reverse_payment_dto_1.ReversePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "reversePayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Pagamentos'),
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map