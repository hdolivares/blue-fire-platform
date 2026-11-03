import { IsHexadecimal, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  // 32 random bytes, hex-encoded (see AuthService.forgotPassword).
  @IsHexadecimal()
  @Length(64, 64)
  token: string;

  // Same policy as registration.
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
