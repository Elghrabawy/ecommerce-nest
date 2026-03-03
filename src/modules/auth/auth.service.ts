import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from 'src/modules/user/dtos/register-user.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';
import { JwtResponse, TokenResponse } from 'src/common/interfaces';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../mail/events/mail.events';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtStrategy: JwtStrategy,
    private readonly refreshStrategy: RefreshStrategy,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<JwtResponse> {
    try {
      const user: User = await this.userService.create(registerUserDto);

      // Emit user.created event after successful registration
      this.eventEmitter.emit(
        'user.created',
        new UserCreatedEvent(user.email, user.name),
      );

      // Generate tokens using separate strategies
      const payload = this.jwtStrategy.createPayload(user);
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtStrategy.signToken(payload),
        this.refreshStrategy.createRefreshToken({
          id: user.id,
          email: user.email,
        }),
      ]);

      this.logger.log(`User registered successfully: ${user.email}`);

      return {
        status: 'success',
        data: payload,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(
        `Registration failed for ${registerUserDto.email}: ${error.message}`,
        error.stack,
      );
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
      const user: User = await this.userService.validateUser(
        loginDto.email,
        loginDto.password,
      );

      // Generate tokens using separate strategies
      const payload = this.jwtStrategy.createPayload(user);
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtStrategy.signToken(payload),
        this.refreshStrategy.createRefreshToken({
          id: user.id,
          email: user.email,
        }),
      ]);

      this.logger.log(`User logged in successfully: ${loginDto.email}`);

      return {
        status: 'success',
        data: payload,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.warn(`Login failed for ${loginDto.email}: ${error.message}`);
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
      this.logger.warn('Token verification failed');
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

      this.logger.log(`Token refreshed for user: ${user.email}`);

      return {
        status: 'success',
        accessToken,
        refreshToken,
        expiresIn: '1h', // or get from config
      };
    } catch (error) {
      this.logger.warn('Token refresh failed');
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
