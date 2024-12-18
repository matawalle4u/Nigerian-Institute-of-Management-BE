import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from './account/account.module';
import { PaymentModule } from './payment/payment.module';
import { GradeModule } from './grade/grade.module';
import { MembershipModule } from './membership/membership.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '172.18.0.2',
      port: 3306,
      username: 'root',
      password: 'Ixxah2san!!',
      database: 'nimportal',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      driver: require('mysql2'),
    }),
    JwtModule.register({
      secret: 'Yan2Mak!!', // TODO Use a strong secret in production
      signOptions: { expiresIn: '1h' },
    }),
    AccountModule,
    PaymentModule,
    GradeModule,
    MembershipModule,
  ],
})
export class AppModule {}
