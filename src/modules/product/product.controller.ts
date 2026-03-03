import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  NotImplementedException,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { PaginationDto } from 'src/common/dto';
import { ResponseInterceptor } from 'src/common/interceptors';
@ApiTags('products')
@Controller('products')
@UseInterceptors(ResponseInterceptor<Product>)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  async getProducts(
    @Query() pagination?: PaginationDto,
    @Query() filters?: ProductFilterDto,
  ): Promise<Product[]> {
    console.log('Received pagination:', pagination);
    console.log('Received filters:', filters);

    return (await this.productService.getAllProducts(
      pagination,
      filters,
    )) as Product[];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async getProductById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Product> {
    return await this.productService.getProductById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new product' })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return await this.productService.createProduct(createProductDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    await this.productService.deleteProduct(id);
  }

  @Get('search/:term')
  @ApiOperation({ summary: 'Search products' })
  async searchProducts(@Param('term') searchTerm: string): Promise<Product[]> {
    throw new NotImplementedException();
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  async getRelatedProducts(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Product[]> {
    return await this.productService.getRelatedProducts(id);
  }

  @Put(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'number', example: 100 },
      },
    },
  })
  async updateProductStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
  ): Promise<Product> {
    return await this.productService.updateProductStock(Number(id), quantity);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  async getProductsByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<Product[]> {
    const products =
      await this.productService.getProductsByCategory(categoryId);

    return products;
  }
}
