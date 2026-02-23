# GitHub Actions 自动部署指南

本文档记录 SUPERME 项目的 GitHub Pages 自动部署配置和使用方法。

---

## 概述

项目使用 **GitHub Actions** 实现自动部署，每次推送到 `main` 分支时，会自动构建并部署到 GitHub Pages。

**部署地址**: https://whyyylyj.github.io/superme/

---

## 工作流文件

配置文件位于 `.github/workflows/deploy-pages.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch: # 允许手动触发部署

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. 检出代码
      - name: Checkout
        uses: actions/checkout@v4

      # 2. 准备部署文件
      - name: Prepare deployment files
        run: |
          mkdir -p ./_site
          cp -r index.html css/ js/ ./_site/
          cp README.md ./_site/ 2>/dev/null || true
          cp -r docs/ ./_site/ 2>/dev/null || true

      # 3. 部署到 gh-pages 分支
      - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
          # 禁用 Jekyll 处理（防止 .md 文件被处理）
          disable_nojekyll: true
```

---

## 关键配置说明

### 1. 触发条件

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
```

- **自动触发**: 每次推送到 `main` 分支
- **手动触发**: 可在 Actions 页面手动运行

### 2. 部署目录结构

保持与本地一致的目录结构，确保相对路径引用正确：

```
_site/
├── index.html          # 入口文件
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── main.js         # 主循环
│   ├── player.js       # 玩家类
│   ├── enemy.js        # 敌人类
│   ├── boss.js         # Boss 类
│   ├── bullet.js       # 子弹类
│   ├── powerup.js      # 道具类
│   ├── level.js        # 关卡类
│   ├── physics.js      # 物理碰撞
│   ├── input.js        # 输入处理
│   ├── entity.js       # 实体基类
│   ├── particle.js     # 粒子效果
│   ├── core/           # 核心模块
│   ├── danmaku/        # 弹幕引擎
│   ├── enemies/        # 敌人类型
│   ├── levels/         # 关卡定义
│   └── transform/      # 变身系统
└── docs/               # 文档（可选）
```

### 3. peaceiris/actions-gh-pages 参数

| 参数 | 值 | 说明 |
|------|-----|------|
| `github_token` | `${{ secrets.GITHUB_TOKEN }}` | 自动生成的访问令牌 |
| `publish_dir` | `./_site` | 要部署的目录 |
| `disable_nojekyll` | `true` | 禁用 Jekyll 处理，防止 `.md` 文件被错误处理 |

---

## 常见问题修复

### 问题 1: `nojekyll` 参数无效

**错误信息**:
```
Unexpected input(s) 'nojekyll', valid inputs are [...]
```

**原因**: `peaceiris/actions-gh-pages@v4` 已废弃 `nojekyll` 参数

**修复**: 改用 `disable_nojekyll: true`

```yaml
# ❌ 错误写法
nojekyll: true

# ✅ 正确写法
disable_nojekyll: true
```

### 问题 2: 资源文件 404

**错误现象**: 页面加载但 CSS/JS 全部 404

**原因**: 部署时文件结构扁平化，丢失了 `css/`、`js/` 子目录

**修复**: 确保 `cp` 命令保留目录结构：

```bash
# ✅ 正确做法
cp -r index.html css/ js/ ./_site/

# ❌ 错误做法（会导致文件扁平化）
cp -r ./_site/* gh-pages-branch/
```

### 问题 3: GitHub Pages 显示 404

**可能原因**:
1. `gh-pages` 分支不存在或未推送
2. GitHub Pages 设置未启用

**解决步骤**:

1. **检查分支**: 访问 https://github.com/whyyylyj/superme/branches 确认 `gh-pages` 存在

2. **启用 Pages**: 
   - 访问 https://github.com/whyyylyj/superme/settings/pages
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `gh-pages` / `(root)`
   - 点击 Save

3. **等待传播**: GitHub Pages 需要 1-3 分钟生效

---

## 手动部署方法

如果自动部署失败，可以手动推送：

```bash
# 1. 准备部署文件
mkdir -p ./_site
cp -r index.html css/ js/ ./_site/
cp README.md ./_site/ 2>/dev/null || true
cp -r docs/ ./_site/ 2>/dev/null || true

# 2. 创建临时目录
rm -rf /tmp/gh-pages
mkdir -p /tmp/gh-pages
cd /tmp/gh-pages

# 3. 初始化 gh-pages 分支
git init
git checkout --orphan gh-pages
git reset --hard

# 4. 复制部署文件
cp -r /path/to/project/_site/* .

# 5. 提交并推送
git add .
git commit -m "deploy: manual deployment"
git remote add origin https://github.com/whyyylyj/superme.git
git push -u --force origin gh-pages
```

---

## 查看部署状态

### 1. GitHub Actions 页面

访问 https://github.com/whyyylyj/superme/actions 查看：
- 部署运行历史
- 实时日志输出
- 失败原因诊断

### 2. 验证部署

```bash
# 检查 gh-pages 分支内容
git fetch origin gh-pages
git ls-tree --name-only -r origin/gh-pages

# 验证在线资源
curl -I https://whyyylyj.github.io/superme/
curl -I https://whyyylyj.github.io/superme/css/style.css
curl -I https://whyyylyj.github.io/superme/js/main.js
```

---

## 部署流程图

```
┌─────────────────┐
│  git push main  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Actions 触发   │
│  (deploy-pages) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Checkout 代码  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 准备 _site 目录 │
│ (复制静态文件)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 推送到 gh-pages │
│   (force push)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Pages   │
│   自动构建      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  在线访问可用   │
│ 1-3 分钟生效     │
└─────────────────┘
```

---

## 最佳实践

1. **提交前测试**: 本地用 `python -m http.server 8000` 测试静态文件服务

2. **小步提交**: 每次修改后及时推送，便于定位部署问题

3. **清理缓存**: 如果更新未生效，强制刷新浏览器 (`Cmd+Shift+R` / `Ctrl+Shift+F5`)

4. **保留构建产物**: `_site` 目录已添加到 `.gitignore`，不需要提交

5. **敏感信息**: 不要将 API Key、密码等敏感信息提交到公开仓库

---

## 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [GitHub Pages 文档](https://docs.github.com/en/pages)

---

*最后更新：2026-02-23*
