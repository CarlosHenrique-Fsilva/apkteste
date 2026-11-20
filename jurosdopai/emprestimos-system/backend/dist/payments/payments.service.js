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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async confirmPayment(ownerUserId, createPaymentDto) {
        return this.prisma.$transaction(async (tx) => {
            if (createPaymentDto.loanId) {
                const loan = await tx.loan.findFirst({
                    where: { id: createPaymentDto.loanId, ownerUserId },
                });
                if (!loan) {
                    throw new common_1.NotFoundException('Empréstimo não encontrado');
                }
            }
            const client = await tx.client.findFirst({
                where: { id: createPaymentDto.clientId, ownerUserId },
            });
            if (!client) {
                throw new common_1.NotFoundException('Cliente não encontrado');
            }
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
                throw new common_1.BadRequestException('Pagamento duplicado detectado (mesmo valor, cliente e empréstimo em intervalo de 1 minuto)');
            }
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
                    status: client_1.PaymentStatus.CONFIRMED,
                },
            });
            await this.allocatePayment(tx, payment, createPaymentDto.allocations);
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
                    reason: `Pagamento confirmado: R$ ${createPaymentDto.amount}`,
                },
            });
            return this.findById(ownerUserId, payment.id);
        });
    }
    async confirmPartialPayment(ownerUserId, receivableId, amount, paymentMethod, notes) {
        return this.prisma.$transaction(async (tx) => {
            const receivable = await tx.receivable.findFirst({
                where: { id: receivableId, ownerUserId },
                include: { loan: true, client: true },
            });
            if (!receivable) {
                throw new common_1.NotFoundException('Recebível não encontrado');
            }
            if (amount > Number(receivable.outstandingAmount)) {
                throw new common_1.BadRequestException('Valor do pagamento parcial não pode exceder o saldo em aberto');
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
                    status: client_1.PaymentStatus.CONFIRMED,
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
    async allocatePayment(tx, payment, allocations) {
        if (!allocations || allocations.length === 0) {
            const receivables = await tx.receivable.findMany({
                where: {
                    ownerUserId: payment.ownerUserId,
                    clientId: payment.clientId,
                    loanId: payment.loanId || undefined,
                    status: { in: [client_1.ReceivableStatus.PENDING, client_1.ReceivableStatus.PARTIAL, client_1.ReceivableStatus.OVERDUE] },
                },
                orderBy: { dueDate: 'asc' },
            });
            let remainingAmount = Number(payment.amount);
            for (const rec of receivables) {
                if (remainingAmount <= 0)
                    break;
                const outstanding = Number(rec.outstandingAmount);
                const allocAmount = Math.min(remainingAmount, outstanding);
                await this.allocatePaymentToReceivable(tx, payment.id, rec.id, allocAmount);
                remainingAmount -= allocAmount;
            }
        }
        else {
            for (const alloc of allocations) {
                await this.allocatePaymentToReceivable(tx, payment.id, alloc.receivableId, alloc.amount);
            }
        }
    }
    async allocatePaymentToReceivable(tx, paymentId, receivableId, amount) {
        const receivable = await tx.receivable.findUnique({ where: { id: receivableId } });
        if (!receivable) {
            throw new common_1.NotFoundException(`Recebível ${receivableId} não encontrado`);
        }
        const newAmountReceived = Number(receivable.amountReceived) + amount;
        const newOutstanding = Number(receivable.originalAmount) - newAmountReceived;
        const newStatus = newOutstanding <= 0 ? client_1.ReceivableStatus.PAID :
            newAmountReceived > 0 ? client_1.ReceivableStatus.PARTIAL : client_1.ReceivableStatus.PENDING;
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
        if (receivable.sourceType === client_1.ReceivableSourceType.INSTALLMENT) {
            const installment = await tx.installment.findUnique({ where: { id: receivable.sourceId } });
            if (installment) {
                const newInstallmentReceived = Number(installment.amountReceived) + amount;
                const newInstallmentStatus = newInstallmentReceived >= Number(installment.totalAmount) ? client_1.ReceivableStatus.PAID :
                    newInstallmentReceived > 0 ? client_1.ReceivableStatus.PARTIAL : client_1.ReceivableStatus.PENDING;
                await tx.installment.update({
                    where: { id: installment.id },
                    data: { amountReceived: newInstallmentReceived, status: newInstallmentStatus },
                });
            }
        }
        await this.checkLoanPaidOff(tx, receivable.loanId);
    }
    async checkLoanPaidOff(tx, loanId) {
        const loan = await tx.loan.findUnique({ where: { id: loanId } });
        if (!loan)
            return;
        const pendingReceivables = await tx.receivable.count({
            where: { loanId, status: { in: [client_1.ReceivableStatus.PENDING, client_1.ReceivableStatus.PARTIAL, client_1.ReceivableStatus.OVERDUE] } },
        });
        if (pendingReceivables === 0 && loan.status === 'ACTIVE') {
            await tx.loan.update({
                where: { id: loanId },
                data: { status: 'PAID_OFF' },
            });
        }
    }
    async reversePayment(ownerUserId, paymentId, reversePaymentDto) {
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findFirst({
                where: { id: paymentId, ownerUserId },
                include: { allocations: true, receipts: true },
            });
            if (!payment) {
                throw new common_1.NotFoundException('Pagamento não encontrado');
            }
            if (payment.status === client_1.PaymentStatus.REVERSED) {
                throw new common_1.BadRequestException('Pagamento já estornado');
            }
            for (const alloc of payment.allocations) {
                const receivable = await tx.receivable.findUnique({ where: { id: alloc.receivableId } });
                if (receivable) {
                    const newAmountReceived = Number(receivable.amountReceived) - Number(alloc.allocatedAmount);
                    const newOutstanding = Number(receivable.originalAmount) - newAmountReceived;
                    const newStatus = newOutstanding >= Number(receivable.originalAmount) ? client_1.ReceivableStatus.PENDING :
                        newAmountReceived > 0 ? client_1.ReceivableStatus.PARTIAL : client_1.ReceivableStatus.PENDING;
                    await tx.receivable.update({
                        where: { id: alloc.receivableId },
                        data: {
                            amountReceived: Math.max(0, newAmountReceived),
                            outstandingAmount: newOutstanding,
                            status: newStatus,
                        },
                    });
                    if (receivable.sourceType === client_1.ReceivableSourceType.INSTALLMENT) {
                        const installment = await tx.installment.findUnique({ where: { id: receivable.sourceId } });
                        if (installment) {
                            const newInstallmentReceived = Number(installment.amountReceived) - Number(alloc.allocatedAmount);
                            const newInstallmentStatus = newInstallmentReceived <= 0 ? client_1.ReceivableStatus.PENDING :
                                newInstallmentReceived < Number(installment.totalAmount) ? client_1.ReceivableStatus.PARTIAL : client_1.ReceivableStatus.PAID;
                            await tx.installment.update({
                                where: { id: installment.id },
                                data: { amountReceived: Math.max(0, newInstallmentReceived), status: newInstallmentStatus },
                            });
                        }
                    }
                }
            }
            await tx.paymentAllocation.deleteMany({ where: { paymentId } });
            const reversedPayment = await tx.payment.update({
                where: { id: paymentId },
                data: { status: client_1.PaymentStatus.REVERSED, notes: `${payment.notes || ''}\n[ESTORNO] ${reversePaymentDto.reason}` },
            });
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
    async findAll(ownerUserId, filters) {
        const where = { ownerUserId };
        if (filters?.clientId)
            where.clientId = filters.clientId;
        if (filters?.loanId)
            where.loanId = filters.loanId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.startDate || filters?.endDate) {
            where.receivedAt = {};
            if (filters.startDate)
                where.receivedAt.gte = filters.startDate;
            if (filters.endDate)
                where.receivedAt.lte = filters.endDate;
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
    async findById(ownerUserId, id) {
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
            throw new common_1.NotFoundException('Pagamento não encontrado');
        }
        return payment;
    }
    async getPaymentSummary(ownerUserId, filters) {
        const where = { ownerUserId, status: client_1.PaymentStatus.CONFIRMED };
        if (filters?.startDate || filters?.endDate) {
            where.receivedAt = {};
            if (filters.startDate)
                where.receivedAt.gte = filters.startDate;
            if (filters.endDate)
                where.receivedAt.lte = filters.endDate;
        }
        const payments = await this.prisma.payment.findMany({ where });
        const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const byMethod = payments.reduce((acc, p) => {
            acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amount);
            return acc;
        }, {});
        return { totalAmount, count: payments.length, byMethod };
    }
    generateReceiptCode() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `REC-${year}${month}${day}-${random}`;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map