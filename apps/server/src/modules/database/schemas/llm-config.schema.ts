import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

// ============================================================
// LLM 配置 Schema — 存储用户设置的 AI 模型参数
// ============================================================

export type LLMConfigDocument = HydratedDocument<LLMConfig>;

@Schema({
  collection: 'llm_configs',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_: unknown, ret: Record<string, unknown>) => {
      ret.id = (ret._id as { toString(): string })?.toString() ?? '';
      delete ret._id;
      delete ret.__v;
      // 脱敏：只显示 key 的前 8 位
      if (ret.apiKey && (ret.apiKey as string).length > 8) {
        ret.apiKey = (ret.apiKey as string).slice(0, 8) + '***';
      }
    },
  },
})
export class LLMConfig {
  /** 提供商 */
  @Prop({ required: true, default: 'deepseek' })
  provider!: string;

  /** 模型名称 */
  @Prop({ required: true, default: 'deepseek-chat' })
  model!: string;

  /** API Key */
  @Prop({ required: true, default: '' })
  apiKey!: string;

  /** 自定义 API 地址 */
  @Prop({ default: '' })
  baseURL!: string;

  /** 温度 */
  @Prop({ default: 0.1 })
  temperature!: number;

  /** 最大 token */
  @Prop({ default: 4096 })
  maxTokens!: number;

  /** 超时时间（毫秒） */
  @Prop({ default: 60000 })
  timeout!: number;
}

export const LLMConfigSchema = SchemaFactory.createForClass(LLMConfig);
export const LLMConfigCollectionName = 'llm_configs';
