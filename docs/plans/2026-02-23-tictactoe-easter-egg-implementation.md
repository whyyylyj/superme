# 井字棋彩蛋系统实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 在SUPERME游戏的三个关卡中添加井字棋彩蛋系统，玩家挑战AI获胜后获得随机奖励

**架构:** 扩展现有状态机添加TIC_TAC_TOE状态，创建独立的井字棋游戏模块，通过EventBus与主游戏通信，在LevelBase中添加动态触发点系统

**技术栈:** Vanilla JavaScript (ES6 Classes), Canvas API, 现有EventBus系统, CSS3动画

---

## 实现总览

本计划分为6个主要任务，每个任务包含多个细粒度步骤（每步2-5分钟）：

1. **状态机与事件系统扩展** - 添加TIC_TAC_TOE状态和相关事件
2. **井字棋核心游戏逻辑** - 实现TicTacToeGame类和混合AI算法
3. **随机奖励系统** - 实现RewardSystem类和5种奖励类型
4. **触发点系统** - 扩展LevelBase添加动态触发点管理
5. **UI界面实现** - 创建霓虹风格井字棋UI和交互逻辑
6. **关卡集成与测试** - 在三个关卡中添加触发点位置并测试

---

## Task 1: 状态机与事件系统扩展

**文件:**
- 修改: `js/core/game-state.js`
- 修改: `js/core/event-bus.js`

### Step 1.1: 添加TIC_TAC_TOE状态到game-state.js

在`STATES`对象中添加新状态：

```javascript
// js/core/game-state.js - 第9-17行

STATES: {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_TRANSITION: 'level_transition',
    BOSS_INTRO: 'boss_intro',
    GAME_OVER: 'game_over',
    GAME_WIN: 'game_win',
    TIC_TAC_TOE: 'tic_tac_toe',  // 新增
},
```

### Step 1.2: 更新状态转换规则

在`transitions`对象中添加转换规则：

```javascript
// js/core/game-state.js - 第23-31行

transitions: {
    'start': ['playing'],
    'playing': ['paused', 'boss_intro', 'level_transition', 'game_over', 'game_win', 'tic_tac_toe'],  // 添加 'tic_tac_toe'
    'paused': ['playing'],
    'boss_intro': ['playing'],
    'level_transition': ['playing'],
    'game_over': ['start'],
    'game_win': ['start'],
    'tic_tac_toe': ['playing', 'game_over'],  // 新增
},
```

### Step 1.3: 添加井字棋相关事件到event-bus.js

```javascript
// js/core/event-bus.js - 在EVENTS对象中添加

EVENTS: {
    // ... 现有事件
    GAME_WIN: 'game:win',

    // 新增井字棋事件
    TIC_TAC_TOE_TRIGGER: 'tic_tac_toe:trigger',
    TIC_TAC_TOE_WIN: 'tic_tac_toe:win',
    TIC_TAC_TOE_LOSE: 'tic_tac_toe:lose',
    TIC_TAC_TOE_DRAW: 'tic_tac_toe:draw',
},
```

### Step 1.4: 验证状态机更新

在浏览器控制台运行：

```javascript
// 应该返回 true
console.log(GameStateMachine.STATES.TIC_TAC_TOE === 'tic_tac_toe');

// 应该返回 true
console.log(GameStateMachine.transitions['playing'].includes('tic_tac_toe'));

// 应该返回 true
console.log(EventBus.EVENTS.TIC_TAC_TOE_TRIGGER === 'tic_tac_toe:trigger');
```

### Step 1.5: 提交状态机扩展

```bash
git add js/core/game-state.js js/core/event-bus.js
git commit -m "feat: add TIC_TAC_TOE state and events for minigame system"
```

---

## Task 2: 井字棋核心游戏逻辑

**文件:**
- 创建: `js/minigame/tic-tac-toe.js`

### Step 2.1: 创建文件基础结构

```javascript
// js/minigame/tic-tac-toe.js

/**
 * TicTacToeGame - 井字棋游戏核心逻辑
 * 包含游戏状态管理、胜负判断、混合AI算法
 */
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill(null);  // 3x3棋盘扁平化
        this.currentPlayer = 'X';  // 'X' = 玩家, 'O' = AI
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];
    }

    /**
     * 重置游戏
     */
    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];
    }

    /**
     * 玩家下棋
     * @param {number} index - 棋盘索引（0-8）
     * @returns {boolean} 是否成功
     */
    makeMove(index) {
        if (this.gameOver || this.board[index] !== null) {
            return false;
        }

        this.board[index] = this.currentPlayer;
        this.moveHistory.push({ player: this.currentPlayer, index });

        // 检查胜负
        if (this.checkWin(this.currentPlayer)) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            return true;
        }

        // 检查平局
        if (this.board.every(cell => cell !== null)) {
            this.gameOver = true;
            this.winner = null;  // 平局
            return true;
        }

        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return true;
    }

    /**
     * AI下棋（混合模式：70%最优 + 30%随机）
     * @returns {number} AI选择的棋盘索引
     */
    makeAIMove() {
        if (this.gameOver || this.currentPlayer !== 'O') {
            return -1;
        }

        let index;
        // 70% 概率走最优步
        if (Math.random() < 0.7) {
            index = this.getBestMove();
        } else {
            // 30% 概率随机选择
            const emptyCells = this.board
                .map((cell, i) => cell === null ? i : null)
                .filter(i => i !== null);
            index = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        if (index !== -1) {
            this.makeMove(index);
        }

        return index;
    }

    /**
     * 使用Minimax算法找到最优步
     * @returns {number} 最优步的棋盘索引
     */
    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                const score = this.minimax(this.board, 0, false);
                this.board[i] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    }

    /**
     * Minimax算法实现
     * @param {Array} board - 棋盘状态
     * @param {number} depth - 递归深度
     * @param {boolean} isMaximizing - 是否是最大化玩家（AI）
     * @returns {number} 得分
     */
    minimax(board, depth, isMaximizing) {
        // 检查胜负
        if (this.checkWinForBoard(board, 'O')) {
            return 10 - depth;
        }
        if (this.checkWinForBoard(board, 'X')) {
            return depth - 10;
        }
        if (board.every(cell => cell !== null)) {
            return 0;  // 平局
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    const score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(bestScore, score);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    const score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(bestScore, score);
                }
            }
            return bestScore;
        }
    }

    /**
     * 检查指定玩家是否获胜
     * @param {string} player - 'X' 或 'O'
     * @returns {boolean}
     */
    checkWin(player) {
        return this.checkWinForBoard(this.board, player);
    }

    /**
     * 检查指定棋盘状态下某玩家是否获胜
     * @param {Array} board - 棋盘状态
     * @param {string} player - 'X' 或 'O'
     * @returns {boolean}
     */
    checkWinForBoard(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  // 横向
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  // 纵向
            [0, 4, 8], [2, 4, 6]              // 对角线
        ];

        return winPatterns.some(pattern =>
            pattern.every(index => board[index] === player)
        );
    }

    /**
     * 获取获胜线（用于UI高亮显示）
     * @returns {Array|null} 获胜的3个索引，或null
     */
    getWinningLine() {
        if (!this.winner) return null;

        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const pattern of winPatterns) {
            if (pattern.every(index => this.board[index] === this.winner)) {
                return pattern;
            }
        }

        return null;
    }

    /**
     * 获取游戏结果文本
     * @returns {string}
     */
    getResultText() {
        if (this.winner === 'X') {
            return '恭喜获胜！';
        } else if (this.winner === 'O') {
            return '遗憾落败...';
        } else {
            return '平局！';
        }
    }
}

// 全局单例
const TicTacToeInstance = new TicTacToeGame();
```

### Step 2.2: 在index.html中添加脚本标签

在`transform`系统脚本之后添加：

```html
<!-- index.html - 在 transform-system.js 之后 -->

<!-- Transform System -->
<script src="js/transform/form-normal.js"></script>
<script src="js/transform/form-mecha.js"></script>
<script src="js/transform/form-dragon.js"></script>
<script src="js/transform/form-phantom.js"></script>
<script src="js/transform/transform-system.js"></script>

<!-- Minigame System -->
<script src="js/minigame/tic-tac-toe.js"></script>
```

### Step 2.3: 测试井字棋核心逻辑

在浏览器控制台运行：

```javascript
// 测试基础功能
TicTacToeInstance.reset();
console.log(TicTacToeInstance.board);  // 应该显示 [null x 9]

// 测试下棋
TicTacToeInstance.makeMove(4);  // 中心
console.log(TicTacToeInstance.board[4]);  // 应该是 'X'

// 测试AI下棋
TicTacToeInstance.makeAIMove();
console.log(TicTacToeInstance.board.filter(c => c === 'O').length);  // 应该是 1

// 测试胜负判断（构造一个X获胜的局面）
TicTacToeInstance.reset();
TicTacToeInstance.board = ['X', 'X', 'X', null, null, null, null, null, null];
console.log(TicTacToeInstance.checkWin('X'));  // 应该是 true
console.log(TicTacToeInstance.getWinningLine());  // 应该是 [0, 1, 2]
```

### Step 2.4: 提交井字棋核心逻辑

```bash
git add js/minigame/tic-tac-toe.js index.html
git commit -m "feat: implement TicTacToeGame core logic with hybrid AI"
```

---

## Task 3: 随机奖励系统

**文件:**
- 创建: `js/minigame/reward-system.js`

### Step 3.1: 创建奖励系统类

```javascript
// js/minigame/reward-system.js

/**
 * RewardSystem - 随机奖励管理系统
 * 提供5种奖励类型：无敌、回血、武器升级等
 */
class RewardSystem {
    constructor() {
        this.rewards = {
            INVINCIBLE: {
                id: 'invincible',
                name: '20秒无敌',
                chance: 0.30,
                icon: '🛡️',
                color: '#ff00ff',
                apply: (player) => {
                    player.invincible = true;
                    player.invincibleTimer = 20;
                }
            },
            FULL_HEAL: {
                id: 'heal',
                name: '满HP恢复',
                chance: 0.25,
                icon: '💚',
                color: '#00ff00',
                apply: (player) => {
                    player.hp = CONFIG.PLAYER.MAX_HP;
                }
            },
            WEAPON_SPREAD: {
                id: 'spread',
                name: '散射武器',
                chance: 0.20,
                icon: '🔱',
                color: '#ffff00',
                apply: (player) => {
                    player.weapon = 'spread';
                    player.weaponTimer = 15;
                }
            },
            WEAPON_RAPID: {
                id: 'rapid',
                name: '速射武器',
                chance: 0.15,
                icon: '⚡',
                color: '#00ffff',
                apply: (player) => {
                    player.weapon = 'rapid';
                    player.weaponTimer = 15;
                }
            },
            INFINITE_AMMO: {
                id: 'ammo',
                name: '无限子弹',
                chance: 0.10,
                icon: '∞',
                color: '#ff8800',
                apply: (player) => {
                    player.infiniteAmmo = true;
                    player.ammoTimer = 5;
                }
            }
        };
    }

    /**
     * 随机抽取并发放奖励
     * @param {Player} player - 玩家实例
     * @returns {Object} 获得的奖励对象
     */
    grantRandomReward(player) {
        const rand = Math.random();
        let cumulative = 0;

        for (const [key, reward] of Object.entries(this.rewards)) {
            cumulative += reward.chance;
            if (rand <= cumulative) {
                reward.apply(player);
                return reward;
            }
        }

        // 兜底：返回无敌奖励
        this.rewards.INVINCIBLE.apply(player);
        return this.rewards.INVINCIBLE;
    }

    /**
     * 获取所有奖励信息（用于UI展示）
     * @returns {Array} 奖励列表
     */
    getAllRewards() {
        return Object.values(this.rewards);
    }

    /**
     * 根据ID获取奖励信息
     * @param {string} id - 奖励ID
     * @returns {Object|null}
     */
    getRewardById(id) {
        return Object.values(this.rewards).find(r => r.id === id) || null;
    }
}

// 全局单例
const RewardSystemInstance = new RewardSystem();
```

### Step 3.2: 在index.html中添加脚本标签

在`tic-tac-toe.js`之后添加：

```html
<!-- index.html -->

<!-- Minigame System -->
<script src="js/minigame/tic-tac-toe.js"></script>
<script src="js/minigame/reward-system.js"></script>
```

### Step 3.3: 测试奖励系统

在浏览器控制台运行（需要先进入游戏）：

```javascript
// 测试概率分布
const results = {};
for (let i = 0; i < 1000; i++) {
    const reward = RewardSystemInstance.grantRandomReward(player);
    results[reward.id] = (results[reward.id] || 0) + 1;
}
console.table(results);  // 应该看到大致符合30%, 25%, 20%, 15%, 10%的分布

// 测试奖励信息
console.log(RewardSystemInstance.getAllRewards());  // 应该返回5个奖励对象
console.log(RewardSystemInstance.getRewardById('invincible'));  // 应该返回无敌奖励对象
```

### Step 3.4: 提交奖励系统

```bash
git add js/minigame/reward-system.js index.html
git commit -m "feat: implement RewardSystem with 5 random reward types"
```

---

## Task 4: 触发点系统

**文件:**
- 修改: `js/levels/level-base.js`

### Step 4.1: 在LevelBase构造函数中添加井字棋触发点属性

```javascript
// js/levels/level-base.js - 第8-19行

constructor(levelNumber, name, config = {}) {
    this.levelNumber = levelNumber;
    this.name = name;
    this.config = config;

    this.platforms = [];
    this.enemies = [];
    this.powerups = [];
    this.checkpoints = [];
    this.boss = null;
    this.isCompleted = false;

    // 新增：井字棋触发点系统
    this.ticTacToeTriggers = [];
    this.ticTacToeCooldowns = {};
    this.possibleTriggerLocations = [];
}
```

### Step 4.2: 添加触发点位置管理方法

在`createCheckpoint`方法之后添加：

```javascript
// js/levels/level-base.js - 在createCheckpoint方法之后（约第57行）

    /**
     * 添加可能的井字棋触发点位置
     * @param {Object} location - {x, y, width, height, hint}
     */
    addPossibleTriggerLocation(location) {
        this.possibleTriggerLocations.push({
            x: location.x,
            y: location.y,
            width: location.width || 80,
            height: location.height || 80,
            hint: location.hint || '发现神秘符文！',
            id: `ttt_trigger_${this.levelNumber}_${this.possibleTriggerLocations.length}`
        });
    }

    /**
     * 随机激活指定数量的触发点
     * @param {number} count - 要激活的数量（默认2个）
     */
    activateRandomTriggers(count = 2) {
        // 打乱预设位置
        const shuffled = [...this.possibleTriggerLocations]
            .sort(() => Math.random() - 0.5);

        // 选择前count个（不超过总数）
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));

        // 创建触发点对象
        selected.forEach(loc => {
            this.ticTacToeTriggers.push({
                ...loc,
                draw: (ctx, cameraX, cameraY) => {
                    // 绘制闪烁金光
                    const alpha = 0.2 + Math.sin(Date.now() / 500) * 0.1;
                    ctx.save();
                    ctx.translate(loc.x - cameraX, loc.y - cameraY);

                    // 金色光晕背景
                    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                    ctx.shadowColor = '#ffd700';
                    ctx.shadowBlur = 20;
                    ctx.fillRect(0, 0, loc.width, loc.height);

                    // "#" 符号（井字棋暗示）
                    ctx.strokeStyle = `rgba(255, 215, 0, ${alpha + 0.3})`;
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    // 左上到右下
                    ctx.moveTo(loc.width * 0.3, loc.height * 0.3);
                    ctx.lineTo(loc.width * 0.7, loc.height * 0.7);
                    // 右上到左下
                    ctx.moveTo(loc.width * 0.7, loc.height * 0.3);
                    ctx.lineTo(loc.width * 0.3, loc.height * 0.7);
                    ctx.stroke();

                    ctx.restore();
                }
            });
        });

        console.log(`[Level ${this.levelNumber}] 激活了 ${selected.length} 个井字棋触发点`);
    }
```

### Step 4.3: 在update方法中添加触发检测

在现有的checkpoint检测逻辑之后添加：

```javascript
// js/levels/level-base.js - 在update方法中（约第85行之后）

        // 检查井字棋触发器
        this.ticTacToeTriggers.forEach(trigger => {
            if (Physics.checkCollision(player, trigger)) {
                const now = Date.now();
                const cooldown = 5 * 60 * 1000;  // 5分钟冷却

                const lastTriggered = this.ticTacToeCooldowns[trigger.id];
                if (!lastTriggered || now - lastTriggered > cooldown) {
                    // 记录触发时间
                    this.ticTacToeCooldowns[trigger.id] = now;

                    // 触发事件
                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit(EventBus.EVENTS.TIC_TAC_TOE_TRIGGER, {
                            hint: trigger.hint,
                            triggerId: trigger.id
                        });
                    }

                    // 将玩家推离触发区域，防止连续触发
                    player.x -= 100;
                    console.log(`[Level ${this.levelNumber}] 触发井字棋彩蛋: ${trigger.hint}`);
                }
            }
        });
```

### Step 4.4: 在draw方法中添加触发点渲染

在checkpoints渲染之后添加：

```javascript
// js/levels/level-base.js - 在draw方法中（约第112行）

    draw(ctx, cameraX, cameraY) {
        // 绘制checkpoint
        this.checkpoints.forEach(cp => {
            if (cp.draw) cp.draw(ctx, cameraX, cameraY);
        });

        // 绘制井字棋触发点
        this.ticTacToeTriggers.forEach(trigger => {
            if (trigger.draw) trigger.draw(ctx, cameraX, cameraY);
        });

        // ... 其余渲染逻辑
    }
```

### Step 4.5: 测试触发点系统

在浏览器控制台运行：

```javascript
// 进入第一关后
LevelMap.addPossibleTriggerLocation({ x: 800, y: 250, hint: '测试触发点' });
LevelMap.activateRandomTriggers(1);
console.log(LevelMap.ticTacToeTriggers.length);  // 应该是 1

// 移动玩家到触发点位置测试
player.x = 800;
player.y = 250;
// 应该看到控制台输出触发信息
```

### Step 4.6: 提交触发点系统

```bash
git add js/levels/level-base.js
git commit -m "feat: add dynamic tic-tac-toe trigger system to LevelBase"
```

---

## Task 5: UI界面实现

**文件:**
- 修改: `index.html`
- 修改: `css/style.css`
- 修改: `js/main.js`

### Step 5.1: 在index.html中添加井字棋UI结构

在`#pause-screen`之后添加：

```html
<!-- index.html - 在 pause-screen 之后 -->

    <!-- 井字棋小游戏界面 -->
    <div id="tictactoe-overlay" class="overlay hidden">
        <div class="tictactoe-container">
            <h2 class="neon-text">✨ 神秘井字棋 ✨</h2>
            <p class="hint-text">战胜AI赢得随机奖励！</p>

            <!-- 确认对话框 -->
            <div id="tictactoe-confirm" class="confirm-dialog">
                <p class="confirm-message">发现神秘符文！要挑战井字棋吗？</p>
                <div class="button-group">
                    <button id="ttt-start" class="pixel-btn primary">开始挑战</button>
                    <button id="ttt-skip" class="pixel-btn">跳过</button>
                </div>
            </div>

            <!-- 游戏面板 -->
            <div id="tictactoe-game" class="game-panel hidden">
                <div id="ttt-status" class="status-text">轮到你下棋（X）</div>

                <div class="board">
                    <div class="cell" data-index="0"></div>
                    <div class="cell" data-index="1"></div>
                    <div class="cell" data-index="2"></div>
                    <div class="cell" data-index="3"></div>
                    <div class="cell" data-index="4"></div>
                    <div class="cell" data-index="5"></div>
                    <div class="cell" data-index="6"></div>
                    <div class="cell" data-index="7"></div>
                    <div class="cell" data-index="8"></div>
                </div>

                <div id="ttt-result" class="result-text hidden"></div>

                <div class="controls">
                    <button id="ttt-restart" class="pixel-btn hidden">再来一局</button>
                    <button id="ttt-close" class="pixel-btn hidden">关闭</button>
                </div>
            </div>

            <!-- 奖励展示 -->
            <div id="ttt-reward" class="reward-display hidden">
                <div class="reward-icon">🎁</div>
                <div id="reward-name" class="reward-name"></div>
            </div>
        </div>
    </div>
```

### Step 5.2: 在style.css中添加井字棋UI样式

在文件末尾添加：

```css
/* =============================================
   井字棋小游戏UI样式
   ============================================= */

/* 容器 */
.tictactoe-container {
    background: rgba(0, 0, 0, 0.95);
    border: 4px solid #ff00ff;
    border-radius: 15px;
    padding: 30px;
    max-width: 500px;
    margin: 50px auto;
    box-shadow:
        0 0 30px #ff00ff,
        0 0 60px rgba(255, 0, 255, 0.3),
        inset 0 0 30px rgba(255, 0, 255, 0.1);
}

.tictactoe-container h2 {
    text-align: center;
    font-size: 28px;
    color: #ff00ff;
    text-shadow:
        0 0 5px #ff00ff,
        0 0 10px #ff00ff,
        0 0 20px #ff00ff,
        0 0 40px #ff00ff;
    margin-bottom: 10px;
}

.hint-text {
    text-align: center;
    color: #00ffff;
    font-size: 14px;
    margin-bottom: 20px;
    text-shadow: 0 0 5px #00ffff;
}

/* 确认对话框 */
.confirm-dialog {
    text-align: center;
    padding: 20px;
}

.confirm-message {
    color: #ffffff;
    font-size: 16px;
    margin-bottom: 20px;
    line-height: 1.6;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.pixel-btn {
    padding: 12px 24px;
    font-family: 'Press Start 2P', monospace;
    font-size: 12px;
    background: #333;
    border: 3px solid #fff;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 4px 4px 0 #000;
}

.pixel-btn:hover {
    background: #555;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
}

.pixel-btn.primary {
    background: #00ffff;
    border-color: #00ffff;
    color: #000;
    box-shadow: 4px 4px 0 #000, 0 0 20px #00ffff;
}

.pixel-btn.primary:hover {
    background: #00cccc;
    box-shadow: 6px 6px 0 #000, 0 0 30px #00ffff;
}

.pixel-btn:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0 #000;
}

/* 游戏面板 */
.game-panel {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}

.status-text {
    text-align: center;
    font-size: 18px;
    color: #ffff00;
    margin-bottom: 20px;
    text-shadow: 0 0 10px #ffff00;
}

/* 棋盘 */
.board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 20px auto;
    max-width: 300px;
}

.cell {
    width: 80px;
    height: 80px;
    background: rgba(0, 0, 0, 0.8);
    border: 3px solid #00ffff;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow:
        0 0 10px rgba(0, 255, 255, 0.5),
        inset 0 0 10px rgba(0, 255, 255, 0.1);
}

.cell:hover:not(.occupied) {
    background: rgba(0, 255, 255, 0.2);
    box-shadow: 0 0 20px #00ffff;
    transform: scale(1.05);
}

.cell.x {
    color: #ff00ff;
    text-shadow:
        0 0 10px #ff00ff,
        0 0 20px #ff00ff,
        0 0 30px #ff00ff;
}

.cell.o {
    color: #00ffff;
    text-shadow:
        0 0 10px #00ffff,
        0 0 20px #00ffff,
        0 0 30px #00ffff;
}

.cell.win {
    animation: winPulse 0.5s ease-in-out infinite;
    background: rgba(255, 215, 0, 0.3) !important;
    border-color: #ffd700 !important;
}

@keyframes winPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* 结果文本 */
.result-text {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    padding: 15px;
    margin: 20px 0;
    border-radius: 10px;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

.result-text.win {
    background: rgba(0, 255, 0, 0.3);
    border: 2px solid #00ff00;
    color: #00ff00;
    text-shadow: 0 0 15px #00ff00;
}

.result-text.lose {
    background: rgba(255, 0, 0, 0.3);
    border: 2px solid #ff0000;
    color: #ff0000;
    text-shadow: 0 0 15px #ff0000;
}

.result-text.draw {
    background: rgba(255, 255, 0, 0.3);
    border: 2px solid #ffff00;
    color: #ffff00;
    text-shadow: 0 0 15px #ffff00;
}

/* 控制按钮 */
.controls {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
}

/* 奖励展示 */
.reward-display {
    text-align: center;
    margin-top: 20px;
    padding: 20px;
    background: rgba(255, 215, 0, 0.2);
    border: 3px solid #ffd700;
    border-radius: 10px;
    animation: rewardGlow 1s ease-in-out infinite;
}

@keyframes rewardGlow {
    0%, 100% { box-shadow: 0 0 20px #ffd700; }
    50% { box-shadow: 0 0 40px #ffd700, 0 0 60px #ffd700; }
}

.reward-icon {
    font-size: 64px;
    animation: bounce 0.5s ease-in-out infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.reward-name {
    font-size: 20px;
    color: #ffd700;
    text-shadow: 0 0 10px #ffd700;
    margin-top: 10px;
}

.hidden {
    display: none !important;
}
```

### Step 5.3: 在main.js中添加井字棋事件监听和UI逻辑

在DOMContentLoaded回调中添加：

```javascript
// js/main.js - 在DOMContentLoaded回调中添加

    // ===== 井字棋彩蛋系统 =====

    const tictactoeOverlay = document.getElementById('tictactoe-overlay');
    const tictactoeConfirm = document.getElementById('tictactoe-confirm');
    const tictactoeGame = document.getElementById('tictactoe-game');
    const tictactoeReward = document.getElementById('ttt-reward');
    const boardCells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('ttt-status');
    const resultText = document.getElementById('ttt-result');
    const rewardName = document.getElementById('reward-name');

    // 监听井字棋触发事件
    EventBus.on(EventBus.EVENTS.TIC_TAC_TOE_TRIGGER, (data) => {
        console.log('[井字棋] 触发彩蛋:', data.hint);

        // 切换到井字棋状态
        GameStateMachine.changeState('tic_tac_toe');

        // 显示确认对话框
        tictactoeOverlay.classList.remove('hidden');
        tictactoeConfirm.classList.remove('hidden');
        tictactoeGame.classList.add('hidden');
        tictactoeReward.classList.add('hidden');
    });

    // 开始游戏按钮
    document.getElementById('ttt-start').addEventListener('click', () => {
        tictactoeConfirm.classList.add('hidden');
        tictactoeGame.classList.remove('hidden');
        startTicTacToeGame();
    });

    // 跳过按钮
    document.getElementById('ttt-skip').addEventListener('click', () => {
        closeTicTacToeUI();
    });

    // 开始井字棋游戏
    function startTicTacToeGame() {
        TicTacToeInstance.reset();
        updateBoardUI();
        statusText.textContent = '轮到你下棋（X）';
        resultText.classList.add('hidden');
        tictactoeReward.classList.add('hidden');
        document.getElementById('ttt-restart').classList.add('hidden');
        document.getElementById('ttt-close').classList.add('hidden');
    }

    // 更新棋盘UI
    function updateBoardUI() {
        boardCells.forEach((cell, index) => {
            cell.textContent = TicTacToeInstance.board[index] || '';
            cell.className = 'cell';  // 重置类名

            if (TicTacToeInstance.board[index] === 'X') {
                cell.classList.add('x', 'occupied');
            } else if (TicTacToeInstance.board[index] === 'O') {
                cell.classList.add('o', 'occupied');
            }
        });

        // 高亮获胜线
        const winLine = TicTacToeInstance.getWinningLine();
        if (winLine) {
            winLine.forEach(index => {
                boardCells[index].classList.add('win');
            });
        }
    }

    // 棋盘格子点击事件
    boardCells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (TicTacToeInstance.gameOver ||
                TicTacToeInstance.currentPlayer !== 'X') {
                return;
            }

            const index = parseInt(cell.dataset.index);
            const success = TicTacToeInstance.makeMove(index);

            if (success) {
                updateBoardUI();

                // 检查游戏是否结束
                if (TicTacToeInstance.gameOver) {
                    handleGameEnd();
                } else {
                    // AI回合
                    statusText.textContent = 'AI思考中...';
                    setTimeout(() => {
                        TicTacToeInstance.makeAIMove();
                        updateBoardUI();

                        if (TicTacToeInstance.gameOver) {
                            handleGameEnd();
                        } else {
                            statusText.textContent = '轮到你下棋（X）';
                        }
                    }, 500);  // 延迟500ms模拟AI思考
                }
            }
        });
    });

    // 处理游戏结束
    function handleGameEnd() {
        statusText.textContent = '游戏结束';
        const result = TicTacToeInstance.getResultText();
        resultText.textContent = result;
        resultText.classList.remove('hidden');

        // 设置结果样式
        resultText.className = 'result-text';
        if (TicTacToeInstance.winner === 'X') {
            resultText.classList.add('win');
            showReward();
        } else if (TicTacToeInstance.winner === 'O') {
            resultText.classList.add('lose');
        } else {
            resultText.classList.add('draw');
        }

        // 显示控制按钮
        document.getElementById('ttt-restart').classList.remove('hidden');
        document.getElementById('ttt-close').classList.remove('hidden');
    }

    // 显示奖励
    function showReward() {
        if (typeof player !== 'undefined') {
            const reward = RewardSystemInstance.grantRandomReward(player);
            rewardName.textContent = `${reward.icon} ${reward.name}`;
            tictactoeReward.classList.remove('hidden');

            // 触发奖励事件
            EventBus.emit(EventBus.EVENTS.TIC_TAC_TOE_WIN, { reward });
        }
    }

    // 再来一局按钮
    document.getElementById('ttt-restart').addEventListener('click', () => {
        startTicTacToeGame();
    });

    // 关闭按钮
    document.getElementById('ttt-close').addEventListener('click', () => {
        closeTicTacToeUI();
    });

    // 关闭井字棋UI
    function closeTicTacToeUI() {
        tictactoeOverlay.classList.add('hidden');
        GameStateMachine.changeState('playing');
    }
```

### Step 5.4: 在main.js的update函数中添加TIC_TAC_TOE状态处理

在switch语句中添加：

```javascript
// js/main.js - 在update函数的switch中添加

    switch (state) {
        // ... 现有状态处理

        case 'tic_tac_toe':
            // 井字棋状态：暂停游戏更新，只处理特效
            ParticleSystem.update(dt);
            ScreenEffects.update(dt);
            break;
    }
```

### Step 5.5: 测试UI交互

在浏览器中：
1. 打开游戏并进入第一关
2. 在控制台手动触发事件：`EventBus.emit(EventBus.EVENTS.TIC_TAC_TOE_TRIGGER, { hint: '测试' })`
3. 验证确认对话框显示
4. 点击"开始挑战"
5. 点击格子下棋，验证AI回应
6. 验证胜负判断和奖励发放

### Step 5.6: 提交UI实现

```bash
git add index.html css/style.css js/main.js
git commit -m "feat: implement neon-style tic-tac-toe UI with interaction logic"
```

---

## Task 6: 关卡集成与测试

**文件:**
- 修改: `js/levels/level1-forest.js`
- 修改: `js/levels/level2-nether.js`
- 修改: `js/levels/level3-sky.js`

### Step 6.1: 在Level 1中添加井字棋触发点

```javascript
// js/levels/level1-forest.js - 在init方法末尾添加

    init() {
        // ... 现有关卡生成代码

        // 添加井字棋触发点（预设3个，实际激活2个）
        this.addPossibleTriggerLocation({
            x: 800,
            y: 250,
            hint: '发现古代树根符文！'
        });

        this.addPossibleTriggerLocation({
            x: 1500,
            y: 180,
            hint: '树叶间闪烁的金光！'
        });

        this.addPossibleTriggerLocation({
            x: 2500,
            y: 300,
            hint: '神秘的森林祭坛！'
        });

        // 随机激活2个触发点
        this.activateRandomTriggers(2);
    }
```

### Step 6.2: 在Level 2中添加井字棋触发点

```javascript
// js/levels/level2-nether.js - 在init方法末尾添加

    init() {
        // ... 现有关卡生成代码

        this.addPossibleTriggerLocation({
            x: 1200,
            y: 200,
            hint: '岩浆中的神秘符文！'
        });

        this.addPossibleTriggerLocation({
            x: 2200,
            y: 150,
            hint: '火焰祭坛的挑战！'
        });

        this.addPossibleTriggerLocation({
            x: 3500,
            y: 250,
            hint: '地狱深处的金光！'
        });

        this.activateRandomTriggers(2);
    }
```

### Step 6.3: 在Level 3中添加井字棋触发点

```javascript
// js/levels/level3-sky.js - 在init方法末尾添加

    init() {
        // ... 现有关卡生成代码

        this.addPossibleTriggerLocation({
            x: 1500,
            y: 100,
            hint: '云端的神秘书符！'
        });

        this.addPossibleTriggerLocation({
            x: 2800,
            y: 80,
            hint: '天空神殿的试炼！'
        });

        this.addPossibleTriggerLocation({
            x: 4200,
            y: 120,
            hint: '神圣的井字棋盘！'
        });

        this.activateRandomTriggers(2);
    }
```

### Step 6.4: 完整功能测试

创建测试清单并逐项验证：

```bash
# 创建测试文档
cat > tests/tictactoe-test-checklist.md << 'EOF'
# 井字棋彩蛋系统测试清单

## 功能测试
- [ ] 玩家能在预设位置看到闪烁金光
- [ ] 碰撞触发点后弹出确认对话框
- [ ] 跳过后触发点进入5分钟冷却
- [ ] 点击格子能正确下棋
- [ ] AI在70%时间走最优步
- [ ] 胜负判断正确
- [ ] 玩家获胜后获得随机奖励
- [ ] 5种奖励按照概率正确分配

## 关卡测试
- [ ] Level 1 有2个激活的触发点
- [ ] Level 2 有2个激活的触发点
- [ ] Level 3 有2个激活的触发点
- [ ] 每次游玩激活的位置可能不同

## 移动端测试
- [ ] 触摸屏可以点击格子
- [ ] UI在手机屏幕正常显示
- [ ] 霓虹效果流畅运行

## 边界测试
- [ ] ESC能退出（无奖励）
- [ ] 触发点冷却期间不重复触发
- [ ] 再来一局功能正常
EOF
```

手动运行以下测试：

```javascript
// 测试Level 1触发点
LevelMap.init();
console.log('[Level 1] 触发点数量:', LevelMap.ticTacToeTriggers.length);  // 应该是 2

// 移动玩家到第一个触发点
const firstTrigger = LevelMap.ticTacToeTriggers[0];
player.x = firstTrigger.x;
player.y = firstTrigger.y;
// 应该看到确认对话框弹出

// 测试AI性能
console.time('AI性能测试');
for (let i = 0; i < 100; i++) {
    const game = new TicTacToeGame();
    while (!game.gameOver) {
        game.makeAIMove();
        if (!game.gameOver) {
            const empty = game.board.findIndex(c => c === null);
            if (empty !== -1) game.makeMove(empty);
        }
    }
}
console.timeEnd('AI性能测试');  // 应该 < 100ms
```

### Step 6.5: 提交关卡集成

```bash
git add js/levels/level1-forest.js js/levels/level2-nether.js js/levels/level3-sky.js
git commit -m "feat: integrate tic-tac-toe triggers into all 3 levels"
```

### Step 6.6: 最终提交与测试

```bash
# 查看所有变更
git log --oneline --all -10

# 运行完整游戏测试
open index.html

# 手动测试所有功能
# 1. 开始游戏，进入Level 1
# 2. 找到闪烁金光触发点
# 3. 完成井字棋游戏
# 4. 验证奖励效果
# 5. 测试冷却时间
# 6. 进入Level 2和Level 3重复测试
```

---

## 📊 完成检查清单

### 代码质量
- [ ] 所有新文件符合现有代码风格
- [ ] 所有方法有JSDoc注释
- [ ] 没有console.log调试代码残留
- [ ] 所有魔法数字提取为常量

### 测试覆盖
- [ ] 井字棋核心逻辑测试通过
- [ ] AI算法测试通过
- [ ] 奖励系统概率测试通过
- [ ] 触发点系统测试通过
- [ ] UI交互测试通过
- [ ] 三个关卡集成测试通过

### 文档更新
- [ ] 设计文档已创建
- [ ] 实现计划已创建
- [ ] 测试清单已创建
- [ ] README.md已更新（如需要）

### Git提交
- [ ] 每个Task有独立commit
- [ ] Commit消息清晰描述变更
- [ ] 没有未提交的临时文件
- [ ] .gitignore正确配置

---

## 🎯 验收标准

### 功能完整性
✅ 玩家能发现并触发井字棋彩蛋
✅ AI提供混合难度（70%最优 + 30%随机）
✅ 5种奖励按概率正确发放
✅ 触发点有5分钟冷却时间
✅ UI风格与游戏保持一致

### 用户体验
✅ 触发点视觉提示明显但不突兀
✅ 确认对话框不打断游戏节奏
✅ 棋盘操作流畅，支持触摸
✅ 奖励展示有视觉冲击力
✅ 再来一局功能可用

### 技术质量
✅ 代码结构清晰，易于扩展
✅ AI性能良好（<50ms响应）
✅ 内存管理正确（无泄漏）
✅ 状态转换符合规则
✅ 移动端兼容性良好

---

**实现计划版本**: 1.0
**创建日期**: 2026-02-23
**预计完成时间**: 7小时
**状态**: ✅ 就绪，等待执行
