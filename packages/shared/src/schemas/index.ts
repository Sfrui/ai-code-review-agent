import { z } from 'zod';
import { ReviewSeverity, ReviewCategory, ReviewStatus, LLMProvider } from '../types';

// ============================================================
// Zod Schemas — 与 TS 类型一一对应，保证运行时校验
// ============================================================

// ---- 枚举 Schema ----

export const ReviewSeveritySchema = z.nativeEnum(ReviewSeverity);
export const ReviewCategorySchema = z.nativeEnum(ReviewCategory);
export const ReviewStatusSchema = z.nativeEnum(ReviewStatus);
export const LLMProviderSchema = z.nativeEnum(LLMProvider);

// ---- 代码文件 Schema ----

export const CodeFileSchema = z.object({
  fileName: z.string().min(1),
  content: z.string().min(1),
  language: z.string().min(1),
});

// ---- 审查问题 Schema ----

export const ReviewIssueSchema = z.object({
  id: z.string().uuid(),
  file: z.string().min(1),
  line: z.number().int().positive(),
  endLine: z.number().int().positive().optional(),
  column: z.number().int().positive().optional(),
  severity: ReviewSeveritySchema,
  category: ReviewCategorySchema,
  message: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  suggestion: z.string().max(2000).optional(),
  originalCode: z.string().max(5000).optional(),
  fixedCode: z.string().max(5000).optional(),
  ruleId: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export type ReviewIssueSchemaOutput = z.infer<typeof ReviewIssueSchema>;

// ---- LLM 输出 Schema ----

export const LLMReviewOutputSchema = z.object({
  issues: z.array(ReviewIssueSchema),
  summary: z.string().min(10).max(2000),
  score: z.number().int().min(0).max(100),
});

export type LLMReviewOutput = z.infer<typeof LLMReviewOutputSchema>;

// ---- 请求 Schema ----

export const CreateReviewRequestSchema = z.object({
  files: z.array(CodeFileSchema).min(1).max(50),
  options: z
    .object({
      categories: z.array(ReviewCategorySchema).optional(),
      language: z.string().optional(),
      customPrompt: z.string().max(2000).optional(),
    })
    .optional(),
});
