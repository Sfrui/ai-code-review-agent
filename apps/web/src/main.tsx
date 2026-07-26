import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import './styles/globals.css';

// 初始化暗黑模式
const savedTheme = localStorage.getItem('ai-review-theme');
if (savedTheme) {
  try {
    const parsed = JSON.parse(savedTheme) as { state?: { isDark?: boolean } };
    if (parsed.state?.isDark) {
      document.documentElement.classList.add('dark');
    }
  } catch {
    // 忽略解析错误
  }
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
