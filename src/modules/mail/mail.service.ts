import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
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

  async getInboxMessages(): Promise<any[]> {
    const token = process.env.MAILTRAP_API_TOKEN!;
    const inboxId = process.env.MAILTRAP_INBOX_ID;
    const accountId = process.env.MAILTRAP_ACCOUNT_ID;
    this.logger.debug(
      `MAILTRAP_API_TOKEN set: ${!!token}, length: ${token?.length}, INBOX_ID: ${inboxId}`,
    );
    const headers: HeadersInit = { 'Api-Token': token };
    const response = await fetch(
      `https://mailtrap.io/api/accounts/${accountId}/inboxes/${inboxId}/messages`,
      { headers },
    );
    if (!response.ok) throw new Error(`Mailtrap API error: ${response.status}`);
    return response.json();
  }

  async getMessageHtml(messageId: string): Promise<string> {
    const token = process.env.MAILTRAP_API_TOKEN!;
    const inboxId = process.env.MAILTRAP_INBOX_ID;
    const accountId = process.env.MAILTRAP_ACCOUNT_ID;

    const headers: HeadersInit = { 'Api-Token': token };
    const response = await fetch(
      `https://mailtrap.io/api/accounts/${accountId}/inboxes/${inboxId}/messages/${messageId}/body.html`,
      { headers },
    );
    if (!response.ok) throw new Error(`Mailtrap API error: ${response.status}`);
    return response.text();
  }

  async deleteMessage(messageId: string): Promise<void> {
    const token = process.env.MAILTRAP_API_TOKEN!;
    const inboxId = process.env.MAILTRAP_INBOX_ID;

    const accountId = process.env.MAILTRAP_ACCOUNT_ID;

    const headers: HeadersInit = { 'Api-Token': token };
    await fetch(
      `https://mailtrap.io/api/accounts/${accountId}/inboxes/${inboxId}/messages/${messageId}`,
      { method: 'DELETE', headers },
    );
  }
}
