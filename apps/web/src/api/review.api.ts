import api from './index';
import type {
  ReviewTask,
  ReviewTaskListItem,
  PaginatedData,
} from '@ai-review/shared';

// ============================================================
// Review API — 审查任务相关接口
// ============================================================

/** 通用 API 响应结构 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/** 创建审查任务 */
export function fetchCreateTask(data: {
  codeName: string;
  codeContent: string;
}): Promise<ApiResponse<ReviewTask>> {
  return api.post('/review/task', data).then((res) => res.data);
}

/** 查询单个任务详情 */
export function fetchTaskById(id: string): Promise<ApiResponse<ReviewTask>> {
  return api.get(`/review/task/${id}`).then((res) => res.data);
}

/** 获取历史任务分页列表 */
export function fetchTaskList(
  page: number,
  pageSize: number,
): Promise<ApiResponse<PaginatedData<ReviewTaskListItem>>> {
  return api.get('/review/task/list', { params: { page, pageSize } }).then((res) => res.data);
}

/** 触发执行 AI 审查 */
export function fetchRunTask(id: string): Promise<ApiResponse<ReviewTask>> {
  return api.post(`/review/task/${id}/run`).then((res) => res.data);
}
