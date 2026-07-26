# ============================================================
# React 前端 Dockerfile
# 多阶段构建：builder → nginx:alpine
# ============================================================

# 阶段 1: 构建
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# 复制依赖文件
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

# 构建 shared 包
RUN pnpm --filter @ai-review/shared build

# 构建 web
RUN pnpm --filter @ai-review/web build

# 阶段 2: 生产（Nginx）
FROM nginx:alpine AS production

# 复制自定义 Nginx 配置
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
