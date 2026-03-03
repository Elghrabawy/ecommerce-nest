import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto';
import Auth from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import AuthAddress from './decorators/auth-address.decorator';
import AuthRoles from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';

@ApiTags('addresses')
@Controller('addresses')
@UseInterceptors(ResponseInterceptor<Address>)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for current user' })
  @ApiResponse({
    status: 200,
    description: 'Addresses retrieved successfully',
  })
  @Auth()
  async getAllAddresses(@CurrentUser() user: User): Promise<Address[]> {
    return await this.addressService.findByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({ status: 200, description: 'Address retrieved successfully' })
  @AuthAddress()
  async getAddressById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Address> {
    return await this.addressService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  @Auth()
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() user: User,
  ): Promise<Address> {
    return await this.addressService.create(createAddressDto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @AuthAddress()
  async updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    return await this.addressService.update(Number(id), updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @AuthAddress()
  async deleteAddress(@Param('id') id: string): Promise<{ message: string }> {
    await this.addressService.remove(Number(id));
    return { message: 'Address deleted successfully' };
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default address for current user' })
  @ApiResponse({
    status: 200,
    description: 'Default address retrieved successfully',
  })
  @Auth()
  async getDefaultAddressForCurrentUser(
    @CurrentUser() user: User,
  ): Promise<Address> {
    return await this.addressService.findDefaultAddress(user.id);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiResponse({
    status: 200,
    description: 'Default address updated successfully',
  })
  @AuthAddress()
  async setDefaultAddress(@Param('id') id: string): Promise<Address> {
    return await this.addressService.setAsDefault(Number(id));
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all addresses for specific user' })
  @ApiResponse({
    status: 200,
    description: 'User addresses retrieved successfully',
  })
  @AuthRoles(UserRole.ADMIN)
  async getUserAddresses(@Param('userId') userId: string): Promise<Address[]> {
    return await this.addressService.findByUser(Number(userId));
  }

  @Get('default/:userId')
  @ApiOperation({ summary: 'Get default address for user' })
  @ApiResponse({
    status: 200,
    description: 'Default address retrieved successfully',
  })
  @AuthRoles(UserRole.ADMIN)
  async getDefaultAddress(
    @Param('userId') userId: string,
  ): Promise<Address | null> {
    return await this.addressService.findDefaultAddress(Number(userId));
  }
}
