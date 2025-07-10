import { Module } from '@nestjs/common';
import { OperatorsController } from './operators.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module'; // 1. Import the AuthModule

@Module({
  imports: [
    UsersModule,
    AuthModule, // 2. Add the AuthModule here
  ],
  controllers: [OperatorsController],
})
export class OperatorsModule {}