import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReceivableStatus, ReceivableSourceType } from '@prisma/client';

@Injectable()
export class InstallmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(ownerUserId: string, filters?: { loanId?: string; status?: string }) {
    const where: any = { loan: { ownerUserId } };
    if (filters?.loanId) where.loanId = filters.loanId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.installment.findMany({
      where,
      orderBy: { installmentNumber: 'asc' },
      include: {
        loan: { select: { id: true, modality: true, client: { select: { id: true, fullName: true } } } },
      },
    });
  }

  async findById(ownerUserId: string, id: string) {
    const installment = await this.prisma.installment.findFirst({
      where: { id, loan: { ownerUserId } },
      include: {
        loan: { include: { client: true } },
      },
    });
    if (!installment) {
      throw new NotFoundException('Parcela não encontrada');
    }
    return installment;
  }

  async updateAmountReceived(ownerUserId: string, id: string, amountReceived: number) {
    const installment = await this.findById(ownerUserId, id);
    const newAmountReceived = Number(installment.amountReceived) + amountReceived;
    const totalAmount = Number(installment.totalAmount);

    if (newAmountReceived > totalAmount) {
      throw new Error('Valor recebido não pode exceder o total da parcela');
    }

    const newStatus = newAmountReceived >= totalAmount ? ReceivableStatus.PAID :
                      newAmountReceived > 0 ? ReceivableStatus.PARTIAL : ReceivableStatus.PENDING;

    const updated = await this.prisma.installment.update({
      where: { id },
      data: { amountReceived: newAmountReceived, status: newStatus },
    });

    // Update corresponding receivable
    await this.prisma.receivable.updateMany({
      where: { sourceId: id, sourceType: ReceivableSourceType.INSTALLMENT },
      data: { amountReceived: newAmountReceived, outstandingAmount: totalAmount - newAmountReceived, status: newStatus },
    });

    return updated;
  }

  async getLoanInstallmentsSummary(ownerUserId: string, loanId: string) {
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
}