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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const documents_service_1 = require("./documents.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async generateContract(req, loanId) {
        return this.documentsService.generateContract(req.user.sub, loanId);
    }
    async generateReceipt(req, paymentId) {
        return this.documentsService.generateReceipt(req.user.sub, paymentId);
    }
    async generateSettlementTerm(req, loanId) {
        return this.documentsService.generateSettlementTerm(req.user.sub, loanId);
    }
    async generateReport(req, type, filters) {
        return this.documentsService.generateReport(req.user.sub, type, filters);
    }
    async findAll(req, documentType, clientId, loanId) {
        return this.documentsService.findAll(req.user.sub, { documentType, clientId, loanId });
    }
    async findById(req, id) {
        return this.documentsService.findById(req.user.sub, id);
    }
    async download(req, id, res) {
        const file = await this.documentsService.getFile(req.user.sub, id);
        res.download(file.path, file.fileName);
    }
    async delete(req, id) {
        return this.documentsService.delete(req.user.sub, id);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('generate/contract/:loanId'),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar contrato de empréstimo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('loanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "generateContract", null);
__decorate([
    (0, common_1.Post)('generate/receipt/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar comprovante de pagamento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "generateReceipt", null);
__decorate([
    (0, common_1.Post)('generate/settlement/:loanId'),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar termo de quitação' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('loanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "generateSettlementTerm", null);
__decorate([
    (0, common_1.Post)('generate/report/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar relatório' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar documentos' }),
    (0, swagger_1.ApiQuery)({ name: 'documentType', required: false, enum: ['CONTRACT', 'RECEIPT', 'SETTLEMENT_TERM', 'REPORT', 'ATTACHMENT'] }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'loanId', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('documentType')),
    __param(2, (0, common_1.Query)('clientId')),
    __param(3, (0, common_1.Query)('loanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter documento por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download do arquivo do documento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "download", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir documento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "delete", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Documentos'),
    (0, common_1.Controller)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map