import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { PerformanceModule } from './performance/performance.module';
import { AdminModule } from './admin/admin.module';
import { OperatorsModule } from './operators/operators.module';
import { InvestmentsModule } from './investments/investments.module';
import { InvestorsModule } from './investors/investors.module';
import { AlertsModule } from './alerts/alerts.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    CommonModule, // Global middleware, guards, and interceptors
    AuthModule, // Authentication module
    EmailModule, // Email service
    UsersModule,
    ProjectsModule,
    PerformanceModule,
    AdminModule,
    OperatorsModule,
    InvestmentsModule,
    InvestorsModule, // ✅ Now properly modularized
    AlertsModule, // ✅ Alert and notification system
  ],
  controllers: [AppController], // ✅ Only root controller
  providers: [AppService],
})
export class AppModule {}