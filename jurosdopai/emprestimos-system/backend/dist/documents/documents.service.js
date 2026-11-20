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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const pdfkit_1 = require("pdfkit");
let DocumentsService = class DocumentsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.storagePath = process.env.STORAGE_PATH || '/app/storage';
        this.ensureStorageDirectories();
    }
    ensureStorageDirectories() {
        const dirs = ['contracts', 'receipts', 'settlements', 'reports', 'attachments'];
        for (const dir of dirs) {
            const fullPath = path.join(this.storagePath, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        }
    }
    async generateContract(ownerUserId, loanId) {
        const loan = await this.prisma.loan.findFirst({
            where: { id: loanId, ownerUserId },
            include: { client: true, interestCharges: true, installments: true },
        });
        if (!loan) {
            throw new common_1.NotFoundException('Empréstimo não encontrado');
        }
        const fileName = `contrato-${loan.id}-${Date.now()}.pdf`;
        const relativePath = path.join('contracts', fileName);
        const fullPath = path.join(this.storagePath, relativePath);
        await this.generateContractPDF(loan, fullPath);
        const document = await this.prisma.document.create({
            data: {
                ownerUserId,
                clientId: loan.clientId,
                loanId,
                documentType: client_1.DocumentType.CONTRACT,
                fileName,
                storagePath: relativePath,
                mimeType: 'application/pdf',
                fileSize: fs.statSync(fullPath).size,
            },
        });
        await this.createAuditLog(ownerUserId, ownerUserId, 'Document', document.id, 'GENERATE_DOCUMENT', null, document, 'Contrato gerado');
        return document;
    }
    async generateReceipt(ownerUserId, paymentId) {
        const payment = await this.prisma.payment.findFirst({
            where: { id: paymentId, ownerUserId },
            include: { client: true, loan: true, allocations: { include: { receivable: true } }, receipts: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pagamento não encontrado');
        }
        if (payment.status !== 'CONFIRMED') {
            throw new common_1.BadRequestException('Só é possível gerar comprovante para pagamentos confirmados');
        }
        const receipt = payment.receipts[0];
        if (!receipt) {
            throw new common_1.NotFoundException('Recibo não encontrado para este pagamento');
        }
        const fileName = `comprovante-${receipt.receiptCode}.pdf`;
        const relativePath = path.join('receipts', fileName);
        const fullPath = path.join(this.storagePath, relativePath);
        await this.generateReceiptPDF(payment, receipt, fullPath);
        await this.prisma.receipt.update({
            where: { id: receipt.id },
            data: { storagePath: relativePath },
        });
        const document = await this.prisma.document.create({
            data: {
                ownerUserId,
                clientId: payment.clientId,
                loanId: payment.loanId || undefined,
                paymentId,
                documentType: client_1.DocumentType.RECEIPT,
                fileName,
                storagePath: relativePath,
                mimeType: 'application/pdf',
                fileSize: fs.statSync(fullPath).size,
            },
        });
        await this.createAuditLog(ownerUserId, ownerUserId, 'Document', document.id, 'GENERATE_DOCUMENT', null, document, 'Comprovante gerado');
        return document;
    }
    async generateSettlementTerm(ownerUserId, loanId) {
        const loan = await this.prisma.loan.findFirst({
            where: { id: loanId, ownerUserId },
            include: { client: true, receivables: true, payments: true },
        });
        if (!loan) {
            throw new common_1.NotFoundException('Empréstimo não encontrado');
        }
        const hasPending = loan.receivables.some(r => r.status !== 'PAID' && r.status !== 'CANCELLED');
        if (hasPending) {
            throw new common_1.BadRequestException('Termo de quitação só pode ser gerado quando todas as obrigações estiverem quitadas');
        }
        const fileName = `termo-quitacao-${loan.id}-${Date.now()}.pdf`;
        const relativePath = path.join('settlements', fileName);
        const fullPath = path.join(this.storagePath, relativePath);
        await this.generateSettlementTermPDF(loan, fullPath);
        const document = await this.prisma.document.create({
            data: {
                ownerUserId,
                clientId: loan.clientId,
                loanId,
                documentType: client_1.DocumentType.SETTLEMENT_TERM,
                fileName,
                storagePath: relativePath,
                mimeType: 'application/pdf',
                fileSize: fs.statSync(fullPath).size,
            },
        });
        await this.createAuditLog(ownerUserId, ownerUserId, 'Document', document.id, 'GENERATE_DOCUMENT', null, document, 'Termo de quitação gerado');
        return document;
    }
    async generateReport(ownerUserId, type, filters) {
        const fileName = `relatorio-${type}-${Date.now()}.pdf`;
        const relativePath = path.join('reports', fileName);
        const fullPath = path.join(this.storagePath, relativePath);
        let data;
        switch (type) {
            case 'clients':
                data = await this.getClientsReportData(ownerUserId, filters);
                break;
            case 'loans':
                data = await this.getLoansReportData(ownerUserId, filters);
                break;
            case 'receivables':
                data = await this.getReceivablesReportData(ownerUserId, filters);
                break;
            case 'payments':
                data = await this.getPaymentsReportData(ownerUserId, filters);
                break;
            case 'financial':
                data = await this.getFinancialReportData(ownerUserId, filters);
                break;
        }
        await this.generateReportPDF(type, data, fullPath);
        const document = await this.prisma.document.create({
            data: {
                ownerUserId,
                documentType: client_1.DocumentType.REPORT,
                fileName,
                storagePath: relativePath,
                mimeType: 'application/pdf',
                fileSize: fs.statSync(fullPath).size,
            },
        });
        return document;
    }
    async findAll(ownerUserId, filters) {
        const where = { ownerUserId };
        if (filters?.documentType)
            where.documentType = filters.documentType;
        if (filters?.clientId)
            where.clientId = filters.clientId;
        if (filters?.loanId)
            where.loanId = filters.loanId;
        return this.prisma.document.findMany({
            where,
            orderBy: { generatedAt: 'desc' },
            include: {
                client: { select: { id: true, fullName: true } },
                loan: { select: { id: true, modality: true } },
                payment: { select: { id: true, amount: true } },
            },
        });
    }
    async findById(ownerUserId, id) {
        const document = await this.prisma.document.findFirst({
            where: { id, ownerUserId },
            include: {
                client: true,
                loan: true,
                payment: true,
            },
        });
        if (!document) {
            throw new common_1.NotFoundException('Documento não encontrado');
        }
        return document;
    }
    async getFile(ownerUserId, id) {
        const document = await this.findById(ownerUserId, id);
        const fullPath = path.join(this.storagePath, document.storagePath);
        if (!fs.existsSync(fullPath)) {
            throw new common_1.NotFoundException('Arquivo não encontrado no armazenamento');
        }
        return { path: fullPath, fileName: document.fileName, mimeType: document.mimeType };
    }
    async delete(ownerUserId, id) {
        const document = await this.findById(ownerUserId, id);
        const fullPath = path.join(this.storagePath, document.storagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
        return this.prisma.document.delete({ where: { id } });
    }
    async generateContractPDF(loan, outputPath) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);
            doc.fontSize(20).text('CONTRATO DE EMPRÉSTIMO', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text('ENTRE:');
            doc.moveDown(0.5);
            doc.text(`COBRANTE: ${loan.client?.ownerUser?.name || 'Cobrante'}`);
            doc.text(`CLIENTE: ${loan.client.fullName}`);
            doc.text(`WHATSAPP: ${loan.client.whatsapp || 'Não informado'}`);
            doc.moveDown();
            doc.fontSize(14).text('DADOS DO EMPRÉSTIMO', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(11);
            doc.text(`Modalidade: ${loan.modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos com Capital Preservado' : 'Empréstimo Parcelado'}`);
            doc.text(`Capital: R$ ${Number(loan.principalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
            doc.text(`Taxa de Juros: ${(Number(loan.interestRate) * 100).toFixed(2)}% ao período`);
            doc.text(`Método de Cálculo: ${this.getCalculationMethodLabel(loan.calculationMethod)}`);
            doc.text(`Frequência de Pagamento: ${loan.paymentFrequency}`);
            doc.text(`Data de Início: ${new Date(loan.startDate).toLocaleDateString('pt-BR')}`);
            doc.text(`Primeiro Vencimento: ${new Date(loan.firstDueDate).toLocaleDateString('pt-BR')}`);
            doc.moveDown();
            if (loan.modality === 'PERIODIC_INTEREST') {
                doc.fontSize(14).text('CRONOGRAMA DE JUROS', { underline: true });
                doc.moveDown(0.5);
                loan.interestCharges.slice(0, 12).forEach((charge, index) => {
                    doc.fontSize(10).text(`${index + 1}. Vencimento: ${new Date(charge.dueDate).toLocaleDateString('pt-BR')} | Valor: R$ ${Number(charge.amountDue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Período: ${new Date(charge.referencePeriod).toLocaleDateString('pt-BR')}`);
                });
            }
            else {
                doc.fontSize(14).text('PARCELAS', { underline: true });
                doc.moveDown(0.5);
                loan.installments.forEach((inst) => {
                    doc.fontSize(10).text(`Parcela ${inst.installmentNumber}: Vencimento ${new Date(inst.dueDate).toLocaleDateString('pt-BR')} | Principal: R$ ${Number(inst.principalComponent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Juros: R$ ${Number(inst.interestComponent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Total: R$ ${Number(inst.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
                });
            }
            doc.moveDown();
            doc.fontSize(14).text('CONDIÇÕES GERAIS', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10).text('1. O cliente compromete-se a pagar os valores nas datas de vencimento estipuladas.');
            doc.text('2. Em caso de atraso, poderão ser aplicadas multas e juros de mora conforme legislação vigente.');
            doc.text('3. A confirmação de pagamento é feita manualmente pelo cobrante após verificação do recebimento.');
            doc.text('4. Este contrato não possui vínculo com instituições financeiras ou bureaus de crédito.');
            doc.text('5. Quaisquer alterações nas condições deverão ser formalizadas por aditivo contratual.');
            doc.moveDown(2);
            doc.fontSize(11).text('_________________________________', { align: 'left' });
            doc.text('Cobrante', { align: 'left' });
            doc.moveDown(2);
            doc.text('_________________________________', { align: 'left' });
            doc.text('Cliente', { align: 'left' });
            doc.moveDown();
            doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
            doc.end();
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }
    async generateReceiptPDF(payment, receipt, outputPath) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);
            doc.fontSize(20).text('COMPROVANTE DE PAGAMENTO', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Código: ${receipt.receiptCode}`, { align: 'center' });
            doc.text(`Data/Hora: ${new Date(payment.receivedAt).toLocaleString('pt-BR')}`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(11).text(`Cobrante: ${payment.client?.ownerUser?.name || 'Cobrante'}`);
            doc.text(`Cliente: ${payment.client.fullName}`);
            doc.moveDown();
            doc.fontSize(14).text('DETALHES DO PAGAMENTO', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(11);
            doc.text(`Valor Pago: R$ ${Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
            doc.text(`Método: ${payment.paymentMethod}`);
            if (payment.loan) {
                doc.text(`Empréstimo: ${payment.loan.modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos' : 'Parcelado'}`);
            }
            doc.moveDown();
            if (payment.allocations && payment.allocations.length > 0) {
                doc.fontSize(14).text('ALOCAÇÃO', { underline: true });
                doc.moveDown(0.5);
                payment.allocations.forEach((alloc) => {
                    const rec = alloc.receivable;
                    doc.fontSize(10).text(`${rec.sourceType === 'INTEREST_CHARGE' ? 'Juros' : rec.sourceType === 'INSTALLMENT' ? 'Parcela' : rec.sourceType}: R$ ${Number(alloc.allocatedAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Venc: ${new Date(rec.dueDate).toLocaleDateString('pt-BR')})`);
                });
                doc.moveDown();
            }
            if (payment.loan) {
                const outstanding = await this.prisma.receivable.aggregate({
                    where: { loanId: payment.loanId, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
                    _sum: { outstandingAmount: true },
                });
                doc.fontSize(11).text(`Saldo Devedor Restante: R$ ${Number(outstanding._sum.outstandingAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
            }
            doc.moveDown(2);
            doc.text('_________________________________', { align: 'center' });
            doc.text('Cobrante (Confirmação Manual)', { align: 'center' });
            doc.moveDown();
            doc.text(`Documento gerado em ${new Date().toLocaleString('pt-BR')}`, { align: 'center', fontSize: 9 });
            doc.end();
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }
    async generateSettlementTermPDF(loan, outputPath) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);
            doc.fontSize(20).text('TERMO DE QUITAÇÃO', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Empréstimo: ${loan.id}`, { align: 'center' });
            doc.text(`Cliente: ${loan.client.fullName}`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(11).text('Declaro, para os devidos fins, que o empréstimo supra referido encontra-se integralmente quitado, não havendo mais nenhum valor a ser cobrado, seja a título de principal, juros, multas ou quaisquer outras despesas.');
            doc.moveDown(2);
            const totalPaid = loan.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            doc.text(`Valor Total Pago: R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
            doc.moveDown(2);
            doc.text('_________________________________', { align: 'left' });
            doc.text('Cobrante', { align: 'left' });
            doc.moveDown(2);
            doc.text('_________________________________', { align: 'left' });
            doc.text('Cliente', { align: 'left' });
            doc.moveDown();
            doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
            doc.end();
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }
    async generateReportPDF(type, data, outputPath) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.PDFDocument({ margin: 40, layout: 'landscape' });
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);
            const titles = {
                clients: 'RELATÓRIO DE CLIENTES',
                loans: 'RELATÓRIO DE EMPRÉSTIMOS',
                receivables: 'RELATÓRIO DE RECEBÍVEIS',
                payments: 'RELATÓRIO DE PAGAMENTOS',
                financial: 'RELATÓRIO FINANCEIRO CONSOLIDADO',
            };
            doc.fontSize(18).text(titles[type] || 'RELATÓRIO', { align: 'center' });
            doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(9);
            if (Array.isArray(data)) {
                data.forEach((item, index) => {
                    const line = Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(' | ');
                    doc.text(`${index + 1}. ${line}`);
                });
            }
            else if (typeof data === 'object') {
                Object.entries(data).forEach(([k, v]) => {
                    doc.text(`${k}: ${JSON.stringify(v)}`);
                });
            }
            doc.end();
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }
    async getClientsReportData(ownerUserId, filters) {
        return this.prisma.client.findMany({
            where: { ownerUserId, ...(filters?.status ? { administrativeStatus: filters.status } : {}) },
            include: { _count: { select: { loans: true, receivables: true } } },
        });
    }
    async getLoansReportData(ownerUserId, filters) {
        return this.prisma.loan.findMany({
            where: { ownerUserId, ...(filters?.status ? { status: filters.status } : {}) },
            include: { client: { select: { fullName: true } } },
        });
    }
    async getReceivablesReportData(ownerUserId, filters) {
        return this.prisma.receivable.findMany({
            where: { ownerUserId, ...(filters?.status ? { status: filters.status } : {}) },
            include: { client: { select: { fullName: true } }, loan: { select: { modality: true } } },
        });
    }
    async getPaymentsReportData(ownerUserId, filters) {
        return this.prisma.payment.findMany({
            where: { ownerUserId, ...(filters?.status ? { status: filters.status } : {}) },
            include: { client: { select: { fullName: true } } },
        });
    }
    async getFinancialReportData(ownerUserId, filters) {
        const [receivables, payments, loans, clients] = await Promise.all([
            this.prisma.receivable.findMany({ where: { ownerUserId } }),
            this.prisma.payment.findMany({ where: { ownerUserId, status: 'CONFIRMED' } }),
            this.prisma.loan.findMany({ where: { ownerUserId } }),
            this.prisma.client.findMany({ where: { ownerUserId } }),
        ]);
        return {
            summary: {
                totalClients: clients.length,
                activeLoans: loans.filter(l => l.status === 'ACTIVE').length,
                paidOffLoans: loans.filter(l => l.status === 'PAID_OFF').length,
                totalReceivables: receivables.reduce((sum, r) => sum + Number(r.originalAmount), 0),
                totalReceived: payments.reduce((sum, p) => sum + Number(p.amount), 0),
                totalOutstanding: receivables.reduce((sum, r) => sum + Number(r.outstandingAmount), 0),
            },
            receivables,
            payments,
            loans,
        };
    }
    getCalculationMethodLabel(method) {
        const labels = {
            SIMPLE_INTEREST_ON_INITIAL: 'Juros Simples sobre Capital Inicial',
            SIMPLE_INTEREST_ON_BALANCE: 'Juros Simples sobre Saldo Devedor',
            PRICE_TABLE: 'Tabela Price',
            PERCENTAGE: 'Percentual',
            FIXED_VALUE: 'Valor Fixo',
            MANUAL: 'Manual',
        };
        return labels[method] || method;
    }
    async createAuditLog(ownerUserId, actorUserId, entityType, entityId, action, oldValues, newValues, reason) {
        await this.prisma.auditLog.create({
            data: { ownerUserId, actorUserId, entityType, entityId, action: action, oldValues, newValues, reason },
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map