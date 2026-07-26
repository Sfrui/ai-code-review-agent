import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// Theme Store — 暗黑模式切换
// ============================================================

interface ThemeState {
  /** 是否暗黑模式 */
  isDark: boolean;
  /** 切换主题 */
  toggleTheme: () => void;
  /** 设置主题 */
  setTheme: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark:
        typeof window !== 'undefined'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : false,
      toggleTheme: () =>
        set((state) => {
          const next = !state.isDark;
          document.documentElement.classList.toggle('dark', next);
          return { isDark: next };
        }),
      setTheme: (dark) =>
        set(() => {
          document.documentElement.classList.toggle('dark', dark);
          return { isDark: dark };
        }),
    }),
    {
      name: 'ai-review-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.isDark) {
          document.documentElement.classList.add('dark');
        }
      },
    },
  ),
);
