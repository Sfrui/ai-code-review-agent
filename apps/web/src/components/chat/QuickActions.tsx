import { QUICK_ACTIONS } from '@/lib/constants';
import type { QuickActionTemplate } from '@/lib/constants';

// ============================================================
// QuickActions — 快捷追问按钮
// ============================================================

interface QuickActionsProps {
  /** 选中 issue 索引（-1 表示未选中） */
  selectedIssueIndex: number;
  /** 点击快捷追问 */
  onSelect: (template: string, issueIndex: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

export function QuickActions({
  selectedIssueIndex,
  onSelect,
  disabled = false,
}: QuickActionsProps) {
  const issueNumber = selectedIssueIndex + 1;

  const handleClick = (template: QuickActionTemplate) => {
    const message = template.template.replace('{n}', String(issueNumber));
    onSelect(message, selectedIssueIndex);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => handleClick(action)}
          disabled={disabled || selectedIssueIndex < 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-600 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-surface-200 disabled:hover:bg-white disabled:hover:text-surface-600 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export type { QuickActionTemplate };
