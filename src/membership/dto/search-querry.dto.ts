import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class SearchMemberDto {
  @ApiProperty({
    example: 'Adam',
    description: 'Member name or Membership Number',
    required: true,
  })
  @IsString()
  search: string;
}
