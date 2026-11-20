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
exports.ReceivablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReceivablesService = class ReceivablesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(ownerUserId, filters) {
        const where = { ownerUserId };
        if (filters?.clientId)
            where.clientId = filters.clientId;
        if (filters?.loanId)
            where.loanId = filters.loanId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.sourceType)
            where.sourceType = filters.sourceType;
        if (filters?.overdueOnly) {
            where.status = { in: [client_1.ReceivableStatus.OVERDUE, client_1.ReceivableStatus.PARTIAL] };
            where.dueDate = { lt: new Date() };
        }
        else if (filters?.startDate || filters?.endDate) {
            where.dueDate = {};
            if (filters.startDate)
                where.dueDate.gte = filters.startDate;
            if (filters.endDate)
                where.dueDate.lte = filters.endDate;
        }
        return this.prisma.receivable.findMany({
            where,
            orderBy: { dueDate: 'asc' },
            include: {
                client: { select: { id: true, fullName: true, whatsapp: true } },
                loan: { select: { id: true, modality: true } },
                payments: { include: { payment: true } },
                dueDateChanges: true,
                lateFees: true,
            },
        });
    }
    async findById(ownerUserId, id) {
        const receivable = await this.prisma.receivable.findFirst({
            where: { id, ownerUserId },
            include: {
                client: true,
                loan: true,
                payments: { include: { payment: true } },
                dueDateChanges: true,
                lateFees: true,
            },
        });
        if (!receivable) {
            throw new common_1.NotFoundException('Recebível não encontrado');
        }
        return receivable;
    }
    async update(ownerUserId, id, updateReceivableDto) {
        await this.findById(ownerUserId, id);
        const oldReceivable = await this.prisma.receivable.findUnique({ where: { id } });
        const updated = await this.prisma.receivable.update({
            where: { id },
            data: updateReceivableDto,
        });
        if (updateReceivableDto.dueDate && updateReceivableDto.dueDate !== oldReceivable.dueDate) {
            await this.prisma.dueDateChange.create({
                data: {
                    receivableId: id,
                    previousDueDate: oldReceivable.dueDate,
                    newDueDate: updateReceivableDto.dueDate,
                    reason: updateReceivableDto.dueDateChangeReason || 'Vencimento alterado',
                    changedBy: ownerUserId,
                },
            });
        }
        return this.findById(ownerUserId, id);
    }
    async updateDueDate(ownerUserId, id, newDueDate, reason) {
        return this.update(ownerUserId, id, { dueDate: newDueDate, dueDateChangeReason: reason });
    }
    async addLateFee(ownerUserId, receivableId, feeType, calculationMethod, amount, referenceDate) {
        await this.findById(ownerUserId, receivableId);
        const lateFee = await this.prisma.lateFee.create({
            data: {
                receivableId,
                feeType,
                calculationMethod,
                amount,
                referenceDate,
                status: client_1.ReceivableStatus.PENDING,
            },
        });
        const receivable = await this.prisma.receivable.findUnique({ where: { id: receivableId } });
        await this.prisma.receivable.create({
            data: {
                ownerUserId: receivable.ownerUserId,
                loanId: receivable.loanId,
                clientId: receivable.clientId,
                sourceType: client_1.ReceivableSourceType.LATE_FEE,
                sourceId: lateFee.id,
                originalAmount: amount,
                amountReceived: 0,
                outstandingAmount: amount,
                dueDate: referenceDate,
                status: client_1.ReceivableStatus.PENDING,
            },
        });
        return lateFee;
    }
    async getOverdueSummary(ownerUserId) {
        const overdue = await this.prisma.receivable.findMany({
            where: {
                ownerUserId,
                status: { in: [client_1.ReceivableStatus.OVERDUE, client_1.ReceivableStatus.PARTIAL] },
                dueDate: { lt: new Date() },
            },
            include: {
                client: { select: { id: true, fullName: true, whatsapp: true } },
                loan: { select: { id: true, modality: true } },
            },
        });
        const totalOverdue = overdue.reduce((sum, r) => sum + Number(r.outstandingAmount), 0);
        const byClient = overdue.reduce((acc, r) => {
            const clientId = r.client.id;
            if (!acc[clientId]) {
                acc[clientId] = { client: r.client, amount: 0, count: 0 };
            }
            acc[clientId].amount += Number(r.outstandingAmount);
            acc[clientId].count += 1;
            return acc;
        }, {});
        return {
            totalOverdue,
            count: overdue.length,
            receivables: overdue,
            byClient: Object.values(byClient),
        };
    }
    async getUpcomingDue(ownerUserId, days = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.prisma.receivable.findMany({
            where: {
                ownerUserId,
                status: { in: [client_1.ReceivableStatus.PENDING, client_1.ReceivableStatus.PARTIAL] },
                dueDate: { gte: new Date(), lte: futureDate },
            },
            orderBy: { dueDate: 'asc' },
            include: {
                client: { select: { id: true, fullName: true, whatsapp: true } },
                loan: { select: { id: true, modality: true } },
            },
        });
    }
    async getFinancialDashboard(ownerUserId) {
        const [totalReceivables, totalReceived, totalOutstanding, overdueCount, pendingCount, paidOffLoans, activeLoans] = await Promise.all([
            this.prisma.receivable.aggregate({ where: { ownerUserId }, _sum: { originalAmount: true } }),
            this.prisma.receivable.aggregate({ where: { ownerUserId }, _sum: { amountReceived: true } }),
            this.prisma.receivable.aggregate({ where: { ownerUserId }, _sum: { outstandingAmount: true } }),
            this.prisma.receivable.count({ where: { ownerUserId, status: client_1.ReceivableStatus.OVERDUE } }),
            this.prisma.receivable.count({ where: { ownerUserId, status: client_1.ReceivableStatus.PENDING } }),
            this.prisma.loan.count({ where: { ownerUserId, status: 'PAID_OFF' } }),
            this.prisma.loan.count({ where: { ownerUserId, status: 'ACTIVE' } }),
        ]);
        const upcoming = await this.getUpcomingDue(ownerUserId, 7);
        const overdue = await this.getOverdueSummary(ownerUserId);
        return {
            totalReceivables: Number(totalReceivables._sum.originalAmount || 0),
            totalReceived: Number(totalReceived._sum.amountReceived || 0),
            totalOutstanding: Number(totalOutstanding._sum.outstandingAmount || 0),
            overdueCount,
            pendingCount,
            paidOffLoans,
            activeLoans,
            upcomingDue: upcoming,
            overdueSummary: overdue,
        };
    }
};
exports.ReceivablesService = ReceivablesService;
exports.ReceivablesService = ReceivablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReceivablesService);
//# sourceMappingURL=receivables.service.js.map