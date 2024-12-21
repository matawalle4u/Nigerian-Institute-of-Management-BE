import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Payment Reference',
    example: 'xyz1234uvw',
  })
  @IsNotEmpty()
  @IsString()
  reference: string;
}
