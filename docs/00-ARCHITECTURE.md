# SUPERME — 总架构设计文档

> **角色：** 所有 Agent 的第一份必读文件  
> **版本：** 1.0  
> **最后更新：** 2026-02-22

---

## 1. 游戏愿景

**SUPERME** 是一款融合多种经典游戏元素的横版飞行射击游戏：

| 灵感来源 | 借鉴元素 |
|---------|---------|
| **东方 Project** | 华丽弹幕花样、符卡（Spell Card）Boss 攻击 |
| **魂斗罗 (Contra)** | 多武器切换、紧张的横版射击节奏 |
| **Minecraft** | 像素方块美学、可破坏地形元素 |
| **超级马里奥** | 变身系统、道具收集、关卡设计节奏 |

### 核心玩法

- **飞行 + 平台跳跃混合**：角色既能在地面跑跳，也可以通过变身获得飞行能力
- **弹幕射击**：玩家子弹和 Boss 子弹都具备弹幕花样效果
- **变身系统**：收集道具后角色形态改变，获得不同能力
- **3 关制**：每关有独立主题、独立 Boss、逐步升级的难度

---

## 2. 技术栈

| 技术 | 说明 |
|------|------|
| HTML5 Canvas | 游戏渲染引擎 |
| 原生 JavaScript (ES6 Class) | 游戏逻辑 |
| CSS3 | HUD 和 UI 层 |
| 无框架依赖 | 所有代码直接通过 `<script>` 标签加载 |

---

## 3. 目标文件结构

```
superme/
├── index.html                  # 入口 HTML
├── css/
│   └── style.css               # UI 样式
├── js/
│   ├── core/                   # 🔵 核心模块（Task 01）
│   │   ├── game-state.js       # 游戏状态机（start/play/pause/transition/gameover/win）
│   │   ├── level-manager.js    # 关卡管理器（加载、切换、过渡动画）
│   │   ├── asset-manager.js    # 资源管理（颜色常量、配置常量）
│   │   └── event-bus.js        # 事件总线（模块间解耦通信）
│   │
│   ├── entity.js               # ✅ 已有 - 基础实体类
│   ├── physics.js              # ✅ 已有 - 物理碰撞
│   ├── input.js                # ✅ 已有 - 输入管理
│   ├── particle.js             # ✅ 已有 - 粒子系统
│   │
│   ├── player.js               # 🟡 需改造（Task 02 变身系统）
│   ├── bullet.js               # 🟡 需改造（Task 03 弹幕系统）
│   │
│   ├── transform/              # 🔴 新增（Task 02）
│   │   ├── transform-system.js # 变身管理器
│   │   ├── form-normal.js      # 普通形态
│   │   ├── form-mecha.js       # 机甲形态
│   │   ├── form-dragon.js      # 龙形态
│   │   └── form-phantom.js     # 幻影形态
│   │
│   ├── danmaku/                # 🔴 新增（Task 03）
│   │   ├── danmaku-engine.js   # 弹幕引擎核心
│   │   ├── patterns.js         # 弹幕花样库
│   │   └── bullet-pool.js     # 子弹对象池（性能优化）
│   │
│   ├── enemies/                # 🔴 新增（Task 04-06）
│   │   ├── enemy-base.js       # 敌人基类（从 enemy.js 重构）
│   │   ├── enemy-types.js      # 各种杂兵类型定义
│   │   ├── boss-base.js        # Boss 基类（从 boss.js 重构）
│   │   ├── boss-level1.js      # 第一关 Boss
│   │   ├── boss-level2.js      # 第二关 Boss
│   │   └── boss-level3.js      # 第三关 Boss
│   │
│   ├── levels/                 # 🔴 新增（Task 04-06）
│   │   ├── level-base.js       # 关卡基类
│   │   ├── level1-forest.js    # 第一关：像素森林
│   │   ├── level2-nether.js    # 第二关：地狱熔岩
│   │   └── level3-sky.js       # 第三关：天空圣殿
│   │
│   ├── powerup.js              # 🟡 需扩展（Task 02 新增变身道具）
│   ├── level.js                # 🟡 将被 levels/ 替代，保留 Platform 类
│   ├── enemy.js                # 🟡 将被 enemies/ 替代
│   ├── boss.js                 # 🟡 将被 enemies/ 替代
│   └── main.js                 # 🟡 需改造（接入状态机和关卡管理器）
│
└── docs/                       # 任务文档
    ├── 00-ARCHITECTURE.md      # 本文件
    ├── 01-CORE-REFACTOR.md
    ├── 02-TRANSFORM-SYSTEM.md
    ├── 03-BULLET-DANMAKU.md
    ├── 04-LEVEL1-FOREST.md
    ├── 05-LEVEL2-NETHER.md
    ├── 06-LEVEL3-SKY.md
    └── 07-UI-AUDIO-POLISH.md
```

---

## 4. 模块依赖图

```
                    ┌─────────────┐
                    │   main.js   │  ← 游戏主循环入口
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐    ┌───────▼──────┐   ┌──────▼──────┐
    │GameState│    │LevelManager  │   │  EventBus   │
    └────┬────┘    └───────┬──────┘   └──────┬──────┘
         │                 │                 │
         │          ┌──────┴──────┐          │
         │          │ Level 1/2/3 │          │
         │          └──────┬──────┘          │
         │                 │                 │
    ┌────┼─────────────────┼─────────────────┼────┐
    │    │                 │                 │    │
  ┌─▼──┐ ┌──▼───┐  ┌──────▼──────┐  ┌───▼───┐ ┌─▼──────┐
  │Play│ │Enemy │  │   Player    │  │Bullet │ │PowerUp │
  │ er │ │Types │  │+Transform  │  │+Danma │ │        │
  └─┬──┘ └──────┘  └──────┬──────┘  │ku    │ └────────┘
    │                      │         └───┬───┘
    │               ┌──────┴──────┐      │
    │               │ Transform   │      │
    │               │ System      │      │
    │               └─────────────┘      │
    │                                    │
    ├────────────────────────────────────┘
    │
  ┌─▼────────────────────────────┐
  │ 底层：Entity / Physics /     │
  │ Input / ParticleSystem       │
  └──────────────────────────────┘
```

---

## 5. 共享接口约定

### 5.1 Entity 基类（已有）

所有游戏对象继承自 `Entity`，必须实现：

```javascript
class Entity {
    constructor(x, y, width, height, color)
    update(dt)        // dt 是秒为单位的 delta time
    draw(ctx, cameraX, cameraY)
    markedForDeletion  // boolean，标记删除
}
```

### 5.2 关卡接口（新）

每个关卡必须实现以下接口（`level-base.js` 提供默认实现）：

```javascript
class LevelBase {
    constructor(levelNumber, name, config) {}

    // 生命周期
    init()                        // 初始化关卡（生成地形、敌人、道具）
    update(dt, player, bullets)   // 每帧更新
    draw(ctx, cameraX, cameraY)   // 渲染关卡内容
    cleanup()                     // 关卡结束时清理

    // 属性
    get width()                   // 关卡宽度
    get height()                  // 关卡高度
    get platforms()               // 平台数组
    get enemies()                 // 敌人数组
    get powerups()                // 道具数组
    get boss()                    // Boss 实例
    get isCompleted()             // 是否通关

    // 背景
    drawBackground(ctx, cameraX, cameraY, canvas)
}
```

### 5.3 变身形态接口（新）

```javascript
class FormBase {
    constructor(player) {}

    get name()          // 形态名称，如 "机甲"
    get color()         // 主颜色
    get speed()         // 移动速度
    get canFly()        // 是否可飞行
    get shootStyle()    // 射击方式描述

    onEnter(player)     // 进入此形态时的初始化
    onExit(player)      // 离开此形态时的清理
    update(dt, player)  // 额外更新逻辑
    shoot(player, bullets)  // 覆写射击行为
    draw(ctx, player, cameraX, cameraY)  // 覆写绘制
}
```

### 5.4 弹幕花样接口（新）

```javascript
// 弹幕花样函数签名
// 返回一组 Bullet 对象
function createPattern(originX, originY, targetX, targetY, options) {
    // options: { color, speed, count, spread, ... }
    return [Bullet, Bullet, ...]
}
```

### 5.5 事件总线接口（新）

```javascript
const EventBus = {
    on(event, callback)     // 订阅
    off(event, callback)    // 取消订阅
    emit(event, data)       // 触发

    // 预定义事件名：
    // 'level:start'      - 关卡开始 { levelNumber }
    // 'level:complete'   - 关卡完成 { levelNumber }
    // 'level:transition' - 关卡过渡动画开始
    // 'player:transform' - 玩家变身 { formName }
    // 'player:damage'    - 玩家受伤 { hp }
    // 'player:death'     - 玩家死亡
    // 'boss:spawn'       - Boss 出现 { bossName }
    // 'boss:phase'       - Boss 变阶段 { phase }
    // 'boss:defeat'      - Boss 被击败
    // 'game:over'        - 游戏结束
    // 'game:win'         - 游戏胜利
}
```

---

## 6. 全局常量与配置

所有 Agent 使用的共享常量应定义在 `js/core/asset-manager.js` 中：

```javascript
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    PLAYER: {
        BASE_SPEED: 300,
        JUMP_FORCE: -600,
        GRAVITY: 1500,
        MAX_HP: 5,               // 从 3 提升到 5
        MAX_JUMPS: 3,
        DAMAGE_COOLDOWN: 1.0,
    },

    DANMAKU: {
        MAX_BULLETS: 500,        // 屏幕最大子弹数
        BULLET_POOL_SIZE: 600,   // 对象池大小
    },

    LEVELS: {
        TOTAL: 3,
        TRANSITION_DURATION: 2,  // 关卡过渡动画时长（秒）
    },

    COLORS: {
        LEVEL1: { primary: '#00ff88', bg: '#0a1a0a', accent: '#88ff00' },
        LEVEL2: { primary: '#ff4400', bg: '#1a0a00', accent: '#ffaa00' },
        LEVEL3: { primary: '#aaaaff', bg: '#0a0a2a', accent: '#ffffff' },
    }
};
```

---

## 7. 三关主题概览

| 关卡 | 主题名 | 环境 | Boss | 难度侧重 |
|------|--------|------|------|----------|
| **第一关** | 像素森林 | 绿色森林 + 方块树 + 河流 | 树精王 (Treant King) | 入门引导，学习操作和变身 |
| **第二关** | 地狱熔岩 | 红色熔岩 + 岩浆河 + 黑曜石 | 烈焰魔龙 (Inferno Dragon) | 大量弹幕挑战，需巧妙闪避 |
| **第三关** | 天空圣殿 | 蓝紫色天空 + 浮空岛 + 光柱 | 天空暴君 (Sky Tyrant) | 全飞行作战，终极弹幕洗礼 |

---

## 8. 脚本加载顺序

在 `index.html` 中的 `<script>` 标签必须按以下顺序加载（因为无模块系统，依赖全局变量）：

```html
<!-- 1. 核心基础 -->
<script src="js/core/event-bus.js"></script>
<script src="js/core/asset-manager.js"></script>
<script src="js/physics.js"></script>
<script src="js/input.js"></script>
<script src="js/entity.js"></script>
<script src="js/particle.js"></script>

<!-- 2. 弹幕系统 -->
<script src="js/danmaku/bullet-pool.js"></script>
<script src="js/danmaku/patterns.js"></script>
<script src="js/danmaku/danmaku-engine.js"></script>
<script src="js/bullet.js"></script>

<!-- 3. 变身系统 -->
<script src="js/transform/form-normal.js"></script>
<script src="js/transform/form-mecha.js"></script>
<script src="js/transform/form-dragon.js"></script>
<script src="js/transform/form-phantom.js"></script>
<script src="js/transform/transform-system.js"></script>

<!-- 4. 游戏对象 -->
<script src="js/powerup.js"></script>
<script src="js/player.js"></script>
<script src="js/enemies/enemy-base.js"></script>
<script src="js/enemies/enemy-types.js"></script>
<script src="js/enemies/boss-base.js"></script>
<script src="js/enemies/boss-level1.js"></script>
<script src="js/enemies/boss-level2.js"></script>
<script src="js/enemies/boss-level3.js"></script>

<!-- 5. 关卡 -->
<script src="js/levels/level-base.js"></script>
<script src="js/levels/level1-forest.js"></script>
<script src="js/levels/level2-nether.js"></script>
<script src="js/levels/level3-sky.js"></script>

<!-- 6. 核心管理 + 主循环 -->
<script src="js/core/level-manager.js"></script>
<script src="js/core/game-state.js"></script>
<script src="js/main.js"></script>
```

---

## 9. 任务分配总览

| 任务文件 | 负责模块 | 依赖 | 可并行 |
|---------|---------|------|-------|
| `01-CORE-REFACTOR.md` | 核心重构：状态机、关卡管理器、事件总线 | 无 | ✅ 最先开始 |
| `02-TRANSFORM-SYSTEM.md` | 变身系统 + player.js 改造 | 01 的接口定义 | ✅ |
| `03-BULLET-DANMAKU.md` | 弹幕引擎 + bullet.js 改造 | 01 的接口定义 | ✅ |
| `04-LEVEL1-FOREST.md` | 第一关设计与实现 | 01, 02, 03 | ⏳ 等 01 完成 |
| `05-LEVEL2-NETHER.md` | 第二关设计与实现 | 01, 02, 03 | ⏳ 等 01 完成 |
| `06-LEVEL3-SKY.md` | 第三关设计与实现 | 01, 02, 03 | ⏳ 等 01 完成 |
| `07-UI-AUDIO-POLISH.md` | UI 改造、音效、过渡动画 | 01 | ✅ |

> **并行策略：** Task 01/02/03/07 可以同时开发。Task 04/05/06 需要等核心接口稳定后再开始，但三关之间可以并行。

---

## 10. 代码规范

1. **命名**：类名 PascalCase，函数/变量 camelCase，常量 UPPER_SNAKE_CASE
2. **注释**：每个文件开头注明文件用途；公共方法需要 JSDoc 注释
3. **坐标系**：左上角为 (0,0)，X 向右增大，Y 向下增大
4. **时间**：`dt` 单位为秒（非毫秒）
5. **颜色**：使用 hex 字符串 `'#rrggbb'`，透明色使用 `rgba()`
6. **删除标记**：用 `this.markedForDeletion = true` 标记待删除对象，在主循环中统一过滤
7. **不要引入任何外部依赖**：保持纯 HTML/JS/CSS

---

## 11. 向后兼容策略

当前游戏只有 1 关，重构过程中需要保持向后兼容：

1. 保留 `level.js` 中的 `Platform` 类，在新的 `level-base.js` 中复用
2. 旧的 `LevelMap.generate()` 内容移入 `level1-forest.js`
3. 旧的 `Boss` 类内容移入 `boss-level1.js`
4. 在新系统尚未完全就绪前，`main.js` 的外部接口保持不变

---

*所有 Agent 请先阅读本文件，再阅读自己负责的任务文件。*
