// ============================================================
// 代码文件 Diff 类型
// ============================================================

/** Diff 行类型 */
export const DiffLineType = {
  ADDED: 'added',
  REMOVED: 'removed',
  UNCHANGED: 'unchanged',
  HEADER: 'header',
} as const;
export type DiffLineType = (typeof DiffLineType)[keyof typeof DiffLineType];

/** 单行 Diff */
export interface DiffLine {
  /** 行类型 */
  readonly type: DiffLineType;
  /** 行内容 */
  readonly content: string;
  /** 旧文件行号 */
  readonly oldLineNumber?: number;
  /** 新文件行号 */
  readonly newLineNumber?: number;
}

/** Diff Hunk（代码变更片段） */
export interface DiffHunk {
  /** 旧文件起始行 */
  readonly oldStart: number;
  /** 旧文件行数 */
  readonly oldLines: number;
  /** 新文件起始行 */
  readonly newStart: number;
  /** 新文件行数 */
  readonly newLines: number;
  /** 变更上下文标题 */
  readonly header?: string;
  /** Diff 行列表 */
  readonly lines: readonly DiffLine[];
}

/** 单个文件的 Diff 信息 */
export interface CodeFileDiff {
  /** 文件名称 */
  readonly fileName: string;
  /** 编程语言 */
  readonly language: string;
  /** 是否为新文件 */
  readonly isNewFile: boolean;
  /** 是否为删除文件 */
  readonly isDeletedFile: boolean;
  /** Diff Hunk 列表 */
  readonly hunks: readonly DiffHunk[];
  /** 变更行数统计 */
  readonly stats: DiffFileStats;
}

/** 文件变更行数统计 */
export interface DiffFileStats {
  /** 新增行数 */
  readonly additions: number;
  /** 删除行数 */
  readonly deletions: number;
}
