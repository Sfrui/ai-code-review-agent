import axios from 'axios';

// ============================================================
// Axios 实例 — 统一 API 请求配置
// ============================================================

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 120_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器：统一错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ?? error.message ?? '网络请求失败';
    console.error(`[API Error] ${message}`);
    return Promise.reject(error);
  },
);

export default api;
