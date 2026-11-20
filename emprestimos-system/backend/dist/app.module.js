"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const clients_module_1 = require("./clients/clients.module");
const loans_module_1 = require("./loans/loans.module");
const interest_module_1 = require("./interest/interest.module");
const installments_module_1 = require("./installments/installments.module");
const payments_module_1 = require("./payments/payments.module");
const receivables_module_1 = require("./receivables/receivables.module");
const documents_module_1 = require("./documents/documents.module");
const notifications_module_1 = require("./notifications/notifications.module");
const reports_module_1 = require("./reports/reports.module");
const storage_module_1 = require("./storage/storage.module");
const audit_module_1 = require("./audit/audit.module");
const health_controller_1 = require("./health/health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            clients_module_1.ClientsModule,
            loans_module_1.LoansModule,
            interest_module_1.InterestModule,
            installments_module_1.InstallmentsModule,
            payments_module_1.PaymentsModule,
            receivables_module_1.ReceivablesModule,
            documents_module_1.DocumentsModule,
            notifications_module_1.NotificationsModule,
            reports_module_1.ReportsModule,
            storage_module_1.StorageModule,
            audit_module_1.AuditModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map