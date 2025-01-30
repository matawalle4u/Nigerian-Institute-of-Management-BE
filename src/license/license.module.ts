import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './licence.controller';
import { License } from './entities/license.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { Login } from 'src/account/entities/login.entity';
import { JwtModule } from '@nestjs/jwt';
import { Members } from 'src/membership/entities/membership.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([License, Login, Members, Payment]),
    JwtModule.register({
      secret: 'Yan2Mak!!',
      signOptions: { expiresIn: '1h' },
    }),
    AccountModule,
    PaymentModule,
  ],
  providers: [LicenseService],
  controllers: [LicenseController],
})
export class LicenseModule {}
