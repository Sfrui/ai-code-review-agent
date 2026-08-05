import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3333,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 支持 SSE 流式输出
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // 禁用请求缓冲，确保 SSE 流不中断
            proxyReq.setHeader('X-Accel-Buffering', 'no');
          });
          proxy.on('proxyRes', (proxyRes) => {
            // 禁用 SSE 响应的缓冲
            if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
              proxyRes.headers['cache-control'] = 'no-cache';
              proxyRes.headers['connection'] = 'keep-alive';
              proxyRes.headers['x-accel-buffering'] = 'no';
            }
          });
        },
      },
    },
  },
});
