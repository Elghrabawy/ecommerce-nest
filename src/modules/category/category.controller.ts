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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@ApiTags('categories')
@Controller('categories')
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
  async getCategoryTree(): Promise<any> {
    return await this.categoryService.getCategoryTree();
  }

  @Get('top-level')
  @ApiOperation({ summary: 'Get top-level categories' })
  @ApiResponse({
    status: 200,
    description: 'Top-level categories retrieved successfully',
  })
  async getTopLevelCategories() {
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
  async getCategoryBySlug(@Param('slug') slug: string) {
    return await this.categoryService.getCategoryBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiBody({ type: CreateCategoryDto })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
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

  @Get(':id/products')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({
    status: 200,
    description: 'Category products retrieved successfully',
  })
  async getCategoryProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: any,
  ) {
    // TODO: Implement get products by category with filters
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child categories' })
  @ApiResponse({
    status: 200,
    description: 'Child categories retrieved successfully',
  })
  async getChildCategories(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.getChildCategories(Number(id));
  }

  @Put(':id/move')
  @ApiOperation({ summary: 'Move category to different parent' })
  @ApiResponse({ status: 200, description: 'Category moved successfully' })
  async moveCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body('new_parent_id', ParseIntPipe) newParentId: number,
  ) {
    return await this.categoryService.moveCategory(id, newParentId);
  }
}
