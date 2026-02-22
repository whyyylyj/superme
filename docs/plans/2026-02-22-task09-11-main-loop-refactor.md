# Task 09-11 - 主循环改造实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 改造 main.js 的核心函数，从直接操作 LevelMap 改为通过 LevelManager 和 GameStateMachine 间接管理。

**架构:** 引入状态机驱动的 update 循环，通过 LevelManager 访问当前关卡数据。

**前置依赖:** 必须先完成 Task 07-08（关卡系统基础）

---

## 前置条件

确保已完成：
- [x] 核心模块（EventBus, CONFIG, GameStateMachine, LevelManager）已创建
- [x] LevelBase 和 Level1Forest 类已创建
- [x] index.html 脚本加载顺序已更新

---

## Task 9: 改造 initGame 函数

**文件:**
- 修改: `js/main.js:34-58`

**Step 1: 备份原始代码**

首先阅读现有的 `initGame` 函数：

```bash
# 在编辑器中打开 js/main.js，找到 initGame 函数（约第 34-58 行）
# 记录现有逻辑，以便参考
```

**Step 2: 重写 initGame 函数**

将 `initGame` 函数完整替换为：

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

**Step 3: 在浏览器中测试**

1. 刷新 `index.html`
2. 打开浏览器控制台
3. 点击 "START GAME" 按钮
4. 确认没有错误，游戏能正常开始

预期输出:
- 控制台显示: "Level registered: Pixel Forest (Index: 0)"
- 控制台显示: "Level loaded: Pixel Forest"
- 控制台显示: "State changed: start -> playing"

**Step 4: 提交**

```bash
git add js/main.js
git commit -m "refactor: rewrite initGame to use LevelManager and GameStateMachine"
```

---

## Task 10: 改造 update 函数（最复杂）

**文件:**
- 修改: `js/main.js:184-243`

**Step 1: 阅读现有 update 函数**

```bash
# 在编辑器中打开 js/main.js
# 找到 update 函数（约第 184-243 行）
# 理解现有的更新逻辑
```

**Step 2: 在 update 函数之前添加 updateGameplay 辅助函数**

在 `update` 函数**之前**插入以下代码：

```javascript
/**
 * 原有的游戏玩法逻辑
 * 提取为独立函数，便于状态机调用
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

**Step 3: 重写 update 函数**

完整替换 `update` 函数：

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
```

**Step 4: 在浏览器中测试**

1. 刷新页面
2. 开始游戏
3. 玩游戏，确认所有功能正常：
   - 玩家移动
   - 射击
   - 敌人互动
   - 道具拾取
4. 击败 Boss，观察是否触发关卡过渡

**Step 5: 提交**

```bash
git add js/main.js
git commit -m "refactor: rewrite update to use GameStateMachine"
```

---

## Task 11: 改造 draw 函数

**文件:**
- 修改: `js/main.js:245-264`

**Step 1: 重写 draw 函数**

找到 `draw` 函数，完整替换为：

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

**Step 2: 在浏览器中完整测试**

进行完整游戏流程测试：

1. 刷新页面，点击开始
2. 玩游戏，击败 Boss
3. 观察关卡过渡效果：
   - 画面应该淡入黑色
   - 显示 "LEVEL 2" 文字
   - 画面淡出黑色
   - 游戏重新开始（目前还是同一关卡内容）

**Step 3: 提交**

```bash
git add js/main.js
git commit -m "refactor: rewrite draw to use LevelManager.currentLevel"
```

---

## 验收检查清单

- [ ] initGame 使用 LevelManager.startGame() 和 GameStateMachine
- [ ] update 使用 switch-case 处理不同状态
- [ ] draw 使用 LevelManager.currentLevel 访问关卡数据
- [ ] 游戏能正常启动和运行
- [ ] Boss 击败后触发关卡过渡动画
- [ ] 所有功能向后兼容（无回退）

---

## 故障排查

### 问题：游戏无法启动

**检查：**
```javascript
// 在控制台输入
console.log(LevelManager);
console.log(GameStateMachine);
console.log(Level1Forest);
```

预期: 三个对象都应该存在

### 问题：关卡过渡不触发

**检查：**
```javascript
// 在控制台输入
EventBus.on('boss:defeat', (data) => console.log('Boss defeated:', data));
```

然后击败 Boss，应该看到事件触发

### 问题：玩家位置重置不正确

**检查 update 函数中的 level_transition 分支：**
```javascript
player.x = 100;  // 应该重置到起始位置
player.y = 300;
```

---

## 完成标志

任务完成后，main.js 应该：
- 完全通过 LevelManager 管理关卡
- 完全通过 GameStateMachine 管理状态
- 不再直接访问 LevelMap（仅在 level1-forest.js 中访问）
