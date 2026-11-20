import { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getFinancialReport(req: any, startDate?: string, endDate?: string): Promise<{
        period: {
            startDate: Date | undefined;
            endDate: Date | undefined;
        };
        summary: {
            totalClients: number;
            activeLoans: number;
            paidOffLoans: number;
            totalReceivables: number;
            totalReceived: number;
            totalOutstanding: number;
            totalOverdue: number;
            collectionRate: number;
        };
        byPaymentMethod: Record<string, number>;
        byLoanModality: Record<string, number>;
        monthlyBreakdown: {
            collectionRate: number;
            received: number;
            due: number;
            paid: number;
            month: string;
        }[];
        topClients: {
            name: string;
            total: number;
            count: number;
            clientId: string;
        }[];
    }>;
    getClientsReport(req: any): Promise<{
        client: {
            id: string;
            fullName: string;
            whatsapp: string | null;
            status: import(".prisma/client").$Enums.ClientAdministrativeStatus;
        };
        totalLoans: number;
        activeLoans: number;
        totalReceivables: number;
        totalReceived: number;
        totalOutstanding: number;
        overdueCount: number;
        paymentRate: number;
    }[]>;
    getLoansReport(req: any): Promise<{
        loan: {
            id: string;
            modality: import(".prisma/client").$Enums.LoanModality;
            status: import(".prisma/client").$Enums.LoanStatus;
            principalAmount: import("@prisma/client/runtime/library").Decimal;
            interestRate: import("@prisma/client/runtime/library").Decimal;
        };
        client: {
            id: string;
            fullName: string;
        };
        totalReceivables: number;
        totalReceived: number;
        totalOutstanding: number;
        overdueCount: number;
        pendingInterestCharges: number;
        pendingInstallments: number;
        progress: number;
    }[]>;
    getReceivablesReport(req: any, status?: string, overdueOnly?: boolean): Promise<{
        daysOverdue: number;
        client: {
            id: string;
            fullName: string;
            whatsapp: string | null;
        };
        loan: {
            id: string;
            modality: import(".prisma/client").$Enums.LoanModality;
        };
        payments: ({
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
            };
        } & {
            id: string;
            createdAt: Date;
            receivableId: string;
            allocatedAmount: import("@prisma/client/runtime/library").Decimal;
            allocationType: string;
            paymentId: string;
        })[];
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
    }[]>;
    getPaymentsReport(req: any, startDate?: string, endDate?: string): Promise<({
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
    getAgingReport(req: any): Promise<({
        label: string;
        amount: number;
        count: number;
        items: any[];
    } | {
        label: string;
        amount: number;
        count: number;
        items: any[];
    } | {
        label: string;
        amount: number;
        count: number;
        items: any[];
    } | {
        label: string;
        amount: number;
        count: number;
        items: any[];
    } | {
        label: string;
        amount: number;
        count: number;
        items: any[];
    })[]>;
    exportCSV(req: any, type: 'clients' | 'loans' | 'receivables' | 'payments', res: Response): Promise<void>;
}
