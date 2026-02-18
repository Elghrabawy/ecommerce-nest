import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    private readonly datasource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    datasource.subscribers.push(this);
  }
  listenTo() {
    return User;
  }

  // should move hashing password here
  beforeInsert(event: InsertEvent<User>) {
    // console.log(`BEFORE USER INSERTED: `, event.entity);
  }

  afterInsert(event: InsertEvent<User>) {
    // console.log(`AFTER USER INSERTED: `, event.entity);
  }
}
