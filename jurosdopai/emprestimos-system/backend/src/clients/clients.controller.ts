import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Clientes')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo cliente' })
  async create(@Request() req: any, @Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(req.user.sub, createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'ARCHIVED'] })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.clientsService.findAll(req.user.sub, { status, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cliente por ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.findById(req.user.sub, id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Obter resumo financeiro do cliente' })
  async getFinancialSummary(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getFinancialSummary(req.user.sub, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  async update(@Request() req: any, @Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(req.user.sub, id, updateClientDto);
  }

  @Put(':id/archive')
  @ApiOperation({ summary: 'Arquivar cliente' })
  async archive(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.archive(req.user.sub, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir cliente' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.delete(req.user.sub, id);
  }
}