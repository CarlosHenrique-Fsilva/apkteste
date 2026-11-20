import { PrismaService } from '../prisma/prisma.service';
import { CreateInterestChargeDto } from './dto/create-interest-charge.dto';
import { UpdateInterestChargeDto } from './dto/update-interest-charge.dto';
export declare class InterestService {
    private prisma;
    constructor(prisma: PrismaService);
    create(ownerUserId: string, createInterestChargeDto: CreateInterestChargeDto): Promise<{
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
    findAll(ownerUserId: string, filters?: {
        loanId?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
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
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        manuallyDefined: boolean;
        referencePeriod: Date;
        dueDate: Date;
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
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        manuallyDefined: boolean;
        referencePeriod: Date;
        dueDate: Date;
    }>;
    update(ownerUserId: string, id: string, updateInterestChargeDto: UpdateInterestChargeDto): Promise<{
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
    defineManualAmount(ownerUserId: string, id: string, amount: number): Promise<{
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
    generateFutureCharges(ownerUserId: string, loanId: string, periods?: number): Promise<({
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
    private calculatePeriodicInterest;
    private addPeriod;
}
