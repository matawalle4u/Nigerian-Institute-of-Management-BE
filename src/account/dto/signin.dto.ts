import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
  @ApiProperty({
    description: 'A valid email of the user',
    example: 'adam@byteflow.com.ng',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '8 Character long password',
    example: 'P@55word1234',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
