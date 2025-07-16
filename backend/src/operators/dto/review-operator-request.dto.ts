import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class ReviewOperatorRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  feedback?: string;
} 