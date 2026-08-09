import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateSaveSlotDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  initialData?: string;
}
