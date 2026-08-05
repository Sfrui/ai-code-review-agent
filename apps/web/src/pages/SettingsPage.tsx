import { useState, useEffect } from 'react';
import { Settings, Save, Check, AlertCircle, Eye, EyeOff, ExternalLink, Cable } from 'lucide-react';
import {
  fetchLLMConfig,
  saveLLMConfig,
  fetchProviderList,
  testLLMConfig,
  type LLMSettings,
} from '@/api/config.api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// ============================================================
// SettingsPage — LLM 配置设置页
// ============================================================

const providerList = fetchProviderList();

const providerUrls: Record<string, string> = {
  deepseek: 'https://platform.deepseek.com',
  moonshot: 'https://platform.moonshot.cn',
  zhipu: 'https://open.bigmodel.cn',
  qwen: 'https://dashscope.console.aliyun.com',
  doubao: 'https://console.volcengine.com',
  yi: 'https://platform.lingyiwanwu.com',
  openai: 'https://platform.openai.com',
  anthropic: 'https://console.anthropic.com',
  ollama: 'https://ollama.com',
};

export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // 测试连接状态
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const [form, setForm] = useState<LLMSettings>({
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: '',
    baseURL: '',
    temperature: 0.1,
    maxTokens: 4096,
    timeout: 60000,
  });

  // 加载配置
  useEffect(() => {
    fetchLLMConfig()
      .then((res) => {
        if (res.data) {
          setForm(res.data);
        }
      })
      .catch(() => setError('加载配置失败'))
      .finally(() => setLoading(false));
  }, []);

  // 切换提供商时自动填充默认模型
  const handleProviderChange = (provider: string) => {
    const option = providerList.find((p) => p.value === provider);
    setForm((prev) => ({
      ...prev,
      provider,
      model: option?.defaultModel ?? '',
      baseURL: '',
    }));
  };

  // 保存配置
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await saveLLMConfig(form);
      setForm(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('保存配置失败，请检查参数');
    } finally {
      setSaving(false);
    }
  };

  // 测试连接
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const res = await testLLMConfig(form);
      setTestResult({
        success: res.data.success,
        message: res.data.message,
        latencyMs: res.data.latencyMs,
      });
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ??
        (err as Error)?.message ??
        '测试连接失败';
      setTestResult({ success: false, message });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="加载配置..." />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          <Settings className="mb-1 inline h-6 w-6" /> AI 模型设置
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          配置代码审查使用的 AI 模型和 API 密钥
        </p>
      </div>

      <div className="card space-y-6 p-6">
        {/* 提供商选择 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
            AI 提供商
          </label>
          <select
            value={form.provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="input"
          >
            {providerList.map((p) => (
              <option key={p.value} value={p.value}>
                {p.name}
              </option>
            ))}
          </select>
          {providerUrls[form.provider] && (
            <a
              href={providerUrls[form.provider]}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              获取 API Key <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* 模型名称 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
            模型名称
          </label>
          <input
            type="text"
            value={form.model}
            onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
            className="input"
            placeholder="例如: deepseek-chat"
          />
        </div>

        {/* API Key */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={form.apiKey}
              onChange={(e) => setForm((prev) => ({ ...prev, apiKey: e.target.value }))}
              className="input pr-10"
              placeholder="sk-..."
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* 自定义 API 地址（仅自定义提供商显示） */}
        {form.provider === 'openai-compat' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
              API 地址
            </label>
            <input
              type="text"
              value={form.baseURL}
              onChange={(e) => setForm((prev) => ({ ...prev, baseURL: e.target.value }))}
              className="input"
              placeholder="https://your-api.com/v1"
            />
          </div>
        )}

        {/* 高级参数 */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-surface-600 dark:text-surface-400 select-none">
            ⚙️ 高级参数
          </summary>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-surface-500">Temperature</label>
              <input
                type="number"
                value={form.temperature}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, temperature: parseFloat(e.target.value) || 0.1 }))
                }
                className="input text-sm"
                min="0"
                max="2"
                step="0.1"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-surface-500">Max Tokens</label>
              <input
                type="number"
                value={form.maxTokens}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }))
                }
                className="input text-sm"
                min="256"
                max="128000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-surface-500">超时 (ms)</label>
              <input
                type="number"
                value={form.timeout}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, timeout: parseInt(e.target.value) || 60000 }))
                }
                className="input text-sm"
                min="1000"
                max="300000"
              />
            </div>
          </div>
        </details>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving || !form.apiKey} className="btn-primary">
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? '已保存' : '保存配置'}
          </button>

          {/* 测试连接按钮 */}
          <button
            onClick={handleTest}
            disabled={testing || !form.apiKey}
            className="btn-secondary"
            title="测试 API 是否可以正常调用"
          >
            {testing ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-500 border-t-transparent" />
            ) : (
              <Cable className="h-4 w-4" />
            )}
            {testing ? '测试中...' : '测试连接'}
          </button>

          {saved && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in">
              ✅ 配置已保存
            </span>
          )}
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div
            className={`rounded-lg border p-3 text-sm animate-fade-in ${
              testResult.success
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p>{testResult.message}</p>
                {testResult.latencyMs != null && (
                  <p className="mt-1 text-xs opacity-75">延迟: {testResult.latencyMs}ms</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="card border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {/* 说明 */}
      <div className="card bg-surface-50 p-5 dark:bg-surface-800/50">
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
          💡 使用说明
        </h3>
        <ul className="space-y-1 text-xs text-surface-500 dark:text-surface-400">
          <li>• 配置保存后，后续代码审查将使用此配置</li>
          <li>• 未配置时，将使用环境变量中的默认值</li>
          <li>• API Key 会在列表中脱敏显示（仅显示前 8 位）</li>
          <li>• 推荐国内用户使用 DeepSeek，价格便宜且效果好</li>
        </ul>
      </div>
    </div>
  );
}
