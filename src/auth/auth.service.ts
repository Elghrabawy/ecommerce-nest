import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from 'src/utils/types/types';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwt: JwtService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    try {
      const user: User = await this.userService.create(registerUserDto);

      const payload: JwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const token = await this.jwt.signAsync(payload);

      return {
        status: 'success',
        data: payload,
        token,
      };
    } catch (error) {
      // If it's already an HTTP exception (like BadRequestException), rethrow it
      if (error instanceof HttpException) {
        throw error;
      }
      // Only catch unexpected errors
      throw new InternalServerErrorException();
    }
  }

  async loginUser(loginDto: LoginDto) {
    try {
      const user: User = await this.userService.validateUser(
        loginDto.email,
        loginDto.password,
      );

      const payload: JwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const token = await this.jwt.signAsync(payload);

      return {
        status: 'success',
        data: payload,
        token,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }

  verifyToken(token: string) {
    try {
      const payload = this.jwt.verify<JwtPayload>(token);
      return {
        status: 'success',
        data: payload,
      };
    } catch {
      throw new HttpException('Invalid token', 401);
    }
  }
}
