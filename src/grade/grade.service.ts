import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Members } from 'src/membership/entities/membership.entity';
import { Grade } from './entities/grade.entity';
import { Criteria } from './entities/criteria.entity';
import { CreateCriteriaDto } from './dto/criteria.dto';
import { CreateGradeDto } from './dto/grade.dto';
import { Upgrade } from './entities/upgrade.entity';
// import { InsufficientCpException } from 'src/membership/utils/MembershipExceptions';
// import { LicenseException } from 'src/license/utils/LicenceExceptions';
import { PaymentService } from 'src/payment/payment.service';
import { Login } from 'src/account/entities/login.entity';
import { Payment } from 'src/payment/entities/payment.entity';

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

    @InjectRepository(Payment)
    private readonly paymentRepo,
  ) {}

  getUserGradeHistory(loginId: number) {
    return this.upgradeRepo
      .find({
        where: { member: { id: loginId } },
        relations: ['member'],
        order: { createdAt: 'DESC' },
      })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw error;
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
    return this.gradeRepo
      .find({
        relations: ['criteria'],
      })
      .then((grade) => {
        if (!grade) {
          throw new NotFoundException('No grade was found');
        }
        return grade;
      })
      .catch((error) => {
        throw error;
      });
  }

  async fetchGrade(gradeName: string): Promise<Grade> {
    return this.gradeRepo
      .findOne({
        where: { name: gradeName },
        relations: ['criteria'],
      })
      .then((grade) => {
        if (!grade) {
          throw new NotFoundException('Grade not found');
        }
        return this.gradeRepo
          .findOne({
            where: { id: grade.priority + 1 },
            relations: ['criteria'],
          })
          .then((nextGrade) => ({ ...grade, nextGrade }));
      })
      .catch((error) => {
        throw error;
      });
  }

  async checkEligibility(userId: number): Promise<any> {
    const membership = await this.memberRepository.findOne({
      where: { id: userId },
    });

    console.log(membership);
    if (!membership) {
      throw new UnauthorizedException(
        `No user found with the membership id ${userId}`,
      );
    }

    const gradeEntry = await this.fetchGrade(membership.grade);

    const nextGradeDetails = await this.gradeRepo.findOne({
      where: { id: gradeEntry.priority + 1 },
      relations: ['criteria'],
    });

    if (!nextGradeDetails) {
      throw new NotFoundException('grade has no next grade');
    }

    const cumulativeCp =
      membership.cumulativeCp >=
      nextGradeDetails.criteria.requirements.cumulative_cp;

    const login = await this.loginRepo.findOne({
      where: {
        member: {
          id: userId,
        },
      },
    });

    if (!login) {
      throw new NotFoundException(
        `No login available for member with id ${userId}`,
      );
    }

    //Get all outstanding
    const outstnd = await this.paymentService.getMemberUnpaidBills(login.id);

    //check for year criteria
    const yearCriteria = await this.gradeIsMoreThanXyears(
      userId,
      membership.grade,
      gradeEntry.criteria.requirements.minimum_years,
    );

    //Check for whether the person has made the payment
    const upgradePaymentMade = await this.paymentRepo.findOne({
      where: {
        payers: { id: login.id },
        other_info: `Payment for Membership upgrade from ${membership.grade} to ${nextGradeDetails.name}`,
        status: 'success',
        amount: gradeEntry.paymentAmount,
      },
    });

    const errorObject = {
      cumulativeCp,
      outstnd,
      yearCriteria,
      upgradePaymentMade,
    };

    return errorObject;
  }

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

    const nextGradeDetails = await this.gradeRepo.findOne({
      where: { id: gradePrio + 1 },
      relations: ['criteria'],
    });

    const nextGradeName = nextGradeDetails.name;
    const nextGradeCriteria = nextGradeDetails.criteria;
    const cumulativeCp =
      membership.cumulativeCp >= nextGradeCriteria.requirements.cumulative_cp;

    //get outstanding based on memberId to get login.member.id: userId
    const login = this.loginRepo.findOne({
      where: {
        member: {
          id: userId,
        },
      },
    });
    if (!login) {
      throw new NotFoundException(
        `No login available for member with id ${userId}`,
      );
    }
    //Get all outstanding
    const userOutstandings =
      await this.paymentService.getMemberOutstandingPayments(login.id);

    //check for year criteria
    const yearCriteria = await this.gradeIsMoreThanXyears(
      userId,
      userGrade,
      currentGradeCriteria.requirements.minimum_years,
    );

    //Check for whether the person has made the payment
    const conditions = `Upgrading from ${userGrade} to ${nextGradeName} spent ${currentGradeCriteria.requirements.minimum_years} years? ${yearCriteria} settled all bills ${userOutstandings} score ${cumulativeCp}`;
    membership.grade = nextGradeName as any;
    await this.memberRepository.save(membership);

    //save the upgrade details to the DB
    const NewUpgrade = this.upgradeRepo.create({
      member: membership,
      currentGrade: userGradeId,
      nextGrade: nextGradeDetails,
    });

    //save the updgrade
    return this.upgradeRepo.save(NewUpgrade);
  }

  async gradeIsMoreThanXyears(userId: number, name: string, Xyears: number) {
    return this.upgradeRepo
      .findOne({
        where: {
          member: { id: userId },
          currentGrade: { name },
        },
        relations: ['member'],
        order: { createdAt: 'DESC' },
      })
      .then((lastGrade) => {
        if (!lastGrade) {
          return true;
        }

        const xYearsAgo = new Date();
        xYearsAgo.setFullYear(xYearsAgo.getFullYear() - Xyears);

        return lastGrade.createdAt <= xYearsAgo;
      })
      .catch((error) => {
        throw error;
      });
  }
}
