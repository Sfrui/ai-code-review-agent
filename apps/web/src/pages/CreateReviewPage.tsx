import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Upload, Trash2 } from 'lucide-react';
import { CodeEditor } from '@/components/code-input/CodeEditor';
import { FileUploader } from '@/components/code-input/FileUploader';
import { useReviewStore } from '@/stores/review.store';
import { useCreateTask } from '@/hooks/use-review';

// ============================================================
// CreateReviewPage — 创建代码审查页面
// ============================================================

export function CreateReviewPage() {
  const navigate = useNavigate();
  const { codeInput, codeName, setCodeInput, setCodeName, clearInput } = useReviewStore();
  const createTask = useCreateTask();
  const [showUpload, setShowUpload] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!codeInput.trim()) return;

    try {
      const result = await createTask.mutateAsync({
        codeName,
        codeContent: codeInput,
      });
      const taskId = result.data.id;
      navigate(`/review/${taskId}`);
    } catch (error) {
      console.error('创建任务失败:', error);
    }
  }, [codeInput, codeName, createTask, navigate]);

  const handleFileSelect = useCallback(
    (params: { fileName: string; content: string; language: string }) => {
      setCodeName(params.fileName);
      setCodeInput(params.content);
      setShowUpload(false);
    },
    [setCodeName, setCodeInput],
  );

  const handleClear = useCallback(() => {
    clearInput();
  }, [clearInput]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          创建代码审查
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          粘贴或上传代码，AI 将自动审查代码质量
        </p>
      </div>

      {/* 文件名输入 */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
            文件名
          </label>
          <input
            type="text"
            value={codeName}
            onChange={(e) => setCodeName(e.target.value)}
            className="input"
            placeholder="例如: app.ts"
          />
        </div>
        <div className="flex gap-2 pt-6">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn-secondary"
          >
            <Upload className="h-4 w-4" />
            上传文件
          </button>
          <button
            onClick={handleClear}
            className="btn-secondary text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            disabled={!codeInput}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 文件上传区域 */}
      {showUpload && (
        <div className="animate-slide-down">
          <FileUploader onFileSelect={handleFileSelect} />
        </div>
      )}

      {/* 代码编辑器 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
          代码内容
        </label>
        <CodeEditor
          value={codeInput}
          onChange={setCodeInput}
          fileName={codeName}
          height="450px"
        />
      </div>

      {/* 提交按钮 */}
      <div className="flex items-center justify-between rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
        <p className="text-sm text-surface-500 dark:text-surface-400">
          {codeInput
            ? `已输入 ${codeInput.split('\n').length} 行代码`
            : '请在上方编辑器中输入代码'}
        </p>
        <button
          onClick={handleSubmit}
          disabled={!codeInput.trim() || createTask.isPending}
          className="btn-primary"
        >
          {createTask.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              创建中...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              开始审查
            </>
          )}
        </button>
      </div>

      {/* 错误提示 */}
      {createTask.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          创建任务失败，请检查网络连接后重试
        </div>
      )}
    </div>
  );
}
