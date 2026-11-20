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
exports.InterestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
let InterestService = class InterestService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(ownerUserId, createInterestChargeDto) {
        const loan = await this.prisma.loan.findFirst({
            where: { id: createInterestChargeDto.loanId, ownerUserId },
        });
        if (!loan) {
            throw new common_1.NotFoundException('Empréstimo não encontrado');
        }
        if (loan.modality !== 'PERIODIC_INTEREST') {
            throw new common_1.BadRequestException('Cobrança de juros só disponível para empréstimos de juros periódicos');
        }
        const interestCharge = await this.prisma.interestCharge.create({
            data: {
                ...createInterestChargeDto,
                status: client_1.ReceivableStatus.PENDING,
            },
        });
        await this.prisma.receivable.create({
            data: {
                ownerUserId,
                loanId: createInterestChargeDto.loanId,
                clientId: loan.clientId,
                sourceType: client_1.ReceivableSourceType.INTEREST_CHARGE,
                sourceId: interestCharge.id,
                originalAmount: createInterestChargeDto.amountDue,
                amountReceived: 0,
                outstandingAmount: createInterestChargeDto.amountDue,
                dueDate: createInterestChargeDto.dueDate,
                status: client_1.ReceivableStatus.PENDING,
            },
        });
        return this.findById(ownerUserId, interestCharge.id);
    }
    async findAll(ownerUserId, filters) {
        const where = { loan: { ownerUserId } };
        if (filters?.loanId)
            where.loanId = filters.loanId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.startDate || filters?.endDate) {
            where.dueDate = {};
            if (filters.startDate)
                where.dueDate.gte = filters.startDate;
            if (filters.endDate)
                where.dueDate.lte = filters.endDate;
        }
        return this.prisma.interestCharge.findMany({
            where,
            orderBy: { dueDate: 'asc' },
            include: {
                loan: { select: { id: true, modality: true, client: { select: { id: true, fullName: true } } } },
            },
        });
    }
    async findById(ownerUserId, id) {
        const interestCharge = await this.prisma.interestCharge.findFirst({
            where: { id, loan: { ownerUserId } },
            include: {
                loan: { include: { client: true } },
            },
        });
        if (!interestCharge) {
            throw new common_1.NotFoundException('Cobrança de juros não encontrada');
        }
        return interestCharge;
    }
    async update(ownerUserId, id, updateInterestChargeDto) {
        await this.findById(ownerUserId, id);
        const oldCharge = await this.prisma.interestCharge.findUnique({ where: { id } });
        const updated = await this.prisma.interestCharge.update({
            where: { id },
            data: updateInterestChargeDto,
        });
        if (updateInterestChargeDto.amountDue !== undefined && updateInterestChargeDto.amountDue !== Number(oldCharge.amountDue)) {
            await this.prisma.receivable.updateMany({
                where: { sourceId: id, sourceType: client_1.ReceivableSourceType.INTEREST_CHARGE },
                data: {
                    originalAmount: updateInterestChargeDto.amountDue,
                    outstandingAmount: updateInterestChargeDto.amountDue,
                },
            });
        }
        return this.findById(ownerUserId, id);
    }
    async defineManualAmount(ownerUserId, id, amount) {
        return this.update(ownerUserId, id, { amountDue: amount, manuallyDefined: true });
    }
    async generateFutureCharges(ownerUserId, loanId, periods = 12) {
        const loan = await this.prisma.loan.findFirst({
            where: { id: loanId, ownerUserId },
            include: { interestCharges: { orderBy: { dueDate: 'desc' }, take: 1 } },
        });
        if (!loan) {
            throw new common_1.NotFoundException('Empréstimo não encontrado');
        }
        if (loan.modality !== 'PERIODIC_INTEREST') {
            throw new common_1.BadRequestException('Geração de juros futuros só disponível para empréstimos de juros periódicos');
        }
        const lastCharge = loan.interestCharges[0];
        const startDate = lastCharge ? lastCharge.referencePeriod : loan.startDate;
        for (let i = 1; i <= periods; i++) {
            const referencePeriod = this.addPeriod(startDate, loan.paymentFrequency, i);
            const dueDate = this.addPeriod(referencePeriod, loan.paymentFrequency, 1);
            const amountDue = this.calculatePeriodicInterest(loan);
            const existing = await this.prisma.interestCharge.findFirst({
                where: { loanId, referencePeriod },
            });
            if (!existing) {
                const interestCharge = await this.prisma.interestCharge.create({
                    data: {
                        loanId,
                        amountDue,
                        manuallyDefined: false,
                        referencePeriod,
                        dueDate,
                        status: client_1.ReceivableStatus.PENDING,
                    },
                });
                await this.prisma.receivable.create({
                    data: {
                        ownerUserId,
                        loanId,
                        clientId: loan.clientId,
                        sourceType: client_1.ReceivableSourceType.INTEREST_CHARGE,
                        sourceId: interestCharge.id,
                        originalAmount: amountDue,
                        amountReceived: 0,
                        outstandingAmount: amountDue,
                        dueDate,
                        status: client_1.ReceivableStatus.PENDING,
                    },
                });
            }
        }
        return this.findAll(ownerUserId, { loanId });
    }
    calculatePeriodicInterest(loan) {
        const principal = Number(loan.outstandingPrincipal);
        const rate = Number(loan.interestRate);
        switch (loan.calculationMethod) {
            case 'PERCENTAGE':
                return Math.round(principal * rate * 100) / 100;
            case 'FIXED_VALUE':
                return rate;
            case 'MANUAL':
                return 0;
            default:
                return Math.round(principal * rate * 100) / 100;
        }
    }
    addPeriod(date, frequency, periods) {
        const d = new Date(date);
        switch (frequency) {
            case 'DAILY':
                return (0, date_fns_1.addDays)(d, periods);
            case 'WEEKLY':
                return (0, date_fns_1.addDays)(d, periods * 7);
            case 'BIWEEKLY':
                return (0, date_fns_1.addDays)(d, periods * 15);
            case 'MONTHLY':
                return (0, date_fns_1.addMonths)(d, periods);
            case 'QUARTERLY':
                return (0, date_fns_1.addMonths)(d, periods * 3);
            case 'SEMIANNUAL':
                return (0, date_fns_1.addMonths)(d, periods * 6);
            case 'ANNUAL':
                return (0, date_fns_1.addMonths)(d, periods * 12);
            default:
                return (0, date_fns_1.addMonths)(d, periods);
        }
    }
};
exports.InterestService = InterestService;
exports.InterestService = InterestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InterestService);
//# sourceMappingURL=interest.service.js.map