# AI Code Review Agent

> 🤖 AI 驱动的代码审查工具 — 粘贴代码，自动检测缺陷、安全漏洞和性能问题

[![CI](https://github.com/your-username/ai-code-review-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/ai-code-review-agent/actions/workflows/ci.yml)

<!-- 技术栈截图占位 -->
<!-- ![Tech Stack](docs/screenshots/tech-stack.png) -->

## ✨ 功能特性

- 🔍 **多维度代码审查** — 缺陷检测、安全审计、性能分析、规范检查
- 🎯 **AI 驱动** — 基于 LangChain.js + OpenAI/Anthropic Claude
- 📊 **结构化输出** — Zod 强校验，确保 AI 返回可信数据
- 🎨 **现代 UI** — React + TailwindCSS + 暗黑模式
- 📝 **代码编辑器** — Monaco Editor（VS Code 同款）
- 🔄 **实时进度** — 轮询显示审查进度
- 📜 **历史记录** — 持久化存储所有审查结果

<!-- 功能演示截图占位 -->
<!-- ![Demo](docs/screenshots/demo.png) -->

## 🏗️ 架构说明

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  Vite + React 18 + TypeScript + Zustand + React-Query       │
│  TailwindCSS + Monaco Editor                                │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP + SSE
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (NestJS)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │ Review   │  │ AI       │  │ Database                 │  │
│  │ Module   │→ │ Agent    │→ │ Module                   │  │
│  │          │  │ Service  │  │ (Mongoose + MongoDB)     │  │
│  └──────────┘  └──────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Layer (LangChain.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Prompt       │  │ LLM Factory  │  │ Zod Schema       │  │
│  │ Templates    │→ │ (OpenAI/     │→ │ Validation       │  │
│  │              │  │  Claude)     │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ 技术栈

| 层级         | 技术                                                               |
| ------------ | ------------------------------------------------------------------ |
| **前端**     | React 18 + Vite + TypeScript + Zustand + React-Query + TailwindCSS |
| **后端**     | NestJS + TypeScript + LangChain.js                                 |
| **数据库**   | MongoDB + Mongoose                                                 |
| **AI**       | OpenAI GPT-4o / Anthropic Claude + Zod 强校验                      |
| **代码编辑** | Monaco Editor                                                      |
| **代码规范** | ESLint + Prettier + Husky + Commitlint                             |
| **CI/CD**    | GitHub Actions                                                     |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9
- MongoDB >= 6（本地或 Atlas）
- LLM API Key（OpenAI 或 Anthropic）

### 1. 克隆项目

```bash
git clone https://github.com/your-username/ai-code-review-agent.git
cd ai-code-review-agent
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example apps/server/.env

# 编辑 apps/server/.env，填入以下配置：
```

```bash
# 必须配置
LLM_API_KEY=sk-your-api-key-here

# 可选配置（有默认值）
LLM_PROVIDER=openai          # openai | anthropic
LLM_MODEL=gpt-4o             # gpt-4o | claude-sonnet-4-20250514
MONGODB_URI=mongodb://localhost:27017/ai-code-review
PORT=3000
```

### 4. 启动开发服务器

```bash
# 同时启动前端和后端
pnpm dev

# 或分别启动
pnpm dev:web      # → http://localhost:5173
pnpm dev:server   # → http://localhost:3000
```

### 5. 访问应用

打开浏览器访问 `http://localhost:5173`

## 📦 项目结构

```
ai-code-review-agent/
├── packages/shared/          # 共享类型、常量、Zod Schema
├── apps/
│   ├── server/               # NestJS 后端
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── ai/       # AI Agent 模块
│   │       │   ├── review/   # 审查任务模块
│   │       │   └── database/ # 数据库模块
│   │       └── common/       # 过滤器、拦截器
│   └── web/                  # React 前端
│       └── src/
│           ├── pages/        # 页面组件
│           ├── components/   # UI 组件
│           ├── api/          # API 封装
│           ├── stores/       # Zustand 状态
│           └── hooks/        # React-Query hooks
├── .github/workflows/        # CI 配置
└── docs/                     # 文档
```

## 🔧 环境变量说明

| 变量名            | 必填 | 默认值                                     | 说明                               |
| ----------------- | ---- | ------------------------------------------ | ---------------------------------- |
| `LLM_API_KEY`     | ✅   | -                                          | LLM API 密钥                       |
| `LLM_PROVIDER`    | ❌   | `openai`                                   | LLM 提供商：`openai` / `anthropic` |
| `LLM_MODEL`       | ❌   | `gpt-4o`                                   | 模型名称                           |
| `LLM_TEMPERATURE` | ❌   | `0.1`                                      | 温度（0-2，越低越确定）            |
| `LLM_MAX_TOKENS`  | ❌   | `4096`                                     | 最大 token 数                      |
| `LLM_TIMEOUT`     | ❌   | `60000`                                    | 超时时间（毫秒）                   |
| `MONGODB_URI`     | ❌   | `mongodb://localhost:27017/ai-code-review` | MongoDB 连接字符串                 |
| `PORT`            | ❌   | `3000`                                     | 后端端口                           |
| `CORS_ORIGIN`     | ❌   | `http://localhost:5173`                    | 跨域来源                           |

## 🚢 部署

### 前端部署（Vercel）

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置：
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm install && pnpm --filter @ai-review/shared build && pnpm --filter @ai-review/web build`
   - **Output Directory**: `dist`
4. 添加环境变量（如需要）
5. 部署

### 后端部署（Render / Railway）

1. 使用提供的 `Dockerfile` 部署
2. 配置环境变量：
   - `MONGODB_URI`（推荐使用 MongoDB Atlas）
   - `LLM_API_KEY`
   - `LLM_PROVIDER`
   - `LLM_MODEL`
3. 部署服务

### Docker 部署

```bash
# 使用 Docker Compose
docker-compose up -d
```

## 📝 开发规范

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat:     新功能
fix:      修复
docs:     文档
style:    格式
refactor: 重构
perf:     性能优化
test:     测试
chore:    杂项
```

### 代码规范

```bash
pnpm lint          # 检查代码
pnpm lint:fix      # 自动修复
pnpm format        # 格式化代码
```

## 🔮 未来拓展

- [ ] 用户认证系统（JWT / OAuth）
- [ ] 多文件批量审查
- [ ] 自定义审查规则
- [ ] 审查结果导出（PDF / Markdown）
- [ ] 团队协作功能
- [ ] Webhook 通知
- [ ] 支持更多编程语言
- [ ] 审查结果对比（不同版本）
- [ ] 代码片段分享功能
- [ ] 集成 GitHub/GitLab PR 自动审查

## 📄 License

MIT

---

<p align="center">
  <sub>Built with ❤️ using React + NestJS + LangChain.js</sub>
</p>
