import { PrismaService } from '../prisma/prisma.service';
export declare class HealthController {
    private prisma;
    constructor(prisma: PrismaService);
    check(): Promise<{
        status: string;
        timestamp: string;
        database: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        database: string;
        error: any;
        uptime?: undefined;
        memory?: undefined;
    }>;
    ready(): Promise<{
        ready: boolean;
    }>;
}
