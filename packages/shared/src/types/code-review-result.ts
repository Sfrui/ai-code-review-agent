import type { CodeFile } from './code-file';
import type { ReviewIssue, ReviewStats } from './review-issue';

// ============================================================
// 代码审查结果类型
// ============================================================

/** 代码审查结果 */
export interface CodeReviewResult {
  /** 结果唯一标识 (UUID) */
  readonly id: string;
  /** 关联的审查任务 ID */
  readonly taskId: string;
  /** 被审查的代码文件列表 */
  readonly files: readonly CodeFile[];
  /** 发现的问题列表 */
  readonly issues: readonly ReviewIssue[];
  /** 审查摘要 */
  readonly summary: string;
  /** 代码质量评分 (0-100) */
  readonly score: number;
  /** 统计数据 */
  readonly stats: ReviewStats;
  /** 使用的 LLM 模型标识 */
  readonly modelUsed: string;
  /** 结果创建时间 (ISO 8601) */
  readonly createdAt: string;
  /** 审查完成时间 (ISO 8601) */
  readonly completedAt: string;
}

/** 审查结果列表项（列表页使用，不含完整 issues） */
export type CodeReviewResultSummary = Pick<
  CodeReviewResult,
  'id' | 'taskId' | 'summary' | 'score' | 'stats' | 'modelUsed' | 'createdAt' | 'completedAt'
> & {
  /** 文件数量 */
  readonly fileCount: number;
};
