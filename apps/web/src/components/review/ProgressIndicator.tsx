import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

// ============================================================
// ProgressIndicator — 任务执行进度指示器
// ============================================================

interface ProgressIndicatorProps {
  status: 'pending' | 'running' | 'success' | 'fail';
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: '等待执行',
    description: '任务已创建，正在排队等待 AI 审查...',
    color: 'text-surface-500',
    bgColor: 'bg-surface-100 dark:bg-surface-800',
  },
  running: {
    icon: Loader2,
    label: 'AI 审查中',
    description: '正在进行代码审查，请稍候...',
    color: 'text-primary-600',
    bgColor: 'bg-primary-50 dark:bg-primary-900/20',
  },
  success: {
    icon: CheckCircle,
    label: '审查完成',
    description: '代码审查已完成，查看下方结果',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  fail: {
    icon: XCircle,
    label: '审查失败',
    description: '代码审查过程中出现错误，请重试',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
} as const;

export function ProgressIndicator({ status }: ProgressIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`card p-6 ${config.bgColor}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-surface-800 ${config.color}`}>
          <Icon
            className={`h-6 w-6 ${
              status === 'running' ? 'animate-spin' : ''
            }`}
          />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${config.color}`}>
            {config.label}
          </h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            {config.description}
          </p>
        </div>
      </div>

      {/* 进度条（仅 running 状态显示） */}
      {status === 'running' && (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
            <div className="h-full animate-pulse rounded-full bg-primary-500" style={{ width: '60%' }} />
          </div>
          <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
            正在调用大语言模型进行代码分析...
          </p>
        </div>
      )}
    </div>
  );
}
