import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewTaskSchema, ReviewTaskCollectionName } from './schemas/review-task.schema';
import { LLMConfigSchema, LLMConfigCollectionName } from './schemas/llm-config.schema';
import { ReviewTaskRepository } from './repositories/review-task.repository';
import { LLMConfigRepository } from './repositories/llm-config.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewTaskCollectionName, schema: ReviewTaskSchema },
      { name: LLMConfigCollectionName, schema: LLMConfigSchema },
    ]),
  ],
  providers: [ReviewTaskRepository, LLMConfigRepository],
  exports: [ReviewTaskRepository, LLMConfigRepository],
})
export class DatabaseModule {}
