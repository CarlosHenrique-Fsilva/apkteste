import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReceivablesService } from './receivables.service';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReceivableStatus, ReceivableSourceType } from '@prisma/client';

@ApiTags('Recebíveis')
@Controller('receivables')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReceivablesController {
  constructor(private receivablesService: ReceivablesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar recebíveis' })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'loanId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] })
  @ApiQuery({ name: 'sourceType', required: false, enum: ['INTEREST_CHARGE', 'INSTALLMENT', 'LATE_FEE', 'MANUAL_ADJUSTMENT'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'overdueOnly', required: false, type: Boolean })
  async findAll(
    @Request() req: any,
    @Query('clientId') clientId?: string,
    @Query('loanId') loanId?: string,
    @Query('status') status?: string,
    @Query('sourceType') sourceType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('overdueOnly') overdueOnly?: boolean,
  ) {
    return this.receivablesService.findAll(req.user.sub, {
      clientId,
      loanId,
      status,
      sourceType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      overdueOnly,
    });
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter dashboard financeiro' })
  async getDashboard(@Request() req: any) {
    return this.receivablesService.getFinancialDashboard(req.user.sub);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Obter resumo de recebíveis em atraso' })
  async getOverdue(@Request() req: any) {
    return this.receivablesService.getOverdueSummary(req.user.sub);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Obter recebíveis com vencimento próximo' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getUpcoming(@Request() req: any, @Query('days') days?: number) {
    return this.receivablesService.getUpcomingDue(req.user.sub, days || 7);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter recebível por ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.receivablesService.findById(req.user.sub, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar recebível' })
  async update(@Request() req: any, @Param('id') id: string, @Body() updateReceivableDto: UpdateReceivableDto) {
    return this.receivablesService.update(req.user.sub, id, updateReceivableDto);
  }

  @Put(':id/due-date')
  @ApiOperation({ summary: 'Alterar data de vencimento' })
  async updateDueDate(@Request() req: any, @Param('id') id: string, @Body() body: { newDueDate: string; reason: string }) {
    return this.receivablesService.updateDueDate(req.user.sub, id, new Date(body.newDueDate), body.reason);
  }

  @Post(':id/late-fee')
  @ApiOperation({ summary: 'Adicionar multa por atraso' })
  async addLateFee(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { feeType: string; calculationMethod: string; amount: number; referenceDate: string },
  ) {
    return this.receivablesService.addLateFee(req.user.sub, id, body.feeType, body.calculationMethod, body.amount, new Date(body.referenceDate));
  }
}