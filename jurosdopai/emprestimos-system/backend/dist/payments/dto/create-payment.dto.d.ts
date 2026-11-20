import { PaymentMethod } from '@prisma/client';
export declare class PaymentAllocationDto {
    receivableId: string;
    amount: number;
}
export declare class CreatePaymentDto {
    clientId: string;
    loanId?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    receivedAt: string;
    notes?: string;
    allocations?: PaymentAllocationDto[];
}
