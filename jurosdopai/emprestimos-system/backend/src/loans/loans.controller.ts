import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Empréstimos')
@Controller('loans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo empréstimo' })
  async create(@Request() req: any, @Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(req.user.sub, createLoanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empréstimos' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'PAID_OFF', 'OVERDUE', 'RESTRUCTURED', 'CANCELLED'] })
  @ApiQuery({ name: 'clientId', required: false })
  async findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.loansService.findAll(req.user.sub, { status, clientId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter empréstimo por ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.loansService.findById(req.user.sub, id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Obter resumo financeiro do empréstimo' })
  async getLoanSummary(@Request() req: any, @Param('id') id: string) {
    return this.loansService.getLoanSummary(req.user.sub, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar empréstimo' })
  async update(@Request() req: any, @Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(req.user.sub, id, updateLoanDto);
  }

  @Post(':id/amortization')
  @ApiOperation({ summary: 'Aplicar amortização extraordinária (juros periódicos)' })
  async applyAmortization(@Request() req: any, @Param('id') id: string, @Body() body: { amount: number }) {
    return this.loansService.applyExtraordinaryAmortization(req.user.sub, id, body.amount);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir empréstimo' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.loansService.delete(req.user.sub, id);
  }
}