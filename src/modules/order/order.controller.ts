import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import Auth from '../auth/decorators/auth.decorator';
import AuthRoles from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/common/utils/enums';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @AuthRoles(UserRole.ADMIN)
  async getOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  @Get('/user')
  @ApiOperation({ summary: 'Get orders by user ID' })
  @ApiResponse({
    status: 200,
    description: 'User orders retrieved successfully',
  })
  @Auth()
  async getOrdersByUserId(@CurrentUser() user: User): Promise<Order[]> {
    console.log('Current user:', user);
    return this.orderService.getOrdersByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @AuthRoles(UserRole.ADMIN)
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.getOrderById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @Auth()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return await this.orderService.createOrder(user.id, createOrderDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: any,
  ) {
    // TODO: Implement update order status
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  async cancelOrder(@Param('id') id: string) {
    // TODO: Implement cancel order
  }
}
