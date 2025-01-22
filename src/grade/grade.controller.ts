// src/grade/grade.controller.ts
import { Controller, Get, Patch, Body, Param, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam, ApiOperation } from '@nestjs/swagger';
import { GradeService } from './grade.service';
import { CreateCriteriaDto } from './dto/criteria.dto';
import { CreateGradeDto } from './dto/grade.dto';

@ApiTags('Grade')
@Controller('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post('criteria/create')
  createCriteria(@Body() createCriteriaDto: CreateCriteriaDto) {
    return this.gradeService.createCriteria(createCriteriaDto);
  }
  @Get('criteria/all')
  @ApiOperation({ summary: 'Retrieve all criteria' })
  allCriteria() {
    return this.gradeService.allCriteria();
  }
  @Get('criteria/:id')
  @ApiOperation({ summary: 'Retrieve a single criteria by ID' })
  fetchCriteria(@Param('id') id: number) {
    return this.gradeService.fetchCriteria(id);
  }
  @Post('create')
  @ApiOperation({ summary: 'Create Membership Grade' })
  createGrade(@Body() createGradeDto: CreateGradeDto) {
    return this.gradeService.createGrade(createGradeDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Retrieve all' })
  allGrade() {
    return this.gradeService.allGrade();
  }

  @Get(':gradeName')
  @ApiOperation({ summary: 'Retrieve a single grade by Name' })
  fetchGrade(@Param('gradeName') gradeName: string) {
    return this.gradeService.fetchGrade(gradeName);
  }

  @Post('upgrade/:userId')
  upgradeMembership(@Param('userId') userId: number) {
    return this.gradeService.upgradeMembership(userId);
  }

  @Get('ugrade/history/:loginId')
  async getUserGradeHistory(@Param('loginId') loginId: number) {
    return this.gradeService.getUserGradeHistory(loginId);
  }
}
