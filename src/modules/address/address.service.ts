import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Address[]> {
    return await this.addressRepository.find({ relations: ['user'] });
  }

  async findByUser(userId: number): Promise<Address[]> {
    return await this.addressRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async findOne(id: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async create(
    createAddressDto: CreateAddressDto,
    user: User,
  ): Promise<Address> {
    const address = this.addressRepository.create({
      ...createAddressDto,
      user,
    });

    return await this.addressRepository.save(address);
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const updatedAddress = this.addressRepository.merge(
      address,
      updateAddressDto,
    );

    return await this.addressRepository.save(updatedAddress);
  }

  async remove(id: number): Promise<void> {
    const address = await this.addressRepository.findOneBy({ id });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.addressRepository.softDelete(id);
  }

  async findDefaultAddress(userId: number): Promise<Address> {
    const defaultAddress = await this.addressRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        isDefault: true,
      },
    });

    if (!defaultAddress) {
      throw new NotFoundException('Default address not found for user');
    }
    return defaultAddress;
  }

  async setAsDefault(id: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const userDefaultAddresses = await this.userRepository.findOne({
      where: {
        id: address.user.id,
        addresses: {
          isDefault: true,
        },
      },
      relations: ['addresses'],
    });

    if (userDefaultAddresses) {
      for (const addr of userDefaultAddresses.addresses) {
        addr.isDefault = false;
        await this.addressRepository.save(addr);
      }
    }
    await this.addressRepository.save({
      ...address,
      isDefault: true,
    });

    return address;
  }

  // async getAddressStatistics(userId: number): Promise<any> {
  // }
}
