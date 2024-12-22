import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateNewsDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'NIM News title',
    description: 'Title Of the news post',
    required: true,
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'News content',
    description: 'Content of the News',
    required: true,
  })
  content: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Adam Mustapha',
    description: 'Name of the news author',
    required: false,
  })
  author: string;
}
