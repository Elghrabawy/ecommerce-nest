import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../../../common/interfaces';
import { CURRENT_USER_KEY } from '../../../common/constants';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtStrategy: JwtStrategy) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    try {
      const token = this.jwtStrategy.extractTokenFromHeader(
        request.headers.authorization,
      );

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      try {
        const payload: JwtPayload = await this.jwtStrategy.validateToken(token);
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
