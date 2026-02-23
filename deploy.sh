#!/bin/bash

# ========================================
# SUPERME 一键部署脚本
# ========================================
# 用法：./deploy.sh [port]
# 示例：./deploy.sh 8000
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认端口
PORT=${1:-8000}

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     SUPERME 一键部署脚本               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到 Node.js${NC}"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js 已安装：$(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到 npm${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm 已安装：$(npm -v)"

cd "$PROJECT_ROOT"

# 安装依赖
echo ""
echo -e "${YELLOW}📦 检查并安装依赖...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓${NC} 依赖安装完成"
else
    echo -e "${GREEN}✓${NC} 依赖已存在"
fi

# 检查 index.html
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ 错误：未找到 index.html${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} index.html 存在"

# 启动服务器
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🚀 启动服务器                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "📍 本地访问：${BLUE}http://localhost:${PORT}${NC}"
echo -e "📍 局域网访问：${BLUE}http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}'):${PORT}${NC}"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止服务器${NC}"
echo ""

# 使用 serve 启动（支持 SPA 和静态文件）
npx serve . -p $PORT -L
