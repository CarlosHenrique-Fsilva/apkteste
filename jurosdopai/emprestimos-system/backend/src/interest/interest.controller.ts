import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InterestService } from './interest.service';
import { CreateInterestChargeDto } from './dto/create-interest-charge.dto';
import { UpdateInterestChargeDto } from './dto/update-interest-charge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Juros')
@Controller('interest')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InterestController {
  constructor(private interestService: InterestService) {}

  @Post()
  @ApiOperation({ summary: 'Criar cobrança de juros manual' })
  async create(@Request() req: any, @Body() createInterestChargeDto: CreateInterestChargeDto) {
    return this.interestService.create(req.user.sub, createInterestChargeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cobranças de juros' })
  @ApiQuery({ name: 'loanId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(
    @Request() req: any,
    @Query('loanId') loanId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.interestService.findAll(req.user.sub, {
      loanId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cobrança de juros por ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.interestService.findById(req.user.sub, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cobrança de juros' })
  async update(@Request() req: any, @Param('id') id: string, @Body() updateInterestChargeDto: UpdateInterestChargeDto) {
    return this.interestService.update(req.user.sub, id, updateInterestChargeDto);
  }

  @Put(':id/manual-amount')
  @ApiOperation({ summary: 'Definir valor manual de juros' })
  async defineManualAmount(@Request() req: any, @Param('id') id: string, @Body() body: { amount: number }) {
    return this.interestService.defineManualAmount(req.user.sub, id, body.amount);
  }

  @Post('generate-future/:loanId')
  @ApiOperation({ summary: 'Gerar cobranças de juros futuras' })
  async generateFutureCharges(@Request() req: any, @Param('loanId') loanId: string, @Query('periods') periods?: number) {
    return this.interestService.generateFutureCharges(req.user.sub, loanId, periods || 12);
  }
}