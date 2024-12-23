import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLicenseDto {
  @ApiProperty({
    description: 'Associated Login ID of the Member',
    example: 1,
  })
  @IsString()
  login: number;

  @ApiProperty({
    description: 'License Number',
    example: 'NIM',
  })
  @IsString()
  @IsNotEmpty()
  licenseNo: string;
}
