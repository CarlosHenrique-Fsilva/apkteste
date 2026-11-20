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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = require("fs");
const path = require("path");
let StorageService = class StorageService {
    constructor(prisma) {
        this.prisma = prisma;
        this.storagePath = process.env.STORAGE_PATH || '/app/storage';
        this.ensureStorageDirectories();
    }
    ensureStorageDirectories() {
        const dirs = ['contracts', 'receipts', 'settlements', 'reports', 'attachments'];
        for (const dir of dirs) {
            const fullPath = path.join(this.storagePath, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        }
    }
    async uploadFile(ownerUserId, file, metadata) {
        if (metadata.clientId) {
            const client = await this.prisma.client.findFirst({
                where: { id: metadata.clientId, ownerUserId },
            });
            if (!client)
                throw new common_1.ForbiddenException('Cliente não pertence a este usuário');
        }
        if (metadata.loanId) {
            const loan = await this.prisma.loan.findFirst({
                where: { id: metadata.loanId, ownerUserId },
            });
            if (!loan)
                throw new common_1.ForbiddenException('Empréstimo não pertence a este usuário');
        }
        if (metadata.paymentId) {
            const payment = await this.prisma.payment.findFirst({
                where: { id: metadata.paymentId, ownerUserId },
            });
            if (!payment)
                throw new common_1.ForbiddenException('Pagamento não pertence a este usuário');
        }
        const fileName = `${Date.now()}-${file.originalname}`;
        const relativePath = path.join(metadata.documentType.toLowerCase(), fileName);
        const fullPath = path.join(this.storagePath, relativePath);
        fs.writeFileSync(fullPath, file.buffer);
        const document = await this.prisma.document.create({
            data: {
                ownerUserId,
                clientId: metadata.clientId,
                loanId: metadata.loanId,
                paymentId: metadata.paymentId,
                documentType: metadata.documentType,
                fileName,
                storagePath: relativePath,
                mimeType: file.mimetype,
                fileSize: file.size,
            },
        });
        return document;
    }
    async getFile(ownerUserId, documentId) {
        const document = await this.prisma.document.findFirst({
            where: { id: documentId, ownerUserId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Documento não encontrado');
        }
        const fullPath = path.join(this.storagePath, document.storagePath);
        if (!fs.existsSync(fullPath)) {
            throw new common_1.NotFoundException('Arquivo não encontrado no armazenamento');
        }
        return { path: fullPath, fileName: document.fileName, mimeType: document.mimeType };
    }
    async getStorageStats(ownerUserId) {
        const documents = await this.prisma.document.findMany({
            where: { ownerUserId },
            select: { fileSize: true, documentType: true },
        });
        const totalSize = documents.reduce((sum, d) => sum + d.fileSize, 0);
        const byType = documents.reduce((acc, d) => {
            acc[d.documentType] = (acc[d.documentType] || 0) + 1;
            return acc;
        }, {});
        const byTypeSize = documents.reduce((acc, d) => {
            acc[d.documentType] = (acc[d.documentType] || 0) + d.fileSize;
            return acc;
        }, {});
        const { execSync } = require('child_process');
        let diskInfo = { total: 0, free: 0, used: 0 };
        try {
            const df = execSync('df -B1 ' + this.storagePath).toString().split('\n')[1].split(/\s+/);
            diskInfo = { total: parseInt(df[1]), used: parseInt(df[2]), free: parseInt(df[3]) };
        }
        catch (e) {
        }
        return {
            totalDocuments: documents.length,
            totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            byType,
            byTypeSizeMB: Object.fromEntries(Object.entries(byTypeSize).map(([k, v]) => [k, (v / (1024 * 1024)).toFixed(2)])),
            disk: {
                totalGB: (diskInfo.total / (1024 * 1024 * 1024)).toFixed(2),
                usedGB: (diskInfo.used / (1024 * 1024 * 1024)).toFixed(2),
                freeGB: (diskInfo.free / (1024 * 1024 * 1024)).toFixed(2),
                usagePercent: diskInfo.total > 0 ? ((diskInfo.used / diskInfo.total) * 100).toFixed(1) : '0',
            },
        };
    }
    async cleanupOrphanFiles(ownerUserId) {
        const documents = await this.prisma.document.findMany({
            where: { ownerUserId },
            select: { storagePath: true },
        });
        const validPaths = new Set(documents.map(d => d.storagePath));
        let cleaned = 0;
        const dirs = ['contracts', 'receipts', 'settlements', 'reports', 'attachments'];
        for (const dir of dirs) {
            const fullDir = path.join(this.storagePath, dir);
            if (fs.existsSync(fullDir)) {
                const files = fs.readdirSync(fullDir);
                for (const file of files) {
                    const relPath = path.join(dir, file);
                    if (!validPaths.has(relPath)) {
                        fs.unlinkSync(path.join(fullDir, file));
                        cleaned++;
                    }
                }
            }
        }
        return { cleanedFiles: cleaned };
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StorageService);
//# sourceMappingURL=storage.service.js.map