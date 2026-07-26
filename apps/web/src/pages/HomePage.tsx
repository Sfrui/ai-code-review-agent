import { Link } from 'react-router-dom';
import { Sparkles, Shield, Zap, Code, ArrowRight } from 'lucide-react';

// ============================================================
// HomePage — 首页：项目简介 + 跳转入口
// ============================================================

export function HomePage() {
  return (
    <div className="space-y-16 py-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
          <Sparkles className="h-4 w-4" />
          AI 驱动的代码审查
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-5xl">
          更智能的代码审查
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-surface-600 dark:text-surface-400">
          利用大语言模型自动审查代码缺陷、安全漏洞和性能问题，
          <br />
          让每一次提交都更加可靠。
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/review" className="btn-primary px-6 py-3 text-base">
            开始审查
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/history" className="btn-secondary px-6 py-3 text-base">
            查看历史
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={Shield}
          title="安全审计"
          description="检测 XSS 注入、敏感信息泄露等安全隐患"
          color="text-red-500"
          bgColor="bg-red-50 dark:bg-red-900/20"
        />
        <FeatureCard
          icon={Code}
          title="缺陷检测"
          description="发现类型错误、空指针、逻辑缺陷等问题"
          color="text-amber-500"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
        />
        <FeatureCard
          icon={Zap}
          title="性能优化"
          description="识别内存泄漏、低效算法、不必要的渲染"
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <FeatureCard
          icon={Sparkles}
          title="代码规范"
          description="检查命名规范、代码结构、可维护性"
          color="text-emerald-500"
          bgColor="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>

      {/* How it works */}
      <div className="card p-8">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">
          工作流程
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <StepCard
            step="1"
            title="粘贴代码"
            description="将需要审查的代码粘贴到编辑器中，或上传代码文件"
          />
          <StepCard
            step="2"
            title="AI 审查"
            description="AI 助手自动分析代码，从多个维度找出潜在问题"
          />
          <StepCard
            step="3"
            title="查看结果"
            description="获取详细的审查报告，包括修改建议和改进方案"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  bgColor,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="card-hover p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-surface-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
        {step}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          {description}
        </p>
      </div>
    </div>
  );
}
