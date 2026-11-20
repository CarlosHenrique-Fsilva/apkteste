import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ReversePaymentDto } from './dto/reverse-payment.dto';
import { PaymentMethod, PaymentStatus, ReceivableStatus, ReceivableSourceType, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // ============ CONFIRMAÇÃO MANUAL DE PAGAMENTO ============

  async confirmPayment(ownerUserId: string, createPaymentDto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      // Verify loan belongs to user if provided
      if (createPaymentDto.loanId) {
        const loan = await tx.loan.findFirst({
          where: { id: createPaymentDto.loanId, ownerUserId },
        });
        if (!loan) {
          throw new NotFoundException('Empréstimo não encontrado');
        }
      }

      // Verify client belongs to user
      const client = await tx.client.findFirst({
        where: { id: createPaymentDto.clientId, ownerUserId },
      });
      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      // Check for duplicate payment (same amount, client, loan, receivedAt within 1 minute)
      const recentPayment = await tx.payment.findFirst({
        where: {
          ownerUserId,
          clientId: createPaymentDto.clientId,
          loanId: createPaymentDto.loanId || null,
          amount: createPaymentDto.amount,
          receivedAt: {
            gte: new Date(new Date(createPaymentDto.receivedAt).getTime() - 60000),
            lte: new Date(new Date(createPaymentDto.receivedAt).getTime() + 60000),
          },
        },
      });

      if (recentPayment) {
        throw new BadRequestException('Pagamento duplicado detectado (mesmo valor, cliente e empréstimo em intervalo de 1 minuto)');
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          ownerUserId,
          clientId: createPaymentDto.clientId,
          loanId: createPaymentDto.loanId,
          amount: createPaymentDto.amount,
          paymentMethod: createPaymentDto.paymentMethod,
          receivedAt: new Date(createPaymentDto.receivedAt),
          confirmedBy: ownerUserId,
          notes: createPaymentDto.notes,
          status: PaymentStatus.CONFIRMED,
        },
      });

      // Allocate payment to receivables
      await this.allocatePayment(tx, payment, createPaymentDto.allocations);

      // Generate receipt
      const receiptCode = this.generateReceiptCode();
      await tx.receipt.create({
        data: {
          paymentId: payment.id,
          receiptCode,
          storagePath: '', // Will be filled when PDF is generated
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          ownerUserId,
          actorUserId: ownerUserId,
          entityType: 'Payment',
          entityId: payment.id,
          action: 'CONFIRM_PAYMENT',
          newValues: payment,
          reason: `Pagamento confirmado: R$ ${createPaymentDto.amount}`,
        },
      });

      return this.findById(ownerUserId, payment.id);
    });
  }

  async confirmPartialPayment(ownerUserId: string, receivableId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const receivable = await tx.receivable.findFirst({
        where: { id: receivableId, ownerUserId },
        include: { loan: true, client: true },
      });
      if (!receivable) {
        throw new NotFoundException('Recebível não encontrado');
      }

      if (amount > Number(receivable.outstandingAmount)) {
        throw new BadRequestException('Valor do pagamento parcial não pode exceder o saldo em aberto');
      }

      const payment = await tx.payment.create({
        data: {
          ownerUserId,
          clientId: receivable.clientId,
          loanId: receivable.loanId,
          amount,
          paymentMethod,
          receivedAt: new Date(),
          confirmedBy: ownerUserId,
          notes: notes || `Pagamento parcial de recebível ${receivable.sourceType}`,
          status: PaymentStatus.CONFIRMED,
        },
      });

      await this.allocatePaymentToReceivable(tx, payment.id, receivableId, amount);

      const receiptCode = this.generateReceiptCode();
      await tx.receipt.create({
        data: {
          paymentId: payment.id,
          receiptCode,
          storagePath: '',
        },
      });

      await tx.auditLog.create({
        data: {
          ownerUserId,
          actorUserId: ownerUserId,
          entityType: 'Payment',
          entityId: payment.id,
          action: 'CONFIRM_PAYMENT',
          newValues: payment,
          reason: `Pagamento parcial confirmado: R$ ${amount}`,
        },
      });

      return this.findById(ownerUserId, payment.id);
    });
  }

  private async allocatePayment(tx: Prisma.TransactionClient, payment: any, allocations?: { receivableId: string; amount: number }[]) {
    if (!allocations || allocations.length === 0) {
      // Auto-allocate to oldest pending receivables
      const receivables = await tx.receivable.findMany({
        where: {
          ownerUserId: payment.ownerUserId,
          clientId: payment.clientId,
          loanId: payment.loanId || undefined,
          status: { in: [ReceivableStatus.PENDING, ReceivableStatus.PARTIAL, ReceivableStatus.OVERDUE] },
        },
        orderBy: { dueDate: 'asc' },
      });

      let remainingAmount = Number(payment.amount);
      for (const rec of receivables) {
        if (remainingAmount <= 0) break;
        const outstanding = Number(rec.outstandingAmount);
        const allocAmount = Math.min(remainingAmount, outstanding);
        await this.allocatePaymentToReceivable(tx, payment.id, rec.id, allocAmount);
        remainingAmount -= allocAmount;
      }
    } else {
      // Manual allocation
      for (const alloc of allocations) {
        await this.allocatePaymentToReceivable(tx, payment.id, alloc.receivableId, alloc.amount);
      }
    }
  }

  private async allocatePaymentToReceivable(tx: Prisma.TransactionClient, paymentId: string, receivableId: string, amount: number) {
    const receivable = await tx.receivable.findUnique({ where: { id: receivableId } });
    if (!receivable) {
      throw new NotFoundException(`Recebível ${receivableId} não encontrado`);
    }

    const newAmountReceived = Number(receivable.amountReceived) + amount;
    const newOutstanding = Number(receivable.originalAmount) - newAmountReceived;
    const newStatus = newOutstanding <= 0 ? ReceivableStatus.PAID :
                      newAmountReceived > 0 ? ReceivableStatus.PARTIAL : ReceivableStatus.PENDING;

    await tx.paymentAllocation.create({
      data: {
        paymentId,
        receivableId,
        allocatedAmount: amount,
        allocationType: 'MANUAL',
      },
    });

    await tx.receivable.update({
      where: { id: receivableId },
      data: {
        amountReceived: newAmountReceived,
        outstandingAmount: newOutstanding,
        status: newStatus,
      },
    });

    // Update loan outstanding principal if it's an installment loan
    if (receivable.sourceType === ReceivableSourceType.INSTALLMENT) {
      const installment = await tx.installment.findUnique({ where: { id: receivable.sourceId } });
      if (installment) {
        const newInstallmentReceived = Number(installment.amountReceived) + amount;
        const newInstallmentStatus = newInstallmentReceived >= Number(installment.totalAmount) ? ReceivableStatus.PAID :
                                     newInstallmentReceived > 0 ? ReceivableStatus.PARTIAL : ReceivableStatus.PENDING;
        await tx.installment.update({
          where: { id: installment.id },
          data: { amountReceived: newInstallmentReceived, status: newInstallmentStatus },
        });
      }
    }

    // Check if loan is fully paid off
    await this.checkLoanPaidOff(tx, receivable.loanId);
  }

  private async checkLoanPaidOff(tx: Prisma.TransactionClient, loanId: string) {
    const loan = await tx.loan.findUnique({ where: { id: loanId } });
    if (!loan) return;

    const pendingReceivables = await tx.receivable.count({
      where: { loanId, status: { in: [ReceivableStatus.PENDING, ReceivableStatus.PARTIAL, ReceivableStatus.OVERDUE] } },
    });

    if (pendingReceivables === 0 && loan.status === 'ACTIVE') {
      await tx.loan.update({
        where: { id: loanId },
        data: { status: 'PAID_OFF' },
      });
    }
  }

  // ============ ESTORNO DE PAGAMENTO ============

  async reversePayment(ownerUserId: string, paymentId: string, reversePaymentDto: ReversePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { id: paymentId, ownerUserId },
        include: { allocations: true, receipts: true },
      });
      if (!payment) {
        throw new NotFoundException('Pagamento não encontrado');
      }

      if (payment.status === PaymentStatus.REVERSED) {
        throw new BadRequestException('Pagamento já estornado');
      }

      // Reverse allocations
      for (const alloc of payment.allocations) {
        const receivable = await tx.receivable.findUnique({ where: { id: alloc.receivableId } });
        if (receivable) {
          const newAmountReceived = Number(receivable.amountReceived) - Number(alloc.allocatedAmount);
          const newOutstanding = Number(receivable.originalAmount) - newAmountReceived;
          const newStatus = newOutstanding >= Number(receivable.originalAmount) ? ReceivableStatus.PENDING :
                            newAmountReceived > 0 ? ReceivableStatus.PARTIAL : ReceivableStatus.PENDING;

          await tx.receivable.update({
            where: { id: alloc.receivableId },
            data: {
              amountReceived: Math.max(0, newAmountReceived),
              outstandingAmount: newOutstanding,
              status: newStatus,
            },
          });

          // Update installment if applicable
          if (receivable.sourceType === ReceivableSourceType.INSTALLMENT) {
            const installment = await tx.installment.findUnique({ where: { id: receivable.sourceId } });
            if (installment) {
              const newInstallmentReceived = Number(installment.amountReceived) - Number(alloc.allocatedAmount);
              const newInstallmentStatus = newInstallmentReceived <= 0 ? ReceivableStatus.PENDING :
                                           newInstallmentReceived < Number(installment.totalAmount) ? ReceivableStatus.PARTIAL : ReceivableStatus.PAID;
              await tx.installment.update({
                where: { id: installment.id },
                data: { amountReceived: Math.max(0, newInstallmentReceived), status: newInstallmentStatus },
              });
            }
          }
        }
      }

      // Delete allocations
      await tx.paymentAllocation.deleteMany({ where: { paymentId } });

      // Update payment status
      const reversedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.REVERSED, notes: `${payment.notes || ''}\n[ESTORNO] ${reversePaymentDto.reason}` },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          ownerUserId,
          actorUserId: ownerUserId,
          entityType: 'Payment',
          entityId: paymentId,
          action: 'REVERSE_PAYMENT',
          oldValues: payment,
          newValues: reversedPayment,
          reason: reversePaymentDto.reason,
        },
      });

      return this.findById(ownerUserId, paymentId);
    });
  }

  // ============ QUERIES ============

  async findAll(ownerUserId: string, filters?: { clientId?: string; loanId?: string; startDate?: Date; endDate?: Date; status?: string }) {
    const where: any = { ownerUserId };
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.loanId) where.loanId = filters.loanId;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.receivedAt = {};
      if (filters.startDate) where.receivedAt.gte = filters.startDate;
      if (filters.endDate) where.receivedAt.lte = filters.endDate;
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      include: {
        client: { select: { id: true, fullName: true } },
        loan: { select: { id: true, modality: true } },
        allocations: { include: { receivable: true } },
        receipts: true,
      },
    });
  }

  async findById(ownerUserId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, ownerUserId },
      include: {
        client: true,
        loan: true,
        allocations: { include: { receivable: true } },
        receipts: true,
        documents: true,
      },
    });
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return payment;
  }

  async getPaymentSummary(ownerUserId: string, filters?: { startDate?: Date; endDate?: Date }) {
    const where: any = { ownerUserId, status: PaymentStatus.CONFIRMED };
    if (filters?.startDate || filters?.endDate) {
      where.receivedAt = {};
      if (filters.startDate) where.receivedAt.gte = filters.startDate;
      if (filters.endDate) where.receivedAt.lte = filters.endDate;
    }

    const payments = await this.prisma.payment.findMany({ where });
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const byMethod = payments.reduce((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

    return { totalAmount, count: payments.length, byMethod };
  }

  private generateReceiptCode(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REC-${year}${month}${day}-${random}`;
  }
}