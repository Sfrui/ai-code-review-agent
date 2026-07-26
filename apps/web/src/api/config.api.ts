import api from './index';
import type { LLMProviderName } from '@ai-review/shared';

// ============================================================
// Config API — LLM 配置管理接口
// ============================================================

/** LLM 配置数据 */
export interface LLMSettings {
  provider: string;
  model: string;
  apiKey: string;
  baseURL: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

/** 提供商选项 */
export interface ProviderOption {
  value: LLMProviderName;
  name: string;
  defaultModel: string;
}

/** 通用 API 响应 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/** 获取 LLM 配置 */
export function fetchLLMConfig(): Promise<ApiResponse<LLMSettings | null>> {
  return api.get('/config/llm').then((res) => res.data);
}

/** 保存 LLM 配置 */
export function saveLLMConfig(data: LLMSettings): Promise<ApiResponse<LLMSettings>> {
  return api.put('/config/llm', data).then((res) => res.data);
}

/** 获取支持的提供商列表 */
export function fetchProviderList(): ProviderOption[] {
  return [
    { value: 'deepseek', name: 'DeepSeek', defaultModel: 'deepseek-chat' },
    { value: 'moonshot', name: 'Kimi (Moonshot)', defaultModel: 'moonshot-v1-8k' },
    { value: 'zhipu', name: '智谱 GLM', defaultModel: 'glm-4-flash' },
    { value: 'qwen', name: '通义千问', defaultModel: 'qwen-plus' },
    { value: 'doubao', name: '豆包', defaultModel: 'doubao-pro-4k' },
    { value: 'yi', name: '零一万物', defaultModel: 'yi-large' },
    { value: 'openai', name: 'OpenAI', defaultModel: 'gpt-4o' },
    { value: 'anthropic', name: 'Anthropic (Claude)', defaultModel: 'claude-sonnet-4-20250514' },
    { value: 'ollama', name: 'Ollama (本地)', defaultModel: 'qwen2.5:7b' },
    { value: 'openai-compat', name: '自定义 (OpenAI 兼容)', defaultModel: '' },
  ];
}
