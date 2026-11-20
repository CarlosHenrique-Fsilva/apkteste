import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, Min, Max, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanModality, LoanCalculationMethod, PaymentFrequency } from '@prisma/client';

export class CreateLoanDto {
  @ApiProperty({ example: 'uuid-do-cliente' })
  @IsString()
  clientId: string;

  @ApiProperty({ enum: LoanModality, example: LoanModality.PERIODIC_INTEREST })
  @IsEnum(LoanModality)
  modality: LoanModality;

  @ApiProperty({ example: 5000.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  principalAmount: number;

  @ApiProperty({ example: 0.05, description: 'Taxa de juros (ex: 0.05 para 5%)' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  interestRate: number;

  @ApiProperty({ enum: LoanCalculationMethod, example: LoanCalculationMethod.SIMPLE_INTEREST_ON_INITIAL })
  @IsEnum(LoanCalculationMethod)
  calculationMethod: LoanCalculationMethod;

  @ApiProperty({ enum: PaymentFrequency, example: PaymentFrequency.MONTHLY })
  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: 'Empréstimo para capital de giro' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}