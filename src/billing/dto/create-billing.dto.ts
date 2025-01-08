import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateBillDto {
  @ApiProperty({
    description: 'A valid user ID',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  userId: number;

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
