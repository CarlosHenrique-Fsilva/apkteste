import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { LoansModule } from './loans/loans.module';
import { InterestModule } from './interest/interest.module';
import { InstallmentsModule } from './installments/installments.module';
import { PaymentsModule } from './payments/payments.module';
import { ReceivablesModule } from './receivables/receivables.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { StorageModule } from './storage/storage.module';
import { AuditModule } from './audit/audit.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    LoansModule,
    InterestModule,
    InstallmentsModule,
    PaymentsModule,
    ReceivablesModule,
    DocumentsModule,
    NotificationsModule,
    ReportsModule,
    StorageModule,
    AuditModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}