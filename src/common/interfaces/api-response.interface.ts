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
