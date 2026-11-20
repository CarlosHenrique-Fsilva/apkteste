import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReversePaymentDto {
  @ApiProperty({ example: 'Pagamento registrado em duplicidade' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason: string;
}