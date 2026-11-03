import { IsOptional, IsString, MaxLength } from 'class-validator';

// Investor-facing narrative for a project. All optional; an empty string
// clears a section.
export class UpdateProjectStoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  opportunity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  community?: string;
}
