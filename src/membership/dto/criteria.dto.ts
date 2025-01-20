import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

interface Requirements {
  minimumPoints: number;
  tasksCompleted: number;
  paid: boolean;
}

export class CreateCriteriaDto {
  @ApiProperty({
    example: 'graduate',
    enum: ['graduate', 'associate', 'member', 'fellow', 'companion'],
    description: 'Criteria Grade',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  grade: string;

  @ApiProperty({
    example: {
      minimumPoints: 100,
      completedTasks: 10,
    },
    description: 'Acceptance status',
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  requirements: Requirements;
}
