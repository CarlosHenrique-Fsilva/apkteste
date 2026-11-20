import { Controller, Get, Put, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Notificações')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações' })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['SCHEDULED', 'SENT', 'READ', 'FAILED'] })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  async findAll(
    @Request() req: any,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('unreadOnly') unreadOnly?: boolean,
  ) {
    return this.notificationsService.findAll(req.user.sub, { clientId, status, unreadOnly });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  async getUnreadCount(@Request() req: any) {
    const count = await this.prisma.notification.count({
      where: { ownerUserId: req.user.sub, readAt: null },
    });
    return { count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.sub, id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Post('generate/due-soon')
  @ApiOperation({ summary: 'Gerar notificações de vencimento próximo' })
  async generateDueSoon(@Request() req: any) {
    return this.notificationsService.createDueSoonNotifications(req.user.sub);
  }

  @Post('generate/overdue')
  @ApiOperation({ summary: 'Gerar notificações de atraso' })
  async generateOverdue(@Request() req: any) {
    return this.notificationsService.createOverdueNotifications(req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir notificação' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.delete(req.user.sub, id);
  }
}