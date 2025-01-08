import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from './account/account.module';
import { PaymentModule } from './payment/payment.module';
import { GradeModule } from './grade/grade.module';
import { MembershipModule } from './membership/membership.module';
import { PublicationModule } from './publication/publication.module';
import { NewsModule } from './news/news.module';
import { LicenseModule } from './license/license.module';
import { NimEventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        driver: require('mysql2'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    AccountModule,
    PaymentModule,
    GradeModule,
    MembershipModule,
    PublicationModule,
    NewsModule,
    LicenseModule,
    NimEventsModule,
    BillingModule,
  ],
})
export class AppModule {}
