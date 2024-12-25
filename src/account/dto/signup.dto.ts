import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
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
