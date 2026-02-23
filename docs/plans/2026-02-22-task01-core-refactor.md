# Task 01 - 核心基础设施重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 将当前单关卡硬编码结构重构为支持多关卡切换的可扩展架构，引入事件总线、状态机、关卡管理器和配置中心。

**架构:** 采用发布-订阅模式解耦模块通信，通过状态机管理游戏流程转换，使用关卡管理器统一关卡加载与切换逻辑。

**技术栈:** 原生 JavaScript (ES6 Class)、HTML5 Canvas、无框架依赖

---

## 前置准备

### Task 0: 创建核心目录结构

**文件:**
- 创建目录: `js/core/`

**Step 1: 创建 core 目录**

```bash
mkdir -p js/core
```

**Step 2: 验证目录创建成功**

```bash
ls -la js/core/
```

预期: 空目录或仅包含 `.` 和 `..`

**Step 3: 提交**

```bash
git add js/core/
git commit -m "chore: create js/core directory for infrastructure modules"
```

---

## Task 1: 事件总线 (EventBus)

**文件:**
- 创建: `js/core/event-bus.js`

**Step 1: 创建 EventBus 基础实现**

```javascript
// js/core/event-bus.js

/**
 * EventBus - 发布订阅事件系统
 * 用于模块间解耦通信
 */
const EventBus = {
    _listeners: {},

    /**
     * 订阅事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    },

    /**
     * 取消订阅
     * @param {string} event - 事件名称
     * @param {Function} callback - 要移除的回调函数
     */
    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    },

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 传递给回调的数据
     */
    emit(event, data) {
        if (!this._listeners[event]) return;
        this._listeners[event].forEach(cb => cb(data));
    },

    /**
     * 清理所有监听器（用于重置游戏）
     */
    clear() {
        this._listeners = {};
    }
};

// 预定义事件名称常量
EventBus.EVENTS = {
    LEVEL_START: 'level:start',
    LEVEL_COMPLETE: 'level:complete',
    LEVEL_TRANSITION: 'level:transition',
    PLAYER_TRANSFORM: 'player:transform',
    PLAYER_DAMAGE: 'player:damage',
    PLAYER_DEATH: 'player:death',
    BOSS_SPAWN: 'boss:spawn',
    BOSS_PHASE: 'boss:phase',
    BOSS_DEFEAT: 'boss:defeat',
    GAME_OVER: 'game:over',
    GAME_WIN: 'game:win',
    STATE_CHANGE: 'state:change',
};
```

**Step 2: 在浏览器中手动测试**

打开 `index.html`，在控制台输入：

```javascript
// 测试订阅和发布
EventBus.on('test:event', (data) => console.log('Received:', data));
EventBus.emit('test:event', { message: 'Hello EventBus!' });
```

预期输出: `Received: {message: "Hello EventBus!"}`

**Step 3: 提交**

```bash
git add js/core/event-bus.js
git commit -m "feat: add EventBus for decoupled module communication"
```

---

## Task 2: 配置管理器 (AssetManager/CONFIG)

**文件:**
- 创建: `js/core/asset-manager.js`

**Step 1: 创建配置常量对象**

```javascript
// js/core/asset-manager.js

/**
 * CONFIG - 全局配置和常量
 * 集中管理游戏参数，便于平衡性调整
 */
const CONFIG = {
    // 画布尺寸
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // 玩家配置
    PLAYER: {
        BASE_SPEED: 300,
        JUMP_FORCE: -600,
        GRAVITY: 1500,
        MAX_HP: 5,               // 从 3 提升到 5
        MAX_JUMPS: 3,
        DAMAGE_COOLDOWN: 1.0,
        SHOOT_COOLDOWN_NORMAL: 0.2,
        SHOOT_COOLDOWN_RAPID: 0.08,
        SHOOT_COOLDOWN_SPREAD: 0.3,
        BULLET_SPEED: 800,
        WIDTH: 30,
        HEIGHT: 40,
    },

    // 弹幕配置
    DANMAKU: {
        MAX_BULLETS: 500,
        BULLET_POOL_SIZE: 600,
        DEFAULT_BULLET_LIFE: 120,
    },

    // 关卡配置
    LEVELS: {
        TOTAL: 3,
        TRANSITION_DURATION: 2.0,
    },

    // 颜色主题
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

**Step 2: 在浏览器中验证**

打开 `index.html`，在控制台输入：

```javascript
console.log('Canvas width:', CONFIG.CANVAS_WIDTH);
console.log('Player max HP:', CONFIG.PLAYER.MAX_HP);
console.log('Level 1 primary color:', CONFIG.COLORS.LEVEL1.primary);
```

预期输出: 正确的配置值

**Step 3: 提交**

```bash
git add js/core/asset-manager.js
git commit -m "feat: add CONFIG for centralized constants management"
```

---

## Task 3: 游戏状态机 (GameStateMachine)

**文件:**
- 创建: `js/core/game-state.js`

**Step 1: 创建状态机实现**

```javascript
// js/core/game-state.js

/**
 * GameStateMachine - 游戏流程状态机
 * 管理游戏状态转换，确保状态转换的合法性
 */
const GameStateMachine = {
    // 所有可能的状态
    STATES: {
        START: 'start',                    // 开始界面
        PLAYING: 'playing',                // 游戏中
        PAUSED: 'paused',                  // 暂停
        LEVEL_TRANSITION: 'level_transition',  // 关卡过渡动画
        BOSS_INTRO: 'boss_intro',          // Boss 登场演出
        GAME_OVER: 'game_over',            // 游戏失败
        GAME_WIN: 'game_win',              // 游戏通关
    },

    currentState: 'start',
    previousState: null,

    // 状态转换规则（白名单）
    transitions: {
        'start':            ['playing'],
        'playing':          ['paused', 'boss_intro', 'level_transition', 'game_over'],
        'paused':           ['playing'],
        'boss_intro':       ['playing'],
        'level_transition': ['playing'],
        'game_over':        ['start'],
        'game_win':         ['start'],
    },

    /**
     * 状态转换
     * @param {string} newState - 目标状态
     * @returns {boolean} 转换是否成功
     */
    changeState(newState) {
        // 验证转换合法性
        const allowed = this.transitions[this.currentState];
        if (!allowed || !allowed.includes(newState)) {
            console.warn(`Invalid state transition: ${this.currentState} -> ${newState}`);
            return false;
        }

        this.previousState = this.currentState;
        this.currentState = newState;

        // 触发状态变化事件
        EventBus.emit(EventBus.EVENTS.STATE_CHANGE, {
            from: this.previousState,
            to: this.currentState
        });

        console.log(`State changed: ${this.previousState} -> ${this.currentState}`);
        return true;
    },

    /**
     * 检查当前状态
     * @param {string} state - 要检查的状态
     * @returns {boolean}
     */
    is(state) {
        return this.currentState === state;
    },

    /**
     * 重置到起始状态（用于重新开始游戏）
     */
    reset() {
        this.currentState = 'start';
        this.previousState = null;
        console.log('StateMachine reset to start');
    }
};
```

**Step 2: 在浏览器中测试状态转换**

打开 `index.html`，在控制台输入：

```javascript
// 测试合法转换
console.log('Start -> Playing:', GameStateMachine.changeState('playing'));  // 应为 true
console.log('Current state:', GameStateMachine.currentState);  // 'playing'

// 测试非法转换
console.log('Playing -> GameWin:', GameStateMachine.changeState('game_win'));  // 应为 false，显示警告
console.log('Current state:', GameStateMachine.currentState);  // 仍然是 'playing'

// 重置
GameStateMachine.reset();
console.log('After reset:', GameStateMachine.currentState);  // 'start'
```

预期输出:
- 第一次转换返回 `true`
- 第二次转换返回 `false` 并显示警告
- 重置后状态为 `'start'`

**Step 3: 提交**

```bash
git add js/core/game-state.js
git commit -m "feat: add GameStateMachine for game flow control"
```

---

## Task 4: 关卡管理器 (LevelManager)

**文件:**
- 创建: `js/core/level-manager.js`

**Step 1: 创建关卡管理器实现**

```javascript
// js/core/level-manager.js

/**
 * LevelManager - 关卡管理器
 * 负责关卡注册、加载、切换和过渡动画
 */
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
        console.log(`Level registered: ${level.name} (Index: ${this.levels.length - 1})`);
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

        EventBus.emit(EventBus.EVENTS.LEVEL_START, {
            levelNumber: this.currentLevelIndex + 1,
            levelName: this.currentLevel.name
        });

        console.log(`Level loaded: ${this.currentLevel.name}`);
    },

    /**
     * 进入下一关
     * @returns {boolean} 是否还有下一关
     */
    nextLevel() {
        if (this.currentLevelIndex + 1 >= this.levels.length) {
            // 已经是最后一关，游戏通关
            EventBus.emit(EventBus.EVENTS.GAME_WIN, {});
            return false;
        }

        this.currentLevelIndex++;
        this.transitionTimer = this.transitionDuration;

        EventBus.emit(EventBus.EVENTS.LEVEL_TRANSITION, {
            from: this.currentLevelIndex - 1,
            to: this.currentLevelIndex
        });

        return true;
    },

    /**
     * 更新关卡过渡
     * @param {number} dt - Delta time (秒)
     * @returns {boolean} 过渡是否完成
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
     * @returns {number}
     */
    getTransitionProgress() {
        return 1 - (this.transitionTimer / this.transitionDuration);
    },

    /**
     * 绘制关卡过渡效果
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLCanvasElement} canvas
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
        console.log('LevelManager reset');
    }
};
```

**Step 2: 提交**

```bash
git add js/core/level-manager.js
git commit -m "feat: add LevelManager for level loading and transitions"
```

---

## Task 5: 更新 index.html 脚本加载顺序

**文件:**
- 修改: `index.html:64-76`

**Step 1: 更新脚本加载顺序**

找到 `index.html` 中的 `<script>` 标签部分（约第 64-76 行），替换为：

```html
    <!-- Scripts -->
    <!-- 1. 核心基础 -->
    <script src="js/core/event-bus.js"></script>
    <script src="js/core/asset-manager.js"></script>
    <script src="js/physics.js"></script>
    <script src="js/input.js"></script>
    <script src="js/entity.js"></script>
    <script src="js/particle.js"></script>

    <!-- 2. 弹幕系统（暂时保留原有 bullet.js） -->
    <script src="js/bullet.js"></script>

    <!-- 3. 游戏对象 -->
    <script src="js/powerup.js"></script>
    <script src="js/player.js"></script>
    <script src="js/enemy.js"></script>
    <script src="js/boss.js"></script>

    <!-- 4. 关卡 -->
    <script src="js/level.js"></script>

    <!-- 5. 核心管理 + 主循环 -->
    <script src="js/core/level-manager.js"></script>
    <script src="js/core/game-state.js"></script>
    <script src="js/main.js"></script>
```

**Step 2: 在浏览器中测试**

刷新 `index.html`，打开控制台，确认没有脚本加载错误。

**Step 3: 提交**

```bash
git add index.html
git commit -m "refactor: update script loading order for core modules"
```

---

## Task 6: 创建临时关卡基类 (LevelBase)

**文件:**
- 创建: `js/levels/level-base.js`

**Step 1: 创建 levels 目录和基类**

```bash
mkdir -p js/levels
```

**Step 2: 创建 LevelBase 类**

```javascript
// js/levels/level-base.js

/**
 * LevelBase - 关卡基类
 * 定义所有关卡必须实现的接口
 */
class LevelBase {
    constructor(levelNumber, name, config = {}) {
        this.levelNumber = levelNumber;
        this.name = name;
        this.config = config;

        this.platforms = [];
        this.enemies = [];
        this.powerups = [];
        this.boss = null;
        this.isCompleted = false;
    }

    /**
     * 初始化关卡（生成地形、敌人、道具）
     * 子类必须覆写此方法
     */
    init() {
        throw new Error('LevelBase.init() must be implemented by subclass');
    }

    /**
     * 每帧更新
     * @param {number} dt - Delta time (秒)
     * @param {Player} player - 玩家实例
     * @param {Array} bullets - 子弹数组
     */
    update(dt, player, bullets) {
        // 更新敌人
        this.enemies.forEach(e => e.update(dt, this.platforms));
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);

        // 更新道具
        this.powerups.forEach(p => p.update(dt, this.platforms));

        // 更新 Boss
        if (this.boss && !this.boss.markedForDeletion) {
            this.boss.update(dt, player, bullets, this.platforms);
        } else if (this.boss && this.boss.markedForDeletion) {
            this.isCompleted = true;
        }
    }

    /**
     * 渲染关卡内容
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} cameraX
     * @param {number} cameraY
     */
    draw(ctx, cameraX, cameraY) {
        this.platforms.forEach(p => p.draw(ctx, cameraX, cameraY));
        this.powerups.forEach(p => p.draw(ctx, cameraX, cameraY));
        this.enemies.forEach(e => e.draw(ctx, cameraX, cameraY));
        if (this.boss && !this.boss.markedForDeletion) {
            this.boss.draw(ctx, cameraX, cameraY);
        }
    }

    /**
     * 渲染背景
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} cameraX
     * @param {number} cameraY
     * @param {HTMLCanvasElement} canvas
     */
    drawBackground(ctx, cameraX, cameraY, canvas) {
        // 默认深色背景
        ctx.fillStyle = this.config.bgColor || '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 简单的网格背景
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const parallaxOffsetX = (cameraX * 0.5) % 50;

        ctx.beginPath();
        for (let x = -parallaxOffsetX; x < canvas.width; x += 50) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
    }

    /**
     * 关卡结束清理
     */
    cleanup() {
        this.platforms = [];
        this.enemies = [];
        this.powerups = [];
        this.boss = null;
        this.isCompleted = false;
    }

    // Getter 方法
    get width() {
        return this.config.width || 3000;
    }

    get height() {
        return this.config.height || 600;
    }
}
```

**Step 3: 提交**

```bash
git add js/levels/level-base.js
git commit -m "feat: add LevelBase class for level interface"
```

---

## Task 7: 创建临时关卡包装器

**文件:**
- 创建: `js/levels/level1-forest.js`

**Step 1: 创建第一关包装器**

```javascript
// js/levels/level1-forest.js

/**
 * Level1Forest - 第一关：像素森林（临时包装器）
 * 将现有的 LevelMap.generate() 包装成 LevelBase 接口
 */
class Level1Forest extends LevelBase {
    constructor() {
        super(1, 'Pixel Forest', {
            width: 4000,
            height: 600,
            bgColor: CONFIG.COLORS.LEVEL1.bg,
        });
    }

    init() {
        // 调用原有的 LevelMap.generate()
        LevelMap.generate();

        // 将生成的数据复制到本关卡
        this.platforms = LevelMap.platforms;
        this.enemies = LevelMap.enemies;
        this.powerups = LevelMap.powerups;
        this.boss = LevelMap.boss;

        console.log('Level1Forest initialized');
    }

    drawBackground(ctx, cameraX, cameraY, canvas) {
        LevelMap.drawBackground(ctx, cameraX, cameraY, canvas);
    }
}
```

**Step 2: 提交**

```bash
git add js/levels/level1-forest.js
git commit -m "feat: add Level1Forest wrapper for existing level"
```

---

## Task 8: 改造 main.js - initGame 函数

**文件:**
- 修改: `js/main.js:34-58`

**Step 1: 重写 initGame 函数**

找到 `initGame` 函数，替换为：

```javascript
function initGame() {
    // 重置系统
    GameStateMachine.reset();
    LevelManager.reset();

    // 创建游戏实体
    player = new Player(100, 300);
    bullets = [];
    ParticleSystem.particles = [];
    cameraX = 0;
    cameraY = 0;

    // 注册关卡（仅首次）
    if (LevelManager.levels.length === 0) {
        LevelManager.registerLevel(new Level1Forest());
        // 后续任务会添加更多关卡
        // LevelManager.registerLevel(new Level2Nether());
        // LevelManager.registerLevel(new Level3Sky());
    }

    // 开始游戏
    LevelManager.startGame();
    GameStateMachine.changeState('playing');

    // UI 更新
    uiStartScreen.classList.add('hidden');
    uiGameOverScreen.classList.add('hidden');
    uiWinScreen.classList.add('hidden');
    uiStartScreen.classList.remove('active');
    uiGameOverScreen.classList.remove('active');
    uiWinScreen.classList.remove('active');

    uiHUD.classList.remove('hidden');
    uiBossHud.classList.add('hidden');

    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    gameLoop(lastTime);
}
```

**Step 2: 在浏览器中测试**

刷新页面，点击 "START GAME"，确认游戏能正常开始。

**Step 3: 提交**

```bash
git add js/main.js
git commit -m "refactor: rewrite initGame to use LevelManager and GameStateMachine"
```

---

## Task 9: 改造 main.js - update 函数

**文件:**
- 修改: `js/main.js:184-243`

**Step 1: 重写 update 函数**

找到 `update` 函数，替换为：

```javascript
function update(dt) {
    const state = GameStateMachine.currentState;

    switch (state) {
        case 'playing':
            updateGameplay(dt);

            // 检查关卡完成
            if (LevelManager.currentLevel && LevelManager.currentLevel.isCompleted) {
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
                player.hp = CONFIG.PLAYER.MAX_HP;
                bullets = [];
                GameStateMachine.changeState('playing');
            }
            break;

        case 'boss_intro':
            // Boss 登场演出（可选，暂时跳过）
            break;

        case 'game_over':
            // Game Over 界面（静态，无需更新）
            break;

        case 'game_win':
            // 胜利烟花
            if (Math.random() < 0.1) {
                ParticleSystem.createFirework(
                    cameraX + Math.random() * canvas.width,
                    cameraY + Math.random() * canvas.height * 0.5
                );
            }
            ParticleSystem.update(dt);
            break;

        case 'start':
        case 'paused':
            // 静态状态，无需更新
            break;
    }
}

/**
 * 原有的游戏玩法逻辑
 */
function updateGameplay(dt) {
    if (Input.shoot) {
        player.shoot(bullets);
    }

    player.update(dt, LevelManager.currentLevel.platforms, LevelManager.currentLevel.width);

    // Smooth Camera Follow
    const targetCamX = player.x - canvas.width / 2 + player.width / 2;
    cameraX += (Math.max(0, Math.min(targetCamX, LevelManager.currentLevel.width - canvas.width)) - cameraX) * 5 * dt;

    // 更新关卡
    LevelManager.currentLevel.update(dt, player, bullets);

    // 更新子弹
    bullets.forEach(b => b.update(dt));
    bullets = bullets.filter(b => !b.markedForDeletion);

    // 更新粒子
    ParticleSystem.update(dt);

    // 碰撞检测
    checkPowerupCollisions();
    checkEnemyCollisions();

    updateHUD();
}
```

**Step 2: 提交**

```bash
git add js/main.js
git commit -m "refactor: rewrite update to use GameStateMachine"
```

---

## Task 10: 改造 main.js - draw 函数

**文件:**
- 修改: `js/main.js:245-264`

**Step 1: 重写 draw 函数**

找到 `draw` 函数，替换为：

```javascript
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const level = LevelManager.currentLevel;
    if (!level) return;

    level.drawBackground(ctx, cameraX, cameraY, canvas);
    level.platforms.forEach(p => p.draw(ctx, cameraX, cameraY));
    level.powerups.forEach(p => p.draw(ctx, cameraX, cameraY));

    if (GameStateMachine.is('playing') || GameStateMachine.is('game_win')) {
        if (!player.markedForDeletion) player.draw(ctx, cameraX, cameraY);
    }

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

**Step 2: 提交**

```bash
git add js/main.js
git commit -m "refactor: rewrite draw to use LevelManager.currentLevel"
```

---

## Task 11: 更新 index.html 添加关卡显示

**文件:**
- 修改: `index.html:20-25`

**Step 1: 添加关卡号显示**

在 HUD 中添加关卡号显示：

```html
            <!-- HUD -->
            <div id="hud" class="hidden">
                <div class="hud-item title">SUPERME</div>
                <div class="hud-item">LV: <span id="level-val">1</span></div>
                <div class="hud-item">HP: <span id="hp-val">3</span></div>
                <div class="hud-item">WPN: <span id="wpn-val">Normal</span></div>
                <div class="hud-item powerup"><span id="powerup-val"></span></div>
            </div>
```

**Step 2: 更新 updateHUD 函数**

在 `js/main.js` 中找到 `updateHUD` 函数，添加关卡号更新：

```javascript
function updateHUD() {
    // 更新关卡号
    const levelNum = LevelManager.currentLevelIndex + 1;
    document.getElementById('level-val').innerText = levelNum;

    uiHp.innerText = Math.max(0, player.hp);
    // ... 其余代码保持不变
}
```

**Step 3: 在浏览器中测试**

确认 HUD 显示 "LV: 1"。

**Step 4: 提交**

```bash
git add index.html js/main.js
git commit -m "feat: add level number display in HUD"
```

---

## Task 12: 更新 player.js 使用 CONFIG

**文件:**
- 修改: `js/player.js:4-44`

**Step 1: 替换硬编码值为 CONFIG**

找到 Player 类的构造函数，将硬编码值替换为 `CONFIG` 引用：

```javascript
class Player extends Entity {
    constructor(x, y) {
        // Player is a 30x40 character, distinct color
        super(x, y, CONFIG.PLAYER.WIDTH, CONFIG.PLAYER.HEIGHT, CONFIG.FORMS.NORMAL);

        this.speed = CONFIG.PLAYER.BASE_SPEED;
        this.jumpForce = CONFIG.PLAYER.JUMP_FORCE;
        this.gravity = CONFIG.PLAYER.GRAVITY;

        this.onGround = false;
        this.hp = CONFIG.PLAYER.MAX_HP;

        // Triple jump state
        this.jumpCount = 0;
        this.maxJumps = CONFIG.PLAYER.MAX_JUMPS;
        this.jumpBtnWasPressed = false;

        // Powerups state
        this.weapon = 'normal'; // 'normal' or 'spread'

        this.bambooMode = false;
        this.bambooTimer = 0;
        this.bambooMaxTime = 5; // seconds

        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleMaxTime = 8; // seconds

        this.shieldMode = false; // single hit protection

        this.speedMode = false;
        this.speedTimer = 0;
        this.speedMaxTime = 5; // seconds

        this.shootCooldown = 0;

        // Direction for shooting: 1 for right, -1 for left
        this.facing = 1;

        // Damage effect
        this.damageCooldown = 0;
    }
```

**Step 2: 更新 shoot 方法使用 CONFIG**

找到 `shoot` 方法，替换硬编码的冷却时间和子弹速度：

```javascript
    shoot(bullets) {
        if (this.shootCooldown > 0) return;

        const bulletSpeed = CONFIG.PLAYER.BULLET_SPEED;
        const startX = this.facing === 1 ? this.x + this.width : this.x - 10;
        const startY = this.y + this.height / 2 - 5;

        if (this.weapon === 'normal') {
            bullets.push(new Bullet(startX, startY, this.facing, 0, bulletSpeed, '#00ffff'));
            this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_NORMAL;
        } else if (this.weapon === 'rapid') {
            bullets.push(new Bullet(startX, startY, this.facing, 0, bulletSpeed + 200, '#cc00ff'));
            this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_RAPID;
        } else if (this.weapon === 'spread') {
            // Scatter shot: 3 bullets
            bullets.push(new Bullet(startX, startY, this.facing, 0, bulletSpeed, '#ff00ff'));
            bullets.push(new Bullet(startX, startY, this.facing, -0.2, bulletSpeed, '#ff00ff'));
            bullets.push(new Bullet(startX, startY, this.facing, 0.2, bulletSpeed, '#ff00ff'));

            this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_SPREAD;
        }
    }
```

**Step 3: 更新 takeDamage 方法使用 CONFIG**

找到 `takeDamage` 方法，更新伤害冷却时间：

```javascript
    takeDamage() {
        if (this.invincible || this.damageCooldown > 0) return;

        if (this.shieldMode) {
            this.shieldMode = false; // consume shield
            this.damageCooldown = CONFIG.PLAYER.DAMAGE_COOLDOWN;
            ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#0000ff', 20);
            return;
        }

        this.hp--;
        this.damageCooldown = CONFIG.PLAYER.DAMAGE_COOLDOWN;

        ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#ff0000', 15);
        if (this.hp <= 0) {
            this.markedForDeletion = true;
        }
    }
```

**Step 4: 在浏览器中测试**

确认游戏能正常运行，玩家行为没有改变。

**Step 5: 提交**

```bash
git add js/player.js
git commit -m "refactor: use CONFIG constants in Player class"
```

---

## Task 13: 最终集成测试

**Step 1: 完整游戏流程测试**

在浏览器中进行完整测试：

1. 刷新页面
2. 点击 "START GAME"
3. 确认 HUD 显示 "LV: 1" 和 "HP: 5"（注意 HP 从 3 变成了 5）
4. 玩游戏，击败 Boss
5. 观察关卡过渡动画（黑色淡入淡出 + "LEVEL 2" 文字）
6. 确认游戏继续进行（目前还是同一关卡内容）

**Step 2: 验证事件总线**

在控制台输入：

```javascript
// 订阅所有事件
Object.values(EventBus.EVENTS).forEach(event => {
    EventBus.on(event, (data) => console.log(`Event: ${event}`, data));
});

// 触发一次状态变化
GameStateMachine.changeState('paused');
```

预期: 控制台输出事件日志

**Step 3: 验证状态机**

测试非法状态转换：

```javascript
console.log('Try invalid transition:', GameStateMachine.changeState('game_win'));
// 应该返回 false 并显示警告
```

**Step 4: 提交最终版本**

```bash
git add .
git commit -m "test: complete Task 01 core refactor integration testing"
```

---

## 验收检查清单

- [ ] EventBus 可以正常发布和订阅事件
- [ ] GameStateMachine 能按规则进行状态转换，非法转换会报警告
- [ ] LevelManager 能注册关卡、加载当前关卡、切换到下一关
- [ ] main.js 改造后，游戏能正常运行
- [ ] 关卡切换时有淡入淡出过渡效果
- [ ] HUD 显示当前关卡编号
- [ ] 玩家 HP 正确显示为 5（使用 CONFIG.PLAYER.MAX_HP）
- [ ] 所有旧功能不回退（向后兼容）
- [ ] 代码风格一致，注释完整

---

## 下一步

完成 Task 01 后，可以并行开始：
- **Task 02:** 变身系统
- **Task 03:** 弹幕引擎
- **Task 07:** UI 与音效优化

等待 Task 01 完成后，Task 04/05/06（三关内容）可以并行开发。
