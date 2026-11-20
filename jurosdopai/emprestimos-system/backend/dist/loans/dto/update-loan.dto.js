"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLoanDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_loan_dto_1 = require("./create-loan.dto");
class UpdateLoanDto extends (0, swagger_1.PartialType)(create_loan_dto_1.CreateLoanDto) {
}
exports.UpdateLoanDto = UpdateLoanDto;
//# sourceMappingURL=update-loan.dto.js.map