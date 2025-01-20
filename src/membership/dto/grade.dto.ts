import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateGradeDto {
  @ApiPropertyOptional({
    description: 'The name of the grade',
    example: 'Graduate',
  })
  @IsOptional()
  @IsString()
  gradeName: string;

  @ApiPropertyOptional({
    description: 'The payment amount required for the grade',
    example: 75.0,
    type: 'number',
  })
  @IsOptional()
  @IsNumber()
  paymentAmount: number;

  @ApiPropertyOptional({
    description: 'The criteria description for this grade',
    example: 'Must complete 15 tasks and earn 150 points',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  criteriaDescription: string;
}
