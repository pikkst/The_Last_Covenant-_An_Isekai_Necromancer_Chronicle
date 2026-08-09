import { IsString, IsNumber } from 'class-validator';

export class WriteSaveDto {
  @IsString()
  data: string;

  @IsNumber()
  expectedRevision: number;
}
