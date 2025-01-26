import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

interface Requirements {
  minimumPoints: number;
  tasksCompleted: number;
  paid: boolean;
  cumulative_cp: number;
  minimum_years: number;
}

export class CreateCriteriaDto {
  @ApiProperty({
    example: {
      minimumPoints: 100,
      completedTasks: 10,
    },
    description: 'Criteria',
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  requirements: Requirements;
}
