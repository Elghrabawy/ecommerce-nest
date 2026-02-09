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
}
