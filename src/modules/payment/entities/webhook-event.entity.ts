import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';

@Entity('webhook_events')
export class WebhookEvent extends BaseEntity {
  @Index({ unique: true })
  @Column({ unique: true })
  eventId: string;

  @Column()
  eventType: string;

  @Column({ type: 'json' })
  payload: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  receivedAt: Date;

  @Column({ default: false })
  processed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ default: 0 })
  retryCount: number;
}
