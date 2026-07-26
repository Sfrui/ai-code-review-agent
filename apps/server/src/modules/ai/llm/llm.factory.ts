import { Injectable, Logger } from '@nestjs/common';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

// ============================================================
// LLM 工厂 — 支持国内外所有主流大模型
// 大部分国内模型使用 OpenAI 兼容 API，通过 baseURL 切换
// ============================================================

/** LLM 提供商类型 */
export type LLMProviderName =
  | 'openai'
  | 'anthropic'
  | 'deepseek'
  | 'moonshot'      // Kimi
  | 'zhipu'         // 智谱 GLM
  | 'qwen'          // 通义千问
  | 'doubao'        // 豆包
  | 'yi'            // 零一万物
  | 'minimax'       // MiniMax
  | 'ollama'        // 本地模型
  | 'openai-compat'; // 其他 OpenAI 兼容 API

/** LLM 配置 */
export interface LLMConfig {
  provider: LLMProviderName;
  model: string;
  apiKey: string;
  /** API 基础地址（用于自定义/代理） */
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

/** 提供商配置元信息 */
interface ProviderMeta {
  name: string;
  baseURL: string;
  defaultModel: string;
  /** 是否使用 OpenAI 兼容格式 */
  isOpenAICompat: boolean;
}

/** 所有支持的提供商配置 */
const PROVIDER_MAP: Record<LLMProviderName, ProviderMeta> = {
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    isOpenAICompat: false,
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    baseURL: 'https://api.anthropic.com',
    defaultModel: 'claude-sonnet-4-20250514',
    isOpenAICompat: false,
  },
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    isOpenAICompat: true,
  },
  moonshot: {
    name: 'Moonshot (Kimi)',
    baseURL: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    isOpenAICompat: true,
  },
  zhipu: {
    name: '智谱 (GLM)',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    isOpenAICompat: true,
  },
  qwen: {
    name: '通义千问',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    isOpenAICompat: true,
  },
  doubao: {
    name: '豆包 (火山引擎)',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-pro-4k',
    isOpenAICompat: true,
  },
  yi: {
    name: '零一万物 (Yi)',
    baseURL: 'https://api.lingyiwanwu.com/v1',
    defaultModel: 'yi-large',
    isOpenAICompat: true,
  },
  minimax: {
    name: 'MiniMax',
    baseURL: 'https://api.minimax.chat/v1',
    defaultModel: 'abab6.5s-chat',
    isOpenAICompat: true,
  },
  ollama: {
    name: 'Ollama (本地)',
    baseURL: 'http://localhost:11434/v1',
    defaultModel: 'qwen2.5:7b',
    isOpenAICompat: true,
  },
  'openai-compat': {
    name: 'OpenAI 兼容 API',
    baseURL: process.env['LLM_BASE_URL'] ?? 'http://localhost:8080/v1',
    defaultModel: 'default',
    isOpenAICompat: true,
  },
};

@Injectable()
export class LLMFactory {
  private readonly logger = new Logger(LLMFactory.name);

  /** 根据配置创建 LangChain ChatModel 实例 */
  async createModel(config: LLMConfig): Promise<BaseChatModel> {
    const meta = PROVIDER_MAP[config.provider];
    this.logger.log(
      `Creating LLM: [${meta.name}] ${config.model} (baseURL: ${config.baseURL ?? meta.baseURL})`,
    );

    // Anthropic 使用专属 SDK
    if (config.provider === 'anthropic') {
      return this.createAnthropicModel(config);
    }

    // 所有其他提供商统一使用 OpenAI 兼容格式
    return this.createOpenAICompatModel(config, meta);
  }

  /** 创建 OpenAI 兼容模型（覆盖国内外所有提供商） */
  private async createOpenAICompatModel(
    config: LLMConfig,
    meta: ProviderMeta,
  ): Promise<BaseChatModel> {
    const { ChatOpenAI } = await import('@langchain/openai');
    return new ChatOpenAI({
      modelName: config.model || meta.defaultModel,
      apiKey: config.apiKey,
      configuration: {
        baseURL: config.baseURL ?? meta.baseURL,
      },
      temperature: config.temperature ?? 0.1,
      maxTokens: config.maxTokens ?? 4096,
      timeout: config.timeout ?? 60_000,
    });
  }

  /** 创建 Anthropic Claude 模型 */
  private async createAnthropicModel(config: LLMConfig): Promise<BaseChatModel> {
    const { ChatAnthropic } = await import('@langchain/anthropic');
    return new ChatAnthropic({
      model: config.model,
      apiKey: config.apiKey,
      temperature: config.temperature ?? 0.1,
      maxTokens: config.maxTokens ?? 4096,
      // timeout 通过 requestTimeout 传递（Anthropic SDK 兼容）
      ...(config.timeout ? { timeout: config.timeout } : {}),
    });
  }

  /** 从环境变量读取配置（兜底方案） */
  static getEnvConfig(): LLMConfig {
    const provider = (process.env['LLM_PROVIDER'] ?? 'openai') as LLMProviderName;
    const meta = PROVIDER_MAP[provider];

    if (!meta) {
      throw new Error(
        `不支持的 LLM 提供商: ${provider}\n` +
          `支持的提供商: ${Object.keys(PROVIDER_MAP).join(', ')}`,
      );
    }

    const apiKey = process.env['LLM_API_KEY'] ?? '';
    const model = process.env['LLM_MODEL'] ?? meta.defaultModel;
    const baseURL = process.env['LLM_BASE_URL'] ?? undefined;
    const temperature = parseFloat(process.env['LLM_TEMPERATURE'] ?? '0.1');
    const maxTokens = parseInt(process.env['LLM_MAX_TOKENS'] ?? '4096', 10);
    const timeout = parseInt(process.env['LLM_TIMEOUT'] ?? '60000', 10);

    // 本地模型（如 ollama）不需要 API Key
    if (!apiKey && provider !== 'ollama') {
      throw new Error(
        `LLM_API_KEY 环境变量未配置\n` +
          `当前提供商: ${meta.name}\n` +
          `请在 .env 文件中设置 LLM_API_KEY`,
      );
    }

    return { provider, model, apiKey: apiKey ?? 'ollama', baseURL, temperature, maxTokens, timeout };
  }

  /** 将数据库配置转为 LLMConfig */
  static fromDBConfig(dbConfig: {
    provider: string;
    model: string;
    apiKey: string;
    baseURL: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
  }): LLMConfig {
    return {
      provider: dbConfig.provider as LLMProviderName,
      model: dbConfig.model,
      apiKey: dbConfig.apiKey,
      baseURL: dbConfig.baseURL || undefined,
      temperature: dbConfig.temperature,
      maxTokens: dbConfig.maxTokens,
      timeout: dbConfig.timeout,
    };
  }

  /** 获取所有支持的提供商列表（用于前端展示） */
  static getProviderList(): Array<{ value: LLMProviderName; name: string; defaultModel: string }> {
    return Object.entries(PROVIDER_MAP).map(([value, meta]) => ({
      value: value as LLMProviderName,
      name: meta.name,
      defaultModel: meta.defaultModel,
    }));
  }
}
