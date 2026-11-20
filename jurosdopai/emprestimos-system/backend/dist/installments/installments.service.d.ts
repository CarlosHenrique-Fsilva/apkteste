import { PrismaService } from '../prisma/prisma.service';
export declare class InstallmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(ownerUserId: string, filters?: {
        loanId?: string;
        status?: string;
    }): Promise<({
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
    findById(ownerUserId: string, id: string): Promise<{
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
    updateAmountReceived(ownerUserId: string, id: string, amountReceived: number): Promise<{
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
    getLoanInstallmentsSummary(ownerUserId: string, loanId: string): Promise<{
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
}
