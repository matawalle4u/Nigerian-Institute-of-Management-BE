import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Members } from './entities/membership.entity';
import { MembershipDto } from './dto/membership.dto';
import { SearchMemberDto } from './dto/search-querry.dto';
import { Grade } from './entities/grade.entity';
import { Criteria } from './entities/criteria.entity';
import { Upgrade } from './entities/upgrade.entity';
import { CreateCriteriaDto } from './dto/criteria.dto';
import { CreateGradeDto } from './dto/grade.dto';
import { InsufficientCpException } from './utils/MembershipExceptions';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Members)
    private readonly memberRepository: Repository<Members>,

    @InjectRepository(Grade)
    private readonly gradeRepo: Repository<Grade>,

    @InjectRepository(Criteria)
    private readonly criteriaRepo: Repository<Criteria>,

    @InjectRepository(Upgrade)
    private readonly upgradeRepo: Repository<Upgrade>,
  ) {}

  async create(memberDto: MembershipDto): Promise<Members> {
    const member = this.memberRepository.create(memberDto);
    return this.memberRepository.save(member);
  }

  async findAll(): Promise<Members[]> {
    return this.memberRepository.find();
  }

  async findOne(id: number): Promise<Members> {
    const member = this.memberRepository.findOne({
      where: { id },
      relations: ['loginId'],
    });

    return member;
  }

  async searchMembership(searchMemberDto: SearchMemberDto): Promise<Members[]> {
    const { search } = searchMemberDto;
    const nameParts = search.split(' ');
    const isMembershipNo = /^\d+$/.test(search);
    const isFullName = nameParts.length > 1;

    const queryBuilder = this.memberRepository.createQueryBuilder('member');

    if (isMembershipNo) {
      // Search by membership number
      queryBuilder.where('member.memberNo = :membershipNo', {
        membershipNo: search,
      });
    } else if (isFullName) {
      // Search by full name (firstName and lastName match)
      queryBuilder.where(
        'member.firstName LIKE :firstName AND member.lastName LIKE :lastName',
        {
          firstName: `%${nameParts[0]}%`,
          lastName: `%${nameParts.slice(1).join(' ')}%`,
        },
      );
    } else {
      // Search by partial name (match firstName or lastName)
      queryBuilder.where(
        'member.firstName LIKE :name OR member.lastName LIKE :name',
        { name: `%${search}%` },
      );
    }
    const users = await queryBuilder.getMany();
    if (!users || users.length === 0) {
      throw new UnauthorizedException(
        `No members found matching the provided input: ${search}`,
      );
    }
    return users;
  }

  async update(id: number, updateData: Partial<Members>): Promise<Members> {
    await this.memberRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.memberRepository.delete(id);
  }

  //Add criteria
  //Add upgrade
  //add grade

  async createCriteria(
    createCriteriaDto: CreateCriteriaDto,
  ): Promise<Criteria> {
    const criteria = this.criteriaRepo.create(createCriteriaDto);
    return this.criteriaRepo.save(criteria);
  }

  async allCriteria(): Promise<Criteria[]> {
    const criteria = await this.criteriaRepo.find({
      select: ['requirements'],
    });
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

    // console.log(grandeName, 'To ', nextGradeDetails);
    // console.log(await this.fetchGrade(nextGradeDetails));
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

    membership.grade = nextGradeName as any;
    await this.memberRepository.save(membership);

    //save the updgrade

    //await this.membership.save(membership);
    return membership;
  }
  // async obtainnUserCriteria(userId: number){

  // }
}
