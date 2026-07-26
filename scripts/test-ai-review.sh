#!/bin/bash
# ============================================================
# AI 代码审查接口测试用例 — curl 命令
# 前提：启动 MongoDB 和 NestJS 服务
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
    "codeContent": "function add(a, b) {\n  return a + b;\n}\n\nconst result = add(1, \"2\");\nconsole.log(result);\n\n// 类型不安全\nconst data: any = getData();\nconsole.log(data.foo.bar);"
  }')

echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"

# 提取任务 ID
TASK_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

if [ -z "$TASK_ID" ]; then
  echo "❌ 无法创建任务，请检查服务是否启动"
  exit 1
fi

echo ""
echo "📝 Task ID: $TASK_ID"

echo ""
echo "=========================================="
echo "2. 执行 AI 代码审查（可能需要 30-60 秒）"
echo "=========================================="

REVIEW_RESPONSE=$(curl -s -X POST "$BASE_URL/review/task/$TASK_ID/run")

echo "$REVIEW_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REVIEW_RESPONSE"

echo ""
echo "=========================================="
echo "3. 查询任务详情"
echo "=========================================="

curl -s "$BASE_URL/review/task/$TASK_ID" | python3 -m json.tool 2>/dev/null || \
  curl -s "$BASE_URL/review/task/$TASK_ID"

echo ""
echo "=========================================="
echo "4. 获取历史任务列表"
echo "=========================================="

curl -s "$BASE_URL/review/task/list?page=1&pageSize=10" | python3 -m json.tool 2>/dev/null || \
  curl -s "$BASE_URL/review/task/list?page=1&pageSize=10"

echo ""
echo "=========================================="
echo "5. 测试重复触发（应返回 400）"
echo "=========================================="

curl -s -X POST "$BASE_URL/review/task/$TASK_ID/run" | python3 -m json.tool 2>/dev/null || \
  curl -s -X POST "$BASE_URL/review/task/$TASK_ID/run"

echo ""
echo "✅ 测试完成"
