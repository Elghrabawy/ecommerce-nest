import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginatedResponse } from '../interfaces';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../constants';

export class PaginationHelper {
  /**
   * Apply pagination to a TypeORM query builder
   *
   * @param query - TypeORM SelectQueryBuilder
   * @param page - Page number (starts from 1)
   * @param limit - Items per page
   * @returns Query builder with pagination applied
   *
   * @example
   * ```typescript
   * const query = this.repository.createQueryBuilder('entity');
   * const paginatedQuery = PaginationHelper.applyPagination(query, 1, 20);
   * ```
   */
  static applyPagination<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    page: number = 1,
    limit: number = 20,
  ): SelectQueryBuilder<T> {
    const pageNumber = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? Math.min(limit, 100) : 20;

    return query.skip((pageNumber - 1) * pageSize).take(pageSize);
  }

  /**
   * Execute paginated query and return result with metadata
   *
   * @param query - TypeORM SelectQueryBuilder
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated result with data and metadata
   *
   * @example
   * ```typescript
   * const query = this.repository.createQueryBuilder('product');
   * const result = await PaginationHelper.paginate(query, 1, 20);
   * ```
   */
  static async paginate<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    page: number = DEFAULT_PAGE,
    limit: number = DEFAULT_LIMIT,
  ): Promise<PaginatedResponse<T>> {
    const pageNumber = page && page > 0 ? page : DEFAULT_PAGE;
    const pageSize =
      limit && limit > 0 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT;

    const [data, total] = await query
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(total / pageSize);

    return {
      status: 'success',
      data,
      meta: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    };
  }

  /**
   * Create pagination metadata manually (when you already have the data)
   *
   * @param data - Array of items
   * @param total - Total count
   * @param page - Current page
   * @param limit - Items per page
   * @returns Paginated result
   */
  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number = DEFAULT_PAGE,
    limit: number = DEFAULT_LIMIT,
  ): PaginatedResponse<T> {
    const pageNumber = page && page > 0 ? page : 1;
    const pageSize =
      limit && limit > 0 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT;
    const totalPages = Math.ceil(total / pageSize);

    return {
      status: 'success',
      data,
      meta: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    };
  }
}
