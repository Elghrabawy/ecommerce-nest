import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, ReviewFilterDto } from './dto';
import { PaginationDto } from 'src/common';
import Auth from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { ResponseInterceptor } from 'src/common/interceptors';
import { Review } from './entities/review.entity';

@ApiTags('reviews')
@Controller('reviews')
@UseInterceptors(ResponseInterceptor<Review>)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews with optional filters' })
  async getReviews(
    @Query() pagination: PaginationDto,
    @Query() filters?: ReviewFilterDto,
  ) {
    return await this.reviewsService.getAllReviews(pagination, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  async getReviewById(@Param('id', ParseIntPipe) id: number) {
    return await this.reviewsService.getReviewById(id);
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create new review' })
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: User,
  ) {
    return await this.reviewsService.createReview(createReviewDto, user.id);
  }

  @Put(':id')
  @Auth()
  @ApiOperation({ summary: 'Update review' })
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return await this.reviewsService.updateReview(id, updateReviewDto, user.id);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete review' })
  async deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.reviewsService.deleteReview(id, user.id);
    return { message: 'Review deleted successfully' };
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews by product ID with optional filters' })
  async getReviewsByProductId(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() pagination: PaginationDto,
    @Query() filters?: ReviewFilterDto,
  ) {
    return await this.reviewsService.getReviewsByProductId(
      productId,
      pagination,
      filters,
    );
  }

  @Get('product/:productId/average')
  @ApiOperation({ summary: 'Get average rating for product' })
  async getAverageRating(@Param('productId', ParseIntPipe) productId: number) {
    const average = await this.reviewsService.getAverageRating(productId);
    return { productId, averageRating: average };
  }

  @Get('product/:productId/distribution')
  @ApiOperation({ summary: 'Get rating distribution for product' })
  async getRatingDistribution(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const distribution =
      await this.reviewsService.getRatingDistribution(productId);
    return { productId, distribution };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reviews by user ID' })
  async getReviewsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() pagination: PaginationDto,
  ) {
    return await this.reviewsService.getReviewsByUserId(userId, pagination);
  }
}
