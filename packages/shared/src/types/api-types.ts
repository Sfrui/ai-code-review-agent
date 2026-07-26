// ============================================================
// API 请求/响应类型
// ============================================================

import type { CodeFile } from './code-file';
import type { ReviewCategory } from './enums';
import type { ReviewIssue } from './review-issue';
import type { ReviewTask } from './review-task';
import type { CodeReviewResult } from './code-review-result';
import type { ReviewProgress } from './review-task';

// ---- 请求类型 ----

/** 创建审查任务请求 */
export interface CreateReviewTaskRequest {
  /** 代码名称（文件名） */
  readonly codeName: string;
  /** 原始代码内容 */
  readonly codeContent: string;
}

/** 分页查询参数 */
export interface PaginationQuery {
  readonly page?: number;
  readonly pageSize?: number;
}

// ---- 响应类型 ----

/** 统一 API 响应 */
export type ApiResponse<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: ApiError };

/** API 错误 */
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

/** 分页响应数据 */
export interface PaginatedData<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

// ---- SSE 事件类型 ----

export type SSEEventType = 'progress' | 'issue' | 'complete' | 'error';

export interface SSEProgressEvent {
  readonly type: 'progress';
  readonly data: ReviewProgress;
}

export interface SSEIssueEvent {
  readonly type: 'issue';
  readonly data: ReviewIssue;
}

export interface SSECompleteEvent {
  readonly type: 'complete';
  readonly data: CodeReviewResult;
}

export interface SSEErrorEvent {
  readonly type: 'error';
  readonly data: ApiError;
}

export type SSEEvent = SSEProgressEvent | SSEIssueEvent | SSECompleteEvent | SSEErrorEvent;
