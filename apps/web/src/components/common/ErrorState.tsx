import { AlertTriangle, RefreshCw } from 'lucide-react';

// ============================================================
// ErrorState — 错误提示状态
// ============================================================

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = '加载失败，请稍后重试',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">
        出了点问题
      </h3>
      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-4">
          <RefreshCw className="h-4 w-4" />
          重试
        </button>
      )}
    </div>
  );
}
