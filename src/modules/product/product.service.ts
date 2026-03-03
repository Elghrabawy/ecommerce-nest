import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { SelectQueryBuilder } from 'typeorm/browser';
import { PaginationDto } from 'src/common/dto';
import { generateSlug } from './../../common/utils';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  applyFilters(query: SelectQueryBuilder<Product>, filters?: ProductFilterDto) {
    if (!filters) {
      return query;
    }

    if (filters.name) {
      query = query.andWhere('product.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.categoryId) {
      query = query.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.minPrice) {
      query = query.andWhere('product.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice) {
      query = query.andWhere('product.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters.inStock !== undefined) {
      query = query.andWhere('product.stock > 0');
    }

    if (filters.sortedBy) {
      const order = filters.sorted === 'desc' ? 'DESC' : 'ASC';
      query = query.orderBy(`product.${filters.sortedBy}`, order);
    }

    return query;
  }

  applyPagination(
    query: SelectQueryBuilder<Product>,
    page?: number,
    limit?: number,
  ): SelectQueryBuilder<Product> {
    const pageNumber = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 20;

    const paginatedQuery = query
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize);

    return paginatedQuery;
  }

  async getAllProducts(
    pagination?: PaginationDto,
    filters?: ProductFilterDto,
  ): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');

    const filteredQuery = this.applyFilters(query, filters);

    const paginatedQuery = this.applyPagination(
      filteredQuery,
      pagination?.page,
      pagination?.limit,
    );

    const finalQuery = paginatedQuery
      .innerJoin('product.category', 'category', 'category.isActive = true')
      .addSelect(['category.id', 'category.name']);

    return await finalQuery.getMany();
  }

  async getProductById(productId: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['category'],
      select: {
        category: {
          id: true,
          name: true,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    const slug = generateSlug(productData.slug);
    const existingProduct = await this.productRepository.findOne({
      where: { slug },
    });
    console.log(
      'Checking for existing product with slug:',
      slug,
      existingProduct,
    );

    if (existingProduct) {
      throw new BadRequestException(
        'Product with the same name already exists',
      );
    }

    const product = this.productRepository.create(productData);
    const savedProduct = await this.productRepository.save(product);

    const returnedProduct = this.getProductById(savedProduct.id);

    return returnedProduct;
  }

  async updateProduct(
    productId: number,
    productData: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, productData);

    return await this.productRepository.save(product);
  }

  async deleteProduct(productId: number): Promise<void> {
    const product = await this.getProductById(productId);
    await this.productRepository.remove(product);
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    throw new NotImplementedException();
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { category: { id: categoryId } },
    });
    return products;
  }

  async updateProductStock(
    productId: number,
    quantity: number,
  ): Promise<Product> {
    const product = await this.getProductById(productId);
    product.stock = quantity;
    return await this.productRepository.save(product);
  }

  async decreaseProductStock(
    manager: EntityManager,
    productId: number,
    quantity: number,
  ) {
    const result = await manager
      .createQueryBuilder(Product, 'product')
      .update(Product)
      .set({ stock: () => `stock - ${quantity}` })
      .where('id = :id', { id: productId })
      .andWhere('stock >= :quantity', { quantity })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(
        `Product #${productId} not found or insufficient stock`,
      );
    }
  }

  async increaseProductStock(
    manager: EntityManager,
    productId: number,
    quantity: number,
  ) {
    const result = await manager
      .createQueryBuilder(Product, 'product')
      .update(Product)
      .set({ stock: () => `stock + ${quantity}` })
      .where('id = :id', { id: productId })
      .execute();
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { stock: 1 },
      order: { created_at: 'DESC' },
      take: 10,
    });
    return products;
  }

  async getRelatedProducts(productId: number): Promise<Product[]> {
    const product = await this.getProductById(productId);

    if (!product.category) {
      return [];
    }

    console.log(
      'Finding related products for category:',
      product.category.name,
    );

    const relatedProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.categoryId = :categoryId', {
        categoryId: product.category.id,
      })
      .andWhere('product.id != :productId', {
        productId: product.id,
      })
      .take(10)
      .getMany();

    return relatedProducts;
  }

  async getProductReviews(productId: number): Promise<any[]> {
    throw new NotImplementedException();
  }
}
