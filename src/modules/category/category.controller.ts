/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';

@ApiTags('categories')
@Controller('categories')
@UseInterceptors(ResponseInterceptor<Category>)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async getCategories(
    @Query('includeTree') includeTree?: boolean,
  ): Promise<Category[]> {
    return await this.categoryService.getAllCategories(includeTree);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get categories as tree structure' })
  @ApiResponse({
    status: 200,
    description: 'Category tree retrieved successfully',
  })
  async getCategoryTree(): Promise<Category[]> {
    return await this.categoryService.getCategoryTree();
  }

  @Get('top-level')
  @ApiOperation({ summary: 'Get top-level categories' })
  @ApiResponse({
    status: 200,
    description: 'Top-level categories retrieved successfully',
  })
  async getTopLevelCategories(): Promise<Category[]> {
    return await this.categoryService.getTopLevelCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Category> {
    return await this.categoryService.getCategoryById(Number(id));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  async getCategoryBySlug(@Param('slug') slug: string): Promise<Category> {
    return await this.categoryService.getCategoryBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiBody({ type: CreateCategoryDto })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.updateCategory(
      Number(id),
      updateCategoryDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.deleteCategory(Number(id));
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child categories' })
  @ApiResponse({
    status: 200,
    description: 'Child categories retrieved successfully',
  })
  async getChildCategories(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Category[]> {
    return await this.categoryService.getChildCategories(Number(id));
  }

  @Put(':id/move')
  @ApiOperation({ summary: 'Move category to different parent' })
  @ApiResponse({ status: 200, description: 'Category moved successfully' })
  async moveCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body('new_parent_id', ParseIntPipe) newParentId: number,
  ): Promise<Category> {
    return await this.categoryService.moveCategory(id, newParentId);
  }
}
