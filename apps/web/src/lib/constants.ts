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

// ============================================================
// 快捷追问模板
// ============================================================

/** 快捷追问模板 */
export interface QuickActionTemplate {
  readonly label: string;
  readonly icon: string;
  readonly template: string;
}

/** 快捷追问选项 */
export const QUICK_ACTIONS: ReadonlyArray<QuickActionTemplate> = [
  {
    label: '如何修复',
    icon: '🔧',
    template: '请详细说明第 {n} 个问题的修复方案，并给出修复后的完整代码。',
  },
  {
    label: '详细解释',
    icon: '📖',
    template: '请详细解释第 {n} 个问题：为什么这是个问题？会造成什么影响？',
  },
  {
    label: '多种方案',
    icon: '⚖️',
    template: '第 {n} 个问题有几种修复方案？请对比各方案的优缺点和适用场景。',
  },
  {
    label: '修复后测试',
    icon: '🧪',
    template: '修复第 {n} 个问题后，应该如何编写单元测试来验证修复是否正确？请给出测试代码。',
  },
];
