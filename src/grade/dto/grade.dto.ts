import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Criteria } from '../entities/criteria.entity';

export class CreateGradeDto {
  @ApiPropertyOptional({
    description: 'The name of the grade',
    example: 'graduate',
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
    description: 'The grade position according to priority',
    example: 1,
    type: 'number',
  })
  @IsOptional()
  @IsNumber()
  priority: number;

  @ApiPropertyOptional({
    description: 'The criteria id to map criteria to grade',
    example: '1',
    type: 'number',
  })
  @IsOptional()
  criteria: Criteria;
}
