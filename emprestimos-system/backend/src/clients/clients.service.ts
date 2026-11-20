import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerUserId: string, createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        ...createClientDto,
        ownerUserId,
      },
    });
  }

  async findAll(ownerUserId: string, filters?: { status?: string; search?: string }) {
    const where: any = { ownerUserId };
    if (filters?.status) {
      where.administrativeStatus = filters.status;
    }
    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { whatsapp: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { loans: true, receivables: true },
        },
      },
    });
  }

  async findById(ownerUserId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, ownerUserId },
      include: {
        loans: {
          include: {
            interestCharges: true,
            installments: true,
          },
        },
        receivables: true,
        payments: true,
        documents: true,
      },
    });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return client;
  }

  async update(ownerUserId: string, id: string, updateClientDto: UpdateClientDto) {
    await this.findById(ownerUserId, id);
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async archive(ownerUserId: string, id: string) {
    await this.findById(ownerUserId, id);
    return this.prisma.client.update({
      where: { id },
      data: {
        administrativeStatus: 'ARCHIVED',
        archivedAt: new Date(),
      },
    });
  }

  async delete(ownerUserId: string, id: string) {
    await this.findById(ownerUserId, id);
    return this.prisma.client.delete({
      where: { id },
    });
  }

  async getFinancialSummary(ownerUserId: string, id: string) {
    const client = await this.findById(ownerUserId, id);

    const totalLoans = client.loans.length;
    const activeLoans = client.loans.filter(l => l.status === 'ACTIVE').length;
    const paidOffLoans = client.loans.filter(l => l.status === 'PAID_OFF').length;

    const totalReceivables = client.receivables.reduce((sum, r) => sum + Number(r.originalAmount), 0);
    const totalReceived = client.receivables.reduce((sum, r) => sum + Number(r.amountReceived), 0);
    const totalOutstanding = client.receivables.reduce((sum, r) => sum + Number(r.outstandingAmount), 0);
    const overdueReceivables = client.receivables.filter(r => r.status === 'OVERDUE').length;

    return {
      totalLoans,
      activeLoans,
      paidOffLoans,
      totalReceivables,
      totalReceived,
      totalOutstanding,
      overdueReceivables,
    };
  }
}