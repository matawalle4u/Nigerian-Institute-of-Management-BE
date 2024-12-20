import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class InitiatePaymentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  callbackUrl: string;
}
