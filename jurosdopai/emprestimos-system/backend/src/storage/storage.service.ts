import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
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

  async uploadFile(ownerUserId: string, file: Express.Multer.File, metadata: {
    clientId?: string;
    loanId?: string;
    paymentId?: string;
    documentType: string;
  }) {
    // Verify ownership of related entities
    if (metadata.clientId) {
      const client = await this.prisma.client.findFirst({
        where: { id: metadata.clientId, ownerUserId },
      });
      if (!client) throw new ForbiddenException('Cliente não pertence a este usuário');
    }

    if (metadata.loanId) {
      const loan = await this.prisma.loan.findFirst({
        where: { id: metadata.loanId, ownerUserId },
      });
      if (!loan) throw new ForbiddenException('Empréstimo não pertence a este usuário');
    }

    if (metadata.paymentId) {
      const payment = await this.prisma.payment.findFirst({
        where: { id: metadata.paymentId, ownerUserId },
      });
      if (!payment) throw new ForbiddenException('Pagamento não pertence a este usuário');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const relativePath = path.join(metadata.documentType.toLowerCase(), fileName);
    const fullPath = path.join(this.storagePath, relativePath);

    fs.writeFileSync(fullPath, file.buffer);

    const document = await this.prisma.document.create({
      data: {
        ownerUserId,
        clientId: metadata.clientId,
        loanId: metadata.loanId,
        paymentId: metadata.paymentId,
        documentType: metadata.documentType as any,
        fileName,
        storagePath: relativePath,
        mimeType: file.mimetype,
        fileSize: file.size,
      },
    });

    return document;
  }

  async getFile(ownerUserId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, ownerUserId },
    });
    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    const fullPath = path.join(this.storagePath, document.storagePath);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('Arquivo não encontrado no armazenamento');
    }

    return { path: fullPath, fileName: document.fileName, mimeType: document.mimeType };
  }

  async getStorageStats(ownerUserId: string) {
    const documents = await this.prisma.document.findMany({
      where: { ownerUserId },
      select: { fileSize: true, documentType: true },
    });

    const totalSize = documents.reduce((sum, d) => sum + d.fileSize, 0);
    const byType = documents.reduce((acc, d) => {
      acc[d.documentType] = (acc[d.documentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byTypeSize = documents.reduce((acc, d) => {
      acc[d.documentType] = (acc[d.documentType] || 0) + d.fileSize;
      return acc;
    }, {} as Record<string, number>);

    // Check disk space
    const { execSync } = require('child_process');
    let diskInfo = { total: 0, free: 0, used: 0 };
    try {
      const df = execSync('df -B1 ' + this.storagePath).toString().split('\n')[1].split(/\s+/);
      diskInfo = { total: parseInt(df[1]), used: parseInt(df[2]), free: parseInt(df[3]) };
    } catch (e) {
      // Ignore disk info errors
    }

    return {
      totalDocuments: documents.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      byType,
      byTypeSizeMB: Object.fromEntries(
        Object.entries(byTypeSize).map(([k, v]) => [k, (v / (1024 * 1024)).toFixed(2)])
      ),
      disk: {
        totalGB: (diskInfo.total / (1024 * 1024 * 1024)).toFixed(2),
        usedGB: (diskInfo.used / (1024 * 1024 * 1024)).toFixed(2),
        freeGB: (diskInfo.free / (1024 * 1024 * 1024)).toFixed(2),
        usagePercent: diskInfo.total > 0 ? ((diskInfo.used / diskInfo.total) * 100).toFixed(1) : '0',
      },
    };
  }

  async cleanupOrphanFiles(ownerUserId: string) {
    const documents = await this.prisma.document.findMany({
      where: { ownerUserId },
      select: { storagePath: true },
    });

    const validPaths = new Set(documents.map(d => d.storagePath));
    let cleaned = 0;

    const dirs = ['contracts', 'receipts', 'settlements', 'reports', 'attachments'];
    for (const dir of dirs) {
      const fullDir = path.join(this.storagePath, dir);
      if (fs.existsSync(fullDir)) {
        const files = fs.readdirSync(fullDir);
        for (const file of files) {
          const relPath = path.join(dir, file);
          if (!validPaths.has(relPath)) {
            fs.unlinkSync(path.join(fullDir, file));
            cleaned++;
          }
        }
      }
    }

    return { cleanedFiles: cleaned };
  }
}