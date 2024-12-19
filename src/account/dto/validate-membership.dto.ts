import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateMembershipDto {
  @ApiProperty({
    example: 'MEM12345',
    description: 'Membership number of the user',
  })
  @IsString()
  @Length(3, 20)
  membership: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name or Date of Birth of the user (in YYYY-MM-DD format)',
  })
  @IsString()
  nameOrDob: string;
}
