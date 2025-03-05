import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'Adam',
    description: 'First name',
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    example: 'Mustapha',
    description: 'Last name',
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({
    example: 'adam@byteflow.ng',
    description: 'Email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '09028163380',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
