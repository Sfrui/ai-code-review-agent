import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
    credentials: true,
  });

  // 全局 ValidationPipe — 自动校验 DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 全局异常过滤器 — 统一错误 JSON 格式
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应拦截器 — 统一成功响应格式
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);

  logger.log('='.repeat(50));
  logger.log(`🚀 AI Code Review Server 已启动`);
  logger.log(`📡 地址: http://localhost:${port}`);
  logger.log(`📋 API 前缀: /api/v1`);
  logger.log(`🌍 环境: ${process.env['NODE_ENV'] ?? 'development'}`);
  logger.log(`🤖 LLM 提供商: ${process.env['LLM_PROVIDER'] ?? 'openai'}`);
  logger.log(`📦 数据库: ${process.env['MONGODB_URI']?.split('@')[1] ?? 'localhost'}`);
  logger.log('='.repeat(50));
}

bootstrap();
