import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import Auth from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from 'src/utils/types/types';
import AuthRoles from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/utils/enums';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @AuthRoles(UserRole.ADMIN)
  fetchAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  fetchOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @Patch()
  @AuthRoles()
  update(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }

  @Get('profile/me')
  @Auth()
  async fetchProfile(@CurrentUser() user: User): Promise<User> {
    return await this.userService.findById(user.id);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
