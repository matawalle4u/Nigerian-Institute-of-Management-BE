import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SearchNewsDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'NIM News title',
    description: 'Title Of the news post',
    required: true,
  })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Adam Mustapha',
    description: 'Name of the news author',
    required: false,
  })
  author?: string;
}
