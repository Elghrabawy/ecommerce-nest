import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import Auth from '../auth/decorators/auth.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces';
import AuthRoles from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { User } from './entities/user.entity';
import { ResponseInterceptor } from '../../common/interceptors';
import { ImageUpload } from '../../common';

@Controller('users')
@UseInterceptors(ResponseInterceptor<User>)
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

  @Delete()
  @AuthRoles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('avatar')
  @Auth()
  @ImageUpload()
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.userService.updateAvatar(user.id, file);
  }

  @Delete('avatar')
  @Auth()
  removeAvatar(@CurrentUser() user: User) {
    return this.userService.removeProfileImage(user.id);
  }
}
