// In backend/src/investors/investors.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { RegisterInvestorDto } from './dto/register-investor.dto';

@Controller('investors')
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  @Post('register')
  register(@Body() registerInvestorDto: RegisterInvestorDto) {
    // This receives the data from the frontend
    return this.investorsService.register(registerInvestorDto);
  }
}