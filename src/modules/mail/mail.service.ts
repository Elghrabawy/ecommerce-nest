import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}
  async sendMail(to: string, subject: string, body: string) {
    await this.mailer.sendMail({
      to,
      from: 'no-reply@borhom.com',
      subject,
      html: body,
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    await this.mailer.sendMail({
      to,
      subject: 'Welcome to Our Platform! 🎉',
      template: 'welcome', // This refers to welcome.ejs
      context: {
        name: name,
        email: to,
      },
    });
  }
}
