import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================
// 工具函数
// ============================================================

/** 合并 TailwindCSS 类名（去重 + 冲突解决） */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期为本地化字符串
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小时前`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} 天前`;
}

/**
 * 根据分数返回等级和颜色
 */
export function getScoreInfo(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 90) return { label: '优秀', color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  if (score >= 70) return { label: '良好', color: 'text-blue-600', bgColor: 'bg-blue-50' };
  if (score >= 50) return { label: '一般', color: 'text-amber-600', bgColor: 'bg-amber-50' };
  return { label: '较差', color: 'text-red-600', bgColor: 'bg-red-50' };
}

/**
 * 根据任务状态返回配置
 */
export function getStatusConfig(status: string): {
  label: string;
  className: string;
} {
  const configs: Record<string, { label: string; className: string }> = {
    pending: { label: '等待中', className: 'badge-pending' },
    running: { label: '执行中', className: 'badge-info animate-pulse-soft' },
    success: { label: '已完成', className: 'badge-success' },
    fail: { label: '失败', className: 'badge-error' },
  };
  return configs[status] ?? { label: status, className: 'badge-pending' };
}
