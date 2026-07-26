# 部署指南

本文档提供完整的项目部署步骤，包括前端 Vercel 部署和后端 Render/Railway 部署。

---

## 前提条件

1. GitHub 账号
2. Vercel 账号（前端部署）
3. Render 或 Railway 账号（后端部署）
4. MongoDB Atlas 账号（数据库）
5. OpenAI 或 Anthropic API Key

---

## 1. 数据库配置（MongoDB Atlas）

### 步骤

1. 访问 [MongoDB Atlas](https://www.mongodb.com/atlas)
2. 创建免费集群（M0 Sandbox）
3. 创建数据库用户（Database Access）
4. 添加 IP 白名单（Network Access）→ 允许所有 IP（0.0.0.0/0）
5. 获取连接字符串：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai-code-review?retryWrites=true&w=majority
   ```

---

## 2. 前端部署（Vercel）

### 步骤

1. **推送到 GitHub**

   ```bash
   git add .
   git commit -m "feat: init project"
   git push origin main
   ```

2. **在 Vercel 导入项目**
   - 访问 [Vercel](https://vercel.com)
   - 点击 "Add New..." → "Project"
   - 选择 GitHub 仓库

3. **配置构建设置**
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**:
     ```bash
     pnpm install && pnpm --filter @ai-review/shared build && pnpm --filter @ai-review/web build
     ```
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

4. **配置环境变量**（可选）
   - 如果需要，添加环境变量

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成
   - 获得部署 URL（如 `https://ai-code-review.vercel.app`）

### 自定义域名（可选）

1. 在 Vercel 项目设置 → "Domains"
2. 添加自定义域名
3. 按提示配置 DNS

---

## 3. 后端部署（Render）

### 步骤

1. **在 Render 创建 Web Service**
   - 访问 [Render](https://render.com)
   - 点击 "New" → "Web Service"
   - 连接 GitHub 仓库

2. **配置服务**
   - **Name**: `ai-code-review-server`
   - **Runtime**: Docker
   - **Dockerfile Path**: `apps/server/Dockerfile`
   - **Port**: `3000`

3. **配置环境变量**

   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai-code-review?retryWrites=true&w=majority
   LLM_API_KEY=sk-your-api-key-here
   LLM_PROVIDER=openai
   LLM_MODEL=gpt-4o
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

4. **部署**
   - 点击 "Create Web Service"
   - 等待构建完成
   - 获得部署 URL（如 `https://ai-code-review-server.onrender.com`）

### Railway 部署（替代方案）

1. 访问 [Railway](https://railway.app)
2. 创建新项目 → 选择 GitHub 仓库
3. 添加 MongoDB 插件
4. 配置环境变量
5. 部署

---

## 4. 更新前端 API 地址

部署完成后，需要更新前端的 API 地址：

### 方法 1：环境变量（推荐）

在 Vercel 项目设置中添加环境变量：

```
VITE_API_URL=https://ai-code-review-server.onrender.com
```

然后修改 `apps/web/src/api/index.ts`：

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  // ...
});
```

### 方法 2：Vercel 代理配置

在 `apps/web/vercel.json` 中添加代理：

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ai-code-review-server.onrender.com/api/:path*"
    }
  ]
}
```

---

## 5. 验证部署

### 前端验证

1. 访问 Vercel 部署 URL
2. 检查页面是否正常加载
3. 检查暗黑模式切换

### 后端验证

1. 访问健康检查接口：

   ```bash
   curl https://ai-code-review-server.onrender.com/api/v1/health
   ```

2. 创建测试任务：

   ```bash
   curl -X POST https://ai-code-review-server.onrender.com/api/v1/review/task \
     -H "Content-Type: application/json" \
     -d '{"codeName":"test.ts","codeContent":"const x = 1;"}'
   ```

3. 执行 AI 审查：
   ```bash
   curl -X POST https://ai-code-review-server.onrender.com/api/v1/review/task/<TASK_ID>/run
   ```

---

## 常见问题

### Q: Render 部署后服务休眠

Render 免费版会在 15 分钟无请求后休眠。解决方案：

1. 使用 UptimeRobot 等工具定期 ping 服务
2. 升级到付费版

### Q: MongoDB 连接失败

检查：

1. IP 白名单是否包含 0.0.0.0/0
2. 数据库用户名密码是否正确
3. 连接字符串格式是否正确

### Q: LLM 调用超时

检查：

1. API Key 是否有效
2. 网络是否能访问 OpenAI/Anthropic API
3. 尝试增加 `LLM_TIMEOUT` 值

---

## 成本估算

### 免费额度

- **Vercel**: 100GB 带宽/月
- **Render**: 750 小时/月（足够个人项目）
- **MongoDB Atlas**: 512MB 存储
- **OpenAI**: 新用户 $5 额度

### 总成本

个人项目使用免费额度即可，预计 **$0/月**。
