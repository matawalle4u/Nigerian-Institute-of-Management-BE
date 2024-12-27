import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Members } from './entities/membership.entity';
import { MembershipDto } from './dto/membership.dto';
import { SearchMemberDto } from './dto/search-querry.dto';
@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Members)
    private readonly memberRepository: Repository<Members>,
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
}
