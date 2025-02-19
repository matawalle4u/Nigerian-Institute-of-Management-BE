import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Login } from './entities/login.entity';
import { JwtModule } from '@nestjs/jwt';
import { Members } from 'src/membership/entities/membership.entity';
import { Otp } from './entities/otp.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailerService as EmailService } from 'src/mailer/mailer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // Change to `true` if using SSL (port 465)
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.SMTP_USER}>`,
      },
      template: {
        dir: join(__dirname, './templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    TypeOrmModule.forFeature([Login, Members, Otp]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'Yan2Mak!!',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
  ],
  controllers: [AccountController],
  providers: [AccountService, EmailService],
})
export class AccountModule {}
