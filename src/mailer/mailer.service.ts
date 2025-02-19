import { Injectable } from '@nestjs/common';
import { MailerService as NodeEmail } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NodeEmail) {}

  sendEmail(to: string, subject: string, text: string) {
    return this.mailerService
      .sendMail({
        to,
        subject,
        text,
      })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error('Error fetching grade history:', error);
        throw error;
      });
  }
}
