import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({
    description: 'Name of the payer',
    example: 'Adam Mustapha',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Payer email address',
    example: 'adam@byteflow.com.ng',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Amount in figures',
    example: 2000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Callback URL',
    example: 'https://example.com/callback',
  })
  @IsString()
  callbackUrl?: string;

  @ApiProperty({
    description: 'Description of the payment',
    example: 'Payment for Membership upgrade',
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Unique transaction reference (specific to some providers)',
    example: 'QWERTY143SADY',
    required: false,
  })
  @IsString()
  @IsOptional()
  transactionRef?: string;

  @ApiProperty({
    description: 'Payer email address',
    example: 'adam@byteflow.com.ng',
  })
  @IsOptional()
  @IsEmail()
  customerId?: string;

  @ApiProperty({
    description: 'Currency e.g NGN for Naira, USD for dollar',
    example: 'NGN',
  })
  @IsString()
  currency: string;
}
