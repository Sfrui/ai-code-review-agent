import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCreateTask,
  fetchTaskById,
  fetchTaskList,
  fetchRunTask,
} from '@/api/review.api';

// ============================================================
// React-Query Hooks — 审查任务数据管理
// ============================================================

/** 创建审查任务 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fetchCreateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewTasks'] });
    },
  });
}

/** 查询单个任务详情 */
export function useTaskDetail(id: string) {
  return useQuery({
    queryKey: ['reviewTask', id],
    queryFn: () => fetchTaskById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // 任务执行中时轮询
      const status = query.state.data?.data?.status;
      return status === 'running' || status === 'pending' ? 2000 : false;
    },
  });
}

/** 获取历史任务列表 */
export function useTaskList(page: number, pageSize: number) {
  return useQuery({
    queryKey: ['reviewTasks', page, pageSize],
    queryFn: () => fetchTaskList(page, pageSize),
  });
}

/** 触发执行 AI 审查 */
export function useRunTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fetchRunTask,
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['reviewTask', taskId] });
      queryClient.invalidateQueries({ queryKey: ['reviewTasks'] });
    },
  });
}
