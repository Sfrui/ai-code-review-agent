import { TrendingUp, AlertTriangle, Shield, Zap, Code, CheckCircle } from 'lucide-react';
import type { ReviewResult } from '@ai-review/shared';
import { getScoreInfo } from '@/lib/formatters';

// ============================================================
// ReviewSummary — 审查结果摘要
// ============================================================

interface ReviewSummaryProps {
  reviewResult: ReviewResult;
}

export function ReviewSummary({ reviewResult }: ReviewSummaryProps) {
  const { summary, score, issues } = reviewResult;
  const scoreInfo = getScoreInfo(score);

  // 统计各分类数量
  const stats = issues.reduce(
    (acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
      acc[issue.category] = (acc[issue.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 评分卡片 */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              审查摘要
            </h3>
            <p className="text-sm leading-relaxed text-surface-600 dark:text-surface-400">
              {summary}
            </p>
          </div>
          <div className={`ml-6 flex h-20 w-20 flex-col items-center justify-center rounded-2xl ${scoreInfo.bgColor}`}>
            <span className={`text-2xl font-bold ${scoreInfo.color}`}>{score}</span>
            <span className={`text-xs font-medium ${scoreInfo.color}`}>{scoreInfo.label}</span>
          </div>
        </div>
      </div>

      {/* 问题统计 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={AlertTriangle}
          label="严重"
          value={stats['error'] ?? 0}
          color="text-red-600"
          bgColor="bg-red-50 dark:bg-red-900/20"
        />
        <StatCard
          icon={Zap}
          label="警告"
          value={stats['warning'] ?? 0}
          color="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard
          icon={Code}
          label="建议"
          value={stats['info'] ?? 0}
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={CheckCircle}
          label="总计"
          value={issues.length}
          color="text-surface-600 dark:text-surface-400"
          bgColor="bg-surface-50 dark:bg-surface-800"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`card p-4 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-medium text-surface-600 dark:text-surface-400">
          {label}
        </span>
      </div>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
