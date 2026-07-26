import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewModule } from './modules/review/review.module';
import { ConfigModule } from './modules/config/config.module';

@Module({
  imports: [
    // 环境变量配置
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB 连接
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/ai-code-review',
      }),
    }),

    // 业务模块
    ReviewModule,
    ConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
