import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsController {
    private clientsService;
    constructor(clientsService: ClientsService);
    create(req: any, createClientDto: CreateClientDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        whatsapp: string | null;
        notes: string | null;
        administrativeStatus: import(".prisma/client").$Enums.ClientAdministrativeStatus;
        archivedAt: Date | null;
        ownerUserId: string;
    }>;
    findAll(req: any, status?: string, search?: string): Promise<({
        _count: {
            loans: number;
            receivables: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        whatsapp: string | null;
        notes: string | null;
        administrativeStatus: import(".prisma/client").$Enums.ClientAdministrativeStatus;
        archivedAt: Date | null;
        ownerUserId: string;
    })[]>;
    findById(req: any, id: string): Promise<{
        loans: ({
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
        })[];
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        whatsapp: string | null;
        notes: string | null;
        administrativeStatus: import(".prisma/client").$Enums.ClientAdministrativeStatus;
        archivedAt: Date | null;
        ownerUserId: string;
    }>;
    getFinancialSummary(req: any, id: string): Promise<{
        totalLoans: number;
        activeLoans: number;
        paidOffLoans: number;
        totalReceivables: number;
        totalReceived: number;
        totalOutstanding: number;
        overdueReceivables: number;
    }>;
    update(req: any, id: string, updateClientDto: UpdateClientDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        whatsapp: string | null;
        notes: string | null;
        administrativeStatus: import(".prisma/client").$Enums.ClientAdministrativeStatus;
        archivedAt: Date | null;
        ownerUserId: string;
    }>;
    archive(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        whatsapp: string | null;
        notes: string | null;
        administrativeStatus: import(".prisma/client").$Enums.ClientAdministrativeStatus;
        archivedAt: Date | null;
        ownerUserId: string;
    }>;
    delete(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        whatsapp: string | null;
        notes: string | null;
        administrativeStatus: import(".prisma/client").$Enums.ClientAdministrativeStatus;
        archivedAt: Date | null;
        ownerUserId: string;
    }>;
}
