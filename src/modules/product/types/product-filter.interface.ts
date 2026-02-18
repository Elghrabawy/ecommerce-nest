export interface ProductFilters {
  name?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sorted?: 'asc' | 'desc';
  sortedBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  page?: number;
  limit?: number;
}
