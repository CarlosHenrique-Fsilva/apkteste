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
exports.CreateLoanDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateLoanDto {
}
exports.CreateLoanDto = CreateLoanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-do-cliente' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.LoanModality, example: client_1.LoanModality.PERIODIC_INTEREST }),
    (0, class_validator_1.IsEnum)(client_1.LoanModality),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "modality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000.00 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.05, description: 'Taxa de juros (ex: 0.05 para 5%)' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.LoanCalculationMethod, example: client_1.LoanCalculationMethod.SIMPLE_INTEREST_ON_INITIAL }),
    (0, class_validator_1.IsEnum)(client_1.LoanCalculationMethod),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "calculationMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentFrequency, example: client_1.PaymentFrequency.MONTHLY }),
    (0, class_validator_1.IsEnum)(client_1.PaymentFrequency),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "paymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Empréstimo para capital de giro' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    MaxLength(500),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "notes", void 0);
//# sourceMappingURL=create-loan.dto.js.map