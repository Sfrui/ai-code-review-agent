import { Injectable, Logger } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { LLMFactory } from './llm/llm.factory';
import type { ConfigService } from '../config/config.service';
import { validateLLMOutput, type LLMReviewOutput } from './schemas/llm-output.schema';
import {
  CODE_REVIEW_SYSTEM_PROMPT,
  buildCodeReviewUserPrompt,
  buildRetryPrompt,
} from './prompts/code-review.prompt';

// ============================================================
// CodeReviewAgentService — AI 代码审查核心服务
// 职责：调用 LLM → 解析输出 → Zod 强校验 → 返回结构化结果
// ============================================================

/** 审查执行结果 */
export interface ReviewExecutionResult {
  success: boolean;
  data?: LLMReviewOutput;
  error?: string;
  retryCount: number;
  modelUsed: string;
}

@Injectable()
export class CodeReviewAgentService {
  private readonly logger = new Logger(CodeReviewAgentService.name);
  private static readonly MAX_RETRIES = 2;
  private static readonly RETRY_DELAY_MS = 1000;

  constructor(
    private readonly llmFactory: LLMFactory,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 执行代码审查
   * 优先使用数据库配置，兜底使用环境变量
   */
  async executeReview(params: {
    codeName: string;
    codeContent: string;
  }): Promise<ReviewExecutionResult> {
    // 1. 获取配置：优先数据库 → 兜底环境变量
    const config = await this.getLLMConfig();
    const model = await this.llmFactory.createModel(config);

    let lastError = '';
    let retryCount = 0;

    for (let attempt = 0; attempt <= CodeReviewAgentService.MAX_RETRIES; attempt++) {
      try {
        retryCount = attempt;
        this.logger.log(
          `[${config.provider}/${config.model}] Review attempt ${attempt + 1}/${CodeReviewAgentService.MAX_RETRIES + 1}: ${params.codeName}`,
        );

        const messages = this.buildMessages(params, lastError);
        const response = await model.invoke(messages);
        const rawOutput =
          typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content);

        this.logger.debug(`LLM raw output length: ${rawOutput.length}`);

        const jsonStr = this.extractJsonFromResponse(rawOutput);
        const parsed: unknown = JSON.parse(jsonStr);
        const validated = validateLLMOutput(parsed);

        this.logger.log(
          `✅ Review completed: score=${validated.score}, issues=${validated.issues.length}`,
        );

        return {
          success: true,
          data: validated,
          retryCount,
          modelUsed: `${config.provider}/${config.model}`,
        };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        lastError = errMsg;
        this.logger.warn(`❌ Review attempt ${attempt + 1} failed: ${errMsg}`);

        if (attempt < CodeReviewAgentService.MAX_RETRIES) {
          await this.delay(CodeReviewAgentService.RETRY_DELAY_MS * (attempt + 1));
        }
      }
    }

    this.logger.error(`💥 Review failed after ${retryCount + 1} attempts: ${lastError}`);
    return {
      success: false,
      error: `AI 审查失败（已重试 ${retryCount} 次）: ${lastError}`,
      retryCount,
      modelUsed: `${config.provider}/${config.model}`,
    };
  }

  // ---- 私有方法 ----

  /** 获取 LLM 配置：优先数据库 → 兜底环境变量 */
  private async getLLMConfig() {
    try {
      const dbConfig = await this.configService.getFullConfig();
      if (dbConfig && dbConfig.apiKey) {
        this.logger.log('Using LLM config from database');
        return LLMFactory.fromDBConfig(dbConfig);
      }
    } catch (error) {
      this.logger.warn(`Failed to load config from database: ${error}`);
    }

    this.logger.log('Using LLM config from environment variables');
    return LLMFactory.getEnvConfig();
  }

  /** 构建 LangChain 消息列表 */
  private buildMessages(params: { codeName: string; codeContent: string }, previousError?: string) {
    const messages = [new SystemMessage(CODE_REVIEW_SYSTEM_PROMPT)];

    if (previousError) {
      messages.push(
        new HumanMessage(
          buildRetryPrompt({
            codeName: params.codeName,
            codeContent: params.codeContent,
            previousOutput: '',
            errorMessage: previousError,
          }),
        ),
      );
    } else {
      messages.push(
        new HumanMessage(
          buildCodeReviewUserPrompt({
            codeName: params.codeName,
            codeContent: params.codeContent,
          }),
        ),
      );
    }

    return messages;
  }

  /** 从 LLM 响应中提取 JSON */
  private extractJsonFromResponse(response: string): string {
    const trimmed = response.trim();
    if (trimmed.startsWith('{')) return trimmed;

    const jsonBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (jsonBlockMatch?.[1]) return jsonBlockMatch[1].trim();

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return trimmed.slice(firstBrace, lastBrace + 1);
    }

    return trimmed;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
