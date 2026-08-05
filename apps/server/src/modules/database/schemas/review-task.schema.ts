import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

// ============================================================
// ReviewTask Mongoose Schema
// 所有字段绑定 @ai-review/shared 的 TS 类型
// ============================================================

/** 审查结果子文档 */
@Schema({ _id: false })
export class ReviewResultSchema {
  @Prop({ required: true })
  summary!: string;

  @Prop({ required: true })
  score!: number;

  @Prop({ type: [{ type: Object }], default: [] })
  issues!: Record<string, unknown>[];

  @Prop({ required: true })
  modelUsed!: string;
}

export const ReviewResultSchemaClass = SchemaFactory.createForClass(ReviewResultSchema);

/** 对话消息子文档 */
@Schema({ _id: false })
export class ChatMessageSchema {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role!: 'user' | 'assistant';

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Number, default: null })
  relatedIssueIndex!: number | null;
}

export const ChatMessageSchemaClass = SchemaFactory.createForClass(ChatMessageSchema);

/** ReviewTask 文档类型 */
export type ReviewTaskDocument = HydratedDocument<ReviewTask>;

@Schema({
  collection: 'review_tasks',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_: unknown, ret: Record<string, unknown>) => {
      ret.id = (ret._id as { toString(): string })?.toString() ?? '';
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class ReviewTask {
  /** 代码名称（文件名） */
  @Prop({ required: true, trim: true })
  codeName!: string;

  /** 原始代码内容 */
  @Prop({ required: true })
  codeContent!: string;

  /** 审查结果（未审查时为 null） */
  @Prop({ type: ReviewResultSchemaClass, default: null })
  reviewResult: InstanceType<typeof ReviewResultSchema> | null = null;

  /** 任务状态: pending | running | success | fail */
  @Prop({
    required: true,
    enum: ['pending', 'running', 'success', 'fail'],
    default: 'pending',
  })
  status!: string;

  /** 任务完成时间 */
  @Prop({ type: Date, default: null })
  completedAt: Date | null = null;

  /** 对话历史（多轮追问） */
  @Prop({ type: [ChatMessageSchemaClass], default: [] })
  chatHistory: InstanceType<typeof ChatMessageSchema>[] = [];
}

export const ReviewTaskSchema = SchemaFactory.createForClass(ReviewTask);
export const ReviewTaskCollectionName = 'review_tasks';
