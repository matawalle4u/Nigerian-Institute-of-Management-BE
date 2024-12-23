import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateNewsDto {
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
    example: 'News content',
    description: 'Content of the News',
    required: true,
  })
  content?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Adam Mustapha',
    description: 'Name of the news author',
    required: false,
  })
  author?: string;

  @ApiProperty({
    description: 'Image file URL or path',
    example: 'https://example.com/image.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;
}
