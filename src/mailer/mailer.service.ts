import { Injectable } from '@nestjs/common';
import { MailerService as NodeEmail } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  private readonly templates = {
    MAILER_TEMPLATE: 'email_template',
  };

  constructor(private readonly mailerService: NodeEmail) {}

  sendEmail(to: string, subject: string, text: string, template: string) {
    const templateName = this.templates[template];
    if (!templateName) {
      return Promise.reject(new Error('Template name is missing'));
    }

    return this.mailerService
      .sendMail({
        to,
        subject,
        text,
        template: templateName,
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
