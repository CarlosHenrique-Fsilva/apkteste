import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class PaymentAllocationDto {
  @ApiProperty({ example: 'uuid-do-recebivel' })
  @IsString()
  receivableId: string;

  @ApiProperty({ example: 100.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-do-cliente' })
  @IsString()
  clientId: string;

  @ApiPropertyOptional({ example: 'uuid-do-emprestimo' })
  @IsOptional()
  @IsString()
  loanId?: string;

  @ApiProperty({ example: 250.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.PIX })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  receivedAt: string;

  @ApiPropertyOptional({ example: 'Pagamento referente a janeiro/2024' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ type: [PaymentAllocationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationDto)
  allocations?: PaymentAllocationDto[];
}