#!/bin/bash
# ============================================================
# API 接口测试用例 — curl 命令
# 前提：先启动 MongoDB 和 NestJS 服务
#   pnpm dev:server
# ============================================================

BASE_URL="http://localhost:3000/api/v1"

echo "=========================================="
echo "1. 创建审查任务"
echo "=========================================="

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/review/task" \
  -H "Content-Type: application/json" \
  -d '{
    "codeName": "example.ts",
    "codeContent": "function add(a, b) {\n  return a + b;\n}\n\nconst result = add(1, '2');\nconsole.log(result);"
  }')

echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"

# 提取任务 ID
TASK_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

echo ""
echo "=========================================="
echo "2. 查询单个任务详情"
echo "=========================================="

if [ -n "$TASK_ID" ]; then
  curl -s "$BASE_URL/review/task/$TASK_ID" | python3 -m json.tool 2>/dev/null || \
    curl -s "$BASE_URL/review/task/$TASK_ID"
else
  echo "⚠️  无法提取任务 ID，请手动测试:"
  echo "curl -s $BASE_URL/review/task/<TASK_ID>"
fi

echo ""
echo "=========================================="
echo "3. 获取历史任务列表（分页）"
echo "=========================================="

curl -s "$BASE_URL/review/task/list?page=1&pageSize=10" | python3 -m json.tool 2>/dev/null || \
  curl -s "$BASE_URL/review/task/list?page=1&pageSize=10"

echo ""
echo "=========================================="
echo "4. 测试参数校验 — 缺少 codeName"
echo "=========================================="

curl -s -X POST "$BASE_URL/review/task" \
  -H "Content-Type: application/json" \
  -d '{"codeContent": "some code"}' | python3 -m json.tool 2>/dev/null || \
  curl -s -X POST "$BASE_URL/review/task" \
  -H "Content-Type: application/json" \
  -d '{"codeContent": "some code"}'

echo ""
echo "=========================================="
echo "5. 测试参数校验 — 空 body"
echo "=========================================="

curl -s -X POST "$BASE_URL/review/task" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool 2>/dev/null || \
  curl -s -X POST "$BASE_URL/review/task" \
  -H "Content-Type: application/json" \
  -d '{}'

echo ""
echo "=========================================="
echo "6. 测试查询不存在的任务"
echo "=========================================="

curl -s "$BASE_URL/review/task/507f1f77bcf86cd799439011" | python3 -m json.tool 2>/dev/null || \
  curl -s "$BASE_URL/review/task/507f1f77bcf86cd799439011"

echo ""
echo "✅ 测试完成"
