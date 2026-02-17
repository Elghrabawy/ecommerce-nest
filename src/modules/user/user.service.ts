import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  HttpException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { StorageService } from '../storage/storage.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly storageService: StorageService,
  ) {}

  async create(createUserDto: RegisterUserDto): Promise<User> {
    try {
      // if user with email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        console.log('Email already in use:', createUserDto.email);
        throw new BadRequestException('Email already in use');
      }

      const user = this.userRepository.create(createUserDto);

      user.password_hash = createUserDto.password;

      // save in db
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      // If it's already an HTTP exception (like BadRequestException), rethrow it
      if (error instanceof HttpException) {
        throw error;
      }
      // Only catch unexpected errors
      throw new InternalServerErrorException();
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Invalid email or password');
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({});

      return users;
    } catch {
      throw new InternalServerErrorException('Could not fetch users');
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user: User | null = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      if (updateUserDto.email && user.email !== updateUserDto.email) {
        // check if email is already in use
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        });
        if (existingUser) {
          throw new BadRequestException('Email already in use');
        }

        user.email = updateUserDto.email!;
      }
      if (updateUserDto.name && user.name !== updateUserDto.name) {
        user.name = updateUserDto.name;
      }

      await this.userRepository.save(user);
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Could not update user with id ${id}`,
        error,
      );
    }
  }

  async setProfileImage(id: number, avatarUrl: string): Promise<User> {
    try {
      const user: User | null = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      user.avatar_url = avatarUrl;

      await this.userRepository.save(user);
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Could not set profile image for user with id ${id}`,
        error,
      );
    }
  }

  async removeProfileImage(id: number): Promise<User> {
    this.logger.log(`Trying to remove profile image for user with id ${id}`);
    try {
      const user: User | null = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      if (!user.avatar_url) {
        throw new BadRequestException(
          'User does not have a profile image to remove',
        );
      }

      const filename = user.avatar_url.split('/').pop();
      this.logger.log(`Attempting to delete file ${filename} from storage`);
      if (filename) {
        try {
          await this.storageService.deleteFile(filename);
        } catch (error) {
          console.log('Failed to delete file from storage:', error);
        }
      }

      user.avatar_url = null;

      await this.userRepository.save(user);
      this.logger.log(`Profile image removed for user with id ${id}`);

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Could not remove profile image for user with id ${id}`,
        error,
      );
    }
  }

  async updateAvatar(id: number, file: Express.Multer.File): Promise<User> {
    if (!file) {
      throw new BadRequestException('File not provided');
    }

    try {
      const uploadResult = await this.storageService.uploadFile(file);

      const user = await this.setProfileImage(id, uploadResult.path);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload avatar',
        error?.message || error,
      );
    }
  }

  remove(id: number) {
    console.log(`Received request to remove user with id ${id}`);
  }
}
