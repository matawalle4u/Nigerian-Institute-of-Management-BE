import { IsEmail, IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BasePaymentDto {
  @ApiProperty({
    description: 'Payer email address or customer ID',
    example: 'adam@byteflow.com.ng',
  })
  @IsNotEmpty()
  @IsEmail()
  emailOrCustomerId: string;

  @ApiProperty({
    description: 'Amount to be paid',
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Callback URL for the payment',
    example: 'https://callback.url',
  })
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
