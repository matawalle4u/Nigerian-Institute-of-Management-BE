import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Members } from 'src/membership/entities/membership.entity';
import { Grade } from './entities/grade.entity';
import { Criteria } from './entities/criteria.entity';
import { CreateCriteriaDto } from './dto/criteria.dto';
import { CreateGradeDto } from './dto/grade.dto';
import { Upgrade } from './entities/upgrade.entity';
import { InsufficientCpException } from 'src/membership/utils/MembershipExceptions';
import { LicenseException } from 'src/license/utils/LicenceExceptions';
import { PaymentService } from 'src/payment/payment.service';
import { Login } from 'src/account/entities/login.entity';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepo,

    @InjectRepository(Criteria)
    private readonly criteriaRepo,

    @InjectRepository(Upgrade)
    private readonly upgradeRepo,

    @InjectRepository(Members)
    private readonly memberRepository,

    @InjectRepository(Login)
    private readonly loginRepo,

    private readonly paymentService: PaymentService,
  ) {}

  // Get all criteria for membership upgrade
  async getUserGradeHistory(loginId: number) {
    return this.upgradeRepo.find({
      where: { loginId },
      relations: ['member'],
      order: { createdAt: 'DESC' },
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

    const gradeEntry = await this.fetchGrade(userGrade);
    const gradePrio = gradeEntry.priority;
    const userGradeId = gradeEntry.id;
    const currentGradeCriteria = gradeEntry.criteria;

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

    // if (!cumulativeCp) {
    //   throw new InsufficientCpException(`Cannot upgrade to ${nextGradeName}`);
    // }

    //get outstanding based on memberId to get login.member.id: userId
    const login = this.loginRepo.findOne({
      where: {
        member: {
          id: userId,
        },
      },
    });

    const userOutstandings =
      await this.paymentService.getMemberOutstandingPayments(login.id);
    console.log(userOutstandings);
    const yearCriteria = await this.gradeIsMoreThanXyears(
      userId,
      userGrade,
      currentGradeCriteria.requirements.minimum_years,
    );

    if (userOutstandings) {
      throw new LicenseException('You need to settle outstanding bills');
    }
    const conditions = `Upgrading from ${userGrade} to ${nextGradeName} spent ${currentGradeCriteria.requirements.minimum_years} years? ${yearCriteria} settled all bills ${userOutstandings} score ${cumulativeCp}`;

    console.log(conditions);
    //TODO ensure the below are executed when conditions are met.
    //Update grade on membership table
    membership.grade = nextGradeName as any;
    await this.memberRepository.save(membership);
    console.log(userGradeId);
    //save the upgrade details to the DB
    const NewUpgrade = this.upgradeRepo.create({
      member: membership,
      currentGrade: userGradeId,
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
    console.log(userId + 1);
    const lastGrade = await this.upgradeRepo.findOne({
      where: {
        member: { id: userId },
        currentGrade: { gradeName },
      },
      relations: ['member'],
      order: { createdAt: 'DESC' },
    });
    console.log(lastGrade);
    if (!lastGrade) {
      return true;
    }

    const xYearsAgo = new Date();
    xYearsAgo.setFullYear(xYearsAgo.getFullYear() - Xyears);

    return lastGrade.createdAt <= xYearsAgo;
  }
}
