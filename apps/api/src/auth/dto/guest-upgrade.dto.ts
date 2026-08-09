import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class GuestUpgradeDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
