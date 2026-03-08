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
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
} from './dto';
import { ResponseInterceptor } from '../../common/interceptors';
import AuthRoles from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/common';
import { CategoryMoveParentDto } from './dto/category-move-parent.dto';

@ApiTags('Categories')
@Controller('categories')
@UseInterceptors(ResponseInterceptor<CategoryResponseDto>)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async getCategories(
    @Query('includeTree') includeTree?: boolean,
  ): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getAllCategories(includeTree);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get categories as tree structure' })
  async getCategoryTree(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getCategoryTree();
  }

  @Get('top-level')
  @ApiOperation({ summary: 'Get top-level categories' })
  async getTopLevelCategories(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getTopLevelCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.getCategoryById(Number(id));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  async getCategoryBySlug(
    @Param('slug') slug: string,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.getCategoryBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiBody({ type: CreateCategoryDto })
  @AuthRoles(UserRole.ADMIN)
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @AuthRoles(UserRole.ADMIN)
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.updateCategory(
      Number(id),
      updateCategoryDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @AuthRoles(UserRole.ADMIN)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.deleteCategory(Number(id));
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child categories' })
  async getChildCategories(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getChildCategories(Number(id));
  }

  @Put(':id/move')
  @ApiOperation({ summary: 'Move category to different parent' })
  @AuthRoles(UserRole.ADMIN)
  async moveCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveParentDto: CategoryMoveParentDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.moveCategory(
      id,
      moveParentDto.newParentId,
    );
  }
}
