"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientsService = class ClientsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(ownerUserId, createClientDto) {
        return this.prisma.client.create({
            data: {
                ...createClientDto,
                ownerUserId,
            },
        });
    }
    async findAll(ownerUserId, filters) {
        const where = { ownerUserId };
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
    async findById(ownerUserId, id) {
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
            throw new common_1.NotFoundException('Cliente não encontrado');
        }
        return client;
    }
    async update(ownerUserId, id, updateClientDto) {
        await this.findById(ownerUserId, id);
        return this.prisma.client.update({
            where: { id },
            data: updateClientDto,
        });
    }
    async archive(ownerUserId, id) {
        await this.findById(ownerUserId, id);
        return this.prisma.client.update({
            where: { id },
            data: {
                administrativeStatus: 'ARCHIVED',
                archivedAt: new Date(),
            },
        });
    }
    async delete(ownerUserId, id) {
        await this.findById(ownerUserId, id);
        return this.prisma.client.delete({
            where: { id },
        });
    }
    async getFinancialSummary(ownerUserId, id) {
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
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map