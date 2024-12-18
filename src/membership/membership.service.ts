import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private readonly memberRepository: Repository<Membership>,
  ) {}

  async create(memberData: Partial<Membership>): Promise<Membership> {
    const member = this.memberRepository.create(memberData);
    return this.memberRepository.save(member);
  }

  async findAll(): Promise<Membership[]> {
    return this.memberRepository.find();
  }

  async findOne(id: number): Promise<Membership> {
    return this.memberRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateData: Partial<Membership>,
  ): Promise<Membership> {
    await this.memberRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.memberRepository.delete(id);
  }
}
