import { Module, forwardRef } from '@nestjs/common';
import { CodeReviewAgentService } from './ai.service';
import { LLMFactory } from './llm/llm.factory';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [forwardRef(() => ConfigModule)],
  providers: [LLMFactory, CodeReviewAgentService],
  exports: [LLMFactory, CodeReviewAgentService],
})
export class AiModule {}
