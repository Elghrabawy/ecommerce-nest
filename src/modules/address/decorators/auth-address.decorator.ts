import { applyDecorators, UseGuards } from '@nestjs/common';
import Auth from '../../auth/decorators/auth.decorator';
import { AddressOwnerGuard } from '../guards/address-owner.guard';

export default function AuthAddress() {
  return applyDecorators(Auth(), UseGuards(AddressOwnerGuard));
}
