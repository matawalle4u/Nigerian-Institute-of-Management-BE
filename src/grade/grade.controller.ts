// src/grade/grade.controller.ts
import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GradeService } from './grade.service';

@ApiTags('Grade')
@Controller('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  // Endpoint to fetch upgrade criteria
  @Get('criteria')
  @ApiResponse({
    status: 200,
    description: 'List of upgrade criteria',
    isArray: true,
  })
  async getCriteria() {
    return this.gradeService.getCriteria();
  }

  // Endpoint to upgrade a member's grade
  @Patch('upgrade/:loginId')
  @ApiParam({ name: 'loginId', description: 'ID of the member to upgrade' })
  @ApiResponse({ status: 200, description: 'Member grade upgraded' })
  async upgradeGrade(
    @Param('loginId') loginId: number,
    @Body('newGrade') newGrade: string,
  ) {
    return this.gradeService.upgradeMemberGrade(loginId, newGrade);
  }
  @Get('history/:loginId')
  async getUserGradeHistory(@Param('loginId') loginId: number) {
    return this.gradeService.getUserGradeHistory(loginId);
  }
}
