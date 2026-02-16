import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { join } from 'path';
import { unlinkSync } from 'fs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

      // hashing the password
      const sault = await bcrypt.genSalt();
      user.password_hash = await bcrypt.hash(createUserDto.password, sault);

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

  async setProfileImage(id: number, filename: string): Promise<User> {
    try {
      const user: User | null = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      await this.removeProfileImage(id).catch((error) => {
        console.log(
          'Failed to remove old profile image for user with id',
          id,
          error,
        );
      });
      user.avatar_url = filename;

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

      const imagePath = join(process.cwd(), 'uploads/images', user.avatar_url);

      unlinkSync(imagePath);

      user.avatar_url = undefined;

      await this.userRepository.save(user);
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

    const user = await this.setProfileImage(id, file.filename);
    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
