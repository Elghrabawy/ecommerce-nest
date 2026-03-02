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

  async sendPaymentSuccessEmail(to: string, orderId: number, amount: number) {
    await this.mailer.sendMail({
      to,
      subject: `Payment Confirmed for Order #${orderId} ✓`,
      template: 'payment-success',
      context: {
        orderId,
        amount: amount.toFixed(2),
      },
    });
  }

  async sendRefundEmail(to: string, orderId: number, amount: number) {
    await this.mailer.sendMail({
      to,
      subject: `Refund Processed for Order #${orderId}`,
      template: 'payment-refund',
      context: {
        orderId,
        amount: amount.toFixed(2),
      },
    });
  }

  async sendPaymentFailedEmail(to: string, orderId: number, reason: string) {
    await this.mailer.sendMail({
      to,
      subject: `Payment Failed for Order #${orderId}`,
      template: 'payment-failed',
      context: {
        orderId,
        reason,
      },
    });
  }
}
