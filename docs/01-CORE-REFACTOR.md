# Task 01 — 核心基础设施重构

> **前置阅读：** `00-ARCHITECTURE.md`  
> **负责文件：** `js/core/event-bus.js`, `js/core/game-state.js`, `js/core/level-manager.js`, `js/core/asset-manager.js`, `main.js` 改造  
> **可并行：** ✅ 无前置依赖，最先开始

---

## 1. 任务目标

将当前"单关卡硬编码"的游戏结构重构为**支持多关卡切换的可扩展架构**。

### 当前问题

- `main.js` 直接操作 `LevelMap`（写死单一关卡）
- 游戏状态通过字符串变量管理，无状态转换逻辑
- 模块之间通过直接函数调用耦合

### 改造后

- 引入 **EventBus** 解耦模块通信
- 引入 **GameState 状态机** 管理游戏流程
- 引入 **LevelManager** 管理关卡加载与切换
- 引入 **AssetManager/CONFIG** 统一管理配置常量

---

## 2. 需要创建的文件

### 2.1 `js/core/event-bus.js`

简单的发布-订阅事件系统：

```javascript
// event-bus.js
const EventBus = {
    _listeners: {},

    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    },

    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    },

    emit(event, data) {
        if (!this._listeners[event]) return;
        this._listeners[event].forEach(cb => cb(data));
    },

    // 清理所有监听器
    clear() {
        this._listeners = {};
    }
};
```

**预定义事件列表（请严格使用这些事件名）：**

| 事件名 | 数据 | 触发时机 |
|--------|------|---------|
| `level:start` | `{ levelNumber }` | 关卡初始化完成，游戏开始 |
| `level:complete` | `{ levelNumber }` | Boss 被击杀，关卡完成 |
| `level:transition` | `{ from, to }` | 切换关卡的过渡动画开始 |
| `player:transform` | `{ formName, previousForm }` | 玩家变身 |
| `player:damage` | `{ currentHp, maxHp }` | 玩家受伤 |
| `player:death` | `{}` | 玩家死亡 |
| `boss:spawn` | `{ bossName, levelNumber }` | Boss 出场 |
| `boss:phase` | `{ phase, bossName }` | Boss 进入新阶段 |
| `boss:defeat` | `{ bossName, levelNumber }` | Boss 被击败 |
| `game:over` | `{}` | 游戏失败 |
| `game:win` | `{}` | 游戏通关（三关全部完成） |

---

### 2.2 `js/core/asset-manager.js`

全局配置和颜色常量：

```javascript
// asset-manager.js
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    PLAYER: {
        BASE_SPEED: 300,
        JUMP_FORCE: -600,
        GRAVITY: 1500,
        MAX_HP: 5,
        MAX_JUMPS: 3,
        DAMAGE_COOLDOWN: 1.0,
        SHOOT_COOLDOWN_NORMAL: 0.2,
        SHOOT_COOLDOWN_RAPID: 0.08,
        SHOOT_COOLDOWN_SPREAD: 0.3,
        BULLET_SPEED: 800,
    },

    DANMAKU: {
        MAX_BULLETS: 500,
        BULLET_POOL_SIZE: 600,
        DEFAULT_BULLET_LIFE: 120,
    },

    LEVELS: {
        TOTAL: 3,
        TRANSITION_DURATION: 2.0,
    },

    COLORS: {
        LEVEL1: {
            primary: '#00ff88',
            secondary: '#88ff00',
            bg: '#0a1a0a',
            platform: '#2a4a2a',
            accent: '#44cc44',
        },
        LEVEL2: {
            primary: '#ff4400',
            secondary: '#ffaa00',
            bg: '#1a0a00',
            platform: '#4a2a1a',
            accent: '#ff6600',
        },
        LEVEL3: {
            primary: '#aaaaff',
            secondary: '#ffffff',
            bg: '#0a0a2a',
            platform: '#2a2a4a',
            accent: '#8888ff',
        },
    },

    // 变身形态颜色
    FORMS: {
        NORMAL: '#00ffcc',
        MECHA: '#cccccc',
        DRAGON: '#ff6600',
        PHANTOM: '#aa00ff',
    }
};
```

---

### 2.3 `js/core/game-state.js`

有限状态机管理游戏流程：

```javascript
// game-state.js

const GameStateMachine = {
    // 所有可能的状态
    STATES: {
        START: 'start',           // 开始界面
        PLAYING: 'playing',       // 游戏中
        PAUSED: 'paused',         // 暂停
        LEVEL_TRANSITION: 'level_transition',  // 关卡过渡动画
        BOSS_INTRO: 'boss_intro', // Boss 登场演出
        GAME_OVER: 'game_over',   // 游戏失败
        GAME_WIN: 'game_win',     // 游戏通关
    },

    currentState: 'start',
    previousState: null,

    // 状态转换规则
    transitions: {
        'start':            ['playing'],
        'playing':          ['paused', 'boss_intro', 'level_transition', 'game_over'],
        'paused':           ['playing'],
        'boss_intro':       ['playing'],
        'level_transition': ['playing'],
        'game_over':        ['start'],
        'game_win':         ['start'],
    },

    changeState(newState) {
        // 验证转换合法性
        const allowed = this.transitions[this.currentState];
        if (!allowed || !allowed.includes(newState)) {
            console.warn(`Invalid state transition: ${this.currentState} -> ${newState}`);
            return false;
        }

        this.previousState = this.currentState;
        this.currentState = newState;

        EventBus.emit('state:change', {
            from: this.previousState,
            to: this.currentState
        });

        return true;
    },

    is(state) {
        return this.currentState === state;
    },

    // 强制重置到起始状态（用于重新开始游戏）
    reset() {
        this.currentState = 'start';
        this.previousState = null;
    }
};
```

---

### 2.4 `js/core/level-manager.js`

关卡管理器，负责加载和切换关卡：

```javascript
// level-manager.js

const LevelManager = {
    levels: [],             // 注册的关卡实例数组
    currentLevelIndex: -1,  // 当前关卡索引（-1 表示未开始）
    currentLevel: null,     // 当前关卡对象引用

    transitionTimer: 0,
    transitionDuration: CONFIG.LEVELS.TRANSITION_DURATION,

    /**
     * 注册关卡
     * @param {LevelBase} level - 关卡实例
     */
    registerLevel(level) {
        this.levels.push(level);
    },

    /**
     * 开始游戏（从第一关）
     */
    startGame() {
        this.currentLevelIndex = 0;
        this.loadCurrentLevel();
    },

    /**
     * 加载当前索引指向的关卡
     */
    loadCurrentLevel() {
        if (this.currentLevel) {
            this.currentLevel.cleanup();
        }

        this.currentLevel = this.levels[this.currentLevelIndex];
        this.currentLevel.init();

        EventBus.emit('level:start', {
            levelNumber: this.currentLevelIndex + 1,
            levelName: this.currentLevel.name
        });
    },

    /**
     * 进入下一关
     * @returns {boolean} 是否还有下一关
     */
    nextLevel() {
        if (this.currentLevelIndex + 1 >= this.levels.length) {
            // 已经是最后一关，游戏通关
            EventBus.emit('game:win', {});
            return false;
        }

        this.currentLevelIndex++;
        this.transitionTimer = this.transitionDuration;

        EventBus.emit('level:transition', {
            from: this.currentLevelIndex,
            to: this.currentLevelIndex + 1
        });

        return true;
    },

    /**
     * 更新关卡过渡
     */
    updateTransition(dt) {
        if (this.transitionTimer > 0) {
            this.transitionTimer -= dt;
            if (this.transitionTimer <= 0) {
                this.loadCurrentLevel();
                return true; // 过渡完成
            }
        }
        return false;
    },

    /**
     * 获取过渡进度 (0~1)
     */
    getTransitionProgress() {
        return 1 - (this.transitionTimer / this.transitionDuration);
    },

    /**
     * 绘制关卡过渡效果
     */
    drawTransition(ctx, canvas) {
        const progress = this.getTransitionProgress();

        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = progress < 0.5
            ? progress * 2      // 前半：渐入黑色
            : 2 - progress * 2; // 后半：渐出黑色
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 中间显示关卡名
        if (progress > 0.3 && progress < 0.7) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(
                `LEVEL ${this.currentLevelIndex + 1}`,
                canvas.width / 2,
                canvas.height / 2 - 20
            );

            ctx.font = '14px "Press Start 2P"';
            ctx.fillText(
                this.currentLevel ? this.currentLevel.name : '',
                canvas.width / 2,
                canvas.height / 2 + 20
            );
        }
        ctx.restore();
    },

    /**
     * 重置
     */
    reset() {
        if (this.currentLevel) this.currentLevel.cleanup();
        this.currentLevelIndex = -1;
        this.currentLevel = null;
        this.transitionTimer = 0;
    }
};
```

---

## 3. 改造 `main.js`

### 3.1 核心变更

将 `main.js` 从"直接操作 LevelMap"改为"通过 LevelManager 和 GameState 间接管理"。

**关键改动点：**

1. **`initGame()`** → 调用 `LevelManager.startGame()` 和 `GameStateMachine.changeState('playing')`
2. **`update(dt)`** → 根据 `GameStateMachine.currentState` 分支处理
3. 关卡完成后 → 调用 `LevelManager.nextLevel()` 触发过渡
4. 三关全通 → 触发 `game:win` 事件

### 3.2 改造后的 `initGame` 伪代码

```javascript
function initGame() {
    // 重置
    GameStateMachine.reset();
    LevelManager.reset();

    player = new Player(100, 300);
    bullets = [];
    ParticleSystem.particles = [];

    // 注册三个关卡（如果尚未注册）
    if (LevelManager.levels.length === 0) {
        LevelManager.registerLevel(new Level1Forest());
        LevelManager.registerLevel(new Level2Nether());
        LevelManager.registerLevel(new Level3Sky());
    }

    // 开始
    LevelManager.startGame();
    GameStateMachine.changeState('playing');

    // UI 更新...
    hideAllOverlays();
    showHUD();

    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    gameLoop(lastTime);
}
```

### 3.3 改造后的 `update` 伪代码

```javascript
function update(dt) {
    const state = GameStateMachine.currentState;

    switch (state) {
        case 'playing':
            // 正常游戏逻辑（现有逻辑）
            updateGameplay(dt);

            // 检查关卡完成
            if (LevelManager.currentLevel.isCompleted) {
                const hasNext = LevelManager.nextLevel();
                if (hasNext) {
                    GameStateMachine.changeState('level_transition');
                } else {
                    GameStateMachine.changeState('game_win');
                }
            }

            // 检查玩家死亡
            if (player.hp <= 0) {
                GameStateMachine.changeState('game_over');
            }
            break;

        case 'level_transition':
            ParticleSystem.update(dt);
            const done = LevelManager.updateTransition(dt);
            if (done) {
                // 重置玩家位置到新关卡起始点
                player.x = 100;
                player.y = 300;
                player.hp = CONFIG.PLAYER.MAX_HP; // 满血进入新关卡
                bullets = [];
                GameStateMachine.changeState('playing');
            }
            break;

        case 'boss_intro':
            // Boss 登场演出（可选）
            break;

        case 'game_over':
            // Game Over 界面
            break;

        case 'game_win':
            // 胜利烟花
            if (Math.random() < 0.1) {
                ParticleSystem.createFirework(/*...*/);
            }
            ParticleSystem.update(dt);
            break;
    }
}
```

### 3.4 改造后的 `draw` 伪代码

```javascript
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const level = LevelManager.currentLevel;
    if (!level) return;

    level.drawBackground(ctx, cameraX, cameraY, canvas);
    level.platforms.forEach(p => p.draw(ctx, cameraX, cameraY));
    level.powerups.forEach(p => p.draw(ctx, cameraX, cameraY));

    if (!player.markedForDeletion) player.draw(ctx, cameraX, cameraY);

    level.enemies.forEach(e => e.draw(ctx, cameraX, cameraY));
    if (level.boss && !level.boss.markedForDeletion) {
        level.boss.draw(ctx, cameraX, cameraY);
    }

    bullets.forEach(b => b.draw(ctx, cameraX, cameraY));
    ParticleSystem.draw(ctx, cameraX, cameraY);

    // 过渡动画叠加
    if (GameStateMachine.is('level_transition')) {
        LevelManager.drawTransition(ctx, canvas);
    }
}
```

---

## 4. 改造 `index.html`

1. 按照 `00-ARCHITECTURE.md` 第 8 节的顺序更新 `<script>` 标签
2. 添加关卡过渡 UI 元素（可选）：

```html
<!-- Level Transition Overlay -->
<div id="level-transition" class="overlay hidden">
    <h1 id="transition-level-name" class="glow"></h1>
    <p id="transition-level-subtitle"></p>
</div>
```

3. 更新 HUD 显示当前关卡号：

```html
<div class="hud-item">LV: <span id="level-val">1</span></div>
```

---

## 5. 验收标准

- [ ] `EventBus` 可以正常发布和订阅事件
- [ ] `GameStateMachine` 能按规则进行状态转换，非法转换会报警告
- [ ] `LevelManager` 能注册关卡、加载当前关卡、切换到下一关
- [ ] `main.js` 改造后，挂载一个"空壳关卡"（可以用旧的 LevelMap 数据），游戏能正常运行
- [ ] 关卡切换时有淡入淡出过渡效果
- [ ] HUD 显示当前关卡编号
- [ ] 三关全通后触发 `game:win` 事件并显示胜利画面
- [ ] 所有旧功能不回退（向后兼容）

---

## 6. 不要做的事

- ❌ 不要实现具体的关卡内容（那是 Task 04-06 的工作）
- ❌ 不要实现变身系统（那是 Task 02 的工作）
- ❌ 不要实现弹幕引擎（那是 Task 03 的工作）
- ❌ 不要引入任何外部依赖

---

*完成后，通知其他 Agent：核心基础设施就绪。*
