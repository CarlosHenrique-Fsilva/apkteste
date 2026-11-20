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
exports.InterestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const interest_service_1 = require("./interest.service");
const create_interest_charge_dto_1 = require("./dto/create-interest-charge.dto");
const update_interest_charge_dto_1 = require("./dto/update-interest-charge.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let InterestController = class InterestController {
    constructor(interestService) {
        this.interestService = interestService;
    }
    async create(req, createInterestChargeDto) {
        return this.interestService.create(req.user.sub, createInterestChargeDto);
    }
    async findAll(req, loanId, status, startDate, endDate) {
        return this.interestService.findAll(req.user.sub, {
            loanId,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    async findById(req, id) {
        return this.interestService.findById(req.user.sub, id);
    }
    async update(req, id, updateInterestChargeDto) {
        return this.interestService.update(req.user.sub, id, updateInterestChargeDto);
    }
    async defineManualAmount(req, id, body) {
        return this.interestService.defineManualAmount(req.user.sub, id, body.amount);
    }
    async generateFutureCharges(req, loanId, periods) {
        return this.interestService.generateFutureCharges(req.user.sub, loanId, periods || 12);
    }
};
exports.InterestController = InterestController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar cobrança de juros manual' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_interest_charge_dto_1.CreateInterestChargeDto]),
    __metadata("design:returntype", Promise)
], InterestController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar cobranças de juros' }),
    (0, swagger_1.ApiQuery)({ name: 'loanId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('loanId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InterestController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter cobrança de juros por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InterestController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar cobrança de juros' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_interest_charge_dto_1.UpdateInterestChargeDto]),
    __metadata("design:returntype", Promise)
], InterestController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/manual-amount'),
    (0, swagger_1.ApiOperation)({ summary: 'Definir valor manual de juros' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InterestController.prototype, "defineManualAmount", null);
__decorate([
    (0, common_1.Post)('generate-future/:loanId'),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar cobranças de juros futuras' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('loanId')),
    __param(2, (0, common_1.Query)('periods')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], InterestController.prototype, "generateFutureCharges", null);
exports.InterestController = InterestController = __decorate([
    (0, swagger_1.ApiTags)('Juros'),
    (0, common_1.Controller)('interest'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [interest_service_1.InterestService])
], InterestController);
//# sourceMappingURL=interest.controller.js.map