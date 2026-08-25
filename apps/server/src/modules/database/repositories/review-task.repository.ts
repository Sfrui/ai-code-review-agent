import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { ReviewTaskDocument } from '../schemas/review-task.schema';
import { ReviewTaskCollectionName } from '../schemas/review-task.schema';
import type { ChatMessage } from '@ai-review/shared';

// ============================================================
// ReviewTask Repository — 数据库操作封装
// ============================================================

/** 分页查询参数 */
export interface FindTasksQuery {
  page: number;
  pageSize: number;
}

/** 分页结果 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ReviewTaskRepository {
  constructor(
    @InjectModel(ReviewTaskCollectionName)
    private readonly model: Model<ReviewTaskDocument>,
  ) {}

  /** 创建审查任务 */
  async create(data: { codeName: string; codeContent: string }): Promise<ReviewTaskDocument> {
    const doc = new this.model({
      codeName: data.codeName,
      codeContent: data.codeContent,
      status: 'pending',
    });
    return doc.save();
  }

  /** 根据 ID 查询任务 */
  async findById(id: string): Promise<ReviewTaskDocument | null> {
    return this.model.findById(id).exec();
  }

  /** 分页查询任务列表（按创建时间倒序） */
  async findPaginated(query: FindTasksQuery): Promise<PaginatedResult<ReviewTaskDocument>> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.model.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize).exec(),
      this.model.countDocuments().exec(),
    ]);

    return { items, total, page, pageSize };
  }

  /** 更新任务状态 */
  async updateStatus(
    id: string,
    status: 'pending' | 'running' | 'success' | 'fail',
  ): Promise<ReviewTaskDocument | null> {
    const update: Record<string, unknown> = { status };
    if (status === 'success' || status === 'fail') {
      update.completedAt = new Date();
    }
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  /** 更新审查结果 */
  async updateReviewResult(
    id: string,
    reviewResult: {
      summary: string;
      score: number;
      issues: Record<string, unknown>[];
      modelUsed: string;
    },
  ): Promise<ReviewTaskDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        {
          reviewResult,
          status: 'success',
          completedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  // ---- 对话历史操作 ----

  /** 追加一条对话消息 */
  async appendChatMessage(id: string, message: ChatMessage): Promise<ReviewTaskDocument | null> {
    return this.model
      .findByIdAndUpdate(id, { $push: { chatHistory: message } }, { new: true })
      .exec();
  }

  /** 获取对话历史 */
  async getChatHistory(id: string): Promise<ChatMessage[]> {
    const doc = await this.model.findById(id).exec();
    if (!doc) return [];
    return (doc.chatHistory ?? []).map((msg) => ({
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
      relatedIssueIndex: msg.relatedIssueIndex ?? undefined,
    }));
  }

  /** 清空对话历史 */
  async clearChatHistory(id: string): Promise<ReviewTaskDocument | null> {
    return this.model.findByIdAndUpdate(id, { $set: { chatHistory: [] } }, { new: true }).exec();
  }

  /** 删除任务 */
  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
