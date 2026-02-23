# SUPERME

> **A HTML5 Canvas Side-Scrolling Shooter Game**

一款融合经典游戏元素的横版飞行射击游戏，结合东方 Project 的弹幕、魂斗罗的多武器、超级马里奥的变身系统和 Minecraft 的像素美学。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

---

## 🎮 游戏特色

| 灵感来源 | 借鉴元素 |
|---------|---------|
| **东方 Project** | 华丽弹幕花样、符卡 Boss 攻击、子弹基因系统 |
| **魂斗罗 (Contra)** | 多武器切换、横版射击节奏、追踪弹模式 |
| **Minecraft** | 像素方块美学、可破坏地形、程序化关卡生成 |
| **超级马里奥** | 变身系统、道具收集、关卡设计 |

### 核心玩法

- 🚁 **飞行 + 平台跳跃**：地面跑跳与空中飞行自由切换
- 💥 **弹幕射击**：华丽的子弹图案、Boss 符卡攻击、图案编织系统
- 🦎 **4 种变身形态**：Normal、Mecha、Dragon、Phantom
- 🏰 **程序化关卡**：基于片段库的动态关卡生成
- 🏆 **3 个关卡**：Pixel Forest, Inferno Nether, Sky Temple
- ⚙️ **配置驱动**：参数化的 Boss 属性与弹幕配置

---

## 🚀 快速开始

### 方式一：直接打开

```bash
open index.html
```

### 方式二：使用静态服务器

```bash
# 使用 Python
python -m http.server 8000

# 或使用 NPM serve
npx serve

# 访问 http://localhost:8000
```

### 方式三：使用 Playwright 测试

```bash
npm test              # 运行测试
npm run test:headed   # 有头模式运行
npm run test:ui       # UI 模式
```

---

## 🌐 部署

### 一键部署到 GitHub Pages

```bash
# 使用部署脚本
./scripts/deploy-to-github.sh "feat: 更新内容"

# 或直接推送
git add .
git commit -m "feat: 更新内容"
git push origin main
```

部署成功后访问：`https://你的用户名.github.io/superme/`

详细部署指南见 [docs/DEPLOY.md](docs/DEPLOY.md)

---

## 🎯 操作说明

| 按键 | 功能 |
|------|------|
| `W/A/S/D` 或 方向键 | 移动 |
| `Space` | 跳跃（支持多段跳） |
| `J` 或 `Z` | 射击 |
| `K` 或 `X` | 变身 |
| `M` | 追踪模式切换 |
| `Esc` | 暂停 |

---

## 🦸 变身形态

| 形态 | 解锁关卡 | 特性 | 持续时间 |
|------|---------|------|---------|
| **Normal** | 初始 | 标准射击 | 无限 |
| **Mecha** | 关卡 1 | 散弹枪 (5 发子弹)、防御力提升 | 12 秒 |
| **Dragon** | 关卡 2 | 飞行能力、火焰喷射、熔岩免疫 | 10 秒 |
| **Phantom** | 关卡 3 | 穿墙能力、追踪子弹、极速移动 | 8 秒 |

---

## 🗺️ 关卡设计

| 关卡 | 名称 | 宽度 | 主题 | Boss | 难度 |
|------|------|------|------|------|------|
| **Stage 1** | Pixel Forest | 5000px | 绿色森林 | 树精王 (Treant King) | ★★☆☆☆ |
| **Stage 2** | Inferno Nether | 6000px | 红色地狱 | 炎龙 (Inferno Dragon) | ★★★★☆ |
| **Stage 3** | Sky Temple | 7000px | 蓝色天空 | 天空暴君 (Sky Tyrant) | ★★★★★ |

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| HTML5 Canvas | 800×600 游戏渲染、粒子系统 |
| Vanilla JavaScript (ES6) | 面向对象游戏逻辑、发布订阅模式 |
| CSS3 | 霓虹 UI 主题、CRT 扫描线效果 |
| Web Audio API | 8 位音效合成与音乐管理 |
| Playwright | 自动化 E2E 冒烟与回归测试 |

**无框架依赖** — 纯 HTML/CSS/JavaScript

---

## 📁 项目结构

```
superme/
├── index.html                  # 入口文件
├── package.json                # 项目配置
├── playwright.config.ts        # Playwright 测试配置
├── README.md                   # 本文件
├── CLAUDE.md                   # 开发者上下文文档
│
├── css/
│   └── style.css               # 霓虹 UI 主题
│
├── js/
│   ├── core/                   # 核心模块
│   │   ├── event-bus.js        # 发布订阅事件系统
│   │   ├── game-state.js       # 有限状态机
│   │   ├── level-manager.js    # 关卡管理器
│   │   ├── asset-manager.js    # 资源与全局配置
│   │   ├── audio-manager.js    # Web Audio 音效管理
│   │   ├── screen-effects.js   # 屏幕特效 (震动、闪烁、CRT)
│   │   ├── boss-config.js      # Boss 参数化配置
│   │   └── boss-config-helper.js # 配置辅助工具
│   │
│   ├── transform/              # 变身系统
│   │   ├── transform-system.js # 变身核心逻辑
│   │   ├── form-normal.js      # 普通形态
│   │   ├── form-mecha.js       # 机甲形态
│   │   ├── form-dragon.js      # 龙形态
│   │   └── form-phantom.js     # 幻影形态
│   │
│   ├── danmaku/                # 弹幕引擎
│   │   ├── danmaku-engine.js   # 弹幕核心引擎
│   │   ├── patterns.js         # 弹幕图案库
│   │   ├── bullet-pool.js      # 子弹对象池
│   │   ├── bullet-genes.js     # 子弹基因系统 (轨迹控制)
│   │   └── pattern-weaver.js   # 图案编织器
│   │
│   ├── enemies/                # 敌人系统
│   │   ├── enemy-base.js       # 敌人基类
│   │   ├── boss-base.js        # Boss 基类
│   │   ├── boss-level1.js      # 树精王 (Forest boss)
│   │   ├── boss-level2.js      # 炎龙 (Nether boss)
│   │   ├── boss-level3.js      # 天空暴君 (Sky boss)
│   │   └── enemy-types.js      # 敌人类型定义
│   │
│   ├── levels/                 # 关卡系统
│   │   ├── level-base.js       # 关卡基类
│   │   ├── level1-forest.js    # 像素森林
│   │   ├── level2-nether.js    # 烈焰地狱
│   │   └── level3-sky.js       # 天空神殿
│   │
│   ├── procedural/             # 程序化生成
│   │   ├── segment-library.js  # 关卡片段库
│   │   └── segment-builder.js  # 关卡构建器
│   │
│   ├── physics.js              # AABB 碰撞检测
│   ├── input.js                # 键盘/输入管理
│   ├── entity.js               # 实体基类
│   ├── particle.js             # 粒子系统
│   ├── bullet.js               # 子弹逻辑
│   ├── powerup.js              # 道具系统
│   ├── player.js               # 玩家核心逻辑
│   ├── enemy.js                # 基础敌人 AI
│   ├── boss.js                 # 基础 Boss 逻辑
│   ├── level.js                # 基础关卡生成
│   └── main.js                 # 游戏启动与主循环
│
├── docs/                       # 设计与技术文档
│   ├── 00-ARCHITECTURE.md      # 总架构设计
│   ├── 08-BOSS-CONFIG.md       # Boss 配置指南
│   └── 09-BOSS-CONFIG-SUMMARY.md # Boss 参数化总结
│
└── tests/                      # E2E 测试
    └── e2e/*.spec.ts           # Playwright 测试用例
```

---

## 📖 开发指南

### 1. 阅读架构文档

在开始任何开发前，先阅读：

```bash
cat docs/00-ARCHITECTURE.md
```

### 2. 运行游戏

```bash
# 方式 1：直接打开
open index.html

# 方式 2：启动服务器
npx serve
```

### 3. 运行测试

```bash
npm test                 # 运行所有测试
npm run test:headed      # 显示浏览器窗口
npm run test:ui          # 交互式 UI
npm run test:report      # 查看测试报告
```

### 4. 调试技巧

在浏览器控制台中：

```javascript
// 查看游戏状态
gameState

// 查看玩家信息
player.hp
player.weapon
player.form

// 查看关卡信息
LevelMap.enemies.length
LevelMap.boss.hp
```

---

## 🎨 弹幕图案

游戏内置 8 种弹幕图案：

| 图案 | 描述 | 用途 |
|------|------|------|
| `circle` | 圆形扩散 | Boss 基础攻击 |
| `fan` | 扇形瞄准 | Boss 瞄准攻击 |
| `spiral` | 旋转螺旋 | 中 Boss 持续攻击 |
| `rain` | 从上落下 | 区域封锁 |
| `cross` | 四向十字 | 地狱 Boss 特殊 |
| `flower` | 六瓣花 | 最终 Boss 特殊 |
| `laser` | 密集直线 | 魂斗罗风格 |
| `scatter` | 随机扩散 | 玩家/Boss 通用 |

---

## 🔧 配置

### 游戏平衡调整

在 `js/core/asset-manager.js` 中调整：

- 玩家血量、速度、跳跃力
- 变身持续时间
- 道具掉落率
- Boss 血量、攻击力

### 弹幕密度

在 `js/danmaku/bullet-pool.js` 中调整对象池大小。

---

## 📝 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| 1.0.0 | 2026-02-22 | 初始版本，包含 3 关卡、4 变身形态、弹幕系统 |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

ISC License

---

## 🙏 致谢

- **东方 Project** - 弹幕射击游戏灵感
- **魂斗罗** - 经典横版射击
- **超级马里奥** - 变身系统设计
- **Minecraft** - 像素美学风格

---

*Last updated: 2026-02-23*
*Made with ❤️ using HTML5 Canvas*
