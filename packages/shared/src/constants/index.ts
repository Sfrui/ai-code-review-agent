// ============================================================
// 常量定义
// ============================================================

import { ReviewSeverity, ReviewCategory } from '../types';

/** 审查问题严重等级标签映射 */
export const SEVERITY_LABELS: Record<ReviewSeverity, string> = {
  [ReviewSeverity.ERROR]: '错误',
  [ReviewSeverity.WARNING]: '警告',
  [ReviewSeverity.INFO]: '提示',
};

/** 审查问题分类标签映射 */
export const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  [ReviewCategory.BUG]: '缺陷',
  [ReviewCategory.SECURITY]: '安全',
  [ReviewCategory.PERFORMANCE]: '性能',
  [ReviewCategory.STYLE]: '规范',
  [ReviewCategory.MAINTAINABILITY]: '可维护性',
};

/** 分页默认值 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** 审查分数阈值 */
export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  FAIR: 50,
  POOR: 0,
} as const;
