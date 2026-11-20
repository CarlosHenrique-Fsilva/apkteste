import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Usuários')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter usuário por ID' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Atualizar próprio perfil' })
  async updateProfile(@Request() req: any, @Body() data: { name?: string; email?: string; password?: string }) {
    return this.usersService.update(req.user.sub, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário (admin)' })
  async update(@Param('id') id: string, @Body() data: { name?: string; email?: string; password?: string; status?: string }) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir usuário' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}