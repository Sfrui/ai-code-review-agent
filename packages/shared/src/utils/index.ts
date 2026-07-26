// ============================================================
// 工具函数
// ============================================================

/**
 * 生成 UUID v4（简易实现，兼容浏览器和 Node.js）
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 获取当前 ISO 8601 时间字符串
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * 计算代码行数
 */
export function countLines(code: string): number {
  if (code.length === 0) return 0;
  return code.split('\n').length;
}

/**
 * 安全截断字符串
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
