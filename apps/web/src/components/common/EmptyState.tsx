import { Inbox } from 'lucide-react';

// ============================================================
// EmptyState — 空数据状态
// ============================================================

interface EmptyStateProps {
  icon?: typeof Inbox;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 dark:bg-surface-800">
        <Icon className="h-8 w-8 text-surface-400 dark:text-surface-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
