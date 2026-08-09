import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateSaveSlotDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  status?: 'ACTIVE' | 'ARCHIVED';
}
