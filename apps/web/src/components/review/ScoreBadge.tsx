import { cn, getScoreInfo } from '@/lib/formatters';

// ============================================================
// ScoreBadge — 评分徽章
// ============================================================

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const info = getScoreInfo(score);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold',
        info.bgColor,
        info.color,
        size === 'sm' && 'h-10 w-10 text-sm',
        size === 'md' && 'h-14 w-14 text-lg',
        size === 'lg' && 'h-20 w-20 text-2xl',
      )}
    >
      {score}
    </div>
  );
}
