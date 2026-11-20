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
exports.LoansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
let LoansService = class LoansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(ownerUserId, createLoanDto) {
        const client = await this.prisma.client.findFirst({
            where: { id: createLoanDto.clientId, ownerUserId },
        });
        if (!client) {
            throw new common_1.NotFoundException('Cliente não encontrado');
        }
        const firstDueDate = this.calculateFirstDueDate(createLoanDto.startDate, createLoanDto.paymentFrequency);
        const loan = await this.prisma.loan.create({
            data: {
                ...createLoanDto,
                ownerUserId,
                outstandingPrincipal: createLoanDto.principalAmount,
                firstDueDate,
            },
            include: {
                client: true,
            },
        });
        await this.generateLoanTerms(loan.id);
        if (loan.modality === client_1.LoanModality.PERIODIC_INTEREST) {
            await this.generateInterestCharges(loan.id);
        }
        else {
            await this.generateInstallments(loan.id);
        }
        await this.createAuditLog(ownerUserId, ownerUserId, 'Loan', loan.id, 'CREATE', null, loan, 'Empréstimo criado');
        return this.findById(ownerUserId, loan.id);
    }
    async findAll(ownerUserId, filters) {
        const where = { ownerUserId };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.clientId) {
            where.clientId = filters.clientId;
        }
        return this.prisma.loan.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                client: { select: { id: true, fullName: true } },
                _count: {
                    select: { interestCharges: true, installments: true, receivables: true },
                },
            },
        });
    }
    async findById(ownerUserId, id) {
        const loan = await this.prisma.loan.findFirst({
            where: { id, ownerUserId },
            include: {
                client: true,
                interestCharges: { orderBy: { dueDate: 'asc' } },
                installments: { orderBy: { installmentNumber: 'asc' } },
                receivables: { orderBy: { dueDate: 'asc' } },
                payments: { orderBy: { receivedAt: 'desc' } },
                terms: true,
            },
        });
        if (!loan) {
            throw new common_1.NotFoundException('Empréstimo não encontrado');
        }
        return loan;
    }
    async update(ownerUserId, id, updateLoanDto) {
        const loan = await this.findById(ownerUserId, id);
        const oldValues = { ...loan };
        const updated = await this.prisma.loan.update({
            where: { id },
            data: updateLoanDto,
        });
        await this.createAuditLog(ownerUserId, ownerUserId, 'Loan', id, 'UPDATE', oldValues, updated, 'Empréstimo atualizado');
        return this.findById(ownerUserId, id);
    }
    async delete(ownerUserId, id) {
        await this.findById(ownerUserId, id);
        await this.prisma.loan.delete({ where: { id } });
        await this.createAuditLog(ownerUserId, ownerUserId, 'Loan', id, 'DELETE', null, null, 'Empréstimo excluído');
        return { message: 'Empréstimo excluído com sucesso' };
    }
    async getLoanSummary(ownerUserId, id) {
        const loan = await this.findById(ownerUserId, id);
        const totalReceivables = loan.receivables.reduce((sum, r) => sum + Number(r.originalAmount), 0);
        const totalReceived = loan.receivables.reduce((sum, r) => sum + Number(r.amountReceived), 0);
        const totalOutstanding = loan.receivables.reduce((sum, r) => sum + Number(r.outstandingAmount), 0);
        const overdueCount = loan.receivables.filter(r => r.status === 'OVERDUE').length;
        const pendingCount = loan.receivables.filter(r => r.status === 'PENDING').length;
        return {
            loan,
            totalReceivables,
            totalReceived,
            totalOutstanding,
            overdueCount,
            pendingCount,
            progressPercentage: totalReceivables > 0 ? (totalReceived / totalReceivables) * 100 : 0,
        };
    }
    calculateFirstDueDate(startDate, frequency) {
        const date = new Date(startDate);
        switch (frequency) {
            case client_1.PaymentFrequency.DAILY:
                return (0, date_fns_1.addDays)(date, 1);
            case client_1.PaymentFrequency.WEEKLY:
                return (0, date_fns_1.addDays)(date, 7);
            case client_1.PaymentFrequency.BIWEEKLY:
                return (0, date_fns_1.addDays)(date, 15);
            case client_1.PaymentFrequency.MONTHLY:
                return (0, date_fns_1.addMonths)(date, 1);
            case client_1.PaymentFrequency.QUARTERLY:
                return (0, date_fns_1.addMonths)(date, 3);
            case client_1.PaymentFrequency.SEMIANNUAL:
                return (0, date_fns_1.addMonths)(date, 6);
            case client_1.PaymentFrequency.ANNUAL:
                return (0, date_fns_1.addMonths)(date, 12);
            default:
                return (0, date_fns_1.addMonths)(date, 1);
        }
    }
    async generateLoanTerms(loanId) {
        const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
        if (!loan)
            return;
        const termsSnapshot = {
            modality: loan.modality,
            principalAmount: loan.principalAmount,
            interestRate: loan.interestRate,
            calculationMethod: loan.calculationMethod,
            paymentFrequency: loan.paymentFrequency,
            startDate: loan.startDate,
            firstDueDate: loan.firstDueDate,
        };
        await this.prisma.loanTerm.create({
            data: {
                loanId,
                principalAmount: loan.principalAmount,
                interestRate: loan.interestRate,
                calculationMethod: loan.calculationMethod,
                termCount: 1,
                termsSnapshot,
            },
        });
    }
    async generateInterestCharges(loanId) {
        const loan = await this.prisma.loan.findUnique({
            where: { id: loanId },
            include: { interestCharges: { orderBy: { dueDate: 'desc' }, take: 1 } },
        });
        if (!loan)
            return;
        const lastCharge = loan.interestCharges[0];
        const startDate = lastCharge ? lastCharge.dueDate : loan.startDate;
        const periodsToGenerate = 12;
        for (let i = 1; i <= periodsToGenerate; i++) {
            const dueDate = this.addPeriod(startDate, loan.paymentFrequency, i);
            const amountDue = this.calculatePeriodicInterest(loan);
            await this.prisma.interestCharge.create({
                data: {
                    loanId,
                    amountDue,
                    manuallyDefined: false,
                    referencePeriod: this.addPeriod(startDate, loan.paymentFrequency, i - 1),
                    dueDate,
                    status: client_1.ReceivableStatus.PENDING,
                },
            });
            await this.prisma.receivable.create({
                data: {
                    ownerUserId: loan.ownerUserId,
                    loanId,
                    clientId: loan.clientId,
                    sourceType: client_1.ReceivableSourceType.INTEREST_CHARGE,
                    sourceId: '',
                    originalAmount: amountDue,
                    amountReceived: 0,
                    outstandingAmount: amountDue,
                    dueDate,
                    status: client_1.ReceivableStatus.PENDING,
                },
            });
        }
    }
    calculatePeriodicInterest(loan) {
        const principal = Number(loan.outstandingPrincipal);
        const rate = Number(loan.interestRate);
        switch (loan.calculationMethod) {
            case 'PERCENTAGE':
                return Math.round(principal * rate * 100) / 100;
            case 'FIXED_VALUE':
                return Number(loan.interestRate);
            case 'MANUAL':
                return 0;
            default:
                return Math.round(principal * rate * 100) / 100;
        }
    }
    async generateInstallments(loanId) {
        const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
        if (!loan)
            return;
        const principal = Number(loan.principalAmount);
        const rate = Number(loan.interestRate);
        const termCount = 12;
        let installments = [];
        switch (loan.calculationMethod) {
            case client_1.LoanCalculationMethod.SIMPLE_INTEREST_ON_INITIAL:
                installments = this.calculateSimpleInterestOnInitial(principal, rate, termCount, loan.firstDueDate, loan.paymentFrequency);
                break;
            case client_1.LoanCalculationMethod.SIMPLE_INTEREST_ON_BALANCE:
                installments = this.calculateSimpleInterestOnBalance(principal, rate, termCount, loan.firstDueDate, loan.paymentFrequency);
                break;
            case client_1.LoanCalculationMethod.PRICE_TABLE:
                installments = this.calculatePriceTable(principal, rate, termCount, loan.firstDueDate, loan.paymentFrequency);
                break;
        }
        for (const inst of installments) {
            const installment = await this.prisma.installment.create({
                data: {
                    loanId,
                    installmentNumber: inst.number,
                    principalComponent: inst.principal,
                    interestComponent: inst.interest,
                    totalAmount: inst.total,
                    dueDate: inst.dueDate,
                    status: client_1.ReceivableStatus.PENDING,
                },
            });
            await this.prisma.receivable.create({
                data: {
                    ownerUserId: loan.ownerUserId,
                    loanId,
                    clientId: loan.clientId,
                    sourceType: client_1.ReceivableSourceType.INSTALLMENT,
                    sourceId: installment.id,
                    originalAmount: inst.total,
                    amountReceived: 0,
                    outstandingAmount: inst.total,
                    dueDate: inst.dueDate,
                    status: client_1.ReceivableStatus.PENDING,
                },
            });
        }
    }
    calculateSimpleInterestOnInitial(principal, rate, terms, firstDueDate, frequency) {
        const totalInterest = principal * rate * terms;
        const principalPerTerm = principal / terms;
        const interestPerTerm = totalInterest / terms;
        const installments = [];
        for (let i = 1; i <= terms; i++) {
            const dueDate = this.addPeriod(firstDueDate, frequency, i - 1);
            installments.push({
                number: i,
                principal: Math.round(principalPerTerm * 100) / 100,
                interest: Math.round(interestPerTerm * 100) / 100,
                total: Math.round((principalPerTerm + interestPerTerm) * 100) / 100,
                dueDate,
            });
        }
        return installments;
    }
    calculateSimpleInterestOnBalance(principal, rate, terms, firstDueDate, frequency) {
        const principalPerTerm = principal / terms;
        const installments = [];
        let remainingBalance = principal;
        for (let i = 1; i <= terms; i++) {
            const interest = remainingBalance * rate;
            const total = principalPerTerm + interest;
            const dueDate = this.addPeriod(firstDueDate, frequency, i - 1);
            installments.push({
                number: i,
                principal: Math.round(principalPerTerm * 100) / 100,
                interest: Math.round(interest * 100) / 100,
                total: Math.round(total * 100) / 100,
                dueDate,
            });
            remainingBalance -= principalPerTerm;
        }
        return installments;
    }
    calculatePriceTable(principal, rate, terms, firstDueDate, frequency) {
        const monthlyRate = rate;
        const factor = Math.pow(1 + monthlyRate, terms);
        const pmt = principal * monthlyRate * factor / (factor - 1);
        const installments = [];
        let remainingBalance = principal;
        for (let i = 1; i <= terms; i++) {
            const interest = remainingBalance * monthlyRate;
            const principalComponent = pmt - interest;
            const dueDate = this.addPeriod(firstDueDate, frequency, i - 1);
            installments.push({
                number: i,
                principal: Math.round(principalComponent * 100) / 100,
                interest: Math.round(interest * 100) / 100,
                total: Math.round(pmt * 100) / 100,
                dueDate,
            });
            remainingBalance -= principalComponent;
        }
        return installments;
    }
    addPeriod(date, frequency, periods) {
        const d = new Date(date);
        switch (frequency) {
            case client_1.PaymentFrequency.DAILY:
                return (0, date_fns_1.addDays)(d, periods);
            case client_1.PaymentFrequency.WEEKLY:
                return (0, date_fns_1.addDays)(d, periods * 7);
            case client_1.PaymentFrequency.BIWEEKLY:
                return (0, date_fns_1.addDays)(d, periods * 15);
            case client_1.PaymentFrequency.MONTHLY:
                return (0, date_fns_1.addMonths)(d, periods);
            case client_1.PaymentFrequency.QUARTERLY:
                return (0, date_fns_1.addMonths)(d, periods * 3);
            case client_1.PaymentFrequency.SEMIANNUAL:
                return (0, date_fns_1.addMonths)(d, periods * 6);
            case client_1.PaymentFrequency.ANNUAL:
                return (0, date_fns_1.addMonths)(d, periods * 12);
            default:
                return (0, date_fns_1.addMonths)(d, periods);
        }
    }
    async applyExtraordinaryAmortization(ownerUserId, loanId, amount) {
        const loan = await this.findById(ownerUserId, loanId);
        if (loan.modality !== client_1.LoanModality.PERIODIC_INTEREST) {
            throw new common_1.BadRequestException('Amortização extraordinária só disponível para juros periódicos');
        }
        if (amount > Number(loan.outstandingPrincipal)) {
            throw new common_1.BadRequestException('Valor de amortização não pode exceder o capital em aberto');
        }
        const newOutstanding = Number(loan.outstandingPrincipal) - amount;
        const updated = await this.prisma.loan.update({
            where: { id: loanId },
            data: { outstandingPrincipal: newOutstanding },
        });
        await this.prisma.interestCharge.deleteMany({
            where: { loanId, status: client_1.ReceivableStatus.PENDING },
        });
        await this.prisma.receivable.deleteMany({
            where: { loanId, sourceType: client_1.ReceivableSourceType.INTEREST_CHARGE, status: client_1.ReceivableStatus.PENDING },
        });
        await this.generateInterestCharges(loanId);
        await this.createAuditLog(ownerUserId, ownerUserId, 'Loan', loanId, 'UPDATE', { outstandingPrincipal: loan.outstandingPrincipal }, { outstandingPrincipal: newOutstanding }, `Amortização extraordinária de R$ ${amount}`);
        return this.findById(ownerUserId, loanId);
    }
    async createAuditLog(ownerUserId, actorUserId, entityType, entityId, action, oldValues, newValues, reason) {
        await this.prisma.auditLog.create({
            data: {
                ownerUserId,
                actorUserId,
                entityType,
                entityId,
                action: action,
                oldValues,
                newValues,
                reason,
            },
        });
    }
};
exports.LoansService = LoansService;
exports.LoansService = LoansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoansService);
//# sourceMappingURL=loans.service.js.map