import { Controller, Get, Put, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InstallmentsService } from './installments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Parcelas')
@Controller('installments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InstallmentsController {
  constructor(private installmentsService: InstallmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar parcelas' })
  @ApiQuery({ name: 'loanId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] })
  async findAll(
    @Request() req: any,
    @Query('loanId') loanId?: string,
    @Query('status') status?: string,
  ) {
    return this.installmentsService.findAll(req.user.sub, { loanId, status });
  }

  @Get('loan/:loanId/summary')
  @ApiOperation({ summary: 'Obter resumo de parcelas de um empréstimo' })
  async getLoanInstallmentsSummary(@Request() req: any, @Param('loanId') loanId: string) {
    return this.installmentsService.getLoanInstallmentsSummary(req.user.sub, loanId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter parcela por ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.installmentsService.findById(req.user.sub, id);
  }

  @Put(':id/amount-received')
  @ApiOperation({ summary: 'Atualizar valor recebido da parcela' })
  async updateAmountReceived(@Request() req: any, @Param('id') id: string, @Body() body: { amountReceived: number }) {
    return this.installmentsService.updateAmountReceived(req.user.sub, id, body.amountReceived);
  }
}