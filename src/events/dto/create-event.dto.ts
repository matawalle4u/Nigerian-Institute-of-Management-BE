import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
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
}
