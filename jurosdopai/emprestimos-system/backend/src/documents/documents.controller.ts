import { Controller, Get, Post, Delete, Param, Query, Res, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentType } from '@prisma/client';

@ApiTags('Documentos')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('generate/contract/:loanId')
  @ApiOperation({ summary: 'Gerar contrato de empréstimo' })
  async generateContract(@Request() req: any, @Param('loanId') loanId: string) {
    return this.documentsService.generateContract(req.user.sub, loanId);
  }

  @Post('generate/receipt/:paymentId')
  @ApiOperation({ summary: 'Gerar comprovante de pagamento' })
  async generateReceipt(@Request() req: any, @Param('paymentId') paymentId: string) {
    return this.documentsService.generateReceipt(req.user.sub, paymentId);
  }

  @Post('generate/settlement/:loanId')
  @ApiOperation({ summary: 'Gerar termo de quitação' })
  async generateSettlementTerm(@Request() req: any, @Param('loanId') loanId: string) {
    return this.documentsService.generateSettlementTerm(req.user.sub, loanId);
  }

  @Post('generate/report/:type')
  @ApiOperation({ summary: 'Gerar relatório' })
  async generateReport(
    @Request() req: any,
    @Param('type') type: 'clients' | 'loans' | 'receivables' | 'payments' | 'financial',
    @Query() filters: any,
  ) {
    return this.documentsService.generateReport(req.user.sub, type, filters);
  }

  @Get()
  @ApiOperation({ summary: 'Listar documentos' })
  @ApiQuery({ name: 'documentType', required: false, enum: ['CONTRACT', 'RECEIPT', 'SETTLEMENT_TERM', 'REPORT', 'ATTACHMENT'] })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'loanId', required: false })
  async findAll(
    @Request() req: any,
    @Query('documentType') documentType?: string,
    @Query('clientId') clientId?: string,
    @Query('loanId') loanId?: string,
  ) {
    return this.documentsService.findAll(req.user.sub, { documentType, clientId, loanId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter documento por ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.findById(req.user.sub, id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download do arquivo do documento' })
  async download(@Request() req: any, @Param('id') id: string, @Res() res: Response) {
    const file = await this.documentsService.getFile(req.user.sub, id);
    res.download(file.path, file.fileName);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir documento' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.delete(req.user.sub, id);
  }
}