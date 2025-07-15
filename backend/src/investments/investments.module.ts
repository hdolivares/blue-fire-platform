// backend/src/investments/investments.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Investment, InvestmentSchema } from './schemas/investment.schema';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Investment.name, schema: InvestmentSchema }]),
    ConfigModule,
    forwardRef(() => UsersModule), // This breaks the cycle
  ],
  controllers: [InvestmentsController],
  providers: [InvestmentsService],
  exports: [MongooseModule],
})
export class InvestmentsModule {}