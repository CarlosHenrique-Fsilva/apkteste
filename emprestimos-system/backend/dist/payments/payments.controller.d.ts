import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ReversePaymentDto } from './dto/reverse-payment.dto';
import { PaymentMethod } from '@prisma/client';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    confirmPayment(req: any, createPaymentDto: CreatePaymentDto): Promise<{
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
        };
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
        documents: {
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
        }[];
        allocations: ({
            receivable: {
                id: string;
                status: import(".prisma/client").$Enums.ReceivableStatus;
                createdAt: Date;
                updatedAt: Date;
                ownerUserId: string;
                clientId: string;
                loanId: string;
                dueDate: Date;
                amountReceived: import("@prisma/client/runtime/library").Decimal;
                sourceType: import(".prisma/client").$Enums.ReceivableSourceType;
                sourceId: string;
                originalAmount: import("@prisma/client/runtime/library").Decimal;
                outstandingAmount: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: import("@prisma/client/runtime/library").Decimal;
            allocationType: string;
            paymentId: string;
        })[];
        receipts: {
            id: string;
            paymentId: string;
            receiptCode: string;
            storagePath: string;
            generatedAt: Date;
        }[];
    } & {
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
    }>;
    confirmPartialPayment(req: any, receivableId: string, body: {
        amount: number;
        paymentMethod: PaymentMethod;
        notes?: string;
    }): Promise<{
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
        };
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
        documents: {
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
        }[];
        allocations: ({
            receivable: {
                id: string;
                status: import(".prisma/client").$Enums.ReceivableStatus;
                createdAt: Date;
                updatedAt: Date;
                ownerUserId: string;
                clientId: string;
                loanId: string;
                dueDate: Date;
                amountReceived: import("@prisma/client/runtime/library").Decimal;
                sourceType: import(".prisma/client").$Enums.ReceivableSourceType;
                sourceId: string;
                originalAmount: import("@prisma/client/runtime/library").Decimal;
                outstandingAmount: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: import("@prisma/client/runtime/library").Decimal;
            allocationType: string;
            paymentId: string;
        })[];
        receipts: {
            id: string;
            paymentId: string;
            receiptCode: string;
            storagePath: string;
            generatedAt: Date;
        }[];
    } & {
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
    }>;
    findAll(req: any, clientId?: string, loanId?: string, status?: string, startDate?: string, endDate?: string): Promise<({
        client: {
            id: string;
            fullName: string;
        };
        loan: {
            id: string;
            modality: import(".prisma/client").$Enums.LoanModality;
        } | null;
        allocations: ({
            receivable: {
                id: string;
                status: import(".prisma/client").$Enums.ReceivableStatus;
                createdAt: Date;
                updatedAt: Date;
                ownerUserId: string;
                clientId: string;
                loanId: string;
                dueDate: Date;
                amountReceived: import("@prisma/client/runtime/library").Decimal;
                sourceType: import(".prisma/client").$Enums.ReceivableSourceType;
                sourceId: string;
                originalAmount: import("@prisma/client/runtime/library").Decimal;
                outstandingAmount: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: import("@prisma/client/runtime/library").Decimal;
            allocationType: string;
            paymentId: string;
        })[];
        receipts: {
            id: string;
            paymentId: string;
            receiptCode: string;
            storagePath: string;
            generatedAt: Date;
        }[];
    } & {
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
    })[]>;
    getSummary(req: any, startDate?: string, endDate?: string): Promise<{
        totalAmount: number;
        count: number;
        byMethod: Record<string, number>;
    }>;
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
        };
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
        documents: {
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
        }[];
        allocations: ({
            receivable: {
                id: string;
                status: import(".prisma/client").$Enums.ReceivableStatus;
                createdAt: Date;
                updatedAt: Date;
                ownerUserId: string;
                clientId: string;
                loanId: string;
                dueDate: Date;
                amountReceived: import("@prisma/client/runtime/library").Decimal;
                sourceType: import(".prisma/client").$Enums.ReceivableSourceType;
                sourceId: string;
                originalAmount: import("@prisma/client/runtime/library").Decimal;
                outstandingAmount: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: import("@prisma/client/runtime/library").Decimal;
            allocationType: string;
            paymentId: string;
        })[];
        receipts: {
            id: string;
            paymentId: string;
            receiptCode: string;
            storagePath: string;
            generatedAt: Date;
        }[];
    } & {
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
    }>;
    reversePayment(req: any, id: string, reversePaymentDto: ReversePaymentDto): Promise<{
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
        };
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
        documents: {
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
        }[];
        allocations: ({
            receivable: {
                id: string;
                status: import(".prisma/client").$Enums.ReceivableStatus;
                createdAt: Date;
                updatedAt: Date;
                ownerUserId: string;
                clientId: string;
                loanId: string;
                dueDate: Date;
                amountReceived: import("@prisma/client/runtime/library").Decimal;
                sourceType: import(".prisma/client").$Enums.ReceivableSourceType;
                sourceId: string;
                originalAmount: import("@prisma/client/runtime/library").Decimal;
                outstandingAmount: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: import("@prisma/client/runtime/library").Decimal;
            allocationType: string;
            paymentId: string;
        })[];
        receipts: {
            id: string;
            paymentId: string;
            receiptCode: string;
            storagePath: string;
            generatedAt: Date;
        }[];
    } & {
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
    }>;
}
