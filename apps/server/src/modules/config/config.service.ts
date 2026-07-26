import { Injectable, Logger } from '@nestjs/common';
import type { LLMConfigRepository } from '../database/repositories/llm-config.repository';

// ============================================================
// ConfigService — LLM 配置业务逻辑
// ============================================================

export interface LLMSettingsResponse {
  provider: string;
  model: string;
  apiKey: string;    // 脱敏后的 key
  baseURL: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private readonly configRepo: LLMConfigRepository) {}

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
}
