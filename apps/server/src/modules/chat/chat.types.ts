import type { ChatMessage, ChatHistory } from '@ai-review/shared';

// ============================================================
// 对话上下文 — 组装给 LLM 的完整信息
// ============================================================

/** 对话上下文 */
export interface ChatContext {
  /** 文件名 */
  readonly codeName: string;
  /** 完整源代码 */
  readonly codeContent: string;
  /** 审查摘要 */
  readonly reviewSummary: string;
  /** 发现的问题列表 */
  readonly issues: ReadonlyArray<{
    readonly line: number;
    readonly severity: string;
    readonly category: string;
    readonly message: string;
    readonly suggestion?: string;
    readonly fixedCode?: string;
  }>;
  /** 对话历史 */
  readonly chatHistory: ChatHistory;
}

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

/** 对话历史最大保留条数（超过则摘要压缩） */
export const MAX_CHAT_HISTORY_LENGTH = 20;

/** 摘要压缩时保留的最近轮数 */
export const KEEP_RECENT_TURNS = 10;

/**
 * 格式化对话历史为 LLM 可读的文本
 */
export function formatChatHistoryForLLM(chatHistory: ChatHistory): string {
  if (chatHistory.length === 0) return '（暂无对话历史）';

  return chatHistory
    .map((msg) => {
      const role = msg.role === 'user' ? '开发者' : '审查专家';
      return `${role}: ${msg.content}`;
    })
    .join('\n\n');
}

/**
 * 压缩过长的对话历史
 * 保留最近 N 轮，老的做摘要占位
 */
export function compressChatHistory(chatHistory: ChatHistory): ChatHistory {
  if (chatHistory.length <= MAX_CHAT_HISTORY_LENGTH) {
    return chatHistory;
  }

  const old = chatHistory.slice(0, -KEEP_RECENT_TURNS * 2);
  const recent = chatHistory.slice(-KEEP_RECENT_TURNS * 2);

  const summary: ChatMessage = {
    role: 'assistant',
    content: `（此前已有 ${old.length} 轮对话，主要讨论了：${old
      .filter((m) => m.role === 'user')
      .slice(0, 3)
      .map((m) => m.content.slice(0, 30))
      .join('、')}...）`,
    createdAt: old[old.length - 1]?.createdAt ?? new Date().toISOString(),
  };

  return [summary, ...recent];
}
