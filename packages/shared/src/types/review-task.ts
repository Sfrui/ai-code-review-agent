import type { ReviewStatus } from './enums';
import type { ReviewIssue } from './review-issue';

// ============================================================
// 审查任务类型
// ============================================================

/** 审查任务进度 */
export interface ReviewProgress {
  /** 当前阶段 */
  readonly stage: string;
  /** 进度百分比 (0-100) */
  readonly percent: number;
  /** 进度描述 */
  readonly message: string;
  /** 当前执行的 Agent 名称 */
  readonly currentAgent?: string;
}

/** 审查结果（AI 审查完成后填充） */
export interface ReviewResult {
  /** 审查摘要 */
  readonly summary: string;
  /** 代码质量评分 (0-100) */
  readonly score: number;
  /** 发现的问题列表 */
  readonly issues: readonly ReviewIssue[];
  /** 使用的模型 */
  readonly modelUsed: string;
}

/** 审查任务 */
export interface ReviewTask {
  /** 任务唯一标识 (MongoDB ObjectId) */
  readonly id: string;
  /** 代码名称（文件名） */
  readonly codeName: string;
  /** 原始代码内容 */
  readonly codeContent: string;
  /** 审查结果（未审查时为 null） */
  readonly reviewResult: ReviewResult | null;
  /** 任务状态 */
  readonly status: ReviewStatus;
  /** 任务创建时间 (ISO 8601) */
  readonly createdAt: string;
  /** 任务完成时间 (ISO 8601) */
  readonly completedAt?: string;
}

/** 审查任务列表项（不含完整代码和结果） */
export type ReviewTaskListItem = Pick<
  ReviewTask,
  'id' | 'codeName' | 'status' | 'createdAt' | 'completedAt'
> & {
  /** 问题数量 */
  readonly issueCount: number;
};
