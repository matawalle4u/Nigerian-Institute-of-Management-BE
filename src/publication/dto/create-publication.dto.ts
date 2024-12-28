import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePublicationDto {
  @ApiProperty({
    description: 'Title of Publication',
    example: 'Example Title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of Publication',
    example: 'Example description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
