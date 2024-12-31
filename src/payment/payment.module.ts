import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { Login } from '../account/entities/login.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from 'src/license/entities/license.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Login, License])],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
