import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { CURRENT_USER_KEY } from 'src/common/constants';
import { JwtPayload } from 'src/common/utils/types';

export const CurrentUser = createParamDecorator<JwtPayload>(
  (data: unknown, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();
    const user = request[CURRENT_USER_KEY] as JwtPayload;

    return user;
  },
);
