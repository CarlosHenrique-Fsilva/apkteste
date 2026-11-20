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
exports.CreateInterestChargeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateInterestChargeDto {
}
exports.CreateInterestChargeDto = CreateInterestChargeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-do-emprestimo' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInterestChargeDto.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 250.00 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateInterestChargeDto.prototype, "amountDue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInterestChargeDto.prototype, "referencePeriod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-02-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInterestChargeDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateInterestChargeDto.prototype, "manuallyDefined", void 0);
//# sourceMappingURL=create-interest-charge.dto.js.map