import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { ReceivableStatus, ReceivableSourceType } from '@prisma/client';
import { addDays, addMonths } from 'date-fns';

@Injectable()
export class ReceivablesService {
  constructor(private prisma: PrismaService) {}

  async findAll(ownerUserId: string, filters?: {
    clientId?: string;
    loanId?: string;
    status?: string;
    sourceType?: string;
    startDate?: Date;
    endDate?: Date;
    overdueOnly?: boolean;
  }) {
    const where: any = { ownerUserId };
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.loanId) where.loanId = filters.loanId;
    if (filters?.status) where.status = filters.status;
    if (filters?.sourceType) where.sourceType = filters.sourceType;
    if (filters?.overdueOnly) {
      where.status = { in: [ReceivableStatus.OVERDUE, ReceivableStatus.PARTIAL] };
      where.dueDate = { lt: new Date() };
    } else if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = filters.startDate;
      if (filters.endDate) where.dueDate.lte = filters.endDate;
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

  async findById(ownerUserId: string, id: string) {
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
      throw new NotFoundException('Recebível não encontrado');
    }
    return receivable;
  }

  async update(ownerUserId: string, id: string, updateReceivableDto: UpdateReceivableDto) {
    await this.findById(ownerUserId, id);

    const oldReceivable = await this.prisma.receivable.findUnique({ where: { id } });

    const updated = await this.prisma.receivable.update({
      where: { id },
      data: updateReceivableDto,
    });

    // If due date changed, create audit record
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

  async updateDueDate(ownerUserId: string, id: string, newDueDate: Date, reason: string) {
    return this.update(ownerUserId, id, { dueDate: newDueDate, dueDateChangeReason: reason });
  }

  async addLateFee(ownerUserId: string, receivableId: string, feeType: string, calculationMethod: string, amount: number, referenceDate: Date) {
    await this.findById(ownerUserId, receivableId);

    const lateFee = await this.prisma.lateFee.create({
      data: {
        receivableId,
        feeType,
        calculationMethod,
        amount,
        referenceDate,
        status: ReceivableStatus.PENDING,
      },
    });

    // Create a new receivable for the late fee
    const receivable = await this.prisma.receivable.findUnique({ where: { id: receivableId } });
    await this.prisma.receivable.create({
      data: {
        ownerUserId: receivable.ownerUserId,
        loanId: receivable.loanId,
        clientId: receivable.clientId,
        sourceType: ReceivableSourceType.LATE_FEE,
        sourceId: lateFee.id,
        originalAmount: amount,
        amountReceived: 0,
        outstandingAmount: amount,
        dueDate: referenceDate,
        status: ReceivableStatus.PENDING,
      },
    });

    return lateFee;
  }

  async getOverdueSummary(ownerUserId: string) {
    const overdue = await this.prisma.receivable.findMany({
      where: {
        ownerUserId,
        status: { in: [ReceivableStatus.OVERDUE, ReceivableStatus.PARTIAL] },
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
    }, {} as Record<string, { client: any; amount: number; count: number }>);

    return {
      totalOverdue,
      count: overdue.length,
      receivables: overdue,
      byClient: Object.values(byClient),
    };
  }

  async getUpcomingDue(ownerUserId: string, days: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.receivable.findMany({
      where: {
        ownerUserId,
        status: { in: [ReceivableStatus.PENDING, ReceivableStatus.PARTIAL] },
        dueDate: { gte: new Date(), lte: futureDate },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        client: { select: { id: true, fullName: true, whatsapp: true } },
        loan: { select: { id: true, modality: true } },
      },
    });
  }

  async getFinancialDashboard(ownerUserId: string) {
    const [totalReceivables, totalReceived, totalOutstanding, overdueCount, pendingCount, paidOffLoans, activeLoans] = await Promise.all([
      this.prisma.receivable.aggregate({ where: { ownerUserId }, _sum: { originalAmount: true } }),
      this.prisma.receivable.aggregate({ where: { ownerUserId }, _sum: { amountReceived: true } }),
      this.prisma.receivable.aggregate({ where: { ownerUserId }, _sum: { outstandingAmount: true } }),
      this.prisma.receivable.count({ where: { ownerUserId, status: ReceivableStatus.OVERDUE } }),
      this.prisma.receivable.count({ where: { ownerUserId, status: ReceivableStatus.PENDING } }),
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
}