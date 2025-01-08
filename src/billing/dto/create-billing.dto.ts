import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateBillDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
