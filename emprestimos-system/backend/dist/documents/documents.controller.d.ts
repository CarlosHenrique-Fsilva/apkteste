import { Response } from 'express';
import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    generateContract(req: any, loanId: string): Promise<{
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
    generateReceipt(req: any, paymentId: string): Promise<{
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
    generateSettlementTerm(req: any, loanId: string): Promise<{
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
    generateReport(req: any, type: 'clients' | 'loans' | 'receivables' | 'payments' | 'financial', filters: any): Promise<{
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
    findAll(req: any, documentType?: string, clientId?: string, loanId?: string): Promise<({
        client: {
            id: string;
            fullName: string;
        } | null;
        loan: {
            id: string;
            modality: import(".prisma/client").$Enums.LoanModality;
        } | null;
        payment: {
            id: string;
            amount: import("@prisma/client/runtime/library").Decimal;
        } | null;
    } & {
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
    })[]>;
    findById(req: any, id: string): Promise<{
        client: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            whatsapp: string | null;
            notes: string | null;
            administrativeStatus: import(".prisma/client").$Enums.ClientAdministrativeStatus;
            archivedAt: Date | null;
            ownerUserId: string;
        } | null;
        loan: {
            id: string;
            status: import(".prisma/client").$Enums.LoanStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            ownerUserId: string;
            clientId: string;
            modality: import(".prisma/client").$Enums.LoanModality;
            principalAmount: import("@prisma/client/runtime/library").Decimal;
            outstandingPrincipal: import("@prisma/client/runtime/library").Decimal;
            interestRate: import("@prisma/client/runtime/library").Decimal;
            calculationMethod: import(".prisma/client").$Enums.LoanCalculationMethod;
            paymentFrequency: import(".prisma/client").$Enums.PaymentFrequency;
            startDate: Date;
            firstDueDate: Date;
        } | null;
        payment: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            notes: string | null;
            ownerUserId: string;
            clientId: string;
            loanId: string | null;
            receivedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            recordedAt: Date;
            confirmedBy: string;
        } | null;
    } & {
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
    download(req: any, id: string, res: Response): Promise<void>;
    delete(req: any, id: string): Promise<{
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
}
