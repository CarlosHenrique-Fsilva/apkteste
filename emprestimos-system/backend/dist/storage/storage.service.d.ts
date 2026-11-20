import { PrismaService } from '../prisma/prisma.service';
export declare class StorageService {
    private prisma;
    private storagePath;
    constructor(prisma: PrismaService);
    private ensureStorageDirectories;
    uploadFile(ownerUserId: string, file: Express.Multer.File, metadata: {
        clientId?: string;
        loanId?: string;
        paymentId?: string;
        documentType: string;
    }): Promise<{
        id: string;
        ownerUserId: string;
        clientId: string | null;
        loanId: string | null;
        paymentId: string | null;
        storagePath: string;
        generatedAt: Date;
        documentType: import(".prisma/client").$Enums.DocumentType;
        fileName: string;
        mimeType: string;
        fileSize: number;
    }>;
    getFile(ownerUserId: string, documentId: string): Promise<{
        path: string;
        fileName: string;
        mimeType: string;
    }>;
    getStorageStats(ownerUserId: string): Promise<{
        totalDocuments: number;
        totalSize: number;
        totalSizeMB: string;
        byType: Record<string, number>;
        byTypeSizeMB: {
            [k: string]: string;
        };
        disk: {
            totalGB: string;
            usedGB: string;
            freeGB: string;
            usagePercent: string;
        };
    }>;
    cleanupOrphanFiles(ownerUserId: string): Promise<{
        cleanedFiles: number;
    }>;
}
