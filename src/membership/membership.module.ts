import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { Membership } from './entities/membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Membership])],
  controllers: [MembershipController],
  providers: [MembershipService],
})
export class MembershipModule {}
