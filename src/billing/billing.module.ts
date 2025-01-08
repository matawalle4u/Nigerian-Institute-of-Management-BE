// src/billing/billing.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { Bill } from './entities/bill.entity';
import { Login } from 'src/account/entities/login.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, Login])],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
