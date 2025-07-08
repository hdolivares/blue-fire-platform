// In backend/src/investors/investors.module.ts

import { Module } from '@nestjs/common';
import { InvestorsController } from './investors.controller';
import { InvestorsService } from './investors.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Investor, InvestorSchema } from './schemas/investor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Investor.name, schema: InvestorSchema }]),
  ],
  controllers: [InvestorsController],
  providers: [InvestorsService],
})
export class InvestorsModule {}