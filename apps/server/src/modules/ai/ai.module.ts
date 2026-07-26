import { Module } from '@nestjs/common';
import { CodeReviewAgentService } from './ai.service';
import { LLMFactory } from './llm/llm.factory';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [LLMFactory, CodeReviewAgentService],
  exports: [CodeReviewAgentService],
})
export class AiModule {}
