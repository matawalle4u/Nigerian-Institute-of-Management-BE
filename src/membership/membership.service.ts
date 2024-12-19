import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Members } from './entities/membership.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Members)
    private readonly memberRepository: Repository<Members>,
  ) {}

  async create(memberData: Partial<Members>): Promise<Members> {
    const member = this.memberRepository.create(memberData);
    return this.memberRepository.save(member);
  }

  async findAll(): Promise<Members[]> {
    return this.memberRepository.find();
  }

  async findOne(id: number): Promise<Members> {
    return this.memberRepository.findOne({ where: { id } });
  }

  async update(id: number, updateData: Partial<Members>): Promise<Members> {
    await this.memberRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.memberRepository.delete(id);
  }
}
