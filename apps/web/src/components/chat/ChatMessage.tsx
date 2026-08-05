import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/formatters';

// ============================================================
// ChatMessage — 单条对话消息
// ============================================================

interface ChatMessageProps {
  /** 消息内容 */
  content: string;
  /** 是否是用户消息 */
  isUser: boolean;
  /** 是否是流式输出中 */
  isStreaming?: boolean;
}

export function ChatMessage({ content, isUser, isStreaming }: ChatMessageProps) {
  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* 头像 */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
            : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* 消息气泡 */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-200',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-pre:my-2 prose-pre:bg-surface-900 prose-pre:text-surface-100 prose-code:text-primary-600 dark:prose-code:text-primary-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {content || '⏳'}
            </ReactMarkdown>
            {isStreaming && (
              <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary-500" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
