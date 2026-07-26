import { Loader2 } from 'lucide-react';

// ============================================================
// LoadingSpinner — 加载中状态
// ============================================================

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ text = '加载中...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <Loader2 className={`animate-spin text-primary-500 ${sizeClasses[size]}`} />
      <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">{text}</p>
    </div>
  );
}
