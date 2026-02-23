# 🎮 井字棋彩蛋系统 - 设计方案

**创建日期**: 2026-02-23
**状态**: ✅ 设计已批准
**优先级**: 中等

---

## 📋 设计概述

在 SUPERME 横版射击游戏的三个关卡中，动态生成井字棋（Tic-Tac-Toe）彩蛋触发点。玩家发现并挑战AI，获胜后获得随机奖励（无敌/回血/武器升级等）。

**核心价值**:
- 增加游戏探索乐趣和重玩价值
- 提供"休息"机制，缓解密集战斗的疲劳
- 移动端友好，无需键盘输入

---

## ✅ 需求确认总结

| 设计维度 | 决策 | 理由 |
|---------|------|------|
| **AI难度** | 混合模式（70%最优+30%随机） | 平衡挑战性与可玩性 |
| **奖励机制** | 随机奖励宝箱（5种） | 增加惊喜感和重玩价值 |
| **触发流程** | 暂停+确认弹窗（开始/跳过） | 给玩家选择权 |
| **关卡分布** | 动态生成（预设3-5个，激活1-2个） | 每次游玩都有新鲜感 |
| **视觉提示** | 微妙闪烁的金光 + "#"符号 | 平衡探索感与可发现性 |
| **UI风格** | 霓虹赛博风格（粉色X + 青色O） | 与游戏整体风格统一 |

---

## 🏗️ 架构设计

### 状态机扩展

```javascript
// js/core/game-state.js

STATES: {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_TRANSITION: 'level_transition',
    BOSS_INTRO: 'boss_intro',
    GAME_OVER: 'game_over',
    GAME_WIN: 'game_win',
    TIC_TAC_TOE: 'tic_tac_toe',  // 新增
}

transitions: {
    'playing': ['paused', 'boss_intro', 'level_transition', 'game_over', 'game_win', 'tic_tac_toe'],
    'tic_tac_toe': ['playing', 'game_over'],
}
```

### 核心组件

| 组件 | 文件路径 | 职责 | 代码量估算 |
|------|---------|------|-----------|
| **TicTacToeGame** | `js/minigame/tic-tac-toe.js` | 井字棋核心逻辑、AI算法、胜负判断 | ~300行 |
| **RewardSystem** | `js/minigame/reward-system.js` | 随机奖励生成和发放 | ~150行 |
| **TriggerSystem** | `js/levels/level-base.js` | 彩蛋触发点管理（扩展） | +80行 |
| **UI组件** | `index.html` + `css/style.css` | 霓虹风格井字棋界面 | +200行 |

---

## 🎯 井字棋游戏逻辑

### AI算法（混合模式）

```javascript
class TicTacToeAI {
    decideMove(board) {
        // 70% 概率走最优步（Minimax）
        if (Math.random() < 0.7) {
            return this.minimax(board);
        }
        // 30% 概率随机失误
        return this.randomMove(board);
    }

    minimax(board, depth = 0, isMaximizing = true) {
        // 基础情况
        if (this.checkWin(board, 'AI')) return 10 - depth;
        if (this.checkWin(board, 'PLAYER')) return depth - 10;
        if (board.isFull()) return 0;

        // 递归查找最优步
        const moves = board.getEmptyCells();
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (const move of moves) {
                board.apply(move, 'AI');
                const score = this.minimax(board, depth + 1, false);
                board.undo(move);
                bestScore = Math.max(bestScore, score);
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (const move of moves) {
                board.apply(move, 'PLAYER');
                const score = this.minimax(board, depth + 1, true);
                board.undo(move);
                bestScore = Math.min(bestScore, score);
            }
            return bestScore;
        }
    }
}
```

### 胜负判断

```javascript
const WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // 横向
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // 纵向
    [0, 4, 8], [2, 4, 6]              // 对角线
];

function checkWin(board, player) {
    return WIN_PATTERNS.some(pattern =>
        pattern.every(index => board[index] === player)
    );
}
```

---

## 🎁 随机奖励系统

### 奖励配置

| 奖励类型 | 概率 | 效果 | 实现方式 |
|---------|------|------|---------|
| **20秒无敌** | 30% | `player.invincible = true, timer = 20` | 彩虹闪烁效果 |
| **满HP恢复** | 25% | `player.hp = CONFIG.PLAYER.MAX_HP` | 绿色治疗特效 |
| **散射武器** | 20% | `player.weapon = 'spread', timer = 15` | 黄色武器光效 |
| **速射武器** | 15% | `player.weapon = 'rapid', timer = 15` | 蓝色武器光效 |
| **无限子弹** | 10% | `player.infiniteAmmo = true, timer = 5` | 青色弹药光效 |

### 奖励发放逻辑

```javascript
const REWARDS = {
    INVINCIBLE: { name: '20秒无敌', chance: 0.30, /* ... */ },
    FULL_HEAL: { name: '满HP恢复', chance: 0.25, /* ... */ },
    WEAPON_SPREAD: { name: '散射武器', chance: 0.20, /* ... */ },
    WEAPON_RAPID: { name: '速射武器', chance: 0.15, /* ... */ },
    INFINITE_AMMO: { name: '无限子弹', chance: 0.10, /* ... */ }
};

function grantRandomReward() {
    const rand = Math.random();
    let cumulative = 0;

    for (const [key, reward] of Object.entries(REWARDS)) {
        cumulative += reward.chance;
        if (rand <= cumulative) {
            reward.effect();
            return reward;
        }
    }
    return REWARDS.INVINCIBLE; // 兜底
}
```

---

## 🚪 触发点系统

### LevelBase 扩展

```javascript
class LevelBase {
    constructor(levelNumber, name, config = {}) {
        // ... 现有代码
        this.ticTacToeTriggers = [];
        this.ticTacToeCooldowns = {};
        this.possibleTriggerLocations = [];
    }

    addPossibleTriggerLocation(location) {
        this.possibleTriggerLocations.push({
            x: location.x,
            y: location.y,
            width: location.width || 80,
            height: location.height || 80,
            hint: location.hint || '发现神秘符文！',
            id: `trigger_${this.possibleTriggerLocations.length}`
        });
    }

    activateRandomTriggers(count = 2) {
        const shuffled = [...this.possibleTriggerLocations]
            .sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));

        selected.forEach(loc => {
            this.ticTacToeTriggers.push({
                ...loc,
                active: false,
                draw(ctx, cameraX, cameraY) {
                    const alpha = 0.2 + Math.sin(Date.now() / 500) * 0.1;
                    ctx.save();
                    ctx.translate(this.x - cameraX, this.y - cameraY);

                    // 金色光晕
                    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                    ctx.shadowColor = '#ffd700';
                    ctx.shadowBlur = 20;
                    ctx.fillRect(0, 0, this.width, this.height);

                    // "#" 符号
                    ctx.strokeStyle = `rgba(255, 215, 0, ${alpha + 0.3})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(20, 20); ctx.lineTo(60, 60);
                    ctx.moveTo(60, 20); ctx.lineTo(20, 60);
                    ctx.stroke();

                    ctx.restore();
                }
            });
        });
    }

    update(dt, player, bullets) {
        // ... 现有更新逻辑

        // 检查井字棋触发器
        this.ticTacToeTriggers.forEach(trigger => {
            if (Physics.checkCollision(player, trigger)) {
                const now = Date.now();
                const cooldown = 5 * 60 * 1000;

                if (!this.ticTacToeCooldowns[trigger.id] ||
                    now - this.ticTacToeCooldowns[trigger.id] > cooldown) {

                    this.ticTacToeCooldowns[trigger.id] = now;
                    EventBus.emit(EventBus.EVENTS.TIC_TAC_TOE_TRIGGER, {
                        hint: trigger.hint,
                        triggerId: trigger.id
                    });

                    player.x -= 100; // 推离触发区域
                }
            }
        });
    }

    draw(ctx, cameraX, cameraY) {
        // ... 现有渲染逻辑
        this.ticTacToeTriggers.forEach(trigger => {
            if (trigger.draw) trigger.draw(ctx, cameraX, cameraY);
        });
    }
}
```

---

## 🎨 UI界面设计

### 确认流程

1. **初始状态**: 显示确认对话框
   - "发现神秘符文！要挑战井字棋吗？"
   - [开始挑战] [跳过] 按钮

2. **游戏中**: 显示井字棋棋盘
   - 3x3 网格，可点击格子
   - 状态提示："轮到你下棋（X）"
   - AI自动下棋（O）

3. **游戏结束**: 显示结果和奖励
   - "恭喜获胜！" / "遗憾落败" / "平局"
   - 奖励展示（仅获胜时）
   - [再来一局] [关闭] 按钮

### HTML结构

```html
<div id="tictactoe-overlay" class="overlay hidden">
    <div class="tictactoe-container">
        <h2 class="neon-text">✨ 神秘井字棋 ✨</h2>
        <p class="hint-text">战胜AI赢得随机奖励！</p>

        <!-- 确认对话框 -->
        <div id="tictactoe-confirm" class="confirm-dialog">
            <p>发现神秘符文！要挑战井字棋吗？</p>
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

### 霓虹风格CSS要点

```css
/* 棋盘格子 - 青色霓虹边框 */
.cell {
    border: 3px solid #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

/* 玩家棋子 X - 粉色霓虹 */
.cell.x {
    color: #ff00ff;
    text-shadow: 0 0 20px #ff00ff;
}

/* AI棋子 O - 青色霓虹 */
.cell.o {
    color: #00ffff;
    text-shadow: 0 0 20px #00ffff;
}

/* 获胜动画 */
.cell.win {
    animation: winPulse 0.5s ease-in-out infinite;
    background: rgba(255, 215, 0, 0.3);
    border-color: #ffd700;
}

/* 奖励展示 */
.reward-display {
    border: 3px solid #ffd700;
    animation: rewardGlow 1s ease-in-out infinite;
}
```

---

## 🔄 完整交互流程

```
玩家移动到触发点位置
    ↓
LevelBase.update() 检测碰撞
    ↓
触发 EventBus.EVENTS.TIC_TAC_TOE_TRIGGER
    ↓
main.js 监听事件，暂停游戏（TIC_TAC_TOE状态）
    ↓
显示确认弹窗
    ├─ 玩家选择"跳过" → 触发点进入5分钟冷却 → 返回游戏
    └─ 玩家选择"开始" → 初始化井字棋游戏
         ↓
    玩家点击格子下棋（X）
         ↓
    AI自动回应（O）
         ↓
    胜负判断
         ├─ 玩家赢 → grantRandomReward() → 显示奖励 → 2秒后关闭
         ├─ AI赢 → 显示失败 → [再来一局] 或 [关闭]
         └─ 平局 → 显示平局 → [再来一局] 或 [关闭]
              ↓
关闭弹窗 → 返回游戏（PLAYING状态）→ 触发点进入冷却
```

---

## 📦 关卡集成

### Level 1 - Pixel Forest

```javascript
init() {
    // ... 现有关卡生成

    this.addPossibleTriggerLocation({
        x: 800, y: 250,
        hint: '发现古代树根符文！'
    });
    this.addPossibleTriggerLocation({
        x: 1500, y: 180,
        hint: '树叶间闪烁的金光！'
    });
    this.addPossibleTriggerLocation({
        x: 2500, y: 300,
        hint: '神秘的森林祭坛！'
    });

    this.activateRandomTriggers(2);
}
```

### Level 2 - Inferno Nether

```javascript
init() {
    // ... 现有关卡生成

    this.addPossibleTriggerLocation({
        x: 1200, y: 200,
        hint: '岩浆中的神秘符文！'
    });
    this.addPossibleTriggerLocation({
        x: 2200, y: 150,
        hint: '火焰祭坛的挑战！'
    });
    this.addPossibleTriggerLocation({
        x: 3500, y: 250,
        hint: '地狱深处的金光！'
    });

    this.activateRandomTriggers(2);
}
```

### Level 3 - Sky Temple

```javascript
init() {
    // ... 现有关卡生成

    this.addPossibleTriggerLocation({
        x: 1500, y: 100,
        hint: '云端的神秘书符！'
    });
    this.addPossibleTriggerLocation({
        x: 2800, y: 80,
        hint: '天空神殿的试炼！'
    });
    this.addPossibleTriggerLocation({
        x: 4200, y: 120,
        hint: '神圣的井字棋盘！'
    });

    this.activateRandomTriggers(2);
}
```

---

## ✅ 验收标准

### 功能测试

- [ ] 玩家能在预设位置看到闪烁金光
- [ ] 碰撞触发点后弹出确认对话框
- [ ] 跳过后触发点进入5分钟冷却
- [ ] 点击格子能正确下棋
- [ ] AI在70%时间走最优步，30%随机失误
- [ ] 胜负判断正确（横/竖/斜三连）
- [ ] 玩家获胜后必定获得随机奖励
- [ ] 5种奖励按照概率正确分配

### 关卡测试

- [ ] 每关随机激活1-2个触发点
- [ ] 每次游玩激活的位置可能不同
- [ ] 3个关卡的提示文字各不相同

### 移动端测试

- [ ] 触摸屏可以点击格子下棋
- [ ] UI在手机屏幕上正常显示
- [ ] 霓虹效果在移动设备上流畅运行

### 边界测试

- [ ] 游戏过程中ESC能退出（无奖励）
- [ ] 触发点冷却期间不会重复触发
- [ ] 再来一局功能正常
- [ ] 奖励效果正确应用到玩家

---

## 📊 开发工作量估算

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| **Phase 1** | 核心游戏逻辑（TicTacToeGame类、AI算法） | 2小时 |
| **Phase 2** | 奖励系统（RewardSystem类、5种奖励） | 1小时 |
| **Phase 3** | 触发点系统（LevelBase扩展） | 1小时 |
| **Phase 4** | UI界面（HTML + CSS + 事件绑定） | 1.5小时 |
| **Phase 5** | 关卡集成（3个关卡各添加触发点） | 0.5小时 |
| **Phase 6** | 测试与调试 | 1小时 |
| **总计** | | **7小时** |

---

## 🚀 后续扩展可能性

基于此框架可快速添加：
- 记忆卡片翻牌游戏
- 反应速度测试
- 数学速算挑战
- 节奏点击游戏
- 成就系统（完成次数、连胜记录）

---

**设计文档版本**: 1.0
**最后更新**: 2026-02-23
**状态**: ✅ 已批准，待实现
