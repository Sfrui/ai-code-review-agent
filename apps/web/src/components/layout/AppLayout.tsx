import { Outlet, Link, useLocation } from 'react-router-dom';
import { Code2, History, Settings, Sparkles, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/theme.store';
import { cn } from '@/lib/formatters';

// ============================================================
// AppLayout — 全局布局：侧边栏 + 主内容区
// ============================================================

const navItems = [
  { path: '/review', label: '代码审查', icon: Code2 },
  { path: '/history', label: '历史记录', icon: History },
] as const;

const bottomItems = [
  { path: '/settings', label: 'AI 设置', icon: Settings },
] as const;

export function AppLayout() {
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      {/* 侧边栏 */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-surface-200 bg-white transition-colors duration-200 dark:border-surface-700 dark:bg-surface-900">
        {/* Logo */}
        <Link
          to="/"
          className="flex h-16 items-center gap-3 border-b border-surface-200 px-6 transition-colors dark:border-surface-700"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-surface-900 dark:text-white">
            AI Code Review
          </span>
        </Link>

        {/* 主导航 */}
        <nav className="mt-6 space-y-1 px-3">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white',
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* 底部：设置 + 主题切换 */}
        <div className="mt-auto border-t border-surface-200 px-3 py-4 space-y-1 dark:border-surface-700">
          {bottomItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white',
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 transition-all duration-200 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {isDark ? '亮色模式' : '暗黑模式'}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 flex-1">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
