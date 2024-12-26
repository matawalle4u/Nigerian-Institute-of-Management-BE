import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'A valid email of the user',
    example: 'adam@byteflow.com.ng',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'adam4u',
  })
  @IsString()
  username: string;
  @ApiProperty({
    description: 'A valid authorization token',
    example: 'Generated token during validation',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'User Login Password',
    example: 'Password123456!',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
