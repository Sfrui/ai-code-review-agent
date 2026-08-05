import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Observable, defer, from } from 'rxjs';
import { ChatAgent } from './chat.agent';
import { ReviewTaskRepository } from '../database/repositories/review-task.repository';
import type { ChatMessage } from '@ai-review/shared';

// ============================================================
// ChatService — 多轮对话业务逻辑
// 职责：调用 ChatAgent → 持久化对话 → SSE 流式输出
// ============================================================

/** SSE 事件格式 */
interface ChatSseEvent {
  /** 事件类型 */
  type: 'delta' | 'done' | 'error';
  /** 事件数据 */
  data: string;
  /** 消息 ID（可选） */
  id?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatAgent: ChatAgent,
    private readonly reviewTaskRepo: ReviewTaskRepository,
  ) {}

  /**
   * 发送消息（同步版本，返回完整回答）
   */
  async sendMessage(
    taskId: string,
    message: string,
    relatedIssueIndex?: number,
  ): Promise<ChatMessage> {
    // 校验输入
    if (!message || !message.trim()) {
      throw new BadRequestException('消息不能为空');
    }

    // 持久化用户消息
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
      relatedIssueIndex,
    };
    await this.reviewTaskRepo.appendChatMessage(taskId, userMessage);

    try {
      // 调用 ChatAgent
      const replyContent = await this.chatAgent.chat(taskId, message, relatedIssueIndex);

      // 持久化 AI 回复
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: replyContent,
        createdAt: new Date().toISOString(),
      };
      await this.reviewTaskRepo.appendChatMessage(taskId, assistantMessage);

      return assistantMessage;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[ChatService] Failed to send message: ${errMsg}`);

      // 持久化错误消息
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `抱歉，处理您的消息时出错：${errMsg}`,
        createdAt: new Date().toISOString(),
      };
      await this.reviewTaskRepo.appendChatMessage(taskId, errorMessage);
      throw error;
    }
  }

  /**
   * 发送消息（流式版本，SSE）
   * 返回 Observable，每个事件包含 delta/done/error
   */
  sendMessageStream(
    taskId: string,
    message: string,
    relatedIssueIndex?: number,
  ): Observable<ChatSseEvent> {
    return defer(() => from(this.createStream(taskId, message, relatedIssueIndex)));
  }

  private async *createStream(
    taskId: string,
    message: string,
    relatedIssueIndex?: number,
  ): AsyncGenerator<ChatSseEvent> {
    if (!message || !message.trim()) {
      yield { type: 'error', data: '消息不能为空' };
      return;
    }

    // 持久化用户消息
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
      relatedIssueIndex,
    };
    await this.reviewTaskRepo.appendChatMessage(taskId, userMessage);

    // 流式调用
    let fullContent = '';
    try {
      const stream = this.chatAgent.chatStream(taskId, message, relatedIssueIndex);

      for await (const chunk of stream) {
        fullContent += chunk;
        yield { type: 'delta', data: chunk };
      }

      // 持久化完整 AI 回复
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: fullContent,
        createdAt: new Date().toISOString(),
      };
      await this.reviewTaskRepo.appendChatMessage(taskId, assistantMessage);

      yield { type: 'done', data: '' };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[ChatService] Stream error: ${errMsg}`);

      // 持久化错误消息
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `抱歉，处理您的消息时出错：${errMsg}`,
        createdAt: new Date().toISOString(),
      };
      await this.reviewTaskRepo.appendChatMessage(taskId, errorMessage);

      yield { type: 'error', data: errMsg };
    }
  }

  /**
   * 获取对话历史
   */
  async getHistory(taskId: string): Promise<ChatMessage[]> {
    const history = await this.reviewTaskRepo.getChatHistory(taskId);
    return history;
  }

  /**
   * 清空对话历史
   */
  async clearHistory(taskId: string): Promise<{ success: boolean }> {
    const doc = await this.reviewTaskRepo.findById(taskId);
    if (!doc) {
      throw new NotFoundException(`任务不存在: ${taskId}`);
    }

    await this.reviewTaskRepo.clearChatHistory(taskId);
    this.logger.log(`[ChatService] Cleared chat history for task ${taskId}`);
    return { success: true };
  }
}
