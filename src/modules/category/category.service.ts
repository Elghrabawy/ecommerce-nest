/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
} from './dto';
import type { ProductFilterDto } from '../product/dto/product-filter.dto';
import { slugify } from 'src/common';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  /**
   * Helper method to convert Category entity to CategoryResponseDto
   * @param category - Category entity to convert
   * @return CategoryResponseDto
   */
  private mapToResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      children: category.children?.map((child) => this.mapToResponseDto(child)),
    };
  }

  /**
   * Get all categories, optionally including their children in a tree structure
   * @param includeTree - Whether to include child categories in the response
   * @returns Array of categories, optionally with their children
   */
  async getAllCategories(
    includeTree?: boolean,
  ): Promise<CategoryResponseDto[]> {
    if (includeTree) {
      const categories = await this.categoryRepo.find({
        relations: ['children'],
      });
      return categories.map((c) => this.mapToResponseDto(c));
    } else {
      const categories = await this.categoryRepo.find();
      return categories.map((c) => this.mapToResponseDto(c));
    }
  }

  /**
   * Get categories in a tree structure
   * @returns Array of categories with their children in a tree structure
   */
  async getCategoryTree(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepo.find({
      relations: ['children'],
    });
    return categories.map((c) => this.mapToResponseDto(c));
  }

  /**
   * Get category by ID
   * @param categoryId - ID of the category to retrieve
   * @returns CategoryResponseDto for the specified category ID
   * @throws NotFoundException if category with the specified ID does not exist
   */
  async getCategoryById(categoryId: number): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.mapToResponseDto(category);
  }

  /**
   * Get category by slug
   * @param slug - Slug of the category to retrieve
   * @returns CategoryResponseDto for the specified category slug
   * @throws NotFoundException if category with the specified slug does not exist
   */
  async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findOne({
      where: { slug },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.mapToResponseDto(category);
  }

  /**
   * Create a new category with the provided data
   * @param categoryData - Data for the new category to create
   * @returns CategoryResponseDto for the newly created category
   * @throws BadRequestException if a category with the same slug already exists
   */
  async createCategory(
    categoryData: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    categoryData.slug = slugify(categoryData.slug);

    const existingCategory = await this.categoryRepo.findOneBy({
      slug: categoryData.slug,
    });

    if (existingCategory) {
      throw new BadRequestException(
        'Category with the same slug already exists',
      );
    }

    const category = this.categoryRepo.create(categoryData);
    const saved = await this.categoryRepo.save(category);
    return this.mapToResponseDto(saved);
  }

  /**
   * Update an existing category with the provided data
   * @param categoryId - ID of the category to update
   * @param categoryData - Data to update the category with
   * @returns CategoryResponseDto for the updated category
   * @throws NotFoundException if category with the specified ID does not exist
   * @throws BadRequestException if another category with the same slug already exists
   */
  async updateCategory(
    categoryId: number,
    categoryData: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    if (categoryData.slug) {
      categoryData.slug = slugify(categoryData.slug);

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
    const saved = await this.categoryRepo.save(updatedCategory);
    return this.mapToResponseDto(saved);
  }

  /**
   * Delete a category by its ID
   * @param categoryId - ID of the category to delete
   * @returns Object containing a success message confirming the deletion of the category
   * @throws NotFoundException if category with the specified ID does not exist
   */
  async deleteCategory(categoryId: number) {
    const category = await this.categoryRepo.findOneBy({ id: categoryId });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepo.remove(category);
    return { message: 'Category deleted successfully' };
  }

  /**
   * Get child categories for a given category ID
   * @param categoryId - ID of the category to retrieve child categories for
   * @returns Array of CategoryResponseDto representing the child categories of the specified category
   * @throws NotFoundException if category with the specified ID does not exist
   */
  async getChildCategories(categoryId: number): Promise<CategoryResponseDto[]> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category.children.map((c) => this.mapToResponseDto(c));
  }

  /**
   * Move a category to a new parent category
   * @param categoryId - ID of the category to move
   * @param newParentId - ID of the new parent category to move the category under (optional, if not provided, category will be moved to root level)
   * @returns CategoryResponseDto for the moved category with its new parent-child relationships
   * @throws NotFoundException if category with the specified ID does not exist or if the new parent category does not exist
   * @throws BadRequestException if moving category to root level is attempted (not supported yet)
   */
  async moveCategory(
    categoryId: number,
    newParentId?: number,
  ): Promise<CategoryResponseDto> {
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

      const saved = await this.categoryRepo.save(category);
      return this.mapToResponseDto(saved);
    } else {
      throw new BadRequestException(
        'Moving category to root is not supported yet',
      );
    }
  }

  /**
   * Get top-level categories (categories without a parent)
   * @returns Array of CategoryResponseDto representing the top-level categories
   */
  async getTopLevelCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepo.find({
      where: { parent: false },
    });
    return categories.map((c) => this.mapToResponseDto(c));
  }
}
