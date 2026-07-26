# AI 代码审查接口测试用例

## 前提条件

1. 启动 MongoDB
2. 配置 `apps/server/.env` 中的 `LLM_API_KEY`
3. 启动后端：`pnpm dev:server`

---

## 完整测试流程

### Step 1: 创建审查任务

```bash
curl -X POST http://localhost:3000/api/v1/review/task \
  -H "Content-Type: application/json" \
  -d '{
    "codeName": "example.ts",
    "codeContent": "function add(a, b) {\n  return a + b;\n}\n\nconst result = add(1, \"2\");\nconsole.log(result);\n\n// 类型不安全\nconst data: any = getData();\nconsole.log(data.foo.bar);"
  }'
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "codeName": "example.ts",
    "codeContent": "...",
    "reviewResult": null,
    "status": "pending",
    "createdAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### Step 2: 执行 AI 审查

```bash
# 将 <TASK_ID> 替换为 Step 1 返回的 id
curl -X POST http://localhost:3000/api/v1/review/task/<TASK_ID>/run
```

**响应示例（成功）：**

```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "codeName": "example.ts",
    "reviewResult": {
      "summary": "代码存在类型安全问题和潜在的类型错误...",
      "score": 45,
      "issues": [
        {
          "line": 4,
          "severity": "error",
          "category": "bug",
          "message": "add(1, '2') 存在类型错误，第二个参数是字符串",
          "suggestion": "使用 Number() 或 parseInt() 转换类型",
          "fixedCode": "const result = add(1, Number('2'));"
        },
        {
          "line": 8,
          "severity": "error",
          "category": "bug",
          "message": "使用 any 类型绕过了类型检查",
          "suggestion": "定义具体的数据类型接口",
          "fixedCode": "interface Data { foo: { bar: string } }\nconst data: Data = getData();"
        }
      ],
      "modelUsed": "openai/gpt-4o"
    },
    "status": "success",
    "completedAt": "2025-01-25T10:00:30.000Z"
  }
}
```

### Step 3: 查询任务详情

```bash
curl http://localhost:3000/api/v1/review/task/<TASK_ID>
```

### Step 4: 查看历史列表

```bash
curl "http://localhost:3000/api/v1/review/task/list?page=1&pageSize=10"
```

---

## 异常测试

### 测试：重复触发执行中的任务

```bash
# 先触发执行
curl -X POST http://localhost:3000/api/v1/review/task/<TASK_ID>/run

# 再次触发（应返回 400）
curl -X POST http://localhost:3000/api/v1/review/task/<TASK_ID>/run
```

**预期响应（400）：**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "任务正在执行中，请勿重复触发"
  }
}
```

### 测试：查询不存在的任务

```bash
curl http://localhost:3000/api/v1/review/task/507f1f77bcf86cd799439011
```

**预期响应（404）：**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "任务不存在: 507f1f77bcf86cd799439011"
  }
}
```

---

## 一键测试脚本

```bash
bash scripts/test-ai-review.sh
```
