#!/bin/bash
# ============================================================
# AI Code Review Agent — 一键部署脚本
# 用法: chmod +x deploy.sh && ./deploy.sh
# ============================================================

set -e

echo "============================================"
echo "  AI Code Review Agent — 部署脚本"
echo "============================================"

# ---- 1. 检查环境 ----
echo ""
echo "[1/6] 检查环境..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

echo "✅ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
echo "✅ Docker Compose $(docker compose version | cut -d' ' -f4)"

# ---- 2. 检查环境变量文件 ----
echo ""
echo "[2/6] 检查环境配置..."

ENV_FILE="apps/server/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  未找到 $ENV_FILE，从模板创建..."
    cp .env.example "$ENV_FILE"
    echo "📝 请编辑 $ENV_FILE 填入 LLM_API_KEY"
    echo "   vim $ENV_FILE"
    echo ""
    read -p "配置完成后按回车继续..."
fi

# 检查 API Key
if grep -q "sk-your-api-key-here" "$ENV_FILE" 2>/dev/null; then
    echo "❌ 请先在 $ENV_FILE 中配置 LLM_API_KEY"
    exit 1
fi

echo "✅ 环境配置已就绪"

# ---- 3. 停止旧容器 ----
echo ""
echo "[3/6] 停止旧容器..."

docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo "✅ 旧容器已停止"

# ---- 4. 构建镜像 ----
echo ""
echo "[4/6] 构建 Docker 镜像（首次较慢）..."

docker compose -f docker-compose.prod.yml build --no-cache
echo "✅ 镜像构建完成"

# ---- 5. 启动服务 ----
echo ""
echo "[5/6] 启动服务..."

docker compose -f docker-compose.prod.yml up -d
echo "✅ 服务已启动"

# ---- 6. 等待健康检查 ----
echo ""
echo "[6/6] 等待服务就绪..."

sleep 5

# 检查服务状态
for i in {1..30}; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/config/llm 2>/dev/null | grep -q "200"; then
        echo "✅ 后端 API 就绪"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  后端启动较慢，请稍后检查: docker compose -f docker-compose.prod.yml logs server"
    fi
    sleep 2
done

if curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null | grep -q "200"; then
    echo "✅ 前端就绪"
else
    echo "⚠️  前端可能还在启动: docker compose -f docker-compose.prod.yml logs nginx"
fi

# ---- 完成 ----
echo ""
echo "============================================"
echo "  ✅ 部署完成！"
echo "============================================"
echo ""
echo "  服务状态:"
docker compose -f docker-compose.prod.yml ps
echo ""
echo "  下一步:"
echo "  1. 将域名 A 记录解析到此服务器 IP"
echo "  2. 安装 SSL 证书: certbot --nginx -d your-domain.com"
echo "  3. 访问 http://your-domain.com"
echo ""
echo "  常用命令:"
echo "  查看日志: docker compose -f docker-compose.prod.yml logs -f"
echo "  重启服务: docker compose -f docker-compose.prod.yml restart"
echo "  停止服务: docker compose -f docker-compose.prod.yml down"
echo "  更新部署: ./deploy.sh"
echo ""
