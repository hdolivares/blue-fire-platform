// In backend/src/investors/investors.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investor } from './schemas/investor.schema';
import { RegisterInvestorDto } from './dto/register-investor.dto';

@Injectable()
export class InvestorsService {
  constructor(@InjectModel(Investor.name) private investorModel: Model<Investor>) {}

  async register(registerInvestorDto: RegisterInvestorDto): Promise<Investor> {
    // TODO: Hash password before saving
    const newInvestor = new this.investorModel(registerInvestorDto);
    return newInvestor.save();
  }
}