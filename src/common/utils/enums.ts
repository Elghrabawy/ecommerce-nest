export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VENDOR = 'vendor',
}

export enum StorageProvider {
  LOCAL = 'local',
  CLOUDINARY = 'cloudinary',
  MINIO = 'minio',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  FAILED = 'FAILED',
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
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}
