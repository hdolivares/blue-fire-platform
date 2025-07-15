import { Controller, Get, Request } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AdminOrOperator } from '../common/decorators/auth.decorator';

@Controller('operators')
@AdminOrOperator()
export class OperatorsController {
  constructor(private usersService: UsersService) {}

  /**
   * This endpoint is for Admins to get a list of all users
   * with the 'Operator' role.
   */
  @Get()
  findAllOperators() {
    return this.usersService.findAllOperators();
  }

  /**
   * This endpoint is for a logged-in Operator to get the
   * specific project they are assigned to.
   */
  @Get('my-project')
  getMyProject(@Request() req) {
    // req.user is populated by the ControllerAuthGuard with the token payload
    const operatorId = req.user.userId;
    return this.usersService.findProjectsByOperator(operatorId);
  }
}