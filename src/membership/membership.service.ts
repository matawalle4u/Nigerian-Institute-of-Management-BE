import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Members } from './entities/membership.entity';
import { MembershipDto } from './dto/membership.dto';
import { SearchMemberDto } from './dto/search-querry.dto';
import { PaginationDto } from 'src/general-dtos/pagination.dto';

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

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: Members[]; total: number }> {
    const { page, limit } = paginationDto;
    const [data, total] = await this.memberRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    if (!data.length) {
      throw new NotFoundException('No memberships found');
    }

    return { data, total };
  }

  async findOne(id: number): Promise<Members> {
    const member = this.memberRepository.findOne({
      where: { id },
      relations: ['login_id'],
    });

    return member;
  }

  async searchMembership(
    searchMemberDto: SearchMemberDto,
    paginationDto: PaginationDto,
  ): Promise<{ data: Members[]; total: number }> {
    const { search } = searchMemberDto;
    const { page, limit } = paginationDto;

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
        'member.first_name LIKE :first_name AND member.last_name LIKE :last_name',
        {
          first_name: `%${nameParts[0]}%`,
          last_name: `%${nameParts.slice(1).join(' ')}%`,
        },
      );
    } else {
      // Search by partial name (match firstName or lastName)
      queryBuilder.where(
        'member.first_name LIKE :name OR member.last_name LIKE :name',
        { name: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit) // Skip records based on page number
      .take(limit) // Limit the number of records per page
      .getManyAndCount(); // Get both the data and total count

    if (!data || data.length === 0) {
      throw new NotFoundException(
        `No members found matching the provided input: ${search}`,
      );
    }

    return { data, total };

    // const users = await queryBuilder.getMany();
    // if (!users || users.length === 0) {
    //   throw new UnauthorizedException(
    //     `No members found matching the provided input: ${search}`,
    //   );
    // }
    // return users;
  }

  async update(id: number, updateData: Partial<Members>): Promise<Members> {
    await this.memberRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.memberRepository.delete(id);
  }
}
