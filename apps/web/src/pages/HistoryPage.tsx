import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { History, ChevronRight, FileCode, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useTaskList, useDeleteTask } from '@/hooks/use-review';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { getStatusConfig, formatDate, formatRelativeTime } from '@/lib/formatters';

// ============================================================
// HistoryPage — 历史记录页
// ============================================================

const PAGE_SIZE = 10;

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { data: response, isLoading, error, refetch } = useTaskList(page, PAGE_SIZE);
  const deleteTask = useDeleteTask();

  const items = response?.data?.items ?? [];
  const total = response?.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask.mutateAsync(deleteTarget);
      setDeleteTarget(null);
      // 如果当前页只剩一条且不是第一页，回到上一页
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error('删除任务失败:', error);
    }
  }, [deleteTarget, deleteTask, items.length, page]);

  // 加载中
  if (isLoading) {
    return <LoadingSpinner text="加载历史记录..." />;
  }

  // 错误
  if (error) {
    return <ErrorState message="加载历史记录失败" onRetry={() => refetch()} />;
  }

  // 空数据
  if (items.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">历史记录</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            查看所有代码审查任务
          </p>
        </div>
        <EmptyState
          icon={History}
          title="暂无审查记录"
          description="开始你的第一次代码审查吧"
          action={
            <Link to="/review" className="btn-primary">
              <Plus className="h-4 w-4" />
              创建审查
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">历史记录</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            共 {total} 条审查记录
          </p>
        </div>
        <Link to="/review" className="btn-primary">
          <Plus className="h-4 w-4" />
          新建审查
        </Link>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const statusConfig = getStatusConfig(item.status);
          return (
            <div
              key={item.id}
              className="card-hover group relative flex items-center gap-4 p-5 animate-slide-up"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* 图标 */}
              <Link
                to={`/review/${item.id}`}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20"
              >
                <FileCode className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </Link>

              {/* 内容 */}
              <Link to={`/review/${item.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                    {item.codeName}
                  </h3>
                  <span className={statusConfig.className}>{statusConfig.label}</span>
                  {item.issueCount > 0 && (
                    <span className="badge bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400">
                      {item.issueCount} 个问题
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                  <span>{formatDate(item.createdAt)}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(item.createdAt)}</span>
                  {item.completedAt && (
                    <>
                      <span>·</span>
                      <span>
                        耗时{' '}
                        {Math.round(
                          (new Date(item.completedAt).getTime() -
                            new Date(item.createdAt).getTime()) /
                            1000,
                        )}
                        s
                      </span>
                    </>
                  )}
                </div>
              </Link>

              {/* 删除按钮 */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setDeleteTarget(item.id);
                }}
                className="shrink-0 p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                title="删除任务"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {/* 箭头 */}
              <Link to={`/review/${item.id}`}>
                <ChevronRight className="h-5 w-5 shrink-0 text-surface-300 transition-transform group-hover:translate-x-1 group-hover:text-primary-500 dark:text-surface-600" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary"
          >
            上一页
          </button>
          <span className="text-sm text-surface-600 dark:text-surface-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary"
          >
            下一页
          </button>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-surface-800 animate-scale-in">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">确认删除</h3>
                <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                  此操作不可撤销，确定要删除这条审查记录吗？
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary"
                disabled={deleteTask.isPending}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className="btn-primary bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                {deleteTask.isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    删除中...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    确认删除
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
