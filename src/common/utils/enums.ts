export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum StorageProvider {
  LOCAL = 'local',
  CLOUDINARY = 'cloudinary',
  MINIO = 'minio',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  SQUARE = 'SQUARE',
  RAZORPAY = 'RAZORPAY',
  MANUAL = 'MANUAL',
}
