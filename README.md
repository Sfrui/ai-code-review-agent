<div align="center">

<!-- 动态标题 -->
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=3776AB&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=100&lines=%F0%9F%A4%96+AI+Code+Review+Agent;Intelligent+Code+Review+Powered+by+LLM" alt="Typing SVG" />

<p align="center">
  <em>🤖 AI 驱动的智能代码审查工具 — 粘贴代码，自动检测缺陷、安全漏洞和性能问题</em>
</p>

<!-- 项目简介 -->
<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/LangChain.js-FF6B35?style=flat&logo=chainlink&logoColor=white" alt="LangChain" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p>
  <img src="https://img.shields.io/github/stars/Sfrui/ai-code-review-agent?style=social" alt="Stars" />
  <img src="https://img.shields.io/github/forks/Sfrui/ai-code-review-agent?style=social" alt="Forks" />
  <img src="https://img.shields.io/github/issues/Sfrui/ai-code-review-agent" alt="Issues" />
  <img src="https://img.shields.io/github/license/Sfrui/ai-code-review-agent" alt="License" />
</p>

<a href="https://www.sfrui.cloud" target="_blank">
  <img src="https://img.shields.io/badge/-Live%20Demo-00C853?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
</a>

<!-- 网站截图预览 -->
<a href="https://www.sfrui.cloud" target="_blank">
  <img src="https://www.sfrui.cloud/preview.png" alt="Website Preview" width="700" />
</a>

</div>

---

## :sparkles: 项目亮点

<table>
  <tr>
    <td width="50%" valign="top">

### :mag: 多维度代码审查

- 🐛 **缺陷检测** — 空指针、类型错误、逻辑漏洞
- 🔒 **安全审计** — SQL注入、XSS、敏感信息泄露
- ⚡ **性能分析** — 复杂度过高、内存泄漏、N+1查询
- 📏 **代码规范** — 命名规范、重复代码、复杂度过高

    </td>
    <td width="50%" valign="top">

### :brain: AI 驱动

- 🌐 支持 **OpenAI / Anthropic / DeepSeek** 等主流模型
- 📊 **Zod 强校验** — 确保 AI 返回可信结构化数据
- 🔄 **智能重试** — 失败自动重试，提高成功率
- ⚙️ **在线配置** — 网页端即可切换模型和参数

    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">

### :speech_balloon: 多轮对话追问

- 💬 **追问讨论** — 审查后可继续与 AI 深入讨论每个问题
- 🔄 **SSE 流式输出** — AI 回复逐字显示，实时流畅
- ⚡ **快捷追问** — 一键提问"如何修复""详细解释"等
- 📝 **对话持久化** — 历史记录自动保存到数据库

    </td>
    <td width="50%" valign="top">

### :wrench: 便捷功能

- 🔌 **测试连接** — 设置页面一键验证 API 是否可用
- ⏱️ **延迟显示** — 显示 API 响应延迟
- 🔒 **智能错误提示** — 自动识别 401/403/429/网络错误
- 📦 **大代码支持** — 支持 10MB 大段代码提交

    </td>
  </tr>

</table>

## :camera: 效果预览

<div align="center">

<a href="https://www.sfrui.cloud" target="_blank">
  <img src="https://www.sfrui.cloud/preview.png" alt="AI Code Review Agent Preview" width="800" />
</a>

<br/>

<a href="https://www.sfrui.cloud" target="_blank">
  <img src="https://img.shields.io/badge/-🚀_立即体验-00C853?style=for-the-badge&logo=vercel&logoColor=white" alt="Try Now" />
</a>

_粘贴代码 → 一键分析 → 获得专业审查报告_

</div>

## :hammer_and_wrench: 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│   Vite + React 18 + TypeScript + Zustand + TailwindCSS          │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│   │ Monaco      │ │ React-Query │ │ Zustand                 │   │
│   │ Editor      │ │ (Data)      │ │ (State)                 │   │
│   └─────────────┘ └─────────────┘ └─────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP + REST API
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend (NestJS)                          │
│   ┌───────────┐  ┌────────────┐  ┌─────────────────────────┐   │
│   │ Config    │→ │ AI Agent   │→ │ MongoDB                 │   │
│   │ Module    │  │ Service    │  │ (Mongoose)              │   │
│   └───────────┘  └────────────┘  └─────────────────────────┘   │
│                       │                                         │
│                       ▼                                         │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              LangChain.js + Zod Schema                  │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Provider Layer                             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│   │ OpenAI   │ │ Claude   │ │ DeepSeek │ │  自定义   │         │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## :rocket: 快速开始

### 环境要求

| 环境    | 版本  |
| ------- | ----- |
| Node.js | >= 18 |
| pnpm    | >= 9  |
| MongoDB | >= 6  |

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/Sfrui/ai-code-review-agent.git
cd ai-code-review-agent

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example apps/server/.env
# 编辑 apps/server/.env，填入 LLM_API_KEY

# 4. 启动开发服务器
pnpm dev
```

访问 http://localhost:5173 开始使用 :tada:

### Docker 部署

```bash
# 一键部署
git clone https://github.com/Sfrui/ai-code-review-agent.git
cd ai-code-review-agent
chmod +x server-deploy.sh
./server-deploy.sh
```

## :gear: 支持的 AI 模型

<div align="center">

| 提供商                                                                                                             | 模型          | 状态 |
| ------------------------------------------------------------------------------------------------------------------ | ------------- | ---- |
| <img src="https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white" alt="OpenAI" />       | GPT-4o        | ✅   |
| <img src="https://img.shields.io/badge/Anthropic-D4A574?style=flat&logo=anthropic&logoColor=white" alt="Claude" /> | Claude Sonnet | ✅   |
| <img src="https://img.shields.io/badge/DeepSeek-0066FF?style=flat&logo=datacamp&logoColor=white" alt="DeepSeek" /> | DeepSeek Chat | ✅   |
| <img src="https://img.shields.io/badge/Moonshot-1A1A2E?style=flat&logo=kotlin&logoColor=white" alt="Moonshot" />   | Kimi          | ✅   |
| <img src="https://img.shields.io/badge/智谱GLM-4183C4?style=flat" alt="Zhipu" />                                   | GLM-4         | ✅   |
| <img src="https://img.shields.io/badge/通义千问-FF6A00?style=flat" alt="Qwen" />                                   | Qwen Plus     | ✅   |

</div>

## :package: 项目结构

<details>
<summary>点击展开项目结构</summary>

```
ai-code-review-agent/
├── apps/
│   ├── server/                    # NestJS 后端
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── ai/            # 🤖 AI Agent 模块
│   │       │   ├── config/        # ⚙️ 配置模块
│   │       │   ├── database/      # 🗄️ 数据库模块
│   │       │   └── review/        # 📋 审查模块
│   │       └── common/            # 🔧 通用工具
│   └── web/                       # React 前端
│       └── src/
│           ├── pages/             # 📄 页面组件
│           ├── components/        # 🧩 UI 组件
│           ├── api/               # 🌐 API 封装
│           ├── stores/            # 📦 状态管理
│           └── hooks/             # 🪝 React Hooks
├── packages/shared/               # 📚 共享类型和 Schema
├── docker-compose.prod.yml        # 🐳 Docker 编排
├── deploy.sh                      # 🚀 部署脚本
└── README.md                      # 📖 项目说明
```

</details>

## :globe_with_meridians: 环境变量

| 变量名            |        必填        | 默认值                                     | 说明         |
| ----------------- | :----------------: | ------------------------------------------ | ------------ |
| `LLM_API_KEY`     | :white_check_mark: | -                                          | LLM API 密钥 |
| `LLM_PROVIDER`    |                    | `openai`                                   | 提供商       |
| `LLM_MODEL`       |                    | `gpt-4o`                                   | 模型名称     |
| `LLM_TEMPERATURE` |                    | `0.1`                                      | 温度         |
| `LLM_MAX_TOKENS`  |                    | `4096`                                     | 最大 token   |
| `LLM_TIMEOUT`     |                    | `60000`                                    | 超时时间     |
| `MONGODB_URI`     |                    | `mongodb://localhost:27017/ai-code-review` | MongoDB 地址 |
| `PORT`            |                    | `3000`                                     | 服务端口     |

## :chart_with_upwards_trends: GitHub Stats

<div align="center">

<img src="https://github-readme-stats.vercel.app/api?username=Sfrui&show_icons=true&theme=radical&hide_border=true" alt="GitHub Stats" />
<img src="https://github-readme-streak-stats.herokuapp.com/?user=Sfrui&theme=radical&hide_border=true" alt="Streak Stats" />

</div>

## :handshake: 贡献

欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## :bookmark_tabs: 更新日志

### [v0.2.0] - 2026-08-05

#### :tada: 新增

- 多轮对话追问功能（SSE 流式输出）
- 快捷追问按钮（如何修复、详细解释、多种方案、修复后测试）
- 对话历史持久化到数据库
- AI 设置页面「测试连接」按钮
- API 延迟显示和智能错误提示

#### :bug: 修复

- 修复 SSE 流式响应被拦截器破坏的问题
- 修复大段代码提交 500 错误（body-parser 1MB → 10MB）
- 修复 Vite 代理缓冲导致 SSE 中断的问题

### [v0.1.0] - 2024-12-26

#### :tada: 新增

- 多维度代码审查（缺陷、安全、性能、规范）
- 支持多种 AI 模型（OpenAI、Claude、DeepSeek 等）
- Monaco Editor 代码编辑器
- 实时审查进度显示
- 历史记录持久化
- Docker 一键部署
- SSL 证书自动配置

## :memo: License

本项目采用 [MIT License](LICENSE) 开源协议

---

<div align="center">

**如果觉得有用，请给个 :star: 支持一下！**

Made with :heart: by [Sfrui](https://github.com/Sfrui)

</div>
