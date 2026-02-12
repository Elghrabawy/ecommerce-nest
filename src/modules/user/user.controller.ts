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
import Auth from 'src/modules/auth/decorators/auth.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from 'src/common/utils/types';
import AuthRoles from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/utils/enums';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileUploadDto } from 'src/modules/storage/dto/file-upload.dto';

@Controller('users')
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

  @Post('avatar')
  @Auth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const filename = Date.now() + '-' + randomUUID() + file.originalname;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar upload',
    type: FileUploadDto,
  })
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.userService.updateAvatar(user.id, file);
  }
}
