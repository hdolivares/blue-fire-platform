import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('operators')
export class OperatorsController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-project')
  getMyProject(@Request() req) {
    // req.user is populated by the JwtAuthGuard with the token payload
    const operatorId = req.user.userId;
    return this.usersService.findProjectByOperator(operatorId);
  }
}