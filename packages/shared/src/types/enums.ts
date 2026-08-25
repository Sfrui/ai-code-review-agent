// ============================================================
// 公共枚举定义
// ============================================================

/** 审查问题严重等级 */
export const ReviewSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;
export type ReviewSeverity = (typeof ReviewSeverity)[keyof typeof ReviewSeverity];

/** 审查问题分类 */
export const ReviewCategory = {
  BUG: 'bug',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  STYLE: 'style',
  MAINTAINABILITY: 'maintainability',
} as const;
export type ReviewCategory = (typeof ReviewCategory)[keyof typeof ReviewCategory];

/** 审查任务状态 */
export const ReviewStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAIL: 'fail',
} as const;
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

/** LLM 提供商 */
export const LLMProvider = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  DEEPSEEK: 'deepseek',
  MOONSHOT: 'moonshot',
  ZHIPU: 'zhipu',
  QWEN: 'qwen',
  DOUBAO: 'doubao',
  YI: 'yi',
  MINIMAX: 'minimax',
  OLLAMA: 'ollama',
  OPENAI_COMPAT: 'openai-compat',
} as const;
export type LLMProvider = (typeof LLMProvider)[keyof typeof LLMProvider];

/** 编程语言 */
export const ProgrammingLanguage = {
  TYPESCRIPT: 'typescript',
  JAVASCRIPT: 'javascript',
  PYTHON: 'python',
  JAVA: 'java',
  GO: 'go',
  RUST: 'rust',
  CSharp: 'csharp',
  CPP: 'cpp',
  C: 'c',
  PHP: 'php',
  RUBY: 'ruby',
  SWIFT: 'swift',
  KOTLIN: 'kotlin',
  OTHER: 'other',
} as const;
export type ProgrammingLanguage = (typeof ProgrammingLanguage)[keyof typeof ProgrammingLanguage];
