# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Code Review Agent — an AI-powered code review tool. Users submit code, the system detects bugs, security vulnerabilities, performance issues, and style problems via LLMs, then supports multi-turn conversational follow-up with SSE streaming. Supports 11 LLM providers (OpenAI, Claude, DeepSeek, Kimi, Qwen, Doubao, Ollama, etc.) through LangChain.js.

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite 6, Zustand 5, TanStack React Query 5, TailwindCSS 3, Monaco Editor, react-router-dom 7
- **Backend**: NestJS 10 (Express, SWC compiler), MongoDB via Mongoose 8, LangChain.js, Zod for LLM output validation
- **Shared**: `@ai-review/shared` — Zod schemas, TypeScript types, constants, enums
- **Infrastructure**: pnpm 9 workspaces, Husky + commitlint (conventional commits), GitHub Actions CI, Docker multi-stage builds

## Monorepo Structure

pnpm workspaces with 3 packages:

- `packages/shared/` → `@ai-review/shared` (types, schemas, constants)
- `apps/server/` → `@ai-review/server` (NestJS backend)
- `apps/web/` → `@ai-review/web` (React frontend)

**Build order**: shared → server → web (enforced in root build script).

## Commands

```bash
# Development (runs server + web concurrently)
pnpm dev
# Frontend: http://localhost:3333 (Vite, proxies /api to backend)
# Backend: http://localhost:3000 (NestJS, /api/v1 prefix)

# Build
pnpm build              # Builds shared → server → web in order
pnpm build:shared       # Build shared package only

# Lint & Format
pnpm lint               # ESLint (flat config, typescript-eslint + prettier)
pnpm lint:fix           # Auto-fix
pnpm format             # Prettier --write
pnpm format:check       # Prettier --check (used in CI)

# Manual API testing
bash scripts/test-api.sh           # Basic CRUD API tests
bash scripts/test-ai-review.sh     # Full AI review integration test

# Docker
docker compose up --build   # Backend + MongoDB
```

**Note**: There is no automated test framework configured — no unit/e2e test runner exists. Only shell-based manual API test scripts under `scripts/`.

## Architecture

### Backend Module Dependency Graph

```
AppModule
├── ReviewModule     — review task CRUD + AI review execution
│   ├── DatabaseModule  (ReviewTaskRepository, LLMConfigRepository)
│   └── AiModule        (LLMFactory, CodeReviewAgentService)
├── ConfigModule     — LLM settings management
│   ├── DatabaseModule
│   └── AiModule
└── ChatModule       — multi-turn conversation (SSE streaming)
    ├── AiModule
    ├── ConfigModule
    └── DatabaseModule
```

### Key Backend Patterns

- **LLM Provider Factory** (`apps/server/src/modules/ai/llm/llm.factory.ts`): Creates LangChain ChatModel instances for 11 providers based on stored config. All providers are configured via a single MongoDB document (`llm-config`).
- **Zod-based LLM Output Validation** (`apps/server/src/modules/ai/schemas/llm-output.schema.ts`): AI responses are strictly validated against Zod schemas before returning to clients — this is a core reliability mechanism.
- **Global exception handling**: `HttpExceptionFilter` + `TransformInterceptor` applied globally wrap all responses in `{ code, data, message }` format.
- **SSE Streaming** for chat: The chat controller uses NestJS `@Sse` for streaming AI responses. The Vite dev proxy is configured with SSE support.
- **Body parser**: 10MB limit to accommodate large code submissions.

### Key Frontend Patterns

- **Zustand stores**: `review.store.ts` (review state) and `theme.store.ts` (dark mode via class toggle).
- **API layer** (`src/api/`): Axios instance with base URL, organized into `config.api.ts` and `review.api.ts`.
- **React Query** for server state management (queries + mutations for review tasks and config).
- **Route structure**: `/` (home), `/review` (create), `/review/:id` (detail + chat), `/history`, `/settings`.

### API Routes (all under `/api/v1`)

| Method | Path                                | Description               |
| ------ | ----------------------------------- | ------------------------- |
| POST   | `/review/task`                      | Create review task        |
| POST   | `/review/task/:id/run`              | Execute AI review         |
| GET    | `/review/task/list`                 | Paginated task list       |
| GET    | `/review/task/:id`                  | Get task details          |
| POST   | `/review/task/:taskId/chat`         | Send message (SSE stream) |
| GET    | `/review/task/:taskId/chat/history` | Get chat history          |
| DELETE | `/review/task/:taskId/chat`         | Clear chat history        |
| GET    | `/config/llm`                       | Get LLM config            |
| PUT    | `/config/llm`                       | Save LLM config           |
| POST   | `/config/llm/test`                  | Test LLM connection       |

## Conventions

- **Commit messages**: Conventional Commits enforced via commitlint — use `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- **Git hooks**: Pre-commit runs `pnpm lint-staged` (eslint --fix + prettier on staged files).
- **Code style**: Prettier with single quotes, semicolons, trailing commas (all), 100 char print width, LF line endings.
- **ESLint**: Flat config (`eslint.config.mjs`), `no-explicit-any` set to error for web, `consistent-type-imports` enforced in web.
- **Server TypeScript**: CommonJS module, experimental decorators, SWC compiler for fast builds.
- **Web TypeScript**: ESM (`"type": "module"`), react-jsx transform, `noEmit` (Vite handles bundling).
- **Shared package**: Composite project references, ESM output. Server and web both import via `workspace:*`.

## Environment Setup

Copy `.env.example` to `apps/server/.env` and configure `LLM_API_KEY` and other variables. MongoDB must be running locally or via Docker.
