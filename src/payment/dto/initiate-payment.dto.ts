import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class InitiatePaymentDto {
  @ApiProperty({
    description: 'Name of the payer',
    example: 'Adam Mustapha',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Payer email address',
    example: 'adam@byteflow.com.ng',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Amount in figures',
    example: 2000,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  callbackUrl: string;
}
