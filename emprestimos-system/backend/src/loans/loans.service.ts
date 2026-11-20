import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Prisma, LoanModality, LoanCalculationMethod, PaymentFrequency, LoanStatus, ReceivableSourceType, ReceivableStatus } from '@prisma/client';
import { addDays, addMonths, differenceInDays } from 'date-fns';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(ownerUserId: string, createLoanDto: CreateLoanDto) {
    // Verify client belongs to user
    const client = await this.prisma.client.findFirst({
      where: { id: createLoanDto.clientId, ownerUserId },
    });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Calculate first due date based on payment frequency
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

    // Generate initial terms snapshot
    await this.generateLoanTerms(loan.id);

    // Generate initial receivables based on modality
    if (loan.modality === LoanModality.PERIODIC_INTEREST) {
      await this.generateInterestCharges(loan.id);
    } else {
      await this.generateInstallments(loan.id);
    }

    // Create audit log
    await this.createAuditLog(ownerUserId, ownerUserId, 'Loan', loan.id, 'CREATE', null, loan, 'Empréstimo criado');

    return this.findById(ownerUserId, loan.id);
  }

  async findAll(ownerUserId: string, filters?: { status?: string; clientId?: string }) {
    const where: any = { ownerUserId };
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

  async findById(ownerUserId: string, id: string) {
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
      throw new NotFoundException('Empréstimo não encontrado');
    }
    return loan;
  }

  async update(ownerUserId: string, id: string, updateLoanDto: UpdateLoanDto) {
    const loan = await this.findById(ownerUserId, id);
    const oldValues = { ...loan };

    const updated = await this.prisma.loan.update({
      where: { id },
      data: updateLoanDto,
    });

    await this.createAuditLog(ownerUserId, ownerUserId, 'Loan', id, 'UPDATE', oldValues, updated, 'Empréstimo atualizado');

    return this.findById(ownerUserId, id);
  }

  async delete(ownerUserId: string, id: string) {
    await this.findById(ownerUserId, id);
    await this.prisma.loan.delete({ where: { id } });
    await this.createAuditLog(ownerUserId, ownerUserId, 'Loan', id, 'DELETE', null, null, 'Empréstimo excluído');
    return { message: 'Empréstimo excluído com sucesso' };
  }

  async getLoanSummary(ownerUserId: string, id: string) {
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

  // ============ FINANCIAL CALCULATIONS ============

  private calculateFirstDueDate(startDate: Date | string, frequency: PaymentFrequency): Date {
    const date = new Date(startDate);
    switch (frequency) {
      case PaymentFrequency.DAILY:
        return addDays(date, 1);
      case PaymentFrequency.WEEKLY:
        return addDays(date, 7);
      case PaymentFrequency.BIWEEKLY:
        return addDays(date, 15);
      case PaymentFrequency.MONTHLY:
        return addMonths(date, 1);
      case PaymentFrequency.QUARTERLY:
        return addMonths(date, 3);
      case PaymentFrequency.SEMIANNUAL:
        return addMonths(date, 6);
      case PaymentFrequency.ANNUAL:
        return addMonths(date, 12);
      default:
        return addMonths(date, 1);
    }
  }

  private async generateLoanTerms(loanId: string) {
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) return;

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

  // ============ MODALIDADE 1: JUROS PERIÓDICOS COM CAPITAL PRESERVADO ============

  private async generateInterestCharges(loanId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: { interestCharges: { orderBy: { dueDate: 'desc' }, take: 1 } },
    });
    if (!loan) return;

    const lastCharge = loan.interestCharges[0];
    const startDate = lastCharge ? lastCharge.dueDate : loan.startDate;
    const periodsToGenerate = 12; // Generate 12 periods ahead

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
          status: ReceivableStatus.PENDING,
        },
      });

      // Create corresponding receivable
      await this.prisma.receivable.create({
        data: {
          ownerUserId: loan.ownerUserId,
          loanId,
          clientId: loan.clientId,
          sourceType: ReceivableSourceType.INTEREST_CHARGE,
          sourceId: '', // Will be updated after interestCharge creation
          originalAmount: amountDue,
          amountReceived: 0,
          outstandingAmount: amountDue,
          dueDate,
          status: ReceivableStatus.PENDING,
        },
      });
    }
  }

  private calculatePeriodicInterest(loan: any): number {
    const principal = Number(loan.outstandingPrincipal);
    const rate = Number(loan.interestRate);

    switch (loan.calculationMethod) {
      case 'PERCENTAGE':
        return Math.round(principal * rate * 100) / 100;
      case 'FIXED_VALUE':
        return Number(loan.interestRate); // In this case, interestRate stores the fixed value
      case 'MANUAL':
        return 0; // Will be defined manually
      default:
        return Math.round(principal * rate * 100) / 100;
    }
  }

  // ============ MODALIDADE 2: EMPRÉSTIMO PARCELADO ============

  private async generateInstallments(loanId: string) {
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) return;

    const principal = Number(loan.principalAmount);
    const rate = Number(loan.interestRate);
    const termCount = 12; // Default 12 installments, could be configurable

    let installments: any[] = [];

    switch (loan.calculationMethod) {
      case LoanCalculationMethod.SIMPLE_INTEREST_ON_INITIAL:
        installments = this.calculateSimpleInterestOnInitial(principal, rate, termCount, loan.firstDueDate, loan.paymentFrequency);
        break;
      case LoanCalculationMethod.SIMPLE_INTEREST_ON_BALANCE:
        installments = this.calculateSimpleInterestOnBalance(principal, rate, termCount, loan.firstDueDate, loan.paymentFrequency);
        break;
      case LoanCalculationMethod.PRICE_TABLE:
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
          status: ReceivableStatus.PENDING,
        },
      });

      await this.prisma.receivable.create({
        data: {
          ownerUserId: loan.ownerUserId,
          loanId,
          clientId: loan.clientId,
          sourceType: ReceivableSourceType.INSTALLMENT,
          sourceId: installment.id,
          originalAmount: inst.total,
          amountReceived: 0,
          outstandingAmount: inst.total,
          dueDate: inst.dueDate,
          status: ReceivableStatus.PENDING,
        },
      });
    }
  }

  private calculateSimpleInterestOnInitial(principal: number, rate: number, terms: number, firstDueDate: Date, frequency: PaymentFrequency) {
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

  private calculateSimpleInterestOnBalance(principal: number, rate: number, terms: number, firstDueDate: Date, frequency: PaymentFrequency) {
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

  private calculatePriceTable(principal: number, rate: number, terms: number, firstDueDate: Date, frequency: PaymentFrequency) {
    // Price table formula: PMT = P * i * (1+i)^n / ((1+i)^n - 1)
    const monthlyRate = rate; // Assuming rate is per period
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

  private addPeriod(date: Date, frequency: PaymentFrequency, periods: number): Date {
    const d = new Date(date);
    switch (frequency) {
      case PaymentFrequency.DAILY:
        return addDays(d, periods);
      case PaymentFrequency.WEEKLY:
        return addDays(d, periods * 7);
      case PaymentFrequency.BIWEEKLY:
        return addDays(d, periods * 15);
      case PaymentFrequency.MONTHLY:
        return addMonths(d, periods);
      case PaymentFrequency.QUARTERLY:
        return addMonths(d, periods * 3);
      case PaymentFrequency.SEMIANNUAL:
        return addMonths(d, periods * 6);
      case PaymentFrequency.ANNUAL:
        return addMonths(d, periods * 12);
      default:
        return addMonths(d, periods);
    }
  }

  // ============ EXTRAORDINARY AMORTIZATION ============

  async applyExtraordinaryAmortization(ownerUserId: string, loanId: string, amount: number) {
    const loan = await this.findById(ownerUserId, loanId);

    if (loan.modality !== LoanModality.PERIODIC_INTEREST) {
      throw new BadRequestException('Amortização extraordinária só disponível para juros periódicos');
    }

    if (amount > Number(loan.outstandingPrincipal)) {
      throw new BadRequestException('Valor de amortização não pode exceder o capital em aberto');
    }

    const newOutstanding = Number(loan.outstandingPrincipal) - amount;

    const updated = await this.prisma.loan.update({
      where: { id: loanId },
      data: { outstandingPrincipal: newOutstanding },
    });

    // Regenerate interest charges with new principal
    await this.prisma.interestCharge.deleteMany({
      where: { loanId, status: ReceivableStatus.PENDING },
    });
    await this.prisma.receivable.deleteMany({
      where: { loanId, sourceType: ReceivableSourceType.INTEREST_CHARGE, status: ReceivableStatus.PENDING },
    });
    await this.generateInterestCharges(loanId);

    await this.createAuditLog(ownerUserId, ownerUserId, 'Loan', loanId, 'UPDATE',
      { outstandingPrincipal: loan.outstandingPrincipal },
      { outstandingPrincipal: newOutstanding },
      `Amortização extraordinária de R$ ${amount}`);

    return this.findById(ownerUserId, loanId);
  }

  private async createAuditLog(ownerUserId: string, actorUserId: string, entityType: string, entityId: string, action: string, oldValues: any, newValues: any, reason?: string) {
    await this.prisma.auditLog.create({
      data: {
        ownerUserId,
        actorUserId,
        entityType,
        entityId,
        action: action as any,
        oldValues,
        newValues,
        reason,
      },
    });
  }
}