// ============================================================
// ChatMessage 类型定义
// ============================================================

/** 对话消息角色 */
export type ChatRole = 'user' | 'assistant';

/** 单条对话消息 */
export interface ChatMessage {
  /** 消息角色 */
  readonly role: ChatRole;
  /** 消息内容（Markdown 格式） */
  readonly content: string;
  /** 创建时间 (ISO 8601) */
  readonly createdAt: string;
  /** 关联的 issue 索引（可选，前端用于高亮） */
  readonly relatedIssueIndex?: number;
}

/** 对话历史 */
export type ChatHistory = readonly ChatMessage[];
