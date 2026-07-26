# API 接口测试用例

## 前提条件

1. 启动 MongoDB（确保 localhost:27017 可访问）
2. 启动 NestJS 服务：`pnpm dev:server`

---

## 1. 创建审查任务

```bash
curl -X POST http://localhost:3000/api/v1/review/task \
  -H "Content-Type: application/json" \
  -d '{
    "codeName": "example.ts",
    "codeContent": "function add(a, b) {\n  return a + b;\n}\n\nconst result = add(1, '2');\nconsole.log(result);"
  }'
```

**预期响应：**

```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "codeName": "example.ts",
    "codeContent": "function add(a, b) {...}",
    "reviewResult": null,
    "status": "pending",
    "createdAt": "2025-01-25T10:00:00.000Z"
  },
  "timestamp": "2025-01-25T10:00:00.000Z"
}
```

---

## 2. 查询单个任务详情

```bash
# 将 <TASK_ID> 替换为实际的 task ID
curl http://localhost:3000/api/v1/review/task/<TASK_ID>
```

**预期响应：**

```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "codeName": "example.ts",
    "codeContent": "function add(a, b) {...}",
    "reviewResult": null,
    "status": "pending",
    "createdAt": "2025-01-25T10:00:00.000Z"
  },
  "timestamp": "2025-01-25T10:00:00.000Z"
}
```

---

## 3. 获取历史任务列表（分页）

```bash
curl "http://localhost:3000/api/v1/review/task/list?page=1&pageSize=10"
```

**预期响应：**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "665f1a2b3c4d5e6f7a8b9c0d",
        "codeName": "example.ts",
        "status": "pending",
        "createdAt": "2025-01-25T10:00:00.000Z",
        "issueCount": 0
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": "2025-01-25T10:00:00.000Z"
}
```

---

## 4. 测试参数校验 — 缺少字段

```bash
curl -X POST http://localhost:3000/api/v1/review/task \
  -H "Content-Type: application/json" \
  -d '{"codeContent": "some code"}'
```

**预期响应（400）：**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数校验失败",
    "details": ["codeName 不能为空"],
    "path": "/api/v1/review/task",
    "timestamp": "2025-01-25T10:00:00.000Z"
  }
}
```

---

## 5. 测试查询不存在的任务

```bash
curl http://localhost:3000/api/v1/review/task/507f1f77bcf86cd799439011
```

**预期响应（404）：**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "任务不存在: 507f1f77bcf86cd799439011",
    "path": "/api/v1/review/task/507f1f77bcf86cd799439011",
    "timestamp": "2025-01-25T10:00:00.000Z"
  }
}
```

---

## 一键测试脚本

```bash
bash scripts/test-api.sh
```
