import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { PerformanceModule } from './performance/performance.module';
import { AdminModule } from './admin/admin.module';
import { OperatorsModule } from './operators/operators.module'; // 1. Import the new module
import { InvestmentsModule } from './investments/investments.module';
import { InvestorsController } from './investors/investors.controller';

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
    UsersModule,
    ProjectsModule,
    PerformanceModule,
    AdminModule,
    OperatorsModule,
    InvestmentsModule, // 2. Add it to the imports array
  ],
  controllers: [AppController, InvestorsController],
  providers: [AppService],
})
export class AppModule {}