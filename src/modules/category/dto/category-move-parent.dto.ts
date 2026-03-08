import { ApiProperty } from '@nestjs/swagger';

export class CategoryMoveParentDto {
  @ApiProperty({ example: 1 })
  newParentId: number;
}
