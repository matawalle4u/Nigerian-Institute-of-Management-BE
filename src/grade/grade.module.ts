// src/grade/grade.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';

import { Grade } from './entities/grade.entity';
import { Criteria } from './entities/criteria.entity';
import { Upgrade } from 'src/membership/entities/upgrade.entity';
import { Members } from 'src/membership/entities/membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Members, Grade, Criteria, Upgrade])],
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
