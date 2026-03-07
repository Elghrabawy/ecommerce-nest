import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { Order } from '../order/entities/order.entity';
import { DataSource } from 'typeorm';
import { StripeProvider } from './providers/stripe.provider';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../../common/enums';
import Stripe from 'stripe';

describe('PaymentService', () => {
  let service: PaymentService;

  const mockPaymentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockWebhookEventRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockOrderRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockStripeProvider = {
    createPaymentIntent: jest.fn(),
    retrievePaymentIntent: jest.fn(),
    createRefund: jest.fn(),
    constructWebhookEvent: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockDataSource = {
    manager: {
      transaction: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        {
          provide: getRepositoryToken(WebhookEvent),
          useValue: mockWebhookEventRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: StripeProvider,
          useValue: mockStripeProvider,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    const userId = 1;
    const orderId = 100;
    const mockOrder: Partial<Order> = {
      id: orderId,
      totalAmount: 99.99,
      status: OrderStatus.AWAITING_PAYMENT,
      user: { id: userId } as any,
      payments: [],
    };

    beforeEach(() => {
      mockConfigService.get.mockReturnValue('usd');
    });

    it('should create a new payment intent successfully', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockStripeProvider.createPaymentIntent.mockResolvedValue({
        clientSecret: 'test_secret',
        paymentIntentId: 'pi_test123',
      });
      mockPaymentRepository.create.mockReturnValue({
        id: 1,
        amount: 99.99,
      });
      mockPaymentRepository.save.mockResolvedValue({});

      const result = await service.createPaymentIntent(userId, {
        orderId,
        paymentMethod: PaymentMethod.STRIPE,
      });

      expect(result).toEqual({
        clientSecret: 'test_secret',
        paymentIntentId: 'pi_test123',
      });
      expect(mockStripeProvider.createPaymentIntent).toHaveBeenCalledWith(
        99.99,
        'usd',
        {
          orderId: orderId.toString(),
          userId: userId.toString(),
        },
        expect.stringMatching(/^order_100_1_\d+$/),
      );
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createPaymentIntent(userId, {
          orderId,
          paymentMethod: PaymentMethod.STRIPE,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order is not awaiting payment', async () => {
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PAID,
      });

      await expect(
        service.createPaymentIntent(userId, {
          orderId,
          paymentMethod: PaymentMethod.STRIPE,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if order is already paid', async () => {
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        payments: [
          {
            id: 1,
            status: PaymentStatus.COMPLETED,
          },
        ],
      });

      await expect(
        service.createPaymentIntent(userId, {
          orderId,
          paymentMethod: PaymentMethod.STRIPE,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reuse existing pending payment intent if valid', async () => {
      const existingPaymentIntentId = 'pi_existing123';
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        payments: [
          {
            id: 1,
            paymentIntentId: existingPaymentIntentId,
            status: PaymentStatus.PENDING,
          },
        ],
      });
      mockStripeProvider.retrievePaymentIntent.mockResolvedValue({
        id: existingPaymentIntentId,
        status: 'requires_payment_method',
        client_secret: 'existing_secret',
      });

      const result = await service.createPaymentIntent(userId, {
        orderId,
        paymentMethod: PaymentMethod.STRIPE,
      });

      expect(result).toEqual({
        clientSecret: 'existing_secret',
        paymentIntentId: existingPaymentIntentId,
      });
      expect(mockStripeProvider.createPaymentIntent).not.toHaveBeenCalled();
    });
  });

  describe('handleWebhook', () => {
    const mockPayload = Buffer.from('test');
    const mockSignature = 'test_signature';
    const mockEvent = {
      id: 'evt_test123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test123',
        },
      },
    };

    beforeEach(() => {
      mockStripeProvider.constructWebhookEvent.mockReturnValue(mockEvent);
    });

    it('should process new webhook event successfully', async () => {
      mockWebhookEventRepository.findOne.mockResolvedValue(null);
      const mockWebhookEvent = {
        eventId: mockEvent.id,
        eventType: mockEvent.type,
        payload: mockEvent.data.object,
        receivedAt: expect.any(Date),
        processed: false,
        retryCount: 0,
      };
      mockWebhookEventRepository.create.mockReturnValue(mockWebhookEvent);
      mockWebhookEventRepository.save.mockResolvedValue(mockWebhookEvent);
      mockWebhookEventRepository.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      // Mock transaction with proper order locking
      mockDataSource.manager.transaction.mockImplementation(
        async (callback: any) => {
          const mockPayment = {
            id: 1,
            paymentIntentId: 'pi_test123',
            status: PaymentStatus.PENDING,
            amount: 99.99,
            metadata: {},
            order: {
              id: 100,
              status: OrderStatus.AWAITING_PAYMENT,
              user: { id: 1, email: 'test@test.com' },
            },
          };

          const mockOrder = {
            id: 100,
            status: OrderStatus.AWAITING_PAYMENT,
          };

          const mockManager = {
            findOne: jest
              .fn()
              .mockResolvedValueOnce(mockPayment) // First call for Payment
              .mockResolvedValueOnce(mockOrder), // Second call for Order
            save: jest.fn().mockResolvedValue({}),
            increment: jest.fn().mockResolvedValue({}),
          };
          return callback(mockManager);
        },
      );

      await service.handleWebhook(mockPayload, mockSignature);

      expect(mockWebhookEventRepository.create).toHaveBeenCalledWith({
        eventId: mockEvent.id,
        eventType: mockEvent.type,
        payload: mockEvent.data.object,
        receivedAt: expect.any(Date),
        processed: false,
        retryCount: 0,
      });
      expect(mockWebhookEventRepository.save).toHaveBeenCalled();
      expect(mockWebhookEventRepository.update).toHaveBeenCalledWith(
        { eventId: mockEvent.id },
        { processed: true, processedAt: expect.any(Date) },
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.success',
        expect.any(Object),
      );
    });

    it('should skip already processed webhook events', async () => {
      mockWebhookEventRepository.findOne.mockResolvedValue({
        eventId: mockEvent.id,
        processed: true,
      });

      await service.handleWebhook(mockPayload, mockSignature);

      expect(mockWebhookEventRepository.create).not.toHaveBeenCalled();
      expect(mockDataSource.manager.transaction).not.toHaveBeenCalled();
      expect(mockWebhookEventRepository.update).not.toHaveBeenCalled();
    });

    it('should increment retry count for unprocessed events', async () => {
      const existingEvent = {
        id: 1,
        eventId: mockEvent.id,
        processed: false,
        retryCount: 0,
      };
      mockWebhookEventRepository.findOne.mockResolvedValue(existingEvent);
      mockWebhookEventRepository.save.mockResolvedValue({
        ...existingEvent,
        retryCount: 1,
      });
      mockWebhookEventRepository.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      mockDataSource.manager.transaction.mockImplementation(
        async (callback: any) => {
          const mockPayment = {
            id: 1,
            paymentIntentId: 'pi_test123',
            status: PaymentStatus.PENDING,
            amount: 99.99,
            metadata: {},
            order: {
              id: 100,
              status: OrderStatus.AWAITING_PAYMENT,
              user: { id: 1, email: 'test@test.com' },
            },
          };

          const mockOrder = {
            id: 100,
            status: OrderStatus.AWAITING_PAYMENT,
          };

          const mockManager = {
            findOne: jest
              .fn()
              .mockResolvedValueOnce(mockPayment) // First call for Payment
              .mockResolvedValueOnce(mockOrder), // Second call for Order
            save: jest.fn().mockResolvedValue({}),
          };
          return callback(mockManager);
        },
      );

      await service.handleWebhook(mockPayload, mockSignature);

      expect(mockWebhookEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ retryCount: 1 }),
      );
    });

    it('should handle payment success for cancelled order with auto-refund', async () => {
      const mockEvent = {
        id: 'evt_cancelled',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_cancelled123',
            payment_method: 'pm_test',
          } as Stripe.PaymentIntent,
        },
      };
      mockStripeProvider.constructWebhookEvent.mockReturnValue(mockEvent);
      mockWebhookEventRepository.findOne.mockResolvedValue(null);
      mockWebhookEventRepository.create.mockReturnValue({
        eventId: mockEvent.id,
      });
      mockWebhookEventRepository.save.mockResolvedValue({});
      mockWebhookEventRepository.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      mockDataSource.manager.transaction.mockImplementation(
        async (callback: any) => {
          const mockPayment = {
            id: 1,
            paymentIntentId: 'pi_cancelled123',
            status: PaymentStatus.PENDING,
            amount: 99.99,
            metadata: {},
            order: {
              id: 100,
              status: OrderStatus.CANCELLED,
              user: { id: 1, email: 'test@test.com' },
            },
          };

          const mockOrder = {
            id: 100,
            status: OrderStatus.CANCELLED,
          };

          const mockManager = {
            findOne: jest
              .fn()
              .mockResolvedValueOnce(mockPayment)
              .mockResolvedValueOnce(mockOrder),
            save: jest.fn().mockResolvedValue({}),
          };
          return callback(mockManager);
        },
      );

      await service.handleWebhook(Buffer.from('test'), 'sig');

      expect(mockStripeProvider.createRefund).toHaveBeenCalledWith(
        'pi_cancelled123',
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.refunded',
        expect.any(Object),
      );
    });

    it('should handle payment failure event', async () => {
      const mockFailedEvent = {
        id: 'evt_failed',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_failed123',
            last_payment_error: {
              message: 'Card declined',
            },
          } as Stripe.PaymentIntent,
        },
      };
      mockStripeProvider.constructWebhookEvent.mockReturnValue(mockFailedEvent);
      mockWebhookEventRepository.findOne.mockResolvedValue(null);
      mockWebhookEventRepository.create.mockReturnValue({
        eventId: mockFailedEvent.id,
      });
      mockWebhookEventRepository.save.mockResolvedValue({});
      mockWebhookEventRepository.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      const mockPayment = {
        id: 1,
        paymentIntentId: 'pi_failed123',
        status: PaymentStatus.PENDING,
        amount: 99.99,
        order: {
          id: 100,
          status: OrderStatus.AWAITING_PAYMENT,
          user: { id: 1, email: 'test@test.com' },
          items: [
            {
              id: 1,
              quantity: 2,
              product: { id: 10, stock: 5 },
            },
          ],
        },
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.FAILED,
      });

      mockDataSource.manager.transaction.mockImplementation(
        async (callback: any) => {
          const mockManager = {
            increment: jest.fn().mockResolvedValue({}),
            save: jest.fn().mockResolvedValue({}),
          };
          return callback(mockManager);
        },
      );

      await service.handleWebhook(Buffer.from('test'), 'sig');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.failed',
        expect.any(Object),
      );
    });

    it('should handle webhook processing errors', async () => {
      const mockEvent = {
        id: 'evt_error',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_error123',
          } as Stripe.PaymentIntent,
        },
      };
      mockStripeProvider.constructWebhookEvent.mockReturnValue(mockEvent);
      mockWebhookEventRepository.findOne.mockResolvedValue(null);
      mockWebhookEventRepository.create.mockReturnValue({
        eventId: mockEvent.id,
      });
      mockWebhookEventRepository.save.mockResolvedValue({});
      mockWebhookEventRepository.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      const testError = new Error('Transaction failed');
      mockDataSource.manager.transaction.mockRejectedValue(testError);

      await expect(
        service.handleWebhook(Buffer.from('test'), 'sig'),
      ).rejects.toThrow('Transaction failed');

      expect(mockWebhookEventRepository.update).toHaveBeenCalledWith(
        { eventId: mockEvent.id },
        { errorMessage: 'Transaction failed', processedAt: expect.any(Date) },
      );
    });
  });

  describe('handlePaymentSuccess', () => {
    it('should skip already completed payments', async () => {
      const mockPaymentIntent = {
        id: 'pi_completed',
      } as Stripe.PaymentIntent;

      mockDataSource.manager.transaction.mockImplementation(
        async (callback: any) => {
          const mockPayment = {
            id: 1,
            paymentIntentId: 'pi_completed',
            status: PaymentStatus.COMPLETED,
            order: {
              id: 100,
              user: { email: 'test@test.com' },
            },
          };

          const mockManager = {
            findOne: jest.fn().mockResolvedValueOnce(mockPayment),
            save: jest.fn().mockResolvedValue({}),
          };
          return callback(mockManager);
        },
      );

      await service.handlePaymentSuccess(mockPaymentIntent);

      // Should not emit success event for already completed payment
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('handlePaymentFailure', () => {
    it('should handle payment failure and restore stock', async () => {
      const mockPaymentIntent = {
        id: 'pi_failed',
        last_payment_error: {
          message: 'Insufficient funds',
        },
      } as Stripe.PaymentIntent;

      const mockPayment = {
        id: 1,
        paymentIntentId: 'pi_failed',
        status: PaymentStatus.PENDING,
        amount: 99.99,
        order: {
          id: 100,
          user: { id: 1, email: 'test@test.com' },
          items: [
            {
              id: 1,
              quantity: 3,
              product: { id: 10, stock: 5 },
            },
            {
              id: 2,
              quantity: 1,
              product: { id: 20, stock: 10 },
            },
          ],
        },
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.FAILED,
      });

      mockDataSource.manager.transaction.mockImplementation(
        async (callback: any) => {
          const mockManager = {
            increment: jest.fn().mockResolvedValue({}),
            save: jest.fn().mockResolvedValue({}),
          };
          return callback(mockManager);
        },
      );

      await service.handlePaymentFailure(mockPaymentIntent);

      expect(mockPaymentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: PaymentStatus.FAILED,
          failureReason: 'Insufficient funds',
        }),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.failed',
        expect.objectContaining({
          reason: 'Insufficient funds',
        }),
      );
    });

    it('should skip already failed payments', async () => {
      const mockPaymentIntent = {
        id: 'pi_already_failed',
      } as Stripe.PaymentIntent;

      const mockPayment = {
        id: 1,
        paymentIntentId: 'pi_already_failed',
        status: PaymentStatus.FAILED,
        order: {
          user: { email: 'test@test.com' },
        },
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);

      await service.handlePaymentFailure(mockPaymentIntent);

      expect(mockPaymentRepository.save).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments with order relations', async () => {
      const mockPayments = [
        { id: 1, order: { id: 100 } },
        { id: 2, order: { id: 101 } },
      ];
      mockPaymentRepository.find.mockResolvedValue(mockPayments);

      const result = await service.getAllPayments();

      expect(result).toEqual(mockPayments);
      expect(mockPaymentRepository.find).toHaveBeenCalledWith({
        relations: ['order'],
      });
    });
  });

  describe('getPaymentById', () => {
    it('should return payment by id', async () => {
      const mockPayment = {
        id: 1,
        order: { id: 100 },
      };
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById(1);

      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException if payment does not exist', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(service.getPaymentById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPaymentsForUser', () => {
    it('should return all payments for a specific user', async () => {
      const userId = 1;
      const mockPayments = [
        { id: 1, order: { id: 100 } },
        { id: 2, order: { id: 101 } },
      ];
      mockPaymentRepository.find.mockResolvedValue(mockPayments);

      const result = await service.getPaymentsForUser(userId);

      expect(result).toEqual(mockPayments);
      expect(mockPaymentRepository.find).toHaveBeenCalledWith({
        where: { order: { user: { id: userId } } },
        relations: ['order'],
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('getPaymentByOrderId', () => {
    const orderId = 100;
    const userId = 1;

    it('should return payment for authorized user', async () => {
      const mockPayment = {
        id: 1,
        order: {
          id: orderId,
          user: { id: userId },
        },
      };
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.getPaymentByOrderId(orderId, userId);

      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException if payment does not exist', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getPaymentByOrderId(orderId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is not authorized', async () => {
      const mockPayment = {
        id: 1,
        order: {
          id: orderId,
          user: { id: 999 }, // Different user
        },
      };
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);

      await expect(
        service.getPaymentByOrderId(orderId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('refundPayment', () => {
    it('should refund a completed payment successfully', async () => {
      const mockPayment = {
        id: 1,
        paymentIntentId: 'pi_test123',
        status: PaymentStatus.COMPLETED,
        amount: 99.99,
        order: {
          id: 100,
          user: { email: 'test@test.com' },
        },
      };
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockStripeProvider.createRefund.mockResolvedValue({});
      mockPaymentRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
      });

      const result = await service.refundPayment(1);

      expect(mockStripeProvider.createRefund).toHaveBeenCalledWith(
        'pi_test123',
      );
      expect(result.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should throw BadRequestException for non-completed payments', async () => {
      const mockPayment = {
        id: 1,
        status: PaymentStatus.PENDING,
      };
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);

      await expect(service.refundPayment(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
