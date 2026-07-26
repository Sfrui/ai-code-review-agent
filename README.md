# AI Code Review Agent

> 🤖 AI 驱动的智能代码审查工具 — 粘贴代码，自动检测缺陷、安全漏洞和性能问题

🔗 **在线体验**: [https://sfrui.cloud](https://sfrui.cloud)

---

## ✨ 功能特性

- 🔍 **多维度代码审查** — 缺陷检测、安全审计、性能分析、代码规范
- 🎯 **AI 驱动** — 支持 OpenAI / Anthropic / DeepSeek / 国内主流大模型
- 📊 **结构化输出** — Zod 强校验，确保 AI 返回可信数据
- 🎨 **现代 UI** — React + TailwindCSS + 暗黑模式
- 📝 **代码编辑器** — Monaco Editor（VS Code 同款）
- 🔄 **实时进度** — 轮询显示审查进度
- 📜 **历史记录** — 持久化存储所有审查结果
- 🌐 **一键部署** — Docker Compose 部署，开箱即用

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
│  │ Module   │→ │ Agent    │→ │ (Mongoose + MongoDB)     │  │
│  │          │  │ Service  │  │                          │  │
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
| **AI**       | OpenAI / Anthropic / DeepSeek + Zod 强校验                         |
| **代码编辑** | Monaco Editor                                                      |
| **代码规范** | ESLint + Prettier + Husky + Commitlint                             |
| **部署**     | Docker + Nginx + Let's Encrypt SSL                                 |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9
- MongoDB >= 6（本地或 Atlas）
- LLM API Key（OpenAI / Anthropic / DeepSeek 等）

### 1. 克隆项目

```bash
git clone https://github.com/Sfrui/ai-code-review-agent.git
cd ai-code-review-agent
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example apps/server/.env
```

编辑 `apps/server/.env`，填入 LLM API Key（也可在网页端配置）：

```bash
LLM_API_KEY=sk-your-api-key-here
LLM_PROVIDER=openai          # openai | anthropic | deepseek
LLM_MODEL=gpt-4o
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
│   │       │   ├── config/   # LLM 配置模块
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

## 🚢 部署

### Docker 一键部署（推荐）

```bash
# 克隆代码
git clone https://github.com/Sfrui/ai-code-review-agent.git
cd ai-code-review-agent

# 一键部署
chmod +x server-deploy.sh
./server-deploy.sh
```

### 配置 SSL 证书

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 环境变量说明

| 变量名            | 必填 | 默认值                                     | 说明                             |
| ----------------- | ---- | ------------------------------------------ | -------------------------------- |
| `LLM_API_KEY`     | ✅   | -                                          | LLM API 密钥（也可在网页端配置） |
| `LLM_PROVIDER`    | ❌   | `openai`                                   | LLM 提供商                       |
| `LLM_MODEL`       | ❌   | `gpt-4o`                                   | 模型名称                         |
| `LLM_TEMPERATURE` | ❌   | `0.1`                                      | 温度（0-2，越低越确定）          |
| `LLM_MAX_TOKENS`  | ❌   | `4096`                                     | 最大 token 数                    |
| `LLM_TIMEOUT`     | ❌   | `60000`                                    | 超时时间（毫秒）                 |
| `MONGODB_URI`     | ❌   | `mongodb://localhost:27017/ai-code-review` | MongoDB 连接字符串               |
| `PORT`            | ❌   | `3000`                                     | 后端端口                         |
| `CORS_ORIGIN`     | ❌   | `http://localhost:5173`                    | 跨域来源                         |

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
- [ ] 集成 GitHub/GitLab PR 自动审查

## 📄 License

MIT

---

<p align="center">
  <sub>Built with ❤️ using React + NestJS + LangChain.js</sub>
</p>
