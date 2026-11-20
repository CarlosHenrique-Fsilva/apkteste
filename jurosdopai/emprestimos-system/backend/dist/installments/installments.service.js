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
exports.InstallmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let InstallmentsService = class InstallmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(ownerUserId, filters) {
        const where = { loan: { ownerUserId } };
        if (filters?.loanId)
            where.loanId = filters.loanId;
        if (filters?.status)
            where.status = filters.status;
        return this.prisma.installment.findMany({
            where,
            orderBy: { installmentNumber: 'asc' },
            include: {
                loan: { select: { id: true, modality: true, client: { select: { id: true, fullName: true } } } },
            },
        });
    }
    async findById(ownerUserId, id) {
        const installment = await this.prisma.installment.findFirst({
            where: { id, loan: { ownerUserId } },
            include: {
                loan: { include: { client: true } },
            },
        });
        if (!installment) {
            throw new common_1.NotFoundException('Parcela não encontrada');
        }
        return installment;
    }
    async updateAmountReceived(ownerUserId, id, amountReceived) {
        const installment = await this.findById(ownerUserId, id);
        const newAmountReceived = Number(installment.amountReceived) + amountReceived;
        const totalAmount = Number(installment.totalAmount);
        if (newAmountReceived > totalAmount) {
            throw new Error('Valor recebido não pode exceder o total da parcela');
        }
        const newStatus = newAmountReceived >= totalAmount ? client_1.ReceivableStatus.PAID :
            newAmountReceived > 0 ? client_1.ReceivableStatus.PARTIAL : client_1.ReceivableStatus.PENDING;
        const updated = await this.prisma.installment.update({
            where: { id },
            data: { amountReceived: newAmountReceived, status: newStatus },
        });
        await this.prisma.receivable.updateMany({
            where: { sourceId: id, sourceType: client_1.ReceivableSourceType.INSTALLMENT },
            data: { amountReceived: newAmountReceived, outstandingAmount: totalAmount - newAmountReceived, status: newStatus },
        });
        return updated;
    }
    async getLoanInstallmentsSummary(ownerUserId, loanId) {
        const installments = await this.findAll(ownerUserId, { loanId });
        const totalAmount = installments.reduce((sum, i) => sum + Number(i.totalAmount), 0);
        const totalReceived = installments.reduce((sum, i) => sum + Number(i.amountReceived), 0);
        const totalOutstanding = totalAmount - totalReceived;
        const paidCount = installments.filter(i => i.status === 'PAID').length;
        const partialCount = installments.filter(i => i.status === 'PARTIAL').length;
        const pendingCount = installments.filter(i => i.status === 'PENDING').length;
        const overdueCount = installments.filter(i => i.status === 'OVERDUE').length;
        return {
            installments,
            totalAmount,
            totalReceived,
            totalOutstanding,
            paidCount,
            partialCount,
            pendingCount,
            overdueCount,
            progressPercentage: totalAmount > 0 ? (totalReceived / totalAmount) * 100 : 0,
        };
    }
};
exports.InstallmentsService = InstallmentsService;
exports.InstallmentsService = InstallmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InstallmentsService);
//# sourceMappingURL=installments.service.js.map