import { Controller, Get, Query, Res, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Relatórios')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('financial')
  @ApiOperation({ summary: 'Relatório financeiro consolidado' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getFinancialReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getFinancialReport(req.user.sub, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get('clients')
  @ApiOperation({ summary: 'Relatório de clientes' })
  async getClientsReport(@Request() req: any) {
    return this.reportsService.getClientsReport(req.user.sub);
  }

  @Get('loans')
  @ApiOperation({ summary: 'Relatório de empréstimos' })
  async getLoansReport(@Request() req: any) {
    return this.reportsService.getLoansReport(req.user.sub);
  }

  @Get('receivables')
  @ApiOperation({ summary: 'Relatório de recebíveis' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] })
  @ApiQuery({ name: 'overdueOnly', required: false, type: Boolean })
  async getReceivablesReport(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('overdueOnly') overdueOnly?: boolean,
  ) {
    return this.reportsService.getReceivablesReport(req.user.sub, { status, overdueOnly });
  }

  @Get('payments')
  @ApiOperation({ summary: 'Relatório de pagamentos' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getPaymentsReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPaymentsReport(req.user.sub, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get('aging')
  @ApiOperation({ summary: 'Relatório de envelhecimento de recebíveis' })
  async getAgingReport(@Request() req: any) {
    return this.reportsService.getAgingReport(req.user.sub);
  }

  @Get('export/:type')
  @ApiOperation({ summary: 'Exportar relatório em CSV' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async exportCSV(
    @Request() req: any,
    @Param('type') type: 'clients' | 'loans' | 'receivables' | 'payments',
    @Res() res: Response,
  ) {
    const csv = await this.reportsService.exportToCSV(req.user.sub, type);
    const fileName = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send('﻿' + csv); // BOM for UTF-8 Excel compatibility
  }
}