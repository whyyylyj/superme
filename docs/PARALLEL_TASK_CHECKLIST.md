# SUPERME 并行开发任务清单 (Master Task Checklist)

> **版本：** 1.0  
> **目标：** 通过清晰的任务边界和依赖管理，支持 3-5 个 Agent 同时进行并行开发。  
> **使用方法：** 每个 Agent 认领一根“轨道（Track）”，完成后在清单中打钩。

---

## 🚦 并行开发导则

1.  **认领原则**：每个 Agent 只能认领一个 **Track** 或一个独立的 **Task**。
2.  **避免踩踏**：严禁在未沟通的情况下修改属于其他 Track 负责的核心文件（详见下方“文件所有权”）。
3.  **接口先行**：如果一个 Task 依赖另一个 Task 的接口，先由提供者创建空接口（Stub），调用者基于 Stub 开发。
4.  **频繁同步**：每次修改 `index.html` 或 `main.js` 时，尽量保持提交颗粒度小。

---

## 🛠️ 文件所有权分配 (Ownership)

为防止冲突，以下文件分配给特定轨道负责：

| 轨道 | 核心负责文件 | 可修改权限 |
| :--- | :--- | :--- |
| **Track A (Core)** | `main.js`, `index.html`, `js/core/*` | 全局顶层逻辑 |
| **Track B (Mechanics)** | `js/transform/*`, `js/danmaku/*` | `player.js` (仅限接入变身逻辑) |
| **Track C (Levels)** | `js/levels/*`, `js/enemies/*` | `level.js` (仅限迁移逻辑) |
| **Track D (Polish)** | `css/style.css`, `js/core/audio-manager.js` | `index.html` (仅限 UI 结构) |

---

## 🏃 任务清单

### 🟦 Track A: 核心基础设施 (核心启动桩)
*依赖：无。优先级：最高。*
- [ ] **Task A-1**: 创建 `js/core/event-bus.js` (事件系统)
- [ ] **Task A-2**: 创建 `js/core/asset-manager.js` (全局配置)
- [ ] **Task A-3**: 创建 `js/core/game-state.js` (状态机)
- [ ] **Task A-4**: 创建 `js/core/level-manager.js` (关卡切换逻辑)
- [ ] **Task A-5**: **重构 `main.js` 入口** —— 引入 `LevelManager` 和 `GameStateMachine` 循环。
- [ ] **Task A-6**: 更新 `index.html` 脚本引用顺序。

### 🟨 Track B: 战斗与变身系统 (核心机制)
*依赖：Track A 的接口定义。优先级：高。*
- [ ] **Task B-1**: **变身系统实现**
    - [ ] 创建 `js/transform/transform-system.js`
    - [ ] 创建 4 种形态类 (`form-normal.js`, `form-mecha.js`...)
    - [ ] 改造 `player.js`：将动力学和射击逻辑委托给变身系统。
- [ ] **Task B-2**: **弹幕引擎实现**
    - [ ] 创建 `js/danmaku/bullet-pool.js` (对象池)
    - [ ] 创建 `js/danmaku/patterns.js` (8 种花样)
    - [ ] 改造 `bullet.js`：支持 homing (追踪) 和生命周期管理。
    - [ ] 接入 `danmaku-engine.js`。

### 🟩 Track C: 关卡与内容生成 (游戏内容)
*依赖：Track A, Track B 完工。优先级：中。*
- [ ] **Task C-1**: **第一关：像素森林**
    - [ ] 创建 `js/levels/level-base.js`
    - [ ] 实现 `level1-forest.js` (地图、视差背景、道具摆放)
    - [ ] 实现 `boss-level1.js` (树精王)
- [ ] **Task C-2**: **第二关：地狱熔岩**
    - [ ] 实现 `level2-nether.js` (岩浆机制、喷泉逻辑)
    - [ ] 实现 `boss-level2.js` (烈焰魔龙，3 阶段)
- [ ] **Task C-3**: **第三关：天空圣殿**
    - [ ] 实现 `level3-sky.js` (虚空死亡、移动平台)
    - [ ] 实现 `boss-level3.js` (天空暴君，4 阶段弹幕)
- [ ] **Task C-4**: **杂兵库创建**：`js/enemies/enemy-types.js`。

### 🟪 Track D: 视觉、交互与音效 (打磨)
*依赖：Track A。优先级：中/低（可并行）。*
- [ ] **Task D-1**: **UI 深度重构**
    - [ ] HTML/CSS 动画化 (Logo 脉冲、心形 HP、变身进度条)
    - [ ] 实现游戏暂停界面 (`Escape` 键)
- [ ] **Task D-2**: **屏幕特效**
    - [ ] 实现 `js/core/screen-effects.js` (震动、闪光、慢动作)
    - [ ] 在 `main.js` 渲染循环中挂载该特效。
- [ ] **Task D-3**: **音效合成**
    - [ ] 实现 `js/core/audio-manager.js` (Web Audio API)
    - [ ] 编写 8-bit 音效库 (Shoot, Hit, Explosion, Transform...)
- [ ] **Task D-4**: **胜利/失败演出逻辑**
    - [ ] 随机死亡台词选择器。
    - [ ] 全屏烟花与结算动画。

---

## 📌 关键同步检查点 (Checkpoints)

1.  **Checkpoint 1**: **[基础设施就绪]** Track A 完成 Task A-5。
    - *此时其他 Agent 可以开始安全地测试变身和关卡加载。*
2.  **Checkpoint 2**: **[机制就绪]** Track B 完成所有任务。
    - *此时关卡 Agent (Track C) 可以调用所有弹幕花样和变身能力来设计 Boss。*
3.  **Checkpoint 3**: **[集成验证]** 第一关可以从标题画面开始直到击败 Boss 自动过渡到第二关。
    - *此时 Track D 应当完成所有音效和震动的挂载。*

---

## 🛠️ 推荐认领顺序建议

*   **1个 Agent 开发时**：A -> B -> C -> D
*   **2个 Agent 开发时**：(Agent 1: A+C), (Agent 2: B+D)
*   **4个 Agent 开发时**：每个 Track 分配一个 Agent
*   **大量 Agent 开发时**：Track C 可以按关卡进一步拆分 (C-1, C-2, C-3 分配给不同 Agent)

---
*请 Agent 开工前在下方记录状态*
- Track A: [待认领]
- Track B: [待认领]
- Track C: [待认领]
- Track D: [待认领]
