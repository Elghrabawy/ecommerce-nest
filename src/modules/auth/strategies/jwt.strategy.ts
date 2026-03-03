import {
  Injectable,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/interfaces';
import jwtConfig from 'src/config/jwt.config';

@Injectable()
export class JwtStrategy {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    if (!this.jwtConfiguration.secret) {
      this.logger.error('JWT_SECRET is not configured');
    }

    if (!this.jwtConfiguration.expiresIn) {
      this.logger.warn(
        'JWT_EXPIRES_IN is not configured, using default of 1 hour',
      );
    }
  }

  /**
   * Sign a token with the given payload using explicit secret
   */
  async signToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      expiresIn: this.jwtConfiguration.expiresIn,
    });
  }

  /**
   * Verify a token and return the payload
   */
  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Verify a token asynchronously with explicit secret
   */
  async verifyTokenAsync(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtConfiguration.secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authorization?: string): string | null {
    if (!authorization) return null;

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' && token ? token : null;
  }

  /**
   * Validate and extract user payload from token
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.verifyTokenAsync(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Token validation failed');
    }
  }

  /**
   * Create JWT payload from user data
   */
  createPayload(user: {
    id: number;
    name: string;
    email: string;
    role: string;
  }): JwtPayload {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
