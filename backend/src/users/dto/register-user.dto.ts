import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  walletAddress?: string;

  // NOTE: `roles` is intentionally NOT accepted from the client. Roles are
  // assigned server-side in UsersService.register to prevent privilege
  // escalation (a client could otherwise register itself as Admin).
}