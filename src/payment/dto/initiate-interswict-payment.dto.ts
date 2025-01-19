// interswitch-payment.dto.ts
import { BasePaymentDto } from './base-payment.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InterswitchPaymentDto extends BasePaymentDto {
  @ApiProperty({
    description: 'Authorization data for Interswitch',
    example: 'G3cf/VTtAHCdHZNxc5GXWRI8z5P0goL2...',
  })
  @IsString()
  @IsNotEmpty()
  authData: string;

  @ApiProperty({
    description: 'Unique transaction reference',
    example: 'QWERTY143SADY',
  })
  @IsString()
  @IsNotEmpty()
  transactionRef: string;
}
