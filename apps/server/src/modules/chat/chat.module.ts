import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatAgent } from './chat.agent';
import { AiModule } from '../ai/ai.module';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';

// ============================================================
// ChatModule — 多轮对话模块
// ============================================================

@Module({
  imports: [AiModule, ConfigModule, DatabaseModule],
  controllers: [ChatController],
  providers: [ChatService, ChatAgent],
  exports: [ChatService],
})
export class ChatModule {}
