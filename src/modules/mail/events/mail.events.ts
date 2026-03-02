export class UserCreatedEvent {
  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}
}

export class OrderCreatedEvent {
  constructor(
    public readonly email: string,
    public readonly orderId: number,
    public readonly amount: number,
  ) {}
}

export class PaymentSuccessEvent {
  constructor(
    public readonly email: string,
    public readonly orderId: number,
    public readonly amount: number,
  ) {}
}

export class PaymentFailedEvent {
  constructor(
    public readonly email: string,
    public readonly orderId: number,
    public readonly reason: string,
  ) {}
}

export class OrderExpiredEvent {
  constructor(
    public readonly email: string,
    public readonly orderId: number,
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly email: string,
    public readonly orderId: number,
    public readonly reason: string,
  ) {}
}

export class RefundedEvent {
  constructor(
    public readonly email: string,
    public readonly orderId: number,
    public readonly amount: number,
  ) {}
}
