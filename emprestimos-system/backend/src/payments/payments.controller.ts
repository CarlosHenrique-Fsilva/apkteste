import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ReversePaymentDto } from './dto/reverse-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentMethod } from '@prisma/client';

@ApiTags('Pagamentos')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Confirmar pagamento manual' })
  async confirmPayment(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.confirmPayment(req.user.sub, createPaymentDto);
  }

  @Post('partial/:receivableId')
  @ApiOperation({ summary: 'Confirmar pagamento parcial de um recebível' })
  async confirmPartialPayment(
    @Request() req: any,
    @Param('receivableId') receivableId: string,
    @Body() body: { amount: number; paymentMethod: PaymentMethod; notes?: string },
  ) {
    return this.paymentsService.confirmPartialPayment(req.user.sub, receivableId, body.amount, body.paymentMethod, body.notes);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos' })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'loanId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['CONFIRMED', 'PENDING_CONFIRMATION', 'REVERSED', 'PARTIAL'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(
    @Request() req: any,
    @Query('clientId') clientId?: string,
    @Query('loanId') loanId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.findAll(req.user.sub, {
      clientId,
      loanId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo de pagamentos' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSummary(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getPaymentSummary(req.user.sub, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter pagamento por ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.findById(req.user.sub, id);
  }

  @Put(':id/reverse')
  @ApiOperation({ summary: 'Estornar pagamento' })
  async reversePayment(@Request() req: any, @Param('id') id: string, @Body() reversePaymentDto: ReversePaymentDto) {
    return this.paymentsService.reversePayment(req.user.sub, id, reversePaymentDto);
  }
}