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
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewFilterDto,
  ReviewResponseDto,
} from './dto';
import { PaginationDto } from '../../common';
import { PaginationHelper } from '../../common/utils';
import { Product } from '../product/entities/product.entity';
import { SelectQueryBuilder } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { OrderStatus } from '../../common/enums';

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

  /**
   * Helper method to apply filters to the review query
   * @param query - The initial query builder for reviews
   * @param filters - Optional filters to apply to the query
   * @returns The modified query builder with filters applied
   */
  private applyReviewFilters(
    query: SelectQueryBuilder<Review>,
    filters?: ReviewFilterDto,
  ): SelectQueryBuilder<Review> {
    if (!filters) {
      return query;
    }

    if (filters.rating) {
      query = query.andWhere('review.rating = :rating', {
        rating: filters.rating,
      });
    }

    if (filters.minRating) {
      query = query.andWhere('review.rating >= :minRating', {
        minRating: filters.minRating,
      });
    }

    if (filters.maxRating) {
      query = query.andWhere('review.rating <= :maxRating', {
        maxRating: filters.maxRating,
      });
    }

    if (filters.search) {
      query = query.andWhere('review.comment ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
      const field =
        filters.sortBy === 'rating'
          ? 'review.rating'
          : filters.sortBy === 'createdAt'
            ? 'review.created_at'
            : 'review.updated_at';
      query = query.orderBy(field, order);
    }

    return query;
  }

  /**
   * Helper method to convert Review entity to ReviewResponseDto
   * @param review - Review entity to convert
   * @returns ReviewResponseDto
   */
  private mapToResponseDto(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      productId: review.productId,
      userId: review.userId,
      createdAt: review.created_at,
      user: review.user
        ? {
            id: review.user.id,
            name: review.user.name,
            avatar_url: review.user.avatar_url,
          }
        : undefined,
      product: review.product
        ? {
            id: review.product.id,
            name: review.product.name,
            slug: review.product.slug,
            price: review.product.price,
            images: review.product.images,
          }
        : undefined,
    };
  }

  /**
   * Get all reviews with optional pagination and filters
   * @param pagination - Pagination parameters (page and limit)
   * @param filters - Optional filters to apply to the reviews query
   * @returns Array of ReviewResponseDto matching the criteria
   */
  async getAllReviews(
    pagination: PaginationDto,
    filters?: ReviewFilterDto,
  ): Promise<ReviewResponseDto[]> {
    let query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product');

    query = this.applyReviewFilters(query, filters);

    if (!filters?.sortBy) {
      query = query.orderBy('review.created_at', 'DESC');
    }

    const reviews = await PaginationHelper.paginate(
      query,
      pagination.page,
      pagination.limit,
    );

    return reviews.data.map((r) => this.mapToResponseDto(r));
  }

  /**
   * Get review by ID
   * @param reviewId - ID of the review to retrieve
   * @returns ReviewResponseDto for the specified review ID
   * @throws NotFoundException if review with the specified ID does not exist
   */
  async getReviewById(reviewId: number): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    return this.mapToResponseDto(review);
  }

  /**
   * Create a new review for a product by a user
   * @param createReviewDto - Data transfer object containing review details
   * @param userId - ID of the user creating the review
   * @returns ReviewResponseDto for the newly created review
   * @throws NotFoundException if the product to review does not exist
   * @throws BadRequestException if the user cannot review the product or has already reviewed it
   */
  async createReview(
    createReviewDto: CreateReviewDto,
    userId: number,
  ): Promise<ReviewResponseDto> {
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

  /**
   * Update an existing review by its ID, ensuring the user owns the review
   * @param reviewId - ID of the review to update
   * @param updateReviewDto - Data transfer object containing updated review details
   * @param userId - ID of the user attempting to update the review
   * @returns Updated ReviewResponseDto for the specified review ID
   * @throws NotFoundException if review with the specified ID does not exist
   * @throws ForbiddenException if the user does not own the review
   */
  async updateReview(
    reviewId: number,
    updateReviewDto: UpdateReviewDto,
    userId: number,
  ): Promise<ReviewResponseDto> {
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

  /**
   * Delete a review by its ID, ensuring the user owns the review
   * @param reviewId - ID of the review to delete
   * @param userId - ID of the user attempting to delete the review
   * @returns Object containing a success message confirming the deletion of the review
   * @throws ForbiddenException if the user does not own the review
   * @throws NotFoundException if review with the specified ID does not exist
   */
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

  /**
   * Get reviews for a specific product with optional pagination and filters
   * @param productId - ID of the product to retrieve reviews for
   * @param pagination - Pagination parameters (page and limit)
   * @param filters - Optional filters to apply to the reviews query
   * @returns Array of ReviewResponseDto matching the criteria for the specified product ID
   */
  async getReviewsByProductId(
    productId: number,
    pagination?: PaginationDto,
    filters?: ReviewFilterDto,
  ): Promise<ReviewResponseDto[]> {
    let query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.productId = :productId', { productId });

    query = this.applyReviewFilters(query, filters);

    if (!filters?.sortBy) {
      query = query.orderBy('review.created_at', 'DESC');
    }

    const reviews = await PaginationHelper.paginate(
      query,
      pagination?.page,
      pagination?.limit,
    );

    return reviews.data.map((r) => this.mapToResponseDto(r));
  }

  /**
   * Get reviews for a specific user with optional pagination
   * @param userId - ID of the user to retrieve reviews for
   * @param pagination - Pagination parameters (page and limit)
   * @returns Array of ReviewResponseDto matching the criteria for the specified user ID
   */
  async getReviewsByUserId(
    userId: number,
    pagination: PaginationDto,
  ): Promise<ReviewResponseDto[]> {
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

    return reviews.data.map((r) => this.mapToResponseDto(r));
  }

  /**
   * Calculate the average rating for a specific product
   * @param productId - ID of the product to calculate the average rating for
   * @returns Average rating as a number (0 if there are no reviews)
   */
  async getAverageRating(productId: number): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.productId = :productId', { productId })
      .getRawOne<{ average: string }>();

    return result?.average ? parseFloat(result.average) : 0;
  }

  /**
   * Get the distribution of ratings for a specific product (count of each rating value)
   * @param productId - ID of the product to get the rating distribution for
   * @returns Object where keys are rating values (1-5) and values are the count of reviews with that rating
   */
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

  /**
   * Helper method to verify if a review belongs to a user
   * @param reviewId - ID of the review to check
   * @param userId - ID of the user to verify ownership against
   * @returns Boolean indicating whether the review belongs to the user
   * @throws NotFoundException if review with the specified ID does not exist
   */
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

  /**
   * Helper method to check if a user can review a product (i.e., has purchased the product)
   * @param productId - ID of the product to check
   * @param userId - ID of the user to check
   * @returns Boolean indicating whether the user can review the product
   */
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
