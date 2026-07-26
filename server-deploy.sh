#!/bin/bash
# ============================================================
# AI Code Review Agent — 服务器一键部署
# 在服务器上执行: bash server-deploy.sh
# ============================================================

set -e

echo "============================================"
echo "  AI Code Review Agent — 服务器部署"
echo "============================================"

# ---- 1. 安装 Docker（如果没有）----
echo ""
echo "[1/7] 检查 Docker..."

if ! command -v docker &> /dev/null; then
    echo "📦 安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker 安装完成"
else
    echo "✅ Docker 已安装"
fi

# ---- 2. 安装 Git（如果没有）----
echo ""
echo "[2/7] 检查 Git..."

if ! command -v git &> /dev/null; then
    echo "📦 安装 Git..."
    apt update && apt install -y git
    echo "✅ Git 安装完成"
else
    echo "✅ Git 已安装"
fi

# ---- 3. 克隆代码 ----
echo ""
echo "[3/7] 克隆代码..."

if [ -d "ai-code-review-agent" ]; then
    echo "📁 已存在，拉取最新代码..."
    cd ai-code-review-agent
    git pull
else
    echo "📦 克隆仓库..."
    git clone https://github.com/Sfrui/ai-code-review-agent.git
    cd ai-code-review-agent
fi
echo "✅ 代码就绪"

# ---- 4. 配置环境变量 ----
echo ""
echo "[4/7] 配置环境变量..."

if [ ! -f "apps/server/.env" ]; then
    cp .env.example apps/server/.env
    echo "📝 请编辑 apps/server/.env 填入你的 LLM_API_KEY"
    echo "   示例: vim apps/server/.env"
    echo ""
    read -p "按回车继续..."
fi

echo "✅ 环境变量已配置"

# ---- 5. 构建 Docker 镜像 ----
echo ""
echo "[5/7] 构建 Docker 镜像（首次约 5-10 分钟）..."

docker compose -f docker-compose.prod.yml build --no-cache
echo "✅ 镜像构建完成"

# ---- 6. 启动服务 ----
echo ""
echo "[6/7] 启动服务..."

# 停止旧容器
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# 启动
docker compose -f docker-compose.prod.yml up -d
echo "✅ 服务已启动"

# ---- 7. 等待就绪 ----
echo ""
echo "[7/7] 等待服务就绪..."

sleep 8

# 检查状态
docker compose -f docker-compose.prod.yml ps

# 测试 API
if curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/config/llm | grep -q "200"; then
    echo "✅ API 正常"
else
    echo "⚠️  API 可能还在启动，稍等片刻再试"
fi

echo ""
echo "============================================"
echo "  ✅ 部署完成！"
echo "============================================"
echo ""
echo "  🌐 现在可以访问: http://152.32.230.137"
echo ""
echo "  📌 下一步：配置域名 SSL"
echo "     1. 在域名管理面板添加 A 记录:"
echo "        sfrui.cloud → 152.32.230.137"
echo "     2. 安装 certbot:"
echo "        apt install certbot python3-certbot-nginx -y"
echo "     3. 申请证书:"
echo "        certbot --nginx -d sfrui.cloud"
echo ""
echo "  📌 常用命令:"
echo "     查看日志: cd ai-code-review-agent && docker compose -f docker-compose.prod.yml logs -f"
echo "     重启服务: cd ai-code-review-agent && docker compose -f docker-compose.prod.yml restart"
echo "     停止服务: cd ai-code-review-agent && docker compose -f docker-compose.prod.yml down"
echo "     更新部署: cd ai-code-review-agent && git pull && ./deploy.sh"
echo ""
