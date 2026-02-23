# 一键部署技能

## 概述

本项目提供两种一键部署方式：

1. **Shell 脚本** — 在终端直接运行
2. **Claude Skill** — 在对话中调用

## 方式一：Shell 脚本

### 使用方法

```bash
./scripts/deploy.sh
```

### 功能

- ✅ 自动检测变更文件
- ✅ 智能生成提交信息
- ✅ 推送到 main 分支
- ✅ 触发 GitHub Actions 部署

### 提交信息规则

| 变更类型 | 提交信息 |
|----------|----------|
| 仅 `.md` 文件 | `docs: 更新文档` |
| 仅 `.css` 文件 | `style: 更新样式` |
| 仅 `.html` 文件 | `feat: 更新页面结构` |
| JS 文件 (含 tictactoe) | `feat: 更新井字棋游戏` |
| JS 文件 (含 boss) | `feat: 更新 Boss 逻辑` |
| JS 文件 (含 enemy) | `feat: 更新敌人 AI` |
| JS 文件 (含 player) | `feat: 更新玩家逻辑` |
| JS 文件 (含 level) | `feat: 更新关卡设计` |
| JS 文件 (含 danmaku/bullet/pattern) | `feat: 更新弹幕系统` |
| 其他 JS 文件 | `feat: 更新游戏代码` |
| 混合修改 | `feat: 混合更新` |

### 输出示例

```
🎮 SUPERME 一键部署
==================

📋 检查变更...
 M js/player.js
 M js/enemy.js

📦 添加文件...
📝 生成提交信息...
   提交信息：feat: 更新游戏代码

💾 提交代码...
[main 388985e] feat: 更新游戏代码
 2 files changed, 23 insertions(+), 13 deletions(-)

🚀 推送到 main 分支...
...

✅ 部署成功!

📊 查看部署进度:
   https://github.com/whyyylyj/superme/actions

🌐 访问部署后的网站:
   https://whyyylyj.github.io/superme/

📝 Commit: 388985e
```

---

## 方式二：Claude Skill

### 使用方法

在对话中直接说：

```
skill: "deploy"
```

或

```
一键部署
```

### Skill 位置

`.qwen/skills/deploy`

### 执行流程

1. 检查 git 状态
2. 添加所有变更文件
3. 根据变更类型生成提交信息
4. 提交并推送

---

## GitHub Actions 配置

部署工作流由 `.github/workflows/deploy-pages.yml` 定义：

- **触发条件**: push 到 main 分支
- **部署目标**: gh-pages 分支
- **访问地址**: https://whyyylyj.github.io/superme/
- **部署时间**: 约 30-60 秒

---

## 常见问题

### Q: 为什么没有触发部署？

A: 检查以下几点：
1. 确认推送到了 `main` 分支
2. 刷新 GitHub Actions 页面查看最新状态
3. 检查仓库 Settings → Actions 是否启用了 GitHub Actions

### Q: 部署后网站没有更新？

A: 等待 1-2 分钟，GitHub Pages 需要时间同步。可以：
1. 硬刷新浏览器 (Cmd+Shift+R / Ctrl+Shift+F5)
2. 清除浏览器缓存
3. 检查 Actions 是否成功完成

### Q: 如何手动触发部署？

A: 访问 https://github.com/whyyylyj/superme/actions
选择 "Deploy to GitHub Pages" 工作流，点击 "Run workflow" 按钮。

---

*Last updated: 2026-02-23*
