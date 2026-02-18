import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../events/mail.events';
import { MailService } from '../mail.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailSubscriber {
  private readonly logger = new Logger(MailSubscriber.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
  ) {}

  @OnEvent('user.created', { async: true })
  async handleUserCreatedEvent(user: UserCreatedEvent) {
    this.logger.log(
      `[USER CREATED] User created event received: ${user.email}`,
    );

    try {
      console.log('Sending welcome email to:', user.email);
      await this.mailService.sendWelcomeEmail(user.email, user.name);
      this.logger.log(`Welcome email sent successfully to: ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${user.email}:`, error);
    }
  }
}
