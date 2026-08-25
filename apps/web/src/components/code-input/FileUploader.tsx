import { useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';
import { detectLanguage } from '@/lib/constants';

// ============================================================
// FileUploader — 代码文件上传组件
// ============================================================

interface FileUploaderProps {
  /** 文件上传回调 */
  onFileSelect: (params: { fileName: string; content: string; language: string }) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

export function FileUploader({ onFileSelect, disabled = false }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const language = detectLanguage(file.name);
        onFileSelect({ fileName: file.name, content, language });
      };
      reader.readAsText(file);
    },
    [onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile],
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-surface-50 p-8 text-center transition-all duration-200 hover:border-primary-400 hover:bg-primary-50/50 dark:border-surface-600 dark:bg-surface-800 dark:hover:border-primary-500 dark:hover:bg-surface-700 ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".ts,.tsx,.js,.jsx,.py,.java,.go,.rs,.cs,.cpp,.cc,.c,.h,.php,.rb,.swift,.kt,.txt,.md"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <Upload className="h-10 w-10 text-surface-400 dark:text-surface-500" />
      <p className="mt-3 text-sm font-medium text-surface-700 dark:text-surface-300">
        点击上传或拖拽代码文件
      </p>
      <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
        支持 .ts .js .py .c .java .go .rs 等常见代码文件
      </p>
    </div>
  );
}
