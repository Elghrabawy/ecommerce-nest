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
  ) {}
}
