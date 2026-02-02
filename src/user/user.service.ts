import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: RegisterUserDto): Promise<User> {
    try {
      // if user with email already exists
      if (await this.findUserByEmail(createUserDto.email)) {
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
        const existingUser = await this.findUserByEmail(updateUserDto.email);
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
