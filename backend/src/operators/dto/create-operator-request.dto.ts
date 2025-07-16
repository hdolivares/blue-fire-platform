import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOperatorRequestDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;
} 