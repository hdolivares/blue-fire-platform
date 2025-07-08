// In backend/src/investors/dto/register-investor.dto.ts
export class RegisterInvestorDto {
  fullName: string;
  email: string;
  password?: string; // Password will be handled securely
  country: string;
  walletAddress: string;
}