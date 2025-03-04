// src/grade/grade.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';

import { Grade } from './entities/grade.entity';
import { Criteria } from './entities/criteria.entity';
import { Upgrade } from './entities/upgrade.entity';
import { Members } from 'src/membership/entities/membership.entity';
import { Login } from 'src/account/entities/login.entity';
import { PaymentService } from 'src/payment/payment.service';
import { Payment } from 'src/payment/entities/payment.entity';
import { License } from 'src/license/entities/license.entity';
import { PaymentProviderFactory } from 'src/payment/providers/payment-provider.factory';
import { Bill } from 'src/billing/entities/bill.entity';
import { PaystackProvider } from 'src/payment/providers/paystack.provider';
import { InterswitchProvider } from 'src/payment/providers/interswitch.provider';
import { RemitaProvider } from 'src/payment/providers/remita.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Members,
      Grade,
      Criteria,
      Upgrade,
      Login,
      Payment,
      License,
      Bill,
    ]),
  ],
  controllers: [GradeController],
  providers: [
    GradeService,
    PaymentService,
    PaymentProviderFactory,
    PaystackProvider,
    InterswitchProvider,
    RemitaProvider,
  ],
})
export class GradeModule {}
