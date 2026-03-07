import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenPayload } from '../../../common/interfaces';

import refreshJwtConfig from '../../../config/refresh-jwt.config';

@Injectable()
export class RefreshStrategy {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshJwtConfiguration: ConfigType<
      typeof refreshJwtConfig
    >,
  ) {}

  /**
   * Create refresh token payload
   */
  createRefreshPayload(user: {
    id: number;
    email: string;
  }): RefreshTokenPayload {
    return {
      id: user.id,
      email: user.email,
      type: 'refresh',
    };
  }

  /**
   * Sign refresh token with longer expiration
   */
  async signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.refreshJwtConfiguration.secret,
      expiresIn: this.refreshJwtConfiguration.expiresIn,
    });
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        token,
        {
          secret: this.refreshJwtConfiguration.secret,
        },
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Create refresh token for user
   */
  async createRefreshToken(user: {
    id: number;
    email: string;
  }): Promise<string> {
    const payload = this.createRefreshPayload(user);
    return await this.signRefreshToken(payload);
  }

  /**
   * Validate refresh token and return user payload
   */
  async validateRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return await this.verifyRefreshToken(token);
  }
}
