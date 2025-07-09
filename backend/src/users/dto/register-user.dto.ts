export class RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password!: string;
  country: string;
  walletAddress: string;
  roles!: string[];
}