import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

interface Requirements {
  minimumPoints: number;
  tasksCompleted: number;
  paid: boolean;
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
