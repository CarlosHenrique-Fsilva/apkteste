import { ReceivablesService } from './receivables.service';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
export declare class ReceivablesController {
    private receivablesService;
    constructor(receivablesService: ReceivablesService);
    findAll(req: any, clientId?: string, loanId?: string, status?: string, sourceType?: string, startDate?: string, endDate?: string, overdueOnly?: boolean): Promise<({
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
        dueDateChanges: {
            id: string;
            reason: string;
            receivableId: string;
            previousDueDate: Date;
            newDueDate: Date;
            changedBy: string;
            changedAt: Date;
        }[];
        lateFees: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            createdAt: Date;
            calculationMethod: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            receivableId: string;
            feeType: string;
            referenceDate: Date;
        }[];
    } & {
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
    })[]>;
    getDashboard(req: any): Promise<{
        totalReceivables: number;
        totalReceived: number;
        totalOutstanding: number;
        overdueCount: number;
        pendingCount: number;
        paidOffLoans: number;
        activeLoans: number;
        upcomingDue: ({
            client: {
                id: string;
                fullName: string;
                whatsapp: string | null;
            };
            loan: {
                id: string;
                modality: import(".prisma/client").$Enums.LoanModality;
            };
        } & {
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
        })[];
        overdueSummary: {
            totalOverdue: number;
            count: number;
            receivables: ({
                client: {
                    id: string;
                    fullName: string;
                    whatsapp: string | null;
                };
                loan: {
                    id: string;
                    modality: import(".prisma/client").$Enums.LoanModality;
                };
            } & {
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
            })[];
            byClient: {
                client: any;
                amount: number;
                count: number;
            }[];
        };
    }>;
    getOverdue(req: any): Promise<{
        totalOverdue: number;
        count: number;
        receivables: ({
            client: {
                id: string;
                fullName: string;
                whatsapp: string | null;
            };
            loan: {
                id: string;
                modality: import(".prisma/client").$Enums.LoanModality;
            };
        } & {
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
        })[];
        byClient: {
            client: any;
            amount: number;
            count: number;
        }[];
    }>;
    getUpcoming(req: any, days?: number): Promise<({
        client: {
            id: string;
            fullName: string;
            whatsapp: string | null;
        };
        loan: {
            id: string;
            modality: import(".prisma/client").$Enums.LoanModality;
        };
    } & {
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
        dueDateChanges: {
            id: string;
            reason: string;
            receivableId: string;
            previousDueDate: Date;
            newDueDate: Date;
            changedBy: string;
            changedAt: Date;
        }[];
        lateFees: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            createdAt: Date;
            calculationMethod: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            receivableId: string;
            feeType: string;
            referenceDate: Date;
        }[];
    } & {
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
    }>;
    update(req: any, id: string, updateReceivableDto: UpdateReceivableDto): Promise<{
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
        dueDateChanges: {
            id: string;
            reason: string;
            receivableId: string;
            previousDueDate: Date;
            newDueDate: Date;
            changedBy: string;
            changedAt: Date;
        }[];
        lateFees: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            createdAt: Date;
            calculationMethod: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            receivableId: string;
            feeType: string;
            referenceDate: Date;
        }[];
    } & {
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
    }>;
    updateDueDate(req: any, id: string, body: {
        newDueDate: string;
        reason: string;
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
        dueDateChanges: {
            id: string;
            reason: string;
            receivableId: string;
            previousDueDate: Date;
            newDueDate: Date;
            changedBy: string;
            changedAt: Date;
        }[];
        lateFees: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            createdAt: Date;
            calculationMethod: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            receivableId: string;
            feeType: string;
            referenceDate: Date;
        }[];
    } & {
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
    }>;
    addLateFee(req: any, id: string, body: {
        feeType: string;
        calculationMethod: string;
        amount: number;
        referenceDate: string;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ReceivableStatus;
        createdAt: Date;
        calculationMethod: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        receivableId: string;
        feeType: string;
        referenceDate: Date;
    }>;
}
