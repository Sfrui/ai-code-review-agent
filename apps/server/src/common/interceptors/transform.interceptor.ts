import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ============================================================
// 响应格式统一拦截器
// 确保所有成功响应都包裹在 { success: true, data: ... } 中
// 注意：SSE 流式响应需要跳过，避免破坏流格式
// ============================================================

export interface ResponseFormat<T> {
  success: true;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    // 跳过 SSE 流式请求（Accept: text/event-stream）
    const http = context.switchToHttp();
    const request = http.getRequest();
    const accept = request.headers?.['accept'] ?? '';
    if (accept.includes('text/event-stream')) {
      return next.handle() as unknown as Observable<ResponseFormat<T>>;
    }

    return next.handle().pipe(
      map((data) => {
        // 如果 controller 已经返回 { success, data } 格式，直接透传
        if (data !== null && typeof data === 'object' && 'success' in data && 'data' in data) {
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
