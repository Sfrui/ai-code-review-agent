import { useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  FileCode,
  AlertCircle,
  GitCompare,
  Filter,
} from 'lucide-react';
import { CodeEditor } from '@/components/code-input/CodeEditor';
import { ReviewSummary } from '@/components/review/ReviewSummary';
import { IssueCard } from '@/components/review/IssueCard';
import { DiffView } from '@/components/review/DiffView';
import { ProgressIndicator } from '@/components/review/ProgressIndicator';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useTaskDetail, useRunTask } from '@/hooks/use-review';
import { useChat } from '@/hooks/use-chat';
import { getStatusConfig, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/formatters';

// ============================================================
// ReviewDetailPage — 审查详情页（含多轮对话）
// ============================================================

type TabKey = 'code' | 'issues' | 'diff';
type SeverityFilter = 'all' | 'error' | 'warning' | 'info';

const severityOptions = [
  { value: 'all' as const, label: '全部', count: null },
  {
    value: 'error' as const,
    label: '严重',
    color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  },
  {
    value: 'warning' as const,
    label: '警告',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  },
  {
    value: 'info' as const,
    label: '建议',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  },
] as const;

export function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('code');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [selectedIssueIndex, setSelectedIssueIndex] = useState(0);

  const { data: response, isLoading, error, refetch } = useTaskDetail(id ?? '');
  const runTask = useRunTask();

  const task = response?.data;

  // 多轮对话 Hook
  const {
    messages: chatMessages,
    streamingContent,
    isStreaming,
    sendMessage: sendChatMessage,
    clearChat,
  } = useChat({
    taskId: id ?? '',
    initialHistory: [],
  });

  // 筛选后的问题列表
  const filteredIssues = useMemo(() => {
    if (!task?.reviewResult) return [];
    if (severityFilter === 'all') return task.reviewResult.issues;
    return task.reviewResult.issues.filter((issue) => issue.severity === severityFilter);
  }, [task?.reviewResult, severityFilter]);

  // 各等级问题数量
  const issueCounts = useMemo(() => {
    if (!task?.reviewResult) return { all: 0, error: 0, warning: 0, info: 0 };
    const issues = task.reviewResult.issues;
    return {
      all: issues.length,
      error: issues.filter((i) => i.severity === 'error').length,
      warning: issues.filter((i) => i.severity === 'warning').length,
      info: issues.filter((i) => i.severity === 'info').length,
    };
  }, [task?.reviewResult]);

  const handleRun = useCallback(async () => {
    if (!id) return;
    try {
      await runTask.mutateAsync(id);
    } catch (err) {
      console.error('执行审查失败:', err);
    }
  }, [id, runTask]);

  // Issue 追问回调
  const handleAskIssue = useCallback(
    (issueIndex: number) => {
      setSelectedIssueIndex(issueIndex);
      const issue = task?.reviewResult?.issues[issueIndex];
      if (issue) {
        const message = `请详细解释第 ${issueIndex + 1} 个问题（行 ${issue.line}）：${issue.message}。这个问题为什么重要？会造成什么影响？`;
        sendChatMessage(message, issueIndex);
      }
    },
    [task?.reviewResult?.issues, sendChatMessage],
  );

  // 发送聊天消息
  const handleSendMessage = useCallback(
    (message: string, relatedIssueIndex?: number) => {
      sendChatMessage(message, relatedIssueIndex ?? selectedIssueIndex);
    },
    [sendChatMessage, selectedIssueIndex],
  );

  // 加载中
  if (isLoading) {
    return <LoadingSpinner text="加载任务详情..." />;
  }

  // 错误
  if (error || !task) {
    return <ErrorState message="加载任务详情失败" onRetry={() => refetch()} />;
  }

  const statusConfig = getStatusConfig(task.status);
  const hasResult = task.reviewResult !== null;
  const issueCount = task.reviewResult?.issues.length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 返回按钮 + 标题 */}
      <div className="flex items-center gap-4">
        <Link
          to="/history"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{task.codeName}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-surface-500 dark:text-surface-400">
            <span className={statusConfig.className}>{statusConfig.label}</span>
            <span>·</span>
            <span>{formatDate(task.createdAt)}</span>
            {hasResult && task.reviewResult && (
              <>
                <span>·</span>
                <span>评分 {task.reviewResult.score}</span>
                <span>·</span>
                <span>{task.reviewResult.issues.length} 个问题</span>
              </>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        {(task.status === 'pending' || task.status === 'fail') && (
          <button onClick={handleRun} disabled={runTask.isPending} className="btn-primary">
            {runTask.isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : task.status === 'fail' ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {task.status === 'fail' ? '重新审查' : '开始审查'}
          </button>
        )}
      </div>

      {/* 执行进度指示器 */}
      {(task.status === 'pending' || task.status === 'running') && (
        <ProgressIndicator status={task.status} />
      )}

      {/* 审查失败提示 */}
      {task.status === 'fail' && (
        <div className="card border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">
              审查任务执行失败，请点击上方按钮重试
            </p>
          </div>
        </div>
      )}

      {/* 审查结果摘要 */}
      {hasResult && task.reviewResult && <ReviewSummary reviewResult={task.reviewResult} />}

      {/* 主体内容：左右分栏 */}
      {hasResult && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 左栏：代码 + 问题 */}
          <div className="space-y-4">
            {/* Tab 切换 */}
            <div className="border-b border-surface-200 dark:border-surface-700">
              <div className="flex gap-1">
                {[
                  { key: 'code' as const, label: '原始代码', icon: FileCode },
                  {
                    key: 'issues' as const,
                    label: `问题列表 (${issueCount})`,
                    icon: AlertCircle,
                  },
                  { key: 'diff' as const, label: '修改对比', icon: GitCompare },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all duration-200',
                      activeTab === key
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab 内容 */}
            <div className="animate-fade-in">
              {activeTab === 'code' && (
                <CodeEditor
                  value={task.codeContent}
                  fileName={task.codeName}
                  readOnly
                  height="500px"
                />
              )}

              {activeTab === 'issues' && (
                <div className="space-y-4">
                  {/* 问题筛选器 */}
                  {(task.reviewResult?.issues.length ?? 0) > 0 && (
                    <div className="card p-4">
                      <div className="flex items-center gap-3">
                        <Filter className="h-4 w-4 text-surface-500" />
                        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                          筛选：
                        </span>
                        <div className="flex gap-2">
                          {severityOptions.map((option) => {
                            const count =
                              option.value === 'all' ? issueCounts.all : issueCounts[option.value];
                            const isActive = severityFilter === option.value;
                            return (
                              <button
                                key={option.value}
                                onClick={() => setSeverityFilter(option.value)}
                                className={cn(
                                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
                                  isActive
                                    ? option.value === 'all'
                                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                      : option.color
                                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700',
                                )}
                              >
                                {option.label}
                                <span className="text-xs opacity-70">({count})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 问题列表 */}
                  {filteredIssues.length === 0 ? (
                    <EmptyState
                      icon={AlertCircle}
                      title={
                        severityFilter === 'all'
                          ? '没有发现问题'
                          : `没有${
                              severityFilter === 'error'
                                ? '严重'
                                : severityFilter === 'warning'
                                  ? '警告'
                                  : '建议'
                            }级别的问题`
                      }
                      description={
                        severityFilter === 'all'
                          ? '代码质量很好，继续保持！'
                          : '尝试切换筛选条件查看其他问题'
                      }
                    />
                  ) : (
                    filteredIssues.map((issue, index) => (
                      <IssueCard
                        key={`${issue.line}-${index}`}
                        issue={issue}
                        index={index}
                        onAskClick={handleAskIssue}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'diff' && task.reviewResult && (
                <DiffView
                  oldCode={task.codeContent}
                  newCode={task.reviewResult.issues
                    .filter((i) => i.fixedCode)
                    .reduce((code, issue) => {
                      const lines = code.split('\n');
                      if (issue.fixedCode) {
                        lines[issue.line - 1] = issue.fixedCode;
                      }
                      return lines.join('\n');
                    }, task.codeContent)}
                  fileName={task.codeName}
                />
              )}
            </div>
          </div>

          {/* 右栏：对话面板 */}
          <div className="lg:sticky lg:top-6 lg:self-start" style={{ height: '600px' }}>
            <ChatPanel
              messages={chatMessages}
              streamingContent={streamingContent}
              isStreaming={isStreaming}
              issueCount={issueCount}
              selectedIssueIndex={selectedIssueIndex}
              onSelectIssue={setSelectedIssueIndex}
              onSend={handleSendMessage}
              onClear={clearChat}
            />
          </div>
        </div>
      )}
    </div>
  );
}
