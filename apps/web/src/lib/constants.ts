// ============================================================
// 前端常量
// ============================================================

/** API 基础路径 */
export const API_BASE_URL = '/api/v1';

/** 支持的编程语言列表（Monaco Editor） */
export const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'java',
  'go',
  'rust',
  'csharp',
  'cpp',
  'php',
  'ruby',
  'swift',
  'kotlin',
] as const;

/** 文件扩展名到语言的映射 */
export const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.go': 'go',
  '.rs': 'rust',
  '.cs': 'csharp',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.php': 'php',
  '.rb': 'ruby',
  '.swift': 'swift',
  '.kt': 'kotlin',
};

/** 根据文件扩展名推断语言 */
export function detectLanguage(fileName: string): string {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  return EXTENSION_LANGUAGE_MAP[ext] ?? 'plaintext';
}
