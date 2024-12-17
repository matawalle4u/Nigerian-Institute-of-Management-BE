// src/grade/grade.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { GradeCriteriaRepository } from './repositories/grade-criteria.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GradeCriteriaRepository])],
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
