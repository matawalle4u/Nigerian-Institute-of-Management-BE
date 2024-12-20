// src/grade/grade.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GradeCriteriaRepository } from './repositories/grade-criteria.repository';
import { GradeHistoryRepository } from './repositories/grade-history.repository';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(GradeCriteriaRepository)
    private readonly criteriaRepository: GradeCriteriaRepository,

    @InjectRepository(GradeHistoryRepository)
    private readonly gradeHistoryRepository,
  ) {}

  // Get all criteria for membership upgrade
  async getCriteria() {
    return this.criteriaRepository.find();
  }

  // Apply grade upgrade logic
  async upgradeMemberGrade(loginId: number, newGrade: string) {
    // Business logic for upgrading a member's grade
    // Example: Save the new grade in the `grade_history` table
    // (use your GradeHistoryRepository or equivalent here)
    return `Member ${loginId} upgraded to grade ${newGrade}`;
  }
  async getUserGradeHistory(loginId: number) {
    return this.gradeHistoryRepository.find({
      where: { loginId },
      relations: ['user', 'postedBy'],
      order: { date: 'DESC' },
    });
  }
}
