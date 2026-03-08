import { ApiProperty } from '@nestjs/swagger';

export class WishlistCheckDto {
  @ApiProperty({ example: true })
  isInWishlist: boolean;
}
