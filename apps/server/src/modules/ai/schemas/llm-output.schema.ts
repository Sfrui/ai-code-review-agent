import { z } from 'zod';

// ============================================================
// LLM 输出 Zod Schema — 强制校验 AI 返回的 JSON 结构
// 体现 Type-Driven 设计：类型即校验，校验即类型
// ============================================================

/** 单个审查问题的 Schema */
export const LLMReviewIssueSchema = z.object({
  /** 问题所在行号 */
  line: z.number().int().positive().describe('问题所在行号'),
  /** 严重等级 */
  severity: z
    .enum(['error', 'warning', 'info'])
    .describe('严重等级: error=必须修复, warning=建议修复, info=提示'),
  /** 问题分类 */
  category: z
    .enum(['bug', 'security', 'performance', 'style', 'maintainability'])
    .describe('问题分类'),
  /** 问题描述 */
  message: z.string().min(1).max(500).describe('简明扼要的问题描述'),
  /** 修复建议 */
  suggestion: z.string().max(1000).optional().describe('如何修复此问题的建议'),
  /** 修复后的代码片段 */
  fixedCode: z.string().max(2000).optional().describe('修复后的完整代码片段'),
});

/** LLM 审查输出的完整 Schema */
export const LLMReviewOutputSchema = z.object({
  /** 审查摘要 */
  summary: z
    .string()
    .min(10)
    .max(1000)
    .describe('对代码质量的简要总结，包含主要问题和改进建议'),
  /** 代码质量评分 (0-100) */
  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('代码质量评分，100为完美，0为极差'),
  /** 发现的问题列表 */
  issues: z
    .array(LLMReviewIssueSchema)
    .max(50)
    .describe('发现的问题列表，按严重程度排序'),
});

/** 从 Zod Schema 推导出的 TS 类型 — 类型与校验完全一致 */
export type LLMReviewOutput = z.infer<typeof LLMReviewOutputSchema>;
export type LLMReviewIssue = z.infer<typeof LLMReviewIssueSchema>;

/**
 * 严格校验 LLM 输出 — 不符合结构直接抛出错误
 * @throws z.ZodError 如果校验失败
 */
export function validateLLMOutput(raw: unknown): LLMReviewOutput {
  return LLMReviewOutputSchema.parse(raw);
}

/**
 * 安全校验 — 返回结果或 null
 */
export function safeValidateLLMOutput(raw: unknown): LLMReviewOutput | null {
  const result = LLMReviewOutputSchema.safeParse(raw);
  return result.success ? result.data : null;
}
