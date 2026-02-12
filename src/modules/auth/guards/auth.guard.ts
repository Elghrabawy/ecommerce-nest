import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/utils/types';
import { ConfigService } from '@nestjs/config';
import { CURRENT_USER_KEY } from 'src/common/utils/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    try {
      const [type, token] = request.headers.authorization?.split(' ') || [];
      if (!type || !token || type !== 'Bearer') {
        throw new UnauthorizedException('No token provided');
      }

      try {
        const payload: JwtPayload = await this.jwt.verifyAsync(token, {
          secret: this.config.get<string>('JWT_SECRET_KEY'),
        });

        request[CURRENT_USER_KEY] = payload;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return false;
    }
  }
}
