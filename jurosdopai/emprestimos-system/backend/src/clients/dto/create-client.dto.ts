import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  fullName: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'Cliente pontual nos pagamentos' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}