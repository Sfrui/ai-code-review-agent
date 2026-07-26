import type { ProgrammingLanguage } from './enums';

// ============================================================
// 代码文件类型
// ============================================================

/** 待审查的代码文件 */
export interface CodeFile {
  /** 文件名称（含扩展名） */
  readonly fileName: string;
  /** 文件内容 */
  readonly content: string;
  /** 编程语言 */
  readonly language: ProgrammingLanguage | string;
}

/** 代码文件元信息 */
export interface CodeFileMeta {
  /** 文件名称 */
  readonly fileName: string;
  /** 编程语言 */
  readonly language: ProgrammingLanguage | string;
  /** 代码行数 */
  readonly lineCount: number;
  /** 文件大小（字节） */
  readonly size: number;
}
