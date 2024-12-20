// src/grade/grade.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { GradeCriteriaRepository } from './repositories/grade-criteria.repository';
import { Grade } from './entities/grade.entity';
import { GradeHistoryRepository } from './repositories/grade-history.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GradeCriteriaRepository,
      Grade,
      GradeHistoryRepository,
    ]),
  ],
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
