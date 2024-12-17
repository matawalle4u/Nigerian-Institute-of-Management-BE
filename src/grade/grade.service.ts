// src/grade/grade.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GradeCriteriaRepository } from './repositories/grade-criteria.repository';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(GradeCriteriaRepository)
    private readonly criteriaRepository: GradeCriteriaRepository,
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
}
