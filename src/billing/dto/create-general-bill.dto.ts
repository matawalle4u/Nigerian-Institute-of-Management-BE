import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateGeneralBillDto {
  @ApiProperty({
    description: 'Bill description',
    example: 'Payment for upgrade fees',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Amount payable',
    example: '10000',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
