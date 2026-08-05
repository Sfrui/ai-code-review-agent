import { useState, useCallback, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

// ============================================================
// ChatInput — 消息输入框
// ============================================================

interface ChatInputProps {
  /** 发送消息回调 */
  onSend: (message: string) => void;
  /** 是否正在生成中 */
  disabled?: boolean;
  /** 占位文本 */
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = '输入问题...',
}: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex items-end gap-2 rounded-xl border border-surface-200 bg-white p-2 dark:border-surface-700 dark:bg-surface-800">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-surface-800 placeholder-surface-400 outline-none disabled:opacity-50 dark:text-surface-200"
        style={{ maxHeight: '120px' }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:opacity-40 disabled:hover:bg-primary-600"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}
