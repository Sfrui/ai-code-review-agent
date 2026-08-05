import { cn } from '@/lib/formatters';
import { AlertTriangle, Shield, Zap, Code, Layers, MessageSquare } from 'lucide-react';

// ============================================================
// IssueCard — 单个审查问题卡片
// ============================================================

interface IssueCardProps {
  issue: {
    line: number;
    severity: 'error' | 'warning' | 'info';
    category: 'bug' | 'security' | 'performance' | 'style' | 'maintainability';
    message: string;
    suggestion?: string;
    fixedCode?: string;
  };
  index: number;
  /** 追问回调（新增） */
  onAskClick?: (issueIndex: number) => void;
}

const severityConfig = {
  error: {
    label: '严重',
    className: 'badge-error',
    border: 'border-l-red-500',
  },
  warning: {
    label: '警告',
    className: 'badge-warning',
    border: 'border-l-amber-500',
  },
  info: {
    label: '建议',
    className: 'badge-info',
    border: 'border-l-blue-500',
  },
} as const;

const categoryConfig = {
  bug: { label: '缺陷', icon: AlertTriangle },
  security: { label: '安全', icon: Shield },
  performance: { label: '性能', icon: Zap },
  style: { label: '规范', icon: Code },
  maintainability: { label: '可维护性', icon: Layers },
} as const;

export function IssueCard({ issue, index, onAskClick }: IssueCardProps) {
  const severity = severityConfig[issue.severity];
  const category = categoryConfig[issue.category];
  const CategoryIcon = category.icon;

  return (
    <div
      className={cn('card border-l-4 p-5 animate-slide-up', severity.border)}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* 头部：行号 + 徽章 */}
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center rounded-md bg-surface-100 px-2 py-1 text-xs font-mono font-medium text-surface-700 dark:bg-surface-700 dark:text-surface-300">
          L{issue.line}
        </span>
        <span className={severity.className}>{severity.label}</span>
        <span className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400">
          <CategoryIcon className="h-3.5 w-3.5" />
          {category.label}
        </span>
        {/* 追问按钮（新增） */}
        {onAskClick && (
          <button
            onClick={() => onAskClick(index)}
            className="ml-auto inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
          >
            <MessageSquare className="h-3 w-3" />
            追问
          </button>
        )}
      </div>

      {/* 问题描述 */}
      <p className="text-sm font-medium text-surface-900 dark:text-surface-100 mb-2">
        {issue.message}
      </p>

      {/* 修复建议 */}
      {issue.suggestion && (
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
            💡 修复建议
          </p>
          <p className="text-sm text-emerald-800 dark:text-emerald-300">{issue.suggestion}</p>
        </div>
      )}

      {/* 修复后代码 */}
      {issue.fixedCode && (
        <div className="mt-3 rounded-lg bg-surface-100 p-3 dark:bg-surface-800">
          <p className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-2">
            📝 修改后代码
          </p>
          <pre className="text-sm font-mono text-surface-800 dark:text-surface-200 overflow-x-auto whitespace-pre-wrap">
            {issue.fixedCode}
          </pre>
        </div>
      )}
    </div>
  );
}
