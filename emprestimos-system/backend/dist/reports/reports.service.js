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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFinancialReport(ownerUserId, startDate, endDate) {
        const where = { ownerUserId };
        if (startDate || endDate) {
            where.receivedAt = {};
            if (startDate)
                where.receivedAt.gte = startDate;
            if (endDate)
                where.receivedAt.lte = endDate;
        }
        const [payments, receivables, loans, clients] = await Promise.all([
            this.prisma.payment.findMany({ where: { ...where, status: client_1.PaymentStatus.CONFIRMED } }),
            this.prisma.receivable.findMany({ where: { ownerUserId } }),
            this.prisma.loan.findMany({ where: { ownerUserId } }),
            this.prisma.client.findMany({ where: { ownerUserId } }),
        ]);
        const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalReceivables = receivables.reduce((sum, r) => sum + Number(r.originalAmount), 0);
        const totalOutstanding = receivables.reduce((sum, r) => sum + Number(r.outstandingAmount), 0);
        const totalOverdue = receivables
            .filter(r => r.status === client_1.ReceivableStatus.OVERDUE || (r.status === client_1.ReceivableStatus.PARTIAL && new Date(r.dueDate) < new Date()))
            .reduce((sum, r) => sum + Number(r.outstandingAmount), 0);
        const byMethod = payments.reduce((acc, p) => {
            acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amount);
            return acc;
        }, {});
        const byLoanModality = payments.reduce((acc, p) => {
            const modality = p.loan?.modality || 'SEM_EMPRESTIMO';
            acc[modality] = (acc[modality] || 0) + Number(p.amount);
            return acc;
        }, {});
        const monthlyData = this.getMonthlyBreakdown(payments, receivables);
        return {
            period: { startDate, endDate },
            summary: {
                totalClients: clients.length,
                activeLoans: loans.filter(l => l.status === client_1.LoanStatus.ACTIVE).length,
                paidOffLoans: loans.filter(l => l.status === client_1.LoanStatus.PAID_OFF).length,
                totalReceivables,
                totalReceived,
                totalOutstanding,
                totalOverdue,
                collectionRate: totalReceivables > 0 ? (totalReceived / totalReceivables) * 100 : 0,
            },
            byPaymentMethod: byMethod,
            byLoanModality,
            monthlyBreakdown: monthlyData,
            topClients: this.getTopClients(payments, clients),
        };
    }
    async getClientsReport(ownerUserId) {
        const clients = await this.prisma.client.findMany({
            where: { ownerUserId },
            include: {
                loans: { include: { receivables: true, payments: true } },
                receivables: true,
                payments: { where: { status: client_1.PaymentStatus.CONFIRMED } },
            },
        });
        return clients.map(client => {
            const totalLoans = client.loans.length;
            const activeLoans = client.loans.filter(l => l.status === client_1.LoanStatus.ACTIVE).length;
            const totalReceivables = client.receivables.reduce((sum, r) => sum + Number(r.originalAmount), 0);
            const totalReceived = client.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const totalOutstanding = client.receivables.reduce((sum, r) => sum + Number(r.outstandingAmount), 0);
            const overdueCount = client.receivables.filter(r => r.status === client_1.ReceivableStatus.OVERDUE).length;
            return {
                client: { id: client.id, fullName: client.fullName, whatsapp: client.whatsapp, status: client.administrativeStatus },
                totalLoans,
                activeLoans,
                totalReceivables,
                totalReceived,
                totalOutstanding,
                overdueCount,
                paymentRate: totalReceivables > 0 ? (totalReceived / totalReceivables) * 100 : 0,
            };
        });
    }
    async getLoansReport(ownerUserId) {
        const loans = await this.prisma.loan.findMany({
            where: { ownerUserId },
            include: {
                client: { select: { id: true, fullName: true } },
                receivables: true,
                payments: { where: { status: client_1.PaymentStatus.CONFIRMED } },
                interestCharges: true,
                installments: true,
            },
        });
        return loans.map(loan => {
            const totalReceivables = loan.receivables.reduce((sum, r) => sum + Number(r.originalAmount), 0);
            const totalReceived = loan.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const totalOutstanding = loan.receivables.reduce((sum, r) => sum + Number(r.outstandingAmount), 0);
            const overdueCount = loan.receivables.filter(r => r.status === client_1.ReceivableStatus.OVERDUE).length;
            const pendingInterestCharges = loan.interestCharges.filter(ic => ic.status !== client_1.ReceivableStatus.PAID).length;
            const pendingInstallments = loan.installments.filter(i => i.status !== client_1.ReceivableStatus.PAID).length;
            return {
                loan: { id: loan.id, modality: loan.modality, status: loan.status, principalAmount: loan.principalAmount, interestRate: loan.interestRate },
                client: loan.client,
                totalReceivables,
                totalReceived,
                totalOutstanding,
                overdueCount,
                pendingInterestCharges,
                pendingInstallments,
                progress: totalReceivables > 0 ? (totalReceived / totalReceivables) * 100 : 0,
            };
        });
    }
    async getReceivablesReport(ownerUserId, filters) {
        const where = { ownerUserId };
        if (filters?.status)
            where.status = filters.status;
        if (filters?.overdueOnly) {
            where.status = { in: [client_1.ReceivableStatus.OVERDUE, client_1.ReceivableStatus.PARTIAL] };
            where.dueDate = { lt: new Date() };
        }
        const receivables = await this.prisma.receivable.findMany({
            where,
            orderBy: { dueDate: 'asc' },
            include: {
                client: { select: { id: true, fullName: true, whatsapp: true } },
                loan: { select: { id: true, modality: true } },
                payments: { include: { payment: true } },
            },
        });
        return receivables.map(r => ({
            ...r,
            daysOverdue: r.dueDate < new Date() && r.status !== client_1.ReceivableStatus.PAID
                ? Math.floor((new Date().getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                : 0,
        }));
    }
    async getPaymentsReport(ownerUserId, startDate, endDate) {
        const where = { ownerUserId, status: client_1.PaymentStatus.CONFIRMED };
        if (startDate || endDate) {
            where.receivedAt = {};
            if (startDate)
                where.receivedAt.gte = startDate;
            if (endDate)
                where.receivedAt.lte = endDate;
        }
        const payments = await this.prisma.payment.findMany({
            where,
            orderBy: { receivedAt: 'desc' },
            include: {
                client: { select: { id: true, fullName: true } },
                loan: { select: { id: true, modality: true } },
                allocations: { include: { receivable: true } },
                receipts: true,
            },
        });
        return payments;
    }
    async getAgingReport(ownerUserId) {
        const receivables = await this.prisma.receivable.findMany({
            where: {
                ownerUserId,
                status: { in: [client_1.ReceivableStatus.PENDING, client_1.ReceivableStatus.PARTIAL, client_1.ReceivableStatus.OVERDUE] },
            },
            include: {
                client: { select: { id: true, fullName: true, whatsapp: true } },
                loan: { select: { id: true, modality: true } },
            },
        });
        const now = new Date();
        const buckets = {
            current: { label: 'Vencendo hoje', amount: 0, count: 0, items: [] },
            '1-30': { label: '1-30 dias', amount: 0, count: 0, items: [] },
            '31-60': { label: '31-60 dias', amount: 0, count: 0, items: [] },
            '61-90': { label: '61-90 dias', amount: 0, count: 0, items: [] },
            '90+': { label: '90+ dias', amount: 0, count: 0, items: [] },
        };
        for (const r of receivables) {
            const daysDiff = Math.floor((now.getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24));
            const outstanding = Number(r.outstandingAmount);
            let bucket;
            if (daysDiff <= 0)
                bucket = 'current';
            else if (daysDiff <= 30)
                bucket = '1-30';
            else if (daysDiff <= 60)
                bucket = '31-60';
            else if (daysDiff <= 90)
                bucket = '61-90';
            else
                bucket = '90+';
            buckets[bucket].amount += outstanding;
            buckets[bucket].count += 1;
            buckets[bucket].items.push({
                id: r.id,
                client: r.client.fullName,
                sourceType: r.sourceType,
                dueDate: r.dueDate,
                outstanding,
                daysOverdue: Math.max(0, daysDiff),
            });
        }
        return Object.values(buckets);
    }
    async exportToCSV(ownerUserId, type) {
        let data;
        let headers;
        switch (type) {
            case 'clients':
                const clientsReport = await this.getClientsReport(ownerUserId);
                data = clientsReport.map(r => ({
                    'ID': r.client.id,
                    'Nome': r.client.fullName,
                    'WhatsApp': r.client.whatsapp || '',
                    'Status': r.client.status,
                    'Total Empréstimos': r.totalLoans,
                    'Empréstimos Ativos': r.activeLoans,
                    'Total a Receber': r.totalReceivables,
                    'Total Recebido': r.totalReceived,
                    'Saldo Devedor': r.totalOutstanding,
                    'Em Atraso': r.overdueCount,
                    'Taxa Pagamento (%)': r.paymentRate.toFixed(2),
                }));
                headers = ['ID', 'Nome', 'WhatsApp', 'Status', 'Total Empréstimos', 'Empréstimos Ativos', 'Total a Receber', 'Total Recebido', 'Saldo Devedor', 'Em Atraso', 'Taxa Pagamento (%)'];
                break;
            case 'loans':
                const loansReport = await this.getLoansReport(ownerUserId);
                data = loansReport.map(r => ({
                    'ID': r.loan.id,
                    'Cliente': r.client.fullName,
                    'Modalidade': r.loan.modality,
                    'Status': r.loan.status,
                    'Capital': r.loan.principalAmount,
                    'Taxa Juros': r.loan.interestRate,
                    'Total a Receber': r.totalReceivables,
                    'Total Recebido': r.totalReceived,
                    'Saldo Devedor': r.totalOutstanding,
                    'Em Atraso': r.overdueCount,
                    'Progresso (%)': r.progress.toFixed(2),
                }));
                headers = ['ID', 'Cliente', 'Modalidade', 'Status', 'Capital', 'Taxa Juros', 'Total a Receber', 'Total Recebido', 'Saldo Devedor', 'Em Atraso', 'Progresso (%)'];
                break;
            case 'receivables':
                const receivablesReport = await this.getReceivablesReport(ownerUserId);
                data = receivablesReport.map(r => ({
                    'ID': r.id,
                    'Cliente': r.client.fullName,
                    'Empréstimo': r.loan.id,
                    'Tipo': r.sourceType,
                    'Valor Original': r.originalAmount,
                    'Valor Recebido': r.amountReceived,
                    'Saldo': r.outstandingAmount,
                    'Vencimento': (0, date_fns_1.format)(new Date(r.dueDate), 'dd/MM/yyyy'),
                    'Status': r.status,
                    'Dias Atraso': r.daysOverdue,
                }));
                headers = ['ID', 'Cliente', 'Empréstimo', 'Tipo', 'Valor Original', 'Valor Recebido', 'Saldo', 'Vencimento', 'Status', 'Dias Atraso'];
                break;
            case 'payments':
                const paymentsReport = await this.getPaymentsReport(ownerUserId);
                data = paymentsReport.map(r => ({
                    'ID': r.id,
                    'Cliente': r.client.fullName,
                    'Empréstimo': r.loan?.id || 'N/A',
                    'Valor': r.amount,
                    'Método': r.paymentMethod,
                    'Recebido Em': (0, date_fns_1.format)(new Date(r.receivedAt), 'dd/MM/yyyy HH:mm'),
                    'Status': r.status,
                    'Comprovante': r.receipts[0]?.receiptCode || 'N/A',
                }));
                headers = ['ID', 'Cliente', 'Empréstimo', 'Valor', 'Método', 'Recebido Em', 'Status', 'Comprovante'];
                break;
        }
        const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n');
        return csv;
    }
    getMonthlyBreakdown(payments, receivables) {
        const months = {};
        for (let i = 11; i >= 0; i--) {
            const date = (0, date_fns_1.subMonths)(new Date(), i);
            const key = (0, date_fns_1.format)(date, 'yyyy-MM');
            months[key] = { received: 0, due: 0, paid: 0 };
        }
        payments.forEach(p => {
            const key = (0, date_fns_1.format)(new Date(p.receivedAt), 'yyyy-MM');
            if (months[key])
                months[key].received += Number(p.amount);
        });
        receivables.forEach(r => {
            const key = (0, date_fns_1.format)(new Date(r.dueDate), 'yyyy-MM');
            if (months[key]) {
                months[key].due += Number(r.originalAmount);
                months[key].paid += Number(r.amountReceived);
            }
        });
        return Object.entries(months).map(([month, data]) => ({
            month,
            ...data,
            collectionRate: data.due > 0 ? (data.paid / data.due) * 100 : 0,
        }));
    }
    getTopClients(payments, clients) {
        const clientTotals = {};
        payments.forEach(p => {
            const clientId = p.clientId;
            if (!clientTotals[clientId]) {
                const client = clients.find(c => c.id === clientId);
                clientTotals[clientId] = { name: client?.fullName || 'Desconhecido', total: 0, count: 0 };
            }
            clientTotals[clientId].total += Number(p.amount);
            clientTotals[clientId].count += 1;
        });
        return Object.entries(clientTotals)
            .map(([id, data]) => ({ clientId: id, ...data }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map