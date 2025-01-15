import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Login } from './entities/login.entity';
import { JwtModule } from '@nestjs/jwt';
import { Members } from 'src/membership/entities/membership.entity';
import { Otp } from './entities/otp.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     MailerModule.forRoot({

//       transport: {
//         host: 'smtp.mailtrap.io',
//         port: 587,
//         auth: {
//           user: 'your-smtp-user',
//           pass: 'your-smtp-pass',
//         },
//       },
//       defaults: {
//         from: '"No Reply" <noreply@example.com>',
//       },
//     }),
//     TypeOrmModule.forFeature([Login, Members, Otp]),

//     JwtModule.register({
//       secret: 'Yan2Mak!!',
//       signOptions: { expiresIn: '1h' },
//     }),

//   ],
//   controllers: [AccountController],
//   providers: [AccountService],
// })

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: false, // Use false for TLS
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('SMTP_USER')}>`,
        },
        template: {
          dir: join(__dirname, './templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    TypeOrmModule.forFeature([Login, Members, Otp]),
    JwtModule.register({
      secret: 'Yan2Mak!!',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
