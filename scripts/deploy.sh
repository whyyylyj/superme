#!/bin/bash

# SUPERME 一键部署脚本
# 自动提交代码并推送到 main 分支，触发 GitHub Pages 部署

set -e

echo "🎮 SUPERME 一键部署"
echo "=================="
echo ""

# 1. 检查 git 状态
echo "📋 检查变更..."
git_status=$(git status --porcelain)

if [ -z "$git_status" ]; then
    echo "⚠️  没有需要提交的更改"
    exit 0
fi

# 显示变更文件
echo "$git_status" | head -10
file_count=$(echo "$git_status" | wc -l)
if [ $file_count -gt 10 ]; then
    echo "... 还有 $((file_count - 10)) 个文件"
fi
echo ""

# 2. 添加所有文件
echo "📦 添加文件..."
git add -A

# 3. 自动生成提交信息
echo "📝 生成提交信息..."

# 检测变更的文件类型
js_changed=$(git diff --cached --name-only | grep -c "\.js$" || true)
css_changed=$(git diff --cached --name-only | grep -c "\.css$" || true)
html_changed=$(git diff --cached --name-only | grep -c "\.html$" || true)
md_changed=$(git diff --cached --name-only | grep -c "\.md$" || true)

# 根据变更类型生成提交信息
if [ $md_changed -gt 0 ] && [ $js_changed -eq 0 ] && [ $css_changed -eq 0 ]; then
    commit_msg="docs: 更新文档"
elif [ $css_changed -gt 0 ] && [ $js_changed -eq 0 ]; then
    commit_msg="style: 更新样式"
elif [ $html_changed -gt 0 ] && [ $js_changed -eq 0 ] && [ $css_changed -eq 0 ]; then
    commit_msg="feat: 更新页面结构"
elif [ $js_changed -gt 0 ]; then
    # 检查是否有特定的文件模式
    if git diff --cached --name-only | grep -q "tictactoe"; then
        commit_msg="feat: 更新井字棋游戏"
    elif git diff --cached --name-only | grep -q "boss"; then
        commit_msg="feat: 更新 Boss 逻辑"
    elif git diff --cached --name-only | grep -q "enemy"; then
        commit_msg="feat: 更新敌人 AI"
    elif git diff --cached --name-only | grep -q "player"; then
        commit_msg="feat: 更新玩家逻辑"
    elif git diff --cached --name-only | grep -q "level"; then
        commit_msg="feat: 更新关卡设计"
    elif git diff --cached --name-only | grep -q "danmaku\|bullet\|pattern"; then
        commit_msg="feat: 更新弹幕系统"
    else
        commit_msg="feat: 更新游戏代码"
    fi
else
    commit_msg="feat: 混合更新"
fi

echo "   提交信息：$commit_msg"
echo ""

# 4. 提交
echo "💾 提交代码..."
git commit -m "$commit_msg"

# 5. 推送
echo "🚀 推送到 main 分支..."
git push origin main

# 6. 获取 commit hash
commit_hash=$(git rev-parse --short HEAD)

echo ""
echo "✅ 部署成功!"
echo ""
echo "📊 查看部署进度:"
echo "   https://github.com/whyyylyj/superme/actions"
echo ""
echo "🌐 访问部署后的网站:"
echo "   https://whyyylyj.github.io/superme/"
echo ""
echo "📝 Commit: $commit_hash"
