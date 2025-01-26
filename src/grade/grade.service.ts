// src/grade/grade.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { GradeCriteriaRepository } from './repositories/grade-criteria.repository';
// import { GradeHistoryRepository } from './repositories/grade-history.repository';
import { Members } from 'src/membership/entities/membership.entity';
import { Grade } from './entities/grade.entity';
import { Criteria } from './entities/criteria.entity';
import { CreateCriteriaDto } from './dto/criteria.dto';
import { CreateGradeDto } from './dto/grade.dto';
import { Upgrade } from 'src/membership/entities/upgrade.entity';
import { InsufficientCpException } from 'src/membership/utils/MembershipExceptions';

@Injectable()
export class GradeService {
  constructor(
    // @InjectRepository(GradeCriteriaRepository)
    // private readonly criteriaRepository: GradeCriteriaRepository,

    // @InjectRepository(GradeHistoryRepository)
    // private readonly gradeHistoryRepository,

    @InjectRepository(Grade)
    private readonly gradeRepo,

    @InjectRepository(Criteria)
    private readonly criteriaRepo,

    @InjectRepository(Upgrade)
    private readonly upgradeRepo,

    @InjectRepository(Members)
    private readonly memberRepository,
  ) {}

  // Get all criteria for membership upgrade
  async getUserGradeHistory(loginId: number) {
    return this.upgradeRepo.find({
      where: { loginId },
      relations: ['member'],
      order: { date: 'DESC' },
    });
  }
  async createCriteria(
    createCriteriaDto: CreateCriteriaDto,
  ): Promise<Criteria> {
    const criteria = this.criteriaRepo.create(createCriteriaDto);
    return this.criteriaRepo.save(criteria);
  }

  async allCriteria(): Promise<Criteria[]> {
    const criteria = await this.criteriaRepo.find({ select: ['requirements'] });
    if (!criteria) {
      throw new NotFoundException('Criteria not found for this grade');
    }
    return criteria;
  }
  async fetchCriteria(id: number): Promise<Criteria> {
    const criteria = await this.criteriaRepo.findOne({
      where: { id },
      select: ['requirements'],
    });
    if (!criteria) {
      throw new NotFoundException('Criteria not found for this grade');
    }
    return criteria;
  }

  async createGrade(createGradeDto: CreateGradeDto): Promise<Grade> {
    const criteria = this.gradeRepo.create(createGradeDto);
    return this.gradeRepo.save(criteria);
  }
  async allGrade(): Promise<Grade[]> {
    const grade = await this.gradeRepo.find({
      relations: ['criteria'],
    });
    if (!grade) {
      throw new NotFoundException('Grade not found');
    }
    return grade;
  }
  async fetchGrade(gradeName: string): Promise<Grade> {
    const grade = await this.gradeRepo.findOne({
      where: { gradeName },
      relations: ['criteria'],
    });
    if (!grade) {
      throw new NotFoundException('Grade not found');
    }
    return grade;
  }

  // async checkEligibility(userId: number): Promise<boolean> {
  //   const membership = await this.memberRepository.findOne({
  //     where: { id: userId },
  //   });
  //   //TODO fetch grade from members where userid, pass the grade to fetch criteria
  //   const  = await this.fetchCriteria(membership.grade);

  //   // Simulate eligibility check based on criteria (e.g., points, activity)
  //   const userPoints = 100; // Example: Fetch user points
  //   return userPoints >= criteria.requirements.minimumPoints;
  // }
  // associate', 'member', 'fellow', 'companion'

  async upgradeMembership(userId: number): Promise<Members> {
    const membership = await this.memberRepository.findOne({
      where: { id: userId },
    });

    //fetch user details to include points,
    const userGrade = membership.grade;
    const gradePrio = (await this.fetchGrade(userGrade)).priority;
    //const prio = (await this.fetchGrade(grandeName)).priority;
    // const prio = gradeDetails.priority;
    const nextGradeDetails = await this.gradeRepo.findOne({
      where: { id: gradePrio + 1 },
      relations: ['criteria'],
    });

    const nextGradeName = nextGradeDetails.gradeName;
    const nextGradeCriteria = nextGradeDetails.criteria;
    const cumulativeCp =
      membership.cumulativeCp >= nextGradeCriteria.requirements.cumulative_cp;

    //REMEMBER ALL requirements have to be inputed in the column names in the db;

    if (!cumulativeCp) {
      throw new InsufficientCpException(`Cannot upgrade to ${nextGradeName}`);
    }

    console.log(membership, userGrade);
    // if (!membership.isUpgradeEligible) {
    //   throw new Error('User is not eligible for an upgrade');
    // }
    // const nextGrade = await this.gradeRepo.findOne({
    //   where: { gradeName: membership.nextGrade },
    // });

    // if (!nextGrade) {
    //   throw new NotFoundException('Next grade not found');
    // }

    // membership.currentGrade = membership.nextGrade;
    // membership.nextGrade = null;
    // membership.isUpgradeEligible = false;
    // membership.hasPaid = false;

    //Update grade on membership table
    membership.grade = nextGradeName as any;
    await this.memberRepository.save(membership);

    //save the upgrade details to the DB
    const NewUpgrade = this.upgradeRepo.create({
      member: membership,
      currentGrade: userGrade,
      nextGrade: nextGradeDetails,
    });

    //save the updgrade
    return this.upgradeRepo.save(NewUpgrade);
  }
  // async obtainnUserCriteria(userId: number){

  // }
  async gradeIsMoreThanXyears(
    userId: number,
    gradeName: string,
    Xyears: number,
  ) {
    const upgradeEntry = {
      member: { id: 1 },
      currentGrade: { id: 2 },
      nextGrade: { id: 3 },
    };
    const NewUpgrade = this.upgradeRepo.create(upgradeEntry);
    console.log(upgradeEntry);
    await this.upgradeRepo.save(NewUpgrade);
    const lastGrade = await this.upgradeRepo.findOne({
      where: {
        member: { id: userId },
        currentGrade: { gradeName },
      },
      order: { createdAt: 'DESC' },
    });

    if (!lastGrade) {
      return true;
    }

    // Check if the upgrade was made more than x years ago
    const xYearsAgo = new Date();
    xYearsAgo.setFullYear(xYearsAgo.getFullYear() - Xyears);

    return lastGrade.createdAt <= xYearsAgo;
  }
}
