import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterestChargeDto } from './dto/create-interest-charge.dto';
import { UpdateInterestChargeDto } from './dto/update-interest-charge.dto';
import { ReceivableStatus, ReceivableSourceType } from '@prisma/client';
import { addMonths, addDays } from 'date-fns';

@Injectable()
export class InterestService {
  constructor(private prisma: PrismaService) {}

  async create(ownerUserId: string, createInterestChargeDto: CreateInterestChargeDto) {
    // Verify loan belongs to user
    const loan = await this.prisma.loan.findFirst({
      where: { id: createInterestChargeDto.loanId, ownerUserId },
    });
    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado');
    }

    if (loan.modality !== 'PERIODIC_INTEREST') {
      throw new BadRequestException('Cobrança de juros só disponível para empréstimos de juros periódicos');
    }

    const interestCharge = await this.prisma.interestCharge.create({
      data: {
        ...createInterestChargeDto,
        status: ReceivableStatus.PENDING,
      },
    });

    // Create corresponding receivable
    await this.prisma.receivable.create({
      data: {
        ownerUserId,
        loanId: createInterestChargeDto.loanId,
        clientId: loan.clientId,
        sourceType: ReceivableSourceType.INTEREST_CHARGE,
        sourceId: interestCharge.id,
        originalAmount: createInterestChargeDto.amountDue,
        amountReceived: 0,
        outstandingAmount: createInterestChargeDto.amountDue,
        dueDate: createInterestChargeDto.dueDate,
        status: ReceivableStatus.PENDING,
      },
    });

    return this.findById(ownerUserId, interestCharge.id);
  }

  async findAll(ownerUserId: string, filters?: { loanId?: string; status?: string; startDate?: Date; endDate?: Date }) {
    const where: any = { loan: { ownerUserId } };
    if (filters?.loanId) where.loanId = filters.loanId;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = filters.startDate;
      if (filters.endDate) where.dueDate.lte = filters.endDate;
    }

    return this.prisma.interestCharge.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        loan: { select: { id: true, modality: true, client: { select: { id: true, fullName: true } } } },
      },
    });
  }

  async findById(ownerUserId: string, id: string) {
    const interestCharge = await this.prisma.interestCharge.findFirst({
      where: { id, loan: { ownerUserId } },
      include: {
        loan: { include: { client: true } },
      },
    });
    if (!interestCharge) {
      throw new NotFoundException('Cobrança de juros não encontrada');
    }
    return interestCharge;
  }

  async update(ownerUserId: string, id: string, updateInterestChargeDto: UpdateInterestChargeDto) {
    await this.findById(ownerUserId, id);

    const oldCharge = await this.prisma.interestCharge.findUnique({ where: { id } });

    const updated = await this.prisma.interestCharge.update({
      where: { id },
      data: updateInterestChargeDto,
    });

    // Update corresponding receivable if amount changed
    if (updateInterestChargeDto.amountDue !== undefined && updateInterestChargeDto.amountDue !== Number(oldCharge.amountDue)) {
      await this.prisma.receivable.updateMany({
        where: { sourceId: id, sourceType: ReceivableSourceType.INTEREST_CHARGE },
        data: {
          originalAmount: updateInterestChargeDto.amountDue,
          outstandingAmount: updateInterestChargeDto.amountDue,
        },
      });
    }

    return this.findById(ownerUserId, id);
  }

  async defineManualAmount(ownerUserId: string, id: string, amount: number) {
    return this.update(ownerUserId, id, { amountDue: amount, manuallyDefined: true });
  }

  async generateFutureCharges(ownerUserId: string, loanId: string, periods: number = 12) {
    const loan = await this.prisma.loan.findFirst({
      where: { id: loanId, ownerUserId },
      include: { interestCharges: { orderBy: { dueDate: 'desc' }, take: 1 } },
    });
    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado');
    }

    if (loan.modality !== 'PERIODIC_INTEREST') {
      throw new BadRequestException('Geração de juros futuros só disponível para empréstimos de juros periódicos');
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
            status: ReceivableStatus.PENDING,
          },
        });

        await this.prisma.receivable.create({
          data: {
            ownerUserId,
            loanId,
            clientId: loan.clientId,
            sourceType: ReceivableSourceType.INTEREST_CHARGE,
            sourceId: interestCharge.id,
            originalAmount: amountDue,
            amountReceived: 0,
            outstandingAmount: amountDue,
            dueDate,
            status: ReceivableStatus.PENDING,
          },
        });
      }
    }

    return this.findAll(ownerUserId, { loanId });
  }

  private calculatePeriodicInterest(loan: any): number {
    const principal = Number(loan.outstandingPrincipal);
    const rate = Number(loan.interestRate);

    switch (loan.calculationMethod) {
      case 'PERCENTAGE':
        return Math.round(principal * rate * 100) / 100;
      case 'FIXED_VALUE':
        return rate; // interestRate stores the fixed value
      case 'MANUAL':
        return 0;
      default:
        return Math.round(principal * rate * 100) / 100;
    }
  }

  private addPeriod(date: Date, frequency: string, periods: number): Date {
    const d = new Date(date);
    switch (frequency) {
      case 'DAILY':
        return addDays(d, periods);
      case 'WEEKLY':
        return addDays(d, periods * 7);
      case 'BIWEEKLY':
        return addDays(d, periods * 15);
      case 'MONTHLY':
        return addMonths(d, periods);
      case 'QUARTERLY':
        return addMonths(d, periods * 3);
      case 'SEMIANNUAL':
        return addMonths(d, periods * 6);
      case 'ANNUAL':
        return addMonths(d, periods * 12);
      default:
        return addMonths(d, periods);
    }
  }
}