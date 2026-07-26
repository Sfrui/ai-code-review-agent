import type { ReviewCategory, ReviewSeverity } from './enums';

// ============================================================
// 审查问题类型
// ============================================================

/** 单个审查问题 */
export interface ReviewIssue {
  /** 唯一标识 (UUID) */
  readonly id: string;
  /** 所在文件 */
  readonly file: string;
  /** 起始行号 */
  readonly line: number;
  /** 结束行号 */
  readonly endLine?: number;
  /** 列号 */
  readonly column?: number;
  /** 严重等级 */
  readonly severity: ReviewSeverity;
  /** 问题分类 */
  readonly category: ReviewCategory;
  /** 问题简述 */
  readonly message: string;
  /** 详细说明 */
  readonly description: string;
  /** 修复建议 */
  readonly suggestion?: string;
  /** 问题代码片段 */
  readonly originalCode?: string;
  /** 建议修改代码 */
  readonly fixedCode?: string;
  /** 规则标识 */
  readonly ruleId?: string;
  /** LLM 置信度 (0-1) */
  readonly confidence: number;
}

/** 审查问题统计 */
export interface ReviewStats {
  readonly totalIssues: number;
  readonly bySeverity: Record<ReviewSeverity, number>;
  readonly byCategory: Record<ReviewCategory, number>;
  readonly filesReviewed: number;
}
