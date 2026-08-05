import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { AIMessageChunk } from '@langchain/core/messages';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { LLMFactory } from '../ai/llm/llm.factory';
import { ConfigService } from '../config/config.service';
import { ReviewTaskRepository } from '../database/repositories/review-task.repository';
import { CHAT_SYSTEM_PROMPT, buildChatUserPrompt } from './chat.prompt';
import { compressChatHistory, type ChatContext } from './chat.types';

// ============================================================
// ChatAgent — 多轮对话核心
// 职责：加载任务 → 组装上下文 → 调用 LLM（支持流式）
// ============================================================

@Injectable()
export class ChatAgent {
  private readonly logger = new Logger(ChatAgent.name);

  constructor(
    private readonly llmFactory: LLMFactory,
    private readonly configService: ConfigService,
    private readonly reviewTaskRepo: ReviewTaskRepository,
  ) {}

  /**
   * 获取任务的对话上下文
   */
  async getContext(taskId: string): Promise<ChatContext> {
    const doc = await this.reviewTaskRepo.findById(taskId);
    if (!doc) {
      throw new NotFoundException(`任务不存在: ${taskId}`);
    }

    if (doc.status !== 'success' || !doc.reviewResult) {
      throw new NotFoundException(`任务尚未完成审查，无法进行对话`);
    }

    // 解析 issues
    const rawIssues = Array.isArray(doc.reviewResult['issues'])
      ? (doc.reviewResult['issues'] as Array<Record<string, unknown>>)
      : [];
    const issues = rawIssues.map((issue) => ({
      line: Number(issue['line'] ?? 0),
      severity: String(issue['severity'] ?? 'info'),
      category: String(issue['category'] ?? 'style'),
      message: String(issue['message'] ?? ''),
      suggestion: issue['suggestion'] ? String(issue['suggestion']) : undefined,
      fixedCode: issue['fixedCode'] ? String(issue['fixedCode']) : undefined,
    }));

    // 解析对话历史
    const rawHistory = (doc.chatHistory ?? []).map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
      relatedIssueIndex: msg.relatedIssueIndex ?? undefined,
    }));

    return {
      codeName: doc.codeName,
      codeContent: doc.codeContent,
      reviewSummary: String(doc.reviewResult['summary'] ?? ''),
      issues,
      chatHistory: compressChatHistory(rawHistory),
    };
  }

  /**
   * 同步调用（一次性返回完整回答）
   */
  async chat(taskId: string, userMessage: string, relatedIssueIndex?: number): Promise<string> {
    const context = await this.getContext(taskId);
    const config = await this.getLLMConfig();
    const model = await this.llmFactory.createModel(config);

    const messages = this.buildMessages(context, userMessage, relatedIssueIndex);

    this.logger.log(
      `[Chat] Processing message for task ${taskId} (${context.chatHistory.length} history messages)`,
    );

    const response = await model.invoke(messages);
    const content =
      typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    this.logger.log(`[Chat] Response length: ${content.length}`);
    return content;
  }

  /**
   * 流式调用（逐字返回）
   */
  async *chatStream(
    taskId: string,
    userMessage: string,
    relatedIssueIndex?: number,
  ): AsyncGenerator<string> {
    const context = await this.getContext(taskId);
    const config = await this.getLLMConfig();
    const model = await this.llmFactory.createModel(config);

    const messages = this.buildMessages(context, userMessage, relatedIssueIndex);

    this.logger.log(
      `[ChatStream] Processing message for task ${taskId} (${context.chatHistory.length} history messages)`,
    );

    const stream = await model.stream(messages);
    let chunkCount = 0;

    for await (const chunk of stream) {
      const text = this.extractChunkText(chunk);
      if (text) {
        chunkCount++;
        yield text;
      }
    }

    this.logger.log(`[ChatStream] Streamed ${chunkCount} chunks`);
  }

  // ---- 私有方法 ----

  /** 构建 LangChain 消息列表 */
  private buildMessages(context: ChatContext, userMessage: string, relatedIssueIndex?: number) {
    return [
      new SystemMessage(CHAT_SYSTEM_PROMPT),
      new HumanMessage(
        buildChatUserPrompt({
          codeName: context.codeName,
          codeContent: context.codeContent,
          reviewSummary: context.reviewSummary,
          issues: context.issues,
          chatHistory: context.chatHistory,
          currentQuestion: userMessage,
          relatedIssueIndex,
        }),
      ),
    ];
  }

  /** 从 LLM 响应块中提取文本 */
  private extractChunkText(chunk: AIMessageChunk | unknown): string {
    if (chunk && typeof chunk === 'object' && 'content' in chunk) {
      const content = (chunk as { content: unknown }).content;
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        return content
          .map((part) =>
            typeof part === 'string'
              ? part
              : part && typeof part === 'object' && 'text' in part
                ? ((part as { text: string }).text ?? '')
                : '',
          )
          .join('');
      }
    }
    return '';
  }

  /** 获取 LLM 配置：优先数据库 → 兜底环境变量 */
  private async getLLMConfig() {
    try {
      const dbConfig = await this.configService.getFullConfig();
      if (dbConfig && dbConfig.apiKey) {
        return LLMFactory.fromDBConfig(dbConfig);
      }
    } catch (error) {
      this.logger.warn(`Failed to load config from database: ${error}`);
    }
    return LLMFactory.getEnvConfig();
  }
}
