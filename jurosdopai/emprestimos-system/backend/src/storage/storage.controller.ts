import { Controller, Get, Post, Delete, Param, Query, Res, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { multerConfig } from '../config/multer.config';

@ApiTags('Armazenamento')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload de arquivo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('clientId') clientId?: string,
    @Query('loanId') loanId?: string,
    @Query('paymentId') paymentId?: string,
    @Query('documentType') documentType: string = 'ATTACHMENT',
  ) {
    if (!file) {
      throw new Error('Nenhum arquivo enviado');
    }

    return this.storageService.uploadFile(req.user.sub, file, {
      clientId,
      loanId,
      paymentId,
      documentType,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar arquivos' })
  @ApiQuery({ name: 'documentType', required: false })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'loanId', required: false })
  async findAll(
    @Request() req: any,
    @Query('documentType') documentType?: string,
    @Query('clientId') clientId?: string,
    @Query('loanId') loanId?: string,
  ) {
    return this.storageService.findAll(req.user.sub, { documentType, clientId, loanId });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de armazenamento' })
  async getStats(@Request() req: any) {
    return this.storageService.getStorageStats(req.user.sub);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download de arquivo' })
  async download(@Request() req: any, @Param('id') id: string, @Res() res: Response) {
    const file = await this.storageService.getFile(req.user.sub, id);
    res.download(file.path, file.fileName);
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Limpar arquivos órfãos' })
  async cleanup(@Request() req: any) {
    return this.storageService.cleanupOrphanFiles(req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir arquivo' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.storageService.delete(req.user.sub, id);
  }
}