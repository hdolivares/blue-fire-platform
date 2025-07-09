export class RegisterUserDto {
  fullName: string;
  email: string;
  password!: string;
  country: string;
  walletAddress: string;
  roles!: string[];
}