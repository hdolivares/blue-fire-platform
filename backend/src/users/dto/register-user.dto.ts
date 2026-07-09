import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEmpty, MinLength, MaxLength } from 'class-validator';

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

  // Honeypot. A hidden form field that must stay empty; humans never see it,
  // but form-filling bots populate it. `@IsOptional` skips validation when it's
  // absent/empty, `@IsEmpty` rejects (400) any non-empty value. Whitelisted so
  // the global `forbidNonWhitelisted` pipe doesn't 400 legitimate empty sends.
  @IsOptional()
  @IsEmpty({ message: 'Registration could not be completed.' })
  website?: string;

  // NOTE: `roles` is intentionally NOT accepted from the client. Roles are
  // assigned server-side in UsersService.register to prevent privilege
  // escalation (a client could otherwise register itself as Admin).
}