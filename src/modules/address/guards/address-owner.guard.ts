import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CURRENT_USER_KEY } from '../../../common/constants';
import { User } from '../../user/entities/user.entity';
import { AddressService } from '../address.service';

@Injectable()
export class AddressOwnerGuard implements CanActivate {
  constructor(private readonly addressService: AddressService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user = request[CURRENT_USER_KEY] as User;
    if (!user) {
      return false;
    }

    const addressId = Number(request.params.id);
    if (isNaN(addressId)) {
      return false;
    }

    const address = await this.addressService.findOne(addressId);

    if (address.user.id !== user.id) {
      return false;
    }

    return true;
  }
}
