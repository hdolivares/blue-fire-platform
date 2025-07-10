import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('operators')
export class OperatorsController {
  constructor(private usersService: UsersService) {}

  /**
   * This endpoint is for Admins to get a list of all users
   * with the 'Operator' role.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAllOperators() {
    return this.usersService.findAllOperators();
  }

  /**
   * This endpoint is for a logged-in Operator to get the
   * specific project they are assigned to.
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-project')
  getMyProject(@Request() req) {
    // req.user is populated by the JwtAuthGuard with the token payload
    const operatorId = req.user.userId;
    return this.usersService.findProjectByOperator(operatorId);
  }
}