#!/bin/bash

# ========================================
# SUPERME 一键部署到 GitHub
# ========================================
# 用法：./scripts/deploy-to-github.sh [commit_message]
# 示例：./scripts/deploy-to-github.sh "feat: 更新游戏内容"
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 默认提交信息
COMMIT_MSG=${1:-"chore: deploy to github pages"}

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SUPERME 一键部署到 GitHub Pages      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

cd "$PROJECT_ROOT"

# 检查 Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到 Git${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Git 已安装：$(git --version)"

# 检查是否在 Git 仓库中
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ 错误：当前目录不是 Git 仓库${NC}"
    exit 1
fi

# 检查远程仓库
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
    echo -e "${YELLOW}⚠️  未配置远程仓库${NC}"
    echo "请先添加远程仓库："
    echo "  git remote add origin https://github.com/你的用户名/superme.git"
    exit 1
fi
echo -e "${GREEN}✓${NC} 远程仓库：$REMOTE"

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}✓${NC} 当前分支：$CURRENT_BRANCH"

# 检查是否有未提交的更改
UNCOMMITTED=$(git status --porcelain)
if [ -n "$UNCOMMITTED" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  存在未提交的更改：${NC}"
    git status --short
    echo ""
    # 自动提交更改（非交互模式）
    echo -e "${BLUE}📝 自动提交更改...${NC}"
    git add .
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✓${NC} 更改已提交"
fi

# 推送到 main 分支
echo ""
echo -e "${BLUE}🚀 推送到 main 分支...${NC}"
git branch -M main 2>/dev/null || true
git push -u origin main

PUSH_STATUS=$?

echo ""
if [ $PUSH_STATUS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ 推送成功！                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📦 GitHub Actions 正在部署...${NC}"
    echo ""
    
    # 提取用户名和仓库名
    REPO_PATH="${REMOTE#*github.com/}"
    REPO_PATH="${REPO_PATH%.git}"
    
    echo "查看部署进度："
    echo "  https://github.com/${REPO_PATH}/actions"
    echo ""
    echo "部署完成后访问："
    echo "  https://${REPO_PATH}"
    echo ""
else
    echo -e "${RED}❌ 推送失败${NC}"
    exit 1
fi
