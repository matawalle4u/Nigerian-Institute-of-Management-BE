import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

  @ApiProperty({
    description: 'Image file URL or path',
    example: 'https://example.com/image.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Asset path',
    example: 'https://example.com/asset.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  asset?: string;
}
