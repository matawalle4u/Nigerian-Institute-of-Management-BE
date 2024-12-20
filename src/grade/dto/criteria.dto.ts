import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({
    description: 'Name of the grade',
    example: 'graduate',
  })
  @IsNotEmpty()
  @IsEnum(['graduate', 'associate', 'member', 'fellow', 'companion'], {
    message:
      'name must be one of: graduate, associate, member, fellow, companion',
  })
  name: 'graduate' | 'associate' | 'member' | 'fellow' | 'companion';
}
