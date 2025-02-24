import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendMailDto } from './dto/send-email.dto';

@Controller('mailer')
export class MailerController {
  constructor(private readonly emailService: MailerService) {}

  @Post('send')
  createCriteria(@Body() sendMailDto: SendMailDto) {
    const { email, subject, content, template } = sendMailDto;
    return this.emailService.sendEmail(email, subject, content, template);
  }
}
