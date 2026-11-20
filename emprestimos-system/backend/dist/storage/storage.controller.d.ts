import { Response } from 'express';
import { StorageService } from './storage.service';
export declare class StorageController {
    private storageService;
    constructor(storageService: StorageService);
    uploadFile(req: any, file: Express.Multer.File, clientId?: string, loanId?: string, paymentId?: string, documentType?: string): Promise<{
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
    findAll(req: any, documentType?: string, clientId?: string, loanId?: string): Promise<any>;
    getStats(req: any): Promise<{
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
    download(req: any, id: string, res: Response): Promise<void>;
    cleanup(req: any): Promise<{
        cleanedFiles: number;
    }>;
    delete(req: any, id: string): Promise<any>;
}
