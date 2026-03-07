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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import Auth from '../auth/decorators/auth.decorator';
import AuthRoles from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @AuthRoles(UserRole.ADMIN)
  async getOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  @Get('/user')
  @ApiOperation({ summary: 'Get orders by user ID' })
  @Auth()
  async getOrdersByUserId(@CurrentUser() user: User): Promise<Order[]> {
    return this.orderService.getOrdersByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @AuthRoles(UserRole.ADMIN)
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.getOrderById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  @Auth()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return await this.orderService.createOrder(user.id, createOrderDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @AuthRoles(UserRole.ADMIN)
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, updateStatusDto.status);
  }

  @Delete(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  @Auth()
  async cancelOrder(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.cancelOrder(id, user.id);
  }
}
