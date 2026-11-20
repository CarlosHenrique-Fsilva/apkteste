import { LoanModality, LoanCalculationMethod, PaymentFrequency } from '@prisma/client';
export declare class CreateLoanDto {
    clientId: string;
    modality: LoanModality;
    principalAmount: number;
    interestRate: number;
    calculationMethod: LoanCalculationMethod;
    paymentFrequency: PaymentFrequency;
    startDate: string;
    notes?: string;
}
