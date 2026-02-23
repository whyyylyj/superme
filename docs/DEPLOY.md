# SUPERME 部署指南

## 一键部署到 GitHub Pages

本项目已配置 GitHub Actions，支持自动部署到 GitHub Pages。

---

## 📋 前置条件

1. **GitHub 账号** - 已注册 GitHub
2. **Git 仓库** - 代码已推送到 GitHub

---

## 🚀 部署步骤

### 方法一：使用部署脚本（最简单）

```bash
# 自动提交并部署
./scripts/deploy-to-github.sh "feat: 更新游戏内容"

# 或使用 npm 命令
npm run deploy:github "feat: 更新游戏内容"
```

脚本会自动：
- 检查 Git 状态
- 提交未提交的更改
- 推送到 main 分支
- 触发 GitHub Actions 部署

---

### 方法二：手动命令部署

每次推送到 `main` 分支时自动部署：

```bash
# 1. 提交你的更改
git add .
git commit -m "feat: 更新游戏内容"

# 2. 推送到 main 分支
git push origin main

# 3. 等待 1-2 分钟，部署完成！
```

---

### 方法三：GitHub 手动触发

在 GitHub 网站上手动触发部署：

1. 进入仓库页面 → **Actions** 标签
2. 左侧选择 **"Deploy to GitHub Pages"**
3. 点击 **"Run workflow"** 按钮
4. 选择 `main` 分支 → 点击 **"Run workflow"**
5. 等待部署完成（约 1-2 分钟）

---

## 🔧 工作流程说明

`.github/workflows/deploy-pages.yml` 定义了部署流程：

```yaml
触发条件:
  - 推送到 main 分支
  - 手动触发 (workflow_dispatch)

部署步骤:
  1. 检出代码
  2. 复制文件到 _site 目录
  3. 部署到 gh-pages 分支
```

---

## 🌐 访问地址

部署成功后，游戏将通过 GitHub Pages 托管：

```
https://<你的 GitHub 用户名>.github.io/superme/
```

例如：`https://whyyylyj.github.io/superme/`

---

## ⚙️ 自定义域名（可选）

如需使用自定义域名：

1. 在仓库 **Settings** → **Pages** → **Custom domain**
2. 输入你的域名（如 `game.example.com`）
3. 在 DNS 服务商添加 CNAME 记录：
   ```
   CNAME <你的用户名>.github.io
   ```

---

## 📝 注意事项

1. **分支保护** - 确保 `main` 分支允许 GitHub Actions 运行
2. **文件大小** - GitHub Pages 限制仓库大小 1GB
3. **构建时间** - 每次部署约 1-2 分钟
4. **缓存** - 部署后可能需要几分钟 CDN 刷新

---

## 🐛 故障排查

### 部署失败

1. 进入 **Actions** 标签
2. 点击失败的 workflow
3. 查看日志定位错误

### 页面 404

- 等待 2-3 分钟（CDN 刷新）
- 检查 `gh-pages` 分支是否存在
- 确认 `index.html` 在 `_site` 目录根路径

### 样式/脚本加载失败

- 检查文件路径是否正确
- 清除浏览器缓存
- 查看浏览器控制台错误

---

## 📦 本地测试部署

在本地模拟部署环境：

```bash
# 使用 Python 内置服务器
python -m http.server 8000

# 或使用 Node.js serve
npm run start
```

访问 `http://localhost:8000` 预览效果。

---

## 🔗 相关资源

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)

---

*最后更新：2026-02-23*
