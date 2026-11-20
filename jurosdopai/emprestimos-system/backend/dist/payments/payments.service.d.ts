import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ReversePaymentDto } from './dto/reverse-payment.dto';
import { PaymentMethod, Prisma } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    confirmPayment(ownerUserId: string, createPaymentDto: CreatePaymentDto): Promise<{
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
            principalAmount: Prisma.Decimal;
            outstandingPrincipal: Prisma.Decimal;
            interestRate: Prisma.Decimal;
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
                amountReceived: Prisma.Decimal;
                sourceType: import(".prisma/client").$Enums.ReceivableSourceType;
                sourceId: string;
                originalAmount: Prisma.Decimal;
                outstandingAmount: Prisma.Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        recordedAt: Date;
        confirmedBy: string;
    }>;
    confirmPartialPayment(ownerUserId: string, receivableId: string, amount: number, paymentMethod: PaymentMethod, notes?: string): Promise<{
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
            principalAmount: Prisma.Decimal;
            outstandingPrincipal: Prisma.Decimal;
            interestRate: Prisma.Decimal;
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
                amountReceived: Prisma.Decimal;
                sourceType: import(".prisma/client").$Enums.ReceivableSourceType;
                sourceId: string;
                originalAmount: Prisma.Decimal;
                outstandingAmount: Prisma.Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        recordedAt: Date;
        confirmedBy: string;
    }>;
    private allocatePayment;
    private allocatePaymentToReceivable;
    private checkLoanPaidOff;
    reversePayment(ownerUserId: string, paymentId: string, reversePaymentDto: ReversePaymentDto): Promise<{
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
            principalAmount: Prisma.Decimal;
            outstandingPrincipal: Prisma.Decimal;
            interestRate: Prisma.Decimal;
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
                amountReceived: Prisma.Decimal;
                sourceType: import(".prisma/client").$Enums.ReceivableSourceType;
                sourceId: string;
                originalAmount: Prisma.Decimal;
                outstandingAmount: Prisma.Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        recordedAt: Date;
        confirmedBy: string;
    }>;
    findAll(ownerUserId: string, filters?: {
        clientId?: string;
        loanId?: string;
        startDate?: Date;
        endDate?: Date;
        status?: string;
    }): Promise<({
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
                amountReceived: Prisma.Decimal;
                sourceType: import(".prisma/client").$Enums.ReceivableSourceType;
                sourceId: string;
                originalAmount: Prisma.Decimal;
                outstandingAmount: Prisma.Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        recordedAt: Date;
        confirmedBy: string;
    })[]>;
    findById(ownerUserId: string, id: string): Promise<{
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
            principalAmount: Prisma.Decimal;
            outstandingPrincipal: Prisma.Decimal;
            interestRate: Prisma.Decimal;
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
                amountReceived: Prisma.Decimal;
                sourceType: import(".prisma/client").$Enums.ReceivableSourceType;
                sourceId: string;
                originalAmount: Prisma.Decimal;
                outstandingAmount: Prisma.Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        recordedAt: Date;
        confirmedBy: string;
    }>;
    getPaymentSummary(ownerUserId: string, filters?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        totalAmount: number;
        count: number;
        byMethod: Record<string, number>;
    }>;
    private generateReceiptCode;
}
