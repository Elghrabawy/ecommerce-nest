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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto';
import Auth from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import AuthAddress from './decorators/auth-address.decorator';
import AuthRoles from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { ResponseInterceptor } from '../../common/interceptors';
import { PaginationDto } from '../../common';

@ApiTags('Addresses')
@Controller('addresses')
@UseInterceptors(ResponseInterceptor<Address>)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for current user' })
  @Auth()
  async getAllAddresses(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ): Promise<Address[]> {
    return await this.addressService.findByUser(user.id, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @AuthAddress()
  async getAddressById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Address> {
    return await this.addressService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create new address' })
  @Auth()
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() user: User,
  ): Promise<Address> {
    return await this.addressService.create(createAddressDto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  @AuthAddress()
  async updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    return await this.addressService.update(id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  @AuthAddress()
  async deleteAddress(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.addressService.remove(id);
    return { message: 'Address deleted successfully' };
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default address for current user' })
  @Auth()
  async getDefaultAddressForCurrentUser(
    @CurrentUser() user: User,
  ): Promise<Address> {
    return await this.addressService.findDefaultAddress(user.id);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set address as default' })
  @AuthAddress()
  async setDefaultAddress(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Address> {
    return await this.addressService.setAsDefault(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all addresses for specific user' })
  @AuthRoles(UserRole.ADMIN)
  async getUserAddresses(
    @Param('userId', ParseIntPipe) userId: number,
    pagination: PaginationDto,
  ): Promise<Address[]> {
    return await this.addressService.findByUser(userId, pagination);
  }

  @Get('default/:userId')
  @ApiOperation({ summary: 'Get default address for user' })
  @AuthRoles(UserRole.ADMIN)
  async getDefaultAddress(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Address | null> {
    return await this.addressService.findDefaultAddress(userId);
  }
}
