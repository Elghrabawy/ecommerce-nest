import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from 'src/modules/user/dtos/register-user.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';
import { JwtResponse, TokenResponse } from 'src/common/utils/types';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../mail/events/mail.events';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtStrategy: JwtStrategy,
    private readonly refreshStrategy: RefreshStrategy,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<JwtResponse> {
    try {
      console.log('Starting user registration...');
      const user: User = await this.userService.create(registerUserDto);
      console.log('User created successfully:', user.id);

      // Emit user.created event after successful registration
      const x = this.eventEmitter.emit(
        'user.created',
        new UserCreatedEvent(user.email, user.name),
      );
      console.log('User created event emitted:', x);

      // Generate tokens using separate strategies
      const payload = this.jwtStrategy.createPayload(user);
      console.log('JWT payload created');

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtStrategy.signToken(payload),
        this.refreshStrategy.createRefreshToken({
          id: user.id,
          email: user.email,
        }),
      ]);
      console.log('Tokens generated successfully');

      return {
        status: 'success',
        data: payload,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Registration error:', error);
      // If it's already an HTTP exception (like BadRequestException), rethrow it
      if (error instanceof HttpException) {
        throw error;
      }
      // Only catch unexpected errors
      throw new InternalServerErrorException(
        error.message || 'Registration failed',
      );
    }
  }

  async loginUser(loginDto: LoginDto): Promise<JwtResponse> {
    try {
      console.log('Starting user login for:', loginDto.email);
      const user: User = await this.userService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      console.log('User validated successfully:', user.id);

      // Generate tokens using separate strategies
      const payload = this.jwtStrategy.createPayload(user);
      console.log('JWT payload created for login');

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtStrategy.signToken(payload),
        this.refreshStrategy.createRefreshToken({
          id: user.id,
          email: user.email,
        }),
      ]);
      console.log('Login tokens generated successfully');

      return {
        status: 'success',
        data: payload,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(error.message || 'Login failed');
    }
  }

  verifyToken(token: string) {
    try {
      const payload = this.jwtStrategy.verifyToken(token);
      return {
        status: 'success',
        data: payload,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Invalid token', 401);
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      // Verify the refresh token using RefreshStrategy
      const refreshPayload = await this.refreshStrategy.verifyRefreshToken(
        refreshTokenDto.refreshToken,
      );

      // Get user details from the database
      const user = await this.userService.findById(refreshPayload.id);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new token pair using separate strategies
      const payload = this.jwtStrategy.createPayload(user);
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtStrategy.signToken(payload),
        this.refreshStrategy.createRefreshToken(user),
      ]);

      return {
        status: 'success',
        accessToken,
        refreshToken,
        expiresIn: '1h', // or get from config
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
