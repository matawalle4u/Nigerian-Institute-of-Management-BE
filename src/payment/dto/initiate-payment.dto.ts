import { IsEmail, IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
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
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  callbackUrl: string;

  @ApiProperty({
    description: 'Description of the payment',
    example: 'Payment for Membership upgrade',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
