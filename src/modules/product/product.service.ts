import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductFilters } from './types/product-filter.interface';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    throw new NotImplementedException();
  }

  async getProductById(productId: number): Promise<Product> {
    throw new NotImplementedException();
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    throw new NotImplementedException();
  }

  async updateProduct(
    productId: number,
    productData: UpdateProductDto,
  ): Promise<Product> {
    throw new NotImplementedException();
  }

  async deleteProduct(productId: number): Promise<void> {
    throw new NotImplementedException();
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    throw new NotImplementedException();
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    throw new NotImplementedException();
  }

  async getProductVariations(productId: number): Promise<any[]> {
    throw new NotImplementedException();
  }

  async updateProductStock(
    productId: number,
    quantity: number,
  ): Promise<Product> {
    throw new NotImplementedException();
  }

  async getFeaturedProducts(): Promise<Product[]> {
    throw new NotImplementedException();
  }

  async getRelatedProducts(productId: number): Promise<Product[]> {
    throw new NotImplementedException();
  }

  async generateSlug(name: string): Promise<string> {
    throw new NotImplementedException();
  }

  async getProductStatistics(): Promise<any> {
    throw new NotImplementedException();
  }

  async getProductReviews(productId: number): Promise<any[]> {
    throw new NotImplementedException();
  }
}
