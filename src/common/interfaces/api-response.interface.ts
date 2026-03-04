/**
 * Common API response types
 */
export interface singleDataResponse<T> {
  status: 'success';
  data: Partial<T>;
}

/**
 * Generic API response wrapper
 */
export interface multiDataResponse<T> {
  status: 'success';
  count: number;
  data: Partial<T>[];
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response with metadata
 */
export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  meta: PaginationMeta;
}
