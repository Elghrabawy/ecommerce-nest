import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { multiDataResponse, singleDataResponse } from '../utils/types';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<multiDataResponse<T> | singleDataResponse<T>> {
    // handle: () => import('rxjs').Observable<userResponse | usersResponse>;

    return next.handle().pipe(
      map((data) => {
        if (data instanceof Array) {
          return {
            status: 'success',
            count: data.length,
            data: data as T[],
          };
        }
        return {
          status: 'success',
          data: data as T,
        };
      }),
    );
  }
}
