# SUPERME E2E 测试快速参考

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动服务器 (终端 1)
python3 -m http.server 8000

# 3. 运行测试 (终端 2)
npm test

# 或使用内置服务器
npm run test:serve
```

## 📋 常用命令

```bash
# 运行所有测试
npx playwright test

# 运行单个测试
npx playwright test tests/e2e/01-start-screen.spec.ts

# 可视化模式 (调试)
npm run test:headed

# 更新截图基准
npm run test:update-snapshots

# 查看测试报告
npm run test:report

# UI 模式
npm run test:ui
```

## 🎮 测试钩子 (Test Hooks)

在浏览器控制台或 `page.evaluate()` 中使用:

```javascript
// 获取游戏状态
window.getGameState()

// 设置玩家状态
window.setPlayerState({ hp: 10, x: 500 })

// 跳过关卡
window.skipLevel()

// 击败 Boss
window.defeatBoss()

// 无敌模式
window.setInvincible(true)

// 变身
window.transformTo('Mecha')
window.transformTo('Dragon')
window.transformTo('Phantom')
```

## 📁 测试文件

| 文件 | 描述 | 测试数 |
|------|------|--------|
| `01-start-screen.spec.ts` | 启动画面 | 3 |
| `02-player-movement.spec.ts` | 玩家移动 | 7 |
| `03-level1-complete.spec.ts` | 第一关 | 4 |
| `04-boss-battle.spec.ts` | Boss 战 | 7 |
| `05-transform-system.spec.ts` | 变身系统 | 8 |
| `06-danmaku-patterns.spec.ts` | 弹幕模式 | 8 |
| `07-all-levels-complete.spec.ts` | 全通关 | 3 |

## ⚠️ 快速故障排查

### 测试超时?
```bash
# 检查服务器是否运行
lsof -i :8000

# 增加超时时间
# 在测试中: .waitFor({ timeout: 20000 })
```

### 截图失败?
```bash
# 更新基准
npm run test:update-snapshots
```

### API 未定义?
```bash
# 清缓存,重启服务器
pkill -f "http.server"
python3 -m http.server 8000
```

## 📊 当前状态 (Phase 4)

- **总测试:** 40
- **通过:** 6
- **失败:** 34
- **主要问题:** 截图基准未生成,游戏初始化超时

**详细报告:** `tests/test-report-phase4.md`
**完整文档:** `docs/08-E2E-TESTING.md`

## 🔗 相关链接

- [Playwright 文档](https://playwright.dev)
- [测试配置](../playwright.config.ts)
- [测试钩子实现](../js/main.js#L460)
