import { InterestService } from './interest.service';
import { CreateInterestChargeDto } from './dto/create-interest-charge.dto';
import { UpdateInterestChargeDto } from './dto/update-interest-charge.dto';
export declare class InterestController {
    private interestService;
    constructor(interestService: InterestService);
    create(req: any, createInterestChargeDto: CreateInterestChargeDto): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        manuallyDefined: boolean;
        referencePeriod: Date;
        dueDate: Date;
    }>;
    findAll(req: any, loanId?: string, status?: string, startDate?: string, endDate?: string): Promise<({
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
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        manuallyDefined: boolean;
        referencePeriod: Date;
        dueDate: Date;
    })[]>;
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
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        manuallyDefined: boolean;
        referencePeriod: Date;
        dueDate: Date;
    }>;
    update(req: any, id: string, updateInterestChargeDto: UpdateInterestChargeDto): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        manuallyDefined: boolean;
        referencePeriod: Date;
        dueDate: Date;
    }>;
    defineManualAmount(req: any, id: string, body: {
        amount: number;
    }): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        manuallyDefined: boolean;
        referencePeriod: Date;
        dueDate: Date;
    }>;
    generateFutureCharges(req: any, loanId: string, periods?: number): Promise<({
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
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        manuallyDefined: boolean;
        referencePeriod: Date;
        dueDate: Date;
    })[]>;
}
