import { ApiProperty } from '@nestjs/swagger';

export class WishlistCountDto {
  @ApiProperty({ example: 5 })
  count: number;
}
