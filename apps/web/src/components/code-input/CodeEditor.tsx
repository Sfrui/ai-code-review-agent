import { useRef, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { detectLanguage } from '@/lib/constants';

// ============================================================
// CodeEditor — Monaco Editor 封装
// ============================================================

interface CodeEditorProps {
  /** 代码内容 */
  value: string;
  /** 内容变化回调 */
  onChange?: (value: string) => void;
  /** 文件名（用于推断语言） */
  fileName?: string;
  /** 语言覆盖 */
  language?: string;
  /** 是否只读 */
  readOnly?: boolean;
  /** 编辑器高度 */
  height?: string;
  /** 编辑器类名 */
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  fileName,
  language,
  readOnly = false,
  height = '500px',
  className,
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const languageId = language ?? (fileName ? detectLanguage(fileName) : 'typescript');

  const handleEditorMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;
    },
    [],
  );

  const handleChange = useCallback(
    (val: string | undefined) => {
      onChange?.(val ?? '');
    },
    [onChange],
  );

  return (
    <div className={`overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700 ${className ?? ''}`}>
      <Editor
        height={height}
        language={languageId}
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: 'line',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}
