import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { Members } from './entities/membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Members])],
  controllers: [MembershipController],
  providers: [MembershipService],
})
export class MembershipModule {}
