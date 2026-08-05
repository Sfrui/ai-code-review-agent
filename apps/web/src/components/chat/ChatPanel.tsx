import { useRef, useEffect } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { EmptyState } from '@/components/common/EmptyState';

// ============================================================
// ChatPanel — 对话面板容器
// ============================================================

interface ChatPanelProps {
  /** 对话历史 */
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    relatedIssueIndex?: number;
  }>;
  /** 当前正在流式输出的内容 */
  streamingContent: string;
  /** 是否正在生成中 */
  isStreaming: boolean;
  /** 问题总数（用于快捷追问） */
  issueCount: number;
  /** 当前选中的 issue 索引 */
  selectedIssueIndex: number;
  /** 选中 issue 变化回调 */
  onSelectIssue: (index: number) => void;
  /** 发送消息回调 */
  onSend: (message: string, relatedIssueIndex?: number) => void;
  /** 清空对话回调 */
  onClear: () => void;
}

export function ChatPanel({
  messages,
  streamingContent,
  isStreaming,
  issueCount,
  selectedIssueIndex,
  onSelectIssue,
  onSend,
  onClear,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasIssues = issueCount > 0;

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleQuickAction = (template: string, issueIndex: number) => {
    if (issueIndex >= 0) {
      onSelectIssue(issueIndex);
      onSend(template, issueIndex);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200">追问对话</h3>
          {messages.length > 0 && (
            <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-500 dark:bg-surface-700 dark:text-surface-400">
              {messages.length} 条
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-700 dark:hover:text-surface-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空
          </button>
        )}
      </div>

      {/* 消息列表 */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-4"
        style={{ minHeight: '300px', maxHeight: '400px' }}
      >
        {messages.length === 0 && !isStreaming ? (
          <EmptyState
            icon={MessageSquare}
            title="开始追问"
            description={
              hasIssues
                ? '点击下方快捷按钮或输入问题，与 AI 深入讨论审查结果'
                : '审查没有问题，你可以询问代码优化建议'
            }
          />
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} content={msg.content} isUser={msg.role === 'user'} />
            ))}
            {/* 流式输出中的消息 */}
            {isStreaming && streamingContent && (
              <ChatMessage content={streamingContent} isUser={false} isStreaming />
            )}
            {/* 流式开始但还没内容 */}
            {isStreaming && !streamingContent && (
              <ChatMessage content="⏳" isUser={false} isStreaming />
            )}
          </>
        )}
      </div>

      {/* 快捷追问（仅当有问题时显示） */}
      {hasIssues && (
        <div className="border-t border-surface-200 px-4 py-2 dark:border-surface-700">
          <QuickActions
            selectedIssueIndex={selectedIssueIndex}
            onSelect={handleQuickAction}
            disabled={isStreaming}
          />
        </div>
      )}

      {/* 输入框 */}
      <div className="border-t border-surface-200 p-3 dark:border-surface-700">
        <ChatInput
          onSend={(msg) => onSend(msg, selectedIssueIndex >= 0 ? selectedIssueIndex : undefined)}
          disabled={isStreaming}
          placeholder={hasIssues ? '输入问题，或点击快捷按钮...' : '询问代码优化建议...'}
        />
      </div>
    </div>
  );
}
