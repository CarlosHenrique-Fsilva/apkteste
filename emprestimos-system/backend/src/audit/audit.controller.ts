import { Controller, Get, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditAction } from '@prisma/client';

@ApiTags('Auditoria')
@Controller('audit')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'action', required: false, enum: ['CREATE', 'UPDATE', 'DELETE', 'CONFIRM_PAYMENT', 'REVERSE_PAYMENT', 'GENERATE_DOCUMENT', 'LOGIN', 'LOGOUT'] })
  @ApiQuery({ name: 'actorUserId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(
    @Request() req: any,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('actorUserId') actorUserId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.findAll(req.user.sub, {
      entityType,
      entityId,
      action: action as AuditAction,
      actorUserId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de auditoria' })
  async getStats(@Request() req: any) {
    return this.auditService.getAuditStats(req.user.sub);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Histórico de auditoria de uma entidade' })
  async findByEntity(@Request() req: any, @Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.auditService.findByEntity(req.user.sub, entityType, entityId);
  }
}