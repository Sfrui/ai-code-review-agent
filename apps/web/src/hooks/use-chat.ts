import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage } from '@ai-review/shared';

// ============================================================
// useChat — 多轮对话 Hook
// 职责：管理对话状态、SSE 流式连接、发送消息
// ============================================================

/** Hook 参数 */
interface UseChatOptions {
  /** 任务 ID */
  taskId: string;
  /** 初始对话历史（可选） */
  initialHistory?: ChatMessage[];
}

/** Hook 返回值 */
interface UseChatReturn {
  /** 对话历史 */
  messages: ChatMessage[];
  /** 当前正在流式输出的内容 */
  streamingContent: string;
  /** 是否正在生成中 */
  isStreaming: boolean;
  /** 发送消息 */
  sendMessage: (message: string, relatedIssueIndex?: number) => Promise<void>;
  /** 清空对话 */
  clearChat: () => Promise<void>;
  /** 错误信息 */
  error: string | null;
}

const API_BASE = '/api/v1';

export function useChat({ taskId, initialHistory = [] }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 清理：组件卸载时取消进行中的请求
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * 发送消息（使用 fetch + ReadableStream 处理 SSE）
   */
  const sendMessage = useCallback(
    async (message: string, relatedIssueIndex?: number) => {
      if (isStreaming) return;

      setError(null);
      setIsStreaming(true);
      setStreamingContent('');

      // 添加用户消息到本地
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
        relatedIssueIndex,
      };
      setMessages((prev) => [...prev, userMessage]);

      // 创建 AbortController
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(`${API_BASE}/review/task/${taskId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ message, relatedIssueIndex }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // 解析 SSE 事件
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              // 尝试解析为 JSON，如果失败则直接作为文本
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'delta') {
                  setStreamingContent((prev) => prev + parsed.data);
                } else if (parsed.type === 'error') {
                  throw new Error(parsed.data);
                }
              } catch {
                setStreamingContent((prev) => prev + data);
              }
            }
          }
        }

        // 流式结束，添加完整 AI 消息
        setStreamingContent((content) => {
          if (content) {
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content,
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }
          return '';
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // 用户主动取消，保留已输出的内容
          setStreamingContent((content) => {
            if (content) {
              const assistantMessage: ChatMessage = {
                role: 'assistant',
                content,
                createdAt: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, assistantMessage]);
            }
            return '';
          });
        } else {
          const errMsg = err instanceof Error ? err.message : String(err);
          setError(errMsg);
          // 添加错误消息
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: `抱歉，处理消息时出错：${errMsg}`,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [taskId, isStreaming],
  );

  /**
   * 清空对话
   */
  const clearChat = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/review/task/${taskId}/chat`, {
        method: 'DELETE',
      });
      setMessages([]);
      setStreamingContent('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [taskId]);

  return {
    messages,
    streamingContent,
    isStreaming,
    sendMessage,
    clearChat,
    error,
  };
}
