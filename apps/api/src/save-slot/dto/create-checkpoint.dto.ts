import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateCheckpointDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  label?: string;
}
