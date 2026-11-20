import { InstallmentsService } from './installments.service';
export declare class InstallmentsController {
    private installmentsService;
    constructor(installmentsService: InstallmentsService);
    findAll(req: any, loanId?: string, status?: string): Promise<({
        loan: {
            client: {
                id: string;
                fullName: string;
            };
            id: string;
            modality: import(".prisma/client").$Enums.LoanModality;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ReceivableStatus;
        loanId: string;
        dueDate: Date;
        installmentNumber: number;
        principalComponent: import("@prisma/client/runtime/library").Decimal;
        interestComponent: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        amountReceived: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    getLoanInstallmentsSummary(req: any, loanId: string): Promise<{
        installments: ({
            loan: {
                client: {
                    id: string;
                    fullName: string;
                };
                id: string;
                modality: import(".prisma/client").$Enums.LoanModality;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            loanId: string;
            dueDate: Date;
            installmentNumber: number;
            principalComponent: import("@prisma/client/runtime/library").Decimal;
            interestComponent: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            amountReceived: import("@prisma/client/runtime/library").Decimal;
        })[];
        totalAmount: number;
        totalReceived: number;
        totalOutstanding: number;
        paidCount: number;
        partialCount: number;
        pendingCount: number;
        overdueCount: number;
        progressPercentage: number;
    }>;
    findById(req: any, id: string): Promise<{
        loan: {
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
        } & {
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
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ReceivableStatus;
        loanId: string;
        dueDate: Date;
        installmentNumber: number;
        principalComponent: import("@prisma/client/runtime/library").Decimal;
        interestComponent: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        amountReceived: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateAmountReceived(req: any, id: string, body: {
        amountReceived: number;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ReceivableStatus;
        loanId: string;
        dueDate: Date;
        installmentNumber: number;
        principalComponent: import("@prisma/client/runtime/library").Decimal;
        interestComponent: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        amountReceived: import("@prisma/client/runtime/library").Decimal;
    }>;
}
