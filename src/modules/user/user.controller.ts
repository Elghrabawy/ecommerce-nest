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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ResponseInterceptor<User>)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @AuthRoles(UserRole.ADMIN)
  fetchAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  fetchOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user' })
  @AuthRoles()
  update(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user profile' })
  @Auth()
  async fetchProfile(@CurrentUser() user: User): Promise<User> {
    return await this.userService.findById(user.id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @AuthRoles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Post('avatar')
  @Auth()
  @ImageUpload()
  @ApiOperation({ summary: 'Upload user avatar' })
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.userService.updateAvatar(user.id, file);
  }

  @Delete('avatar')
  @Auth()
  @ApiOperation({ summary: 'Remove user avatar' })
  removeAvatar(@CurrentUser() user: User) {
    return this.userService.removeProfileImage(user.id);
  }
}
