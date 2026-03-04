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
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { ResponseInterceptor } from 'src/common/interceptors';

@ApiTags('categories')
@Controller('categories')
@UseInterceptors(ResponseInterceptor<Category>)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async getCategories(
    @Query('includeTree') includeTree?: boolean,
  ): Promise<Category[]> {
    return await this.categoryService.getAllCategories(includeTree);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get categories as tree structure' })
  async getCategoryTree(): Promise<Category[]> {
    return await this.categoryService.getCategoryTree();
  }

  @Get('top-level')
  @ApiOperation({ summary: 'Get top-level categories' })
  async getTopLevelCategories(): Promise<Category[]> {
    return await this.categoryService.getTopLevelCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Category> {
    return await this.categoryService.getCategoryById(Number(id));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  async getCategoryBySlug(@Param('slug') slug: string): Promise<Category> {
    return await this.categoryService.getCategoryBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiBody({ type: CreateCategoryDto })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
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
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.deleteCategory(Number(id));
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child categories' })
  async getChildCategories(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Category[]> {
    return await this.categoryService.getChildCategories(Number(id));
  }

  @Put(':id/move')
  @ApiOperation({ summary: 'Move category to different parent' })
  async moveCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body('new_parent_id', ParseIntPipe) newParentId: number,
  ): Promise<Category> {
    return await this.categoryService.moveCategory(id, newParentId);
  }
}
