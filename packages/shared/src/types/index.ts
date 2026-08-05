// ============================================================
// Types 统一出口
// ============================================================

// 枚举
export {
  ReviewSeverity,
  ReviewCategory,
  ReviewStatus,
  LLMProvider,
  ProgrammingLanguage,
} from './enums';

export type {
  ReviewSeverity as ReviewSeverityType,
  ReviewCategory as ReviewCategoryType,
  ReviewStatus as ReviewStatusType,
  LLMProvider as LLMProviderType,
  ProgrammingLanguage as ProgrammingLanguageType,
} from './enums';

// 代码文件
export type { CodeFile, CodeFileMeta } from './code-file';

// 审查问题
export type { ReviewIssue, ReviewStats } from './review-issue';

// 审查任务
export type { ReviewTask, ReviewTaskListItem, ReviewProgress, ReviewResult } from './review-task';

// 审查结果
export type { CodeReviewResult, CodeReviewResultSummary } from './code-review-result';

// Diff
export { DiffLineType } from './code-file-diff';
export type { DiffLine, DiffHunk, CodeFileDiff, DiffFileStats } from './code-file-diff';
export type { DiffLineType as DiffLineTypeType } from './code-file-diff';

// 对话
export type { ChatMessage, ChatHistory, ChatRole } from './chat';

// API 类型
export type {
  CreateReviewTaskRequest,
  PaginationQuery,
  ApiResponse,
  ApiError,
  PaginatedData,
  SSEEvent,
  SSEEventType,
  SSEProgressEvent,
  SSEIssueEvent,
  SSECompleteEvent,
  SSEErrorEvent,
} from './api-types';
