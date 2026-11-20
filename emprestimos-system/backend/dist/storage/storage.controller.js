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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const storage_service_1 = require("./storage.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const multer_config_1 = require("../config/multer.config");
let StorageController = class StorageController {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async uploadFile(req, file, clientId, loanId, paymentId, documentType = 'ATTACHMENT') {
        if (!file) {
            throw new Error('Nenhum arquivo enviado');
        }
        return this.storageService.uploadFile(req.user.sub, file, {
            clientId,
            loanId,
            paymentId,
            documentType,
        });
    }
    async findAll(req, documentType, clientId, loanId) {
        return this.storageService.findAll(req.user.sub, { documentType, clientId, loanId });
    }
    async getStats(req) {
        return this.storageService.getStorageStats(req.user.sub);
    }
    async download(req, id, res) {
        const file = await this.storageService.getFile(req.user.sub, id);
        res.download(file.path, file.fileName);
    }
    async cleanup(req) {
        return this.storageService.cleanupOrphanFiles(req.user.sub);
    }
    async delete(req, id) {
        return this.storageService.delete(req.user.sub, id);
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload de arquivo' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.multerConfig)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Query)('clientId')),
    __param(3, (0, common_1.Query)('loanId')),
    __param(4, (0, common_1.Query)('paymentId')),
    __param(5, (0, common_1.Query)('documentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof Express !== "undefined" && (_a = Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar arquivos' }),
    (0, swagger_1.ApiQuery)({ name: 'documentType', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'loanId', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('documentType')),
    __param(2, (0, common_1.Query)('clientId')),
    __param(3, (0, common_1.Query)('loanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Estatísticas de armazenamento' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download de arquivo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "download", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, swagger_1.ApiOperation)({ summary: 'Limpar arquivos órfãos' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "cleanup", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir arquivo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "delete", null);
exports.StorageController = StorageController = __decorate([
    (0, swagger_1.ApiTags)('Armazenamento'),
    (0, common_1.Controller)('storage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map