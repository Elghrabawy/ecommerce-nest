import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { PaginationDto } from 'src/common';
import { PaginationHelper } from 'src/common/utils';
import { Product } from '../product/entities/product.entity';
import { Order } from '../order/entities/order.entity';
import { OrderStatus } from 'src/common/enums';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getAllReviews(pagination: PaginationDto): Promise<Review[]> {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.created_at', 'DESC');

    const reviews = await PaginationHelper.paginate(
      query,
      pagination.page,
      pagination.limit,
    );

    return reviews.data;
  }

  async getReviewById(reviewId: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    return review;
  }

  async createReview(
    createReviewDto: CreateReviewDto,
    userId: number,
  ): Promise<Review> {
    const { productId, rating, comment } = createReviewDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if user can review (has purchased the product)
    const canReview = await this.canUserReview(productId, userId);
    if (!canReview) {
      throw new BadRequestException(
        'You must purchase this product before reviewing it',
      );
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: { productId, userId },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this product. Use update instead.',
      );
    }

    const review = this.reviewRepository.create({
      productId,
      userId,
      rating,
      comment,
    });

    const savedReview = await this.reviewRepository.save(review);
    this.logger.log(
      `Review created by user ${userId} for product ${productId}`,
    );

    return await this.getReviewById(savedReview.id);
  }

  async updateReview(
    reviewId: number,
    updateReviewDto: UpdateReviewDto,
    userId: number,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Verify ownership
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    await this.reviewRepository.save(review);

    this.logger.log(`Review ${reviewId} updated by user ${userId}`);

    return await this.getReviewById(reviewId);
  }

  async deleteReview(reviewId: number, userId: number): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Verify ownership
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.softRemove(review);
    this.logger.log(`Review ${reviewId} deleted by user ${userId}`);
  }

  async getReviewsByProductId(
    productId: number,
    pagination?: PaginationDto,
  ): Promise<Review[]> {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.productId = :productId', { productId })
      .orderBy('review.created_at', 'DESC');

    const reviews = await PaginationHelper.paginate(
      query,
      pagination?.page,
      pagination?.limit,
    );

    return reviews.data;
  }

  async getReviewsByUserId(
    userId: number,
    pagination: PaginationDto,
  ): Promise<Review[]> {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .where('review.userId = :userId', { userId })
      .orderBy('review.created_at', 'DESC');

    const reviews = await PaginationHelper.paginate(
      query,
      pagination?.page,
      pagination?.limit,
    );

    return reviews.data;
  }

  async getAverageRating(productId: number): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.productId = :productId', { productId })
      .getRawOne<{ average: string }>();

    return result?.average ? parseFloat(result.average) : 0;
  }

  async getRatingDistribution(productId: number): Promise<{
    [key: number]: number;
  }> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.productId = :productId', { productId })
      .groupBy('review.rating')
      .getRawMany<{ rating: number; count: string }>();

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.forEach((row) => {
      distribution[row.rating] = parseInt(row.count);
    });

    return distribution;
  }

  async verifyReviewOwnership(
    reviewId: number,
    userId: number,
  ): Promise<boolean> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    return review.userId === userId;
  }

  async canUserReview(productId: number, userId: number): Promise<boolean> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'orderItem')
      .where('order.userId = :userId', { userId })
      .andWhere('orderItem.productId = :productId', { productId })
      .andWhere('order.status = :status', { status: OrderStatus.SHIPPED })
      .getOne();

    return !!order;
  }
}
