import { useMemo } from 'react';
import { diffLines, type Change } from 'diff';

// ============================================================
// DiffView — 代码差异对比视图
// ============================================================

interface DiffViewProps {
  /** 原始代码 */
  oldCode: string;
  /** 新代码（修改后） */
  newCode: string;
  /** 文件名 */
  fileName?: string;
}

export function DiffView({ oldCode, newCode, fileName = 'code' }: DiffViewProps) {
  const changes = useMemo(() => diffLines(oldCode, newCode), [oldCode, newCode]);

  let oldLine = 1;
  let newLine = 1;

  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700">
      {/* 文件头 */}
      <div className="flex items-center justify-between border-b border-surface-200 bg-surface-50 px-4 py-2.5 dark:border-surface-700 dark:bg-surface-800">
        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
          📄 {fileName}
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-emerald-600 dark:text-emerald-400">
            +{changes.filter((c) => c.added).reduce((sum, c) => sum + (c.count ?? 0), 0)}
          </span>
          <span className="text-red-600 dark:text-red-400">
            -{changes.filter((c) => c.removed).reduce((sum, c) => sum + (c.count ?? 0), 0)}
          </span>
        </div>
      </div>

      {/* Diff 内容 */}
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <tbody>
            {changes.map((change, changeIdx) => {
              const lines = (change.value ?? '').split('\n').filter((_, i, arr) => {
                // 移除末尾空行
                if (i === arr.length - 1 && arr[i] === '') return false;
                return true;
              });

              return lines.map((line, lineIdx) => {
                const key = `${changeIdx}-${lineIdx}`;
                let lineType: 'added' | 'removed' | 'unchanged' = 'unchanged';
                let lineNum: number | null = null;

                if (change.added) {
                  lineType = 'added';
                  lineNum = newLine++;
                } else if (change.removed) {
                  lineType = 'removed';
                  lineNum = oldLine++;
                } else {
                  lineNum = oldLine++;
                  newLine++;
                }

                return (
                  <tr
                    key={key}
                    className={
                      lineType === 'added'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                        : lineType === 'removed'
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : ''
                    }
                  >
                    <td className="w-16 select-none border-r border-surface-200 px-2 py-0.5 text-right text-xs text-surface-400 dark:border-surface-700">
                      {lineNum}
                    </td>
                    <td className="w-8 select-none px-2 py-0.5 text-center text-xs">
                      {lineType === 'added' ? (
                        <span className="text-emerald-600 dark:text-emerald-400">+</span>
                      ) : lineType === 'removed' ? (
                        <span className="text-red-600 dark:text-red-400">-</span>
                      ) : (
                        <span className="text-surface-300 dark:text-surface-600">·</span>
                      )}
                    </td>
                    <td className="whitespace-pre px-4 py-0.5 text-surface-800 dark:text-surface-200">
                      {line}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
