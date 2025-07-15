import { Module } from '@nestjs/common';
import { InvestorsController } from './investors.controller';
import { InvestorsService } from './investors.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [InvestorsController],
  providers: [InvestorsService],
  exports: [InvestorsService],
})
export class InvestorsModule {} 