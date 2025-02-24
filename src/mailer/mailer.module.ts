import { MailerModule as NestEmail } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { HandlebarsAdapter as Adapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    NestEmail.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        debug: true,
        logger: true,
      },
      defaults: {
        from: '"No Reply" <noreply@nim.ng>',
      },
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new Adapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [MailerController],
  providers: [MailerService],
})
export class MailerModule {}
