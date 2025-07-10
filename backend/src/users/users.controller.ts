// In backend/src/users/users.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common'; // <-- Add Get here
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth') // Keep 'auth' to group routes like /auth/register
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  @Get('users/operators') // Make the route more specific
  findAllOperators() {
    return this.usersService.findAllOperators();
  }
}