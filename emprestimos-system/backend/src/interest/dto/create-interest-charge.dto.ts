import { IsString, IsNumber, IsDateString, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInterestChargeDto {
  @ApiProperty({ example: 'uuid-do-emprestimo' })
  @IsString()
  loanId: string;

  @ApiProperty({ example: 250.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amountDue: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  referencePeriod: string;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  manuallyDefined?: boolean;
}