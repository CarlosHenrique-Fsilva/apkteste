import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
export declare class LoansController {
    private loansService;
    constructor(loansService: LoansService);
    create(req: any, createLoanDto: CreateLoanDto): Promise<{
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
        receivables: {
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
        }[];
        payments: {
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
        }[];
        interestCharges: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            createdAt: Date;
            updatedAt: Date;
            loanId: string;
            amountDue: import("@prisma/client/runtime/library").Decimal;
            manuallyDefined: boolean;
            referencePeriod: Date;
            dueDate: Date;
        }[];
        installments: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            loanId: string;
            dueDate: Date;
            installmentNumber: number;
            principalComponent: import("@prisma/client/runtime/library").Decimal;
            interestComponent: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            amountReceived: import("@prisma/client/runtime/library").Decimal;
        }[];
        terms: {
            id: string;
            createdAt: Date;
            principalAmount: import("@prisma/client/runtime/library").Decimal;
            interestRate: import("@prisma/client/runtime/library").Decimal;
            calculationMethod: import(".prisma/client").$Enums.LoanCalculationMethod;
            loanId: string;
            termCount: number;
            termsSnapshot: import("@prisma/client/runtime/library").JsonValue;
        }[];
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
    }>;
    findAll(req: any, status?: string, clientId?: string): Promise<({
        client: {
            id: string;
            fullName: string;
        };
        _count: {
            receivables: number;
            interestCharges: number;
            installments: number;
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
        receivables: {
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
        }[];
        payments: {
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
        }[];
        interestCharges: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            createdAt: Date;
            updatedAt: Date;
            loanId: string;
            amountDue: import("@prisma/client/runtime/library").Decimal;
            manuallyDefined: boolean;
            referencePeriod: Date;
            dueDate: Date;
        }[];
        installments: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            loanId: string;
            dueDate: Date;
            installmentNumber: number;
            principalComponent: import("@prisma/client/runtime/library").Decimal;
            interestComponent: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            amountReceived: import("@prisma/client/runtime/library").Decimal;
        }[];
        terms: {
            id: string;
            createdAt: Date;
            principalAmount: import("@prisma/client/runtime/library").Decimal;
            interestRate: import("@prisma/client/runtime/library").Decimal;
            calculationMethod: import(".prisma/client").$Enums.LoanCalculationMethod;
            loanId: string;
            termCount: number;
            termsSnapshot: import("@prisma/client/runtime/library").JsonValue;
        }[];
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
    }>;
    getLoanSummary(req: any, id: string): Promise<{
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
            receivables: {
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
            }[];
            payments: {
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
            }[];
            interestCharges: {
                id: string;
                status: import(".prisma/client").$Enums.ReceivableStatus;
                createdAt: Date;
                updatedAt: Date;
                loanId: string;
                amountDue: import("@prisma/client/runtime/library").Decimal;
                manuallyDefined: boolean;
                referencePeriod: Date;
                dueDate: Date;
            }[];
            installments: {
                id: string;
                status: import(".prisma/client").$Enums.ReceivableStatus;
                loanId: string;
                dueDate: Date;
                installmentNumber: number;
                principalComponent: import("@prisma/client/runtime/library").Decimal;
                interestComponent: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                amountReceived: import("@prisma/client/runtime/library").Decimal;
            }[];
            terms: {
                id: string;
                createdAt: Date;
                principalAmount: import("@prisma/client/runtime/library").Decimal;
                interestRate: import("@prisma/client/runtime/library").Decimal;
                calculationMethod: import(".prisma/client").$Enums.LoanCalculationMethod;
                loanId: string;
                termCount: number;
                termsSnapshot: import("@prisma/client/runtime/library").JsonValue;
            }[];
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
        totalReceivables: number;
        totalReceived: number;
        totalOutstanding: number;
        overdueCount: number;
        pendingCount: number;
        progressPercentage: number;
    }>;
    update(req: any, id: string, updateLoanDto: UpdateLoanDto): Promise<{
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
        receivables: {
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
        }[];
        payments: {
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
        }[];
        interestCharges: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            createdAt: Date;
            updatedAt: Date;
            loanId: string;
            amountDue: import("@prisma/client/runtime/library").Decimal;
            manuallyDefined: boolean;
            referencePeriod: Date;
            dueDate: Date;
        }[];
        installments: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            loanId: string;
            dueDate: Date;
            installmentNumber: number;
            principalComponent: import("@prisma/client/runtime/library").Decimal;
            interestComponent: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            amountReceived: import("@prisma/client/runtime/library").Decimal;
        }[];
        terms: {
            id: string;
            createdAt: Date;
            principalAmount: import("@prisma/client/runtime/library").Decimal;
            interestRate: import("@prisma/client/runtime/library").Decimal;
            calculationMethod: import(".prisma/client").$Enums.LoanCalculationMethod;
            loanId: string;
            termCount: number;
            termsSnapshot: import("@prisma/client/runtime/library").JsonValue;
        }[];
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
    }>;
    applyAmortization(req: any, id: string, body: {
        amount: number;
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
        receivables: {
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
        }[];
        payments: {
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
        }[];
        interestCharges: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            createdAt: Date;
            updatedAt: Date;
            loanId: string;
            amountDue: import("@prisma/client/runtime/library").Decimal;
            manuallyDefined: boolean;
            referencePeriod: Date;
            dueDate: Date;
        }[];
        installments: {
            id: string;
            status: import(".prisma/client").$Enums.ReceivableStatus;
            loanId: string;
            dueDate: Date;
            installmentNumber: number;
            principalComponent: import("@prisma/client/runtime/library").Decimal;
            interestComponent: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            amountReceived: import("@prisma/client/runtime/library").Decimal;
        }[];
        terms: {
            id: string;
            createdAt: Date;
            principalAmount: import("@prisma/client/runtime/library").Decimal;
            interestRate: import("@prisma/client/runtime/library").Decimal;
            calculationMethod: import(".prisma/client").$Enums.LoanCalculationMethod;
            loanId: string;
            termCount: number;
            termsSnapshot: import("@prisma/client/runtime/library").JsonValue;
        }[];
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
    }>;
    delete(req: any, id: string): Promise<{
        message: string;
    }>;
}
