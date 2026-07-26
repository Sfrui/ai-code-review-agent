import type {
  NestInterceptor,
  ExecutionContext,
  CallHandler} from '@nestjs/common';
import {
  Injectable
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ============================================================
// 响应格式统一拦截器
// 确保所有成功响应都包裹在 { success: true, data: ... } 中
// ============================================================

export interface ResponseFormat<T> {
  success: true;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果 controller 已经返回 { success, data } 格式，直接透传
        if (
          data !== null &&
          typeof data === 'object' &&
          'success' in data &&
          'data' in data
        ) {
          return {
            ...data,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true as const,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
