import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';
export class CreateEventDto {
  @ApiProperty({
    description: 'Name of the Event',
    example: 'Annual Conference',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Event Description',
    example: 'Description goes here',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Event Date',
    example: '12/12/2025',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Event Price',
    example: 50000,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Event Mode',
    example: 'Virtual',
  })
  @IsString()
  mode: string;

  @ApiProperty({
    description: 'Image file URL or path',
    example: 'https://example.com/image.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;
}
