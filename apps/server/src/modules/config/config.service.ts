import { Injectable, Logger } from '@nestjs/common';
import { LLMConfigRepository } from '../database/repositories/llm-config.repository';
import { LLMFactory, type LLMConfig } from '../ai/llm/llm.factory';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

// ============================================================
// ConfigService — LLM 配置业务逻辑
// ============================================================

export interface LLMSettingsResponse {
  provider: string;
  model: string;
  apiKey: string; // 脱敏后的 key
  baseURL: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(
    private readonly configRepo: LLMConfigRepository,
    private readonly llmFactory: LLMFactory,
  ) {}

  /** 获取当前 LLM 配置（脱敏） */
  async getLLMConfig(): Promise<LLMSettingsResponse | null> {
    const doc = await this.configRepo.getConfig();
    if (!doc) return null;

    return {
      provider: doc.provider,
      model: doc.model,
      apiKey: this.maskKey(doc.apiKey),
      baseURL: doc.baseURL,
      temperature: doc.temperature,
      maxTokens: doc.maxTokens,
      timeout: doc.timeout,
    };
  }

  /** 保存 LLM 配置 */
  async saveLLMConfig(data: {
    provider: string;
    model: string;
    apiKey: string;
    baseURL: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
  }): Promise<LLMSettingsResponse> {
    // 如果 apiKey 包含脱敏标记 "***"，说明用户没有修改 key，保留原值
    const saveData = { ...data };
    if (saveData.apiKey.includes('***')) {
      const existing = await this.configRepo.getConfig();
      if (existing) {
        saveData.apiKey = existing.apiKey;
      }
    }

    const doc = await this.configRepo.saveConfig(saveData);
    this.logger.log(`LLM config saved: provider=${data.provider}, model=${data.model}`);

    return {
      provider: doc.provider,
      model: doc.model,
      apiKey: this.maskKey(doc.apiKey),
      baseURL: doc.baseURL,
      temperature: doc.temperature,
      maxTokens: doc.maxTokens,
      timeout: doc.timeout,
    };
  }

  /** 获取完整的 LLM 配置（包含完整 API Key，内部使用） */
  async getFullConfig(): Promise<{
    provider: string;
    model: string;
    apiKey: string;
    baseURL: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
  } | null> {
    return this.configRepo.getConfig();
  }

  /** 脱敏 API Key */
  private maskKey(key: string): string {
    if (!key) return '';
    if (key.length <= 8) return '***';
    return key.slice(0, 8) + '***' + key.slice(-4);
  }

  /**
   * 测试 LLM 连接
   * 使用用户提供的配置发起一次简单请求，验证 API 是否可用
   */
  async testLLMConnection(data: {
    provider: string;
    model: string;
    apiKey: string;
    baseURL: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
  }): Promise<{
    success: boolean;
    message: string;
    modelUsed: string;
    latencyMs: number;
  }> {
    const startTime = Date.now();

    // 如果 apiKey 包含脱敏标记，说明用户没有修改，从数据库取原值
    let apiKey = data.apiKey;
    if (apiKey.includes('***')) {
      const existing = await this.configRepo.getConfig();
      if (existing) {
        apiKey = existing.apiKey;
      }
    }

    const config: LLMConfig = {
      provider: data.provider as LLMConfig['provider'],
      model: data.model,
      apiKey,
      baseURL: data.baseURL || undefined,
      temperature: data.temperature,
      maxTokens: data.maxTokens,
      timeout: data.timeout,
    };

    this.logger.log(`Testing LLM connection: provider=${config.provider}, model=${config.model}`);

    try {
      const model: BaseChatModel = await this.llmFactory.createModel(config);

      // 发送一个极简的测试请求
      const response = await model.invoke('Say "OK" if you can hear me.');

      const latencyMs = Date.now() - startTime;
      const responseText =
        typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

      this.logger.log(
        `LLM test success: latency=${latencyMs}ms, response="${responseText.slice(0, 100)}"`,
      );

      return {
        success: true,
        message: `连接成功！模型返回: ${responseText.slice(0, 80)}${responseText.length > 80 ? '...' : ''}`,
        modelUsed: `${config.provider}/${config.model}`,
        latencyMs,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`LLM test failed: latency=${latencyMs}ms, error=${errorMessage}`);

      // 分类常见错误，给出友好提示
      let friendlyMessage = errorMessage;
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        friendlyMessage = 'API Key 无效或已过期，请检查';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        friendlyMessage = 'API Key 无权限访问该模型';
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        friendlyMessage = '请求过于频繁，请稍后再试';
      } else if (
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('getaddrinfo')
      ) {
        friendlyMessage = '无法连接到 API 地址，请检查网络或 API 地址是否正确';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        friendlyMessage = '连接超时，请检查网络或增大超时时间';
      }

      return {
        success: false,
        message: `连接失败: ${friendlyMessage}`,
        modelUsed: `${config.provider}/${config.model}`,
        latencyMs,
      };
    }
  }
}
