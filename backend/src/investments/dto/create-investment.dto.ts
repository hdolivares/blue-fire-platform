import { IsMongoId, IsNumber, IsPositive, Max } from 'class-validator';

export class CreateInvestmentDto {
  @IsMongoId()
  projectId: string;

  // Positive, bounded amount — blocks negative/absurd values from polluting
  // portfolio and admin TVL/ROI aggregations.
  @IsNumber()
  @IsPositive()
  @Max(1_000_000_000)
  amount: number;
}
