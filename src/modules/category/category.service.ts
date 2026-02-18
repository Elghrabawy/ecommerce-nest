/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import type { ProductFilterDto } from '../product/dto/product-filter.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async getAllCategories(includeTree?: boolean): Promise<Category[]> {
    if (includeTree) {
      return await this.categoryRepo.find({ relations: ['children'] });
    } else {
      return await this.categoryRepo.find();
    }
  }

  async getCategoryTree(): Promise<Category[]> {
    return await this.categoryRepo.find({ relations: ['children'] });
  }

  async getCategoryById(categoryId: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { slug },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    categoryData.slug = this.generateSlug(categoryData.name);

    const existingCategory = await this.categoryRepo.findOneBy({
      slug: categoryData.slug,
    });

    if (existingCategory) {
      throw new BadRequestException(
        'Category with the same name already exists',
      );
    }

    const category = this.categoryRepo.create(categoryData);
    return await this.categoryRepo.save(category);
  }

  async updateCategory(
    categoryId: number,
    categoryData: UpdateCategoryDto,
  ): Promise<Category> {
    if (categoryData.slug) {
      categoryData.slug = this.generateSlug(categoryData.slug);

      const existingCategory = await this.categoryRepo.findOneBy({
        slug: categoryData.slug,
      });

      if (existingCategory && existingCategory.id !== categoryId) {
        throw new BadRequestException(
          'Another category with the same name already exists',
        );
      }
    }

    const category = await this.categoryRepo.findOneBy({ id: categoryId });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updatedCategory = this.categoryRepo.merge(category, categoryData);
    return await this.categoryRepo.save(updatedCategory);
  }

  async deleteCategory(categoryId: number) {
    const category = await this.categoryRepo.findOneBy({ id: categoryId });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepo.remove(category);
    return { message: 'Category deleted successfully' };
  }

  async getCategoryProducts(categoryId: number, filters?: ProductFilterDto) {
    // TODO: Implement get products by category with filters
  }

  async getChildCategories(categoryId: number): Promise<Category[]> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category.children;
  }

  async moveCategory(
    categoryId: number,
    newParentId?: number,
  ): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (newParentId) {
      const newParent = await this.categoryRepo.findOneBy({ id: newParentId });
      if (!newParent) {
        throw new NotFoundException('New parent category not found');
      }
      category.parent = newParent;

      return await this.categoryRepo.save(category);
    } else {
      throw new BadRequestException(
        'Moving category to root is not supported yet',
      );
    }
  }

  generateSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async getTopLevelCategories(): Promise<Category[]> {
    return await this.categoryRepo.find({
      where: { parent: false },
    });
  }
}
