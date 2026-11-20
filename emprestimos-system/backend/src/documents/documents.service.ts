import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  private storagePath = process.env.STORAGE_PATH || '/app/storage';

  constructor(private prisma: PrismaService) {
    this.ensureStorageDirectories();
  }

  private ensureStorageDirectories() {
    const dirs = ['contracts', 'receipts', 'settlements', 'reports', 'attachments'];
    for (const dir of dirs) {
      const fullPath = path.join(this.storagePath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  async generateContract(ownerUserId: string, loanId: string) {
    const loan = await this.prisma.loan.findFirst({
      where: { id: loanId, ownerUserId },
      include: { client: true, interestCharges: true, installments: true },
    });
    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado');
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
        documentType: DocumentType.CONTRACT,
        fileName,
        storagePath: relativePath,
        mimeType: 'application/pdf',
        fileSize: fs.statSync(fullPath).size,
      },
    });

    await this.createAuditLog(ownerUserId, ownerUserId, 'Document', document.id, 'GENERATE_DOCUMENT', null, document, 'Contrato gerado');

    return document;
  }

  async generateReceipt(ownerUserId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, ownerUserId },
      include: { client: true, loan: true, allocations: { include: { receivable: true } }, receipts: true },
    });
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (payment.status !== 'CONFIRMED') {
      throw new BadRequestException('Só é possível gerar comprovante para pagamentos confirmados');
    }

    const receipt = payment.receipts[0];
    if (!receipt) {
      throw new NotFoundException('Recibo não encontrado para este pagamento');
    }

    const fileName = `comprovante-${receipt.receiptCode}.pdf`;
    const relativePath = path.join('receipts', fileName);
    const fullPath = path.join(this.storagePath, relativePath);

    await this.generateReceiptPDF(payment, receipt, fullPath);

    // Update receipt storage path
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
        documentType: DocumentType.RECEIPT,
        fileName,
        storagePath: relativePath,
        mimeType: 'application/pdf',
        fileSize: fs.statSync(fullPath).size,
      },
    });

    await this.createAuditLog(ownerUserId, ownerUserId, 'Document', document.id, 'GENERATE_DOCUMENT', null, document, 'Comprovante gerado');

    return document;
  }

  async generateSettlementTerm(ownerUserId: string, loanId: string) {
    const loan = await this.prisma.loan.findFirst({
      where: { id: loanId, ownerUserId },
      include: { client: true, receivables: true, payments: true },
    });
    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado');
    }

    // Check if all receivables are paid
    const hasPending = loan.receivables.some(r => r.status !== 'PAID' && r.status !== 'CANCELLED');
    if (hasPending) {
      throw new BadRequestException('Termo de quitação só pode ser gerado quando todas as obrigações estiverem quitadas');
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
        documentType: DocumentType.SETTLEMENT_TERM,
        fileName,
        storagePath: relativePath,
        mimeType: 'application/pdf',
        fileSize: fs.statSync(fullPath).size,
      },
    });

    await this.createAuditLog(ownerUserId, ownerUserId, 'Document', document.id, 'GENERATE_DOCUMENT', null, document, 'Termo de quitação gerado');

    return document;
  }

  async generateReport(ownerUserId: string, type: 'clients' | 'loans' | 'receivables' | 'payments' | 'financial', filters?: any) {
    const fileName = `relatorio-${type}-${Date.now()}.pdf`;
    const relativePath = path.join('reports', fileName);
    const fullPath = path.join(this.storagePath, relativePath);

    let data: any;
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
        documentType: DocumentType.REPORT,
        fileName,
        storagePath: relativePath,
        mimeType: 'application/pdf',
        fileSize: fs.statSync(fullPath).size,
      },
    });

    return document;
  }

  async findAll(ownerUserId: string, filters?: { documentType?: string; clientId?: string; loanId?: string }) {
    const where: any = { ownerUserId };
    if (filters?.documentType) where.documentType = filters.documentType;
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.loanId) where.loanId = filters.loanId;

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

  async findById(ownerUserId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, ownerUserId },
      include: {
        client: true,
        loan: true,
        payment: true,
      },
    });
    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }
    return document;
  }

  async getFile(ownerUserId: string, id: string) {
    const document = await this.findById(ownerUserId, id);
    const fullPath = path.join(this.storagePath, document.storagePath);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('Arquivo não encontrado no armazenamento');
    }
    return { path: fullPath, fileName: document.fileName, mimeType: document.mimeType };
  }

  async delete(ownerUserId: string, id: string) {
    const document = await this.findById(ownerUserId, id);
    const fullPath = path.join(this.storagePath, document.storagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    return this.prisma.document.delete({ where: { id } });
  }

  // ============ PDF GENERATION METHODS ============

  private async generateContractPDF(loan: any, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('CONTRATO DE EMPRÉSTIMO', { align: 'center' });
      doc.moveDown();

      // Parties
      doc.fontSize(12).text('ENTRE:');
      doc.moveDown(0.5);
      doc.text(`COBRANTE: ${loan.client?.ownerUser?.name || 'Cobrante'}`);
      doc.text(`CLIENTE: ${loan.client.fullName}`);
      doc.text(`WHATSAPP: ${loan.client.whatsapp || 'Não informado'}`);
      doc.moveDown();

      // Loan details
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

      // Terms
      if (loan.modality === 'PERIODIC_INTEREST') {
        doc.fontSize(14).text('CRONOGRAMA DE JUROS', { underline: true });
        doc.moveDown(0.5);
        loan.interestCharges.slice(0, 12).forEach((charge: any, index: number) => {
          doc.fontSize(10).text(
            `${index + 1}. Vencimento: ${new Date(charge.dueDate).toLocaleDateString('pt-BR')} | Valor: R$ ${Number(charge.amountDue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Período: ${new Date(charge.referencePeriod).toLocaleDateString('pt-BR')}`
          );
        });
      } else {
        doc.fontSize(14).text('PARCELAS', { underline: true });
        doc.moveDown(0.5);
        loan.installments.forEach((inst: any) => {
          doc.fontSize(10).text(
            `Parcela ${inst.installmentNumber}: Vencimento ${new Date(inst.dueDate).toLocaleDateString('pt-BR')} | Principal: R$ ${Number(inst.principalComponent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Juros: R$ ${Number(inst.interestComponent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Total: R$ ${Number(inst.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          );
        });
      }
      doc.moveDown();

      // Conditions
      doc.fontSize(14).text('CONDIÇÕES GERAIS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text('1. O cliente compromete-se a pagar os valores nas datas de vencimento estipuladas.');
      doc.text('2. Em caso de atraso, poderão ser aplicadas multas e juros de mora conforme legislação vigente.');
      doc.text('3. A confirmação de pagamento é feita manualmente pelo cobrante após verificação do recebimento.');
      doc.text('4. Este contrato não possui vínculo com instituições financeiras ou bureaus de crédito.');
      doc.text('5. Quaisquer alterações nas condições deverão ser formalizadas por aditivo contratual.');
      doc.moveDown(2);

      // Signatures
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

  private async generateReceiptPDF(payment: any, receipt: any, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('COMPROVANTE DE PAGAMENTO', { align: 'center' });
      doc.moveDown();

      // Receipt info
      doc.fontSize(12).text(`Código: ${receipt.receiptCode}`, { align: 'center' });
      doc.text(`Data/Hora: ${new Date(payment.receivedAt).toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown();

      // Parties
      doc.fontSize(11).text(`Cobrante: ${payment.client?.ownerUser?.name || 'Cobrante'}`);
      doc.text(`Cliente: ${payment.client.fullName}`);
      doc.moveDown();

      // Payment details
      doc.fontSize(14).text('DETALHES DO PAGAMENTO', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Valor Pago: R$ ${Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      doc.text(`Método: ${payment.paymentMethod}`);
      if (payment.loan) {
        doc.text(`Empréstimo: ${payment.loan.modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos' : 'Parcelado'}`);
      }
      doc.moveDown();

      // Allocation details
      if (payment.allocations && payment.allocations.length > 0) {
        doc.fontSize(14).text('ALOCAÇÃO', { underline: true });
        doc.moveDown(0.5);
        payment.allocations.forEach((alloc: any) => {
          const rec = alloc.receivable;
          doc.fontSize(10).text(
            `${rec.sourceType === 'INTEREST_CHARGE' ? 'Juros' : rec.sourceType === 'INSTALLMENT' ? 'Parcela' : rec.sourceType}: R$ ${Number(alloc.allocatedAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Venc: ${new Date(rec.dueDate).toLocaleDateString('pt-BR')})`
          );
        });
        doc.moveDown();
      }

      // Remaining balance
      if (payment.loan) {
        const outstanding = await this.prisma.receivable.aggregate({
          where: { loanId: payment.loanId, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
          _sum: { outstandingAmount: true },
        });
        doc.fontSize(11).text(`Saldo Devedor Restante: R$ ${Number(outstanding._sum.outstandingAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      }
      doc.moveDown(2);

      // Signature
      doc.text('_________________________________', { align: 'center' });
      doc.text('Cobrante (Confirmação Manual)', { align: 'center' });
      doc.moveDown();
      doc.text(`Documento gerado em ${new Date().toLocaleString('pt-BR')}`, { align: 'center', fontSize: 9 });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  private async generateSettlementTermPDF(loan: any, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      doc.fontSize(20).text('TERMO DE QUITAÇÃO', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Empréstimo: ${loan.id}`, { align: 'center' });
      doc.text(`Cliente: ${loan.client.fullName}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(11).text('Declaro, para os devidos fins, que o empréstimo supra referido encontra-se integralmente quitado, não havendo mais nenhum valor a ser cobrado, seja a título de principal, juros, multas ou quaisquer outras despesas.');
      doc.moveDown(2);

      const totalPaid = loan.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
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

  private async generateReportPDF(type: string, data: any, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, layout: 'landscape' });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const titles: Record<string, string> = {
        clients: 'RELATÓRIO DE CLIENTES',
        loans: 'RELATÓRIO DE EMPRÉSTIMOS',
        receivables: 'RELATÓRIO DE RECEBÍVEIS',
        payments: 'RELATÓRIO DE PAGAMENTOS',
        financial: 'RELATÓRIO FINANCEIRO CONSOLIDADO',
      };

      doc.fontSize(18).text(titles[type] || 'RELATÓRIO', { align: 'center' });
      doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown();

      // Simple table-like rendering
      doc.fontSize(9);
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          const line = Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(' | ');
          doc.text(`${index + 1}. ${line}`);
        });
      } else if (typeof data === 'object') {
        Object.entries(data).forEach(([k, v]) => {
          doc.text(`${k}: ${JSON.stringify(v)}`);
        });
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  // ============ REPORT DATA METHODS ============

  private async getClientsReportData(ownerUserId: string, filters?: any) {
    return this.prisma.client.findMany({
      where: { ownerUserId, ...(filters?.status ? { administrativeStatus: filters.status } : {}) },
      include: { _count: { select: { loans: true, receivables: true } } },
    });
  }

  private async getLoansReportData(ownerUserId: string, filters?: any) {
    return this.prisma.loan.findMany({
      where: { ownerUserId, ...(filters?.status ? { status: filters.status } : {}) },
      include: { client: { select: { fullName: true } } },
    });
  }

  private async getReceivablesReportData(ownerUserId: string, filters?: any) {
    return this.prisma.receivable.findMany({
      where: { ownerUserId, ...(filters?.status ? { status: filters.status } : {}) },
      include: { client: { select: { fullName: true } }, loan: { select: { modality: true } } },
    });
  }

  private async getPaymentsReportData(ownerUserId: string, filters?: any) {
    return this.prisma.payment.findMany({
      where: { ownerUserId, ...(filters?.status ? { status: filters.status } : {}) },
      include: { client: { select: { fullName: true } } },
    });
  }

  private async getFinancialReportData(ownerUserId: string, filters?: any) {
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

  private getCalculationMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      SIMPLE_INTEREST_ON_INITIAL: 'Juros Simples sobre Capital Inicial',
      SIMPLE_INTEREST_ON_BALANCE: 'Juros Simples sobre Saldo Devedor',
      PRICE_TABLE: 'Tabela Price',
      PERCENTAGE: 'Percentual',
      FIXED_VALUE: 'Valor Fixo',
      MANUAL: 'Manual',
    };
    return labels[method] || method;
  }

  private async createAuditLog(ownerUserId: string, actorUserId: string, entityType: string, entityId: string, action: string, oldValues: any, newValues: any, reason?: string) {
    await this.prisma.auditLog.create({
      data: { ownerUserId, actorUserId, entityType, entityId, action: action as any, oldValues, newValues, reason },
    });
  }
}