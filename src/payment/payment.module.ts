import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { Login } from '../account/entities/login.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from 'src/license/entities/license.entity';
import { PaymentProviderFactory } from './providers/payment-provider.factory';
import { PaystackProvider } from './providers/paystack.provider';
import { InterswitchProvider } from './providers/interswitch.provider';
import { Bill } from 'src/billing/entities/bill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Login, License, Bill])],
  providers: [
    PaymentService,
    PaymentProviderFactory,
    PaystackProvider,
    InterswitchProvider,
  ],
  controllers: [PaymentController],
})
export class PaymentModule {}
