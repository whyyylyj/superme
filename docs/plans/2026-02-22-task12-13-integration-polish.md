# Task 12-13 - 集成与优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 添加关卡号显示到 HUD，将 Player 类中的硬编码值替换为 CONFIG 常量。

**架构:** 通过 DOM 操作更新 UI，通过 CONFIG 对象统一管理游戏参数。

**前置依赖:** 必须先完成 Task 09-11（主循环改造）

---

## 前置条件

确保已完成：
- [x] 核心模块全部实现
- [x] LevelBase 和 Level1Forest 已创建
- [x] main.js 的 initGame/update/draw 已改造

---

## Task 12: 更新 index.html 添加关卡号显示

**文件:**
- 修改: `index.html:20-25`
- 修改: `js/main.js` 的 updateHUD 函数

**Step 1: 添加关卡号显示元素**

找到 HUD 部分，添加关卡号显示：

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

在 `js/main.js` 中找到 `updateHUD` 函数，在开头添加关卡号更新：

```javascript
function updateHUD() {
    // 更新关卡号
    const levelNum = LevelManager.currentLevelIndex + 1;
    document.getElementById('level-val').innerText = levelNum;

    uiHp.innerText = Math.max(0, player.hp);
    let wpnStr = 'Normal';
    if (player.weapon === 'spread') wpnStr = 'Scatter';
    if (player.weapon === 'rapid') wpnStr = 'Rapid';
    uiWpn.innerText = wpnStr;

    let pwText = '';
    if (player.bambooMode) pwText += 'BAMBOO ';
    if (player.invincible) pwText += 'INVINCIBLE ';
    if (player.shieldMode) pwText += 'SHIELD ';
    if (player.speedMode) pwText += 'SPEED ';
    uiPowerup.innerText = pwText;

    // Update Boss HUD if boss is active
    if (LevelManager.currentLevel.boss && !LevelManager.currentLevel.boss.markedForDeletion && player.x > LevelManager.currentLevel.boss.x - 800) {
        uiBossHud.classList.remove('hidden');
        const hpPercent = (LevelManager.currentLevel.boss.hp / LevelManager.currentLevel.boss.maxHp) * 100;
        uiBossHpBar.style.width = Math.max(0, hpPercent) + '%';
        if (hpPercent < 50) {
            uiBossHpBar.style.background = 'linear-gradient(90deg, #ffaa00, #ffff00)';
            uiBossHpBar.style.boxShadow = '0 0 10px #ffaa00';
        }
    } else {
        uiBossHud.classList.add('hidden');
    }
}
```

**Step 3: 在浏览器中测试**

1. 刷新页面
2. 开始游戏
3. 确认 HUD 显示 "LV: 1"

**Step 4: 提交**

```bash
git add index.html js/main.js
git commit -m "feat: add level number display in HUD"
```

---

## Task 13: 更新 player.js 使用 CONFIG

**文件:**
- 修改: `js/player.js` (多处)

**Step 1: 更新 Player 构造函数**

找到 `Player` 类的构造函数（约第 3-44 行），替换硬编码值：

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

**Step 2: 更新 shoot 方法**

找到 `shoot` 方法（约第 155-176 行），替换硬编码值：

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

**Step 3: 更新 takeDamage 方法**

找到 `takeDamage` 方法（约第 178-195 行），替换硬编码值：

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

**Step 4: 在浏览器中完整测试**

1. 刷新页面
2. 确认 HUD 显示 "HP: 5"（从 CONFIG.PLAYER.MAX_HP 读取）
3. 测试所有玩家功能：
   - 移动速度正常
   - 跳跃高度正常
   - 射击频率正常
   - 伤害无敌帧正常

**Step 5: 提交**

```bash
git add js/player.js
git commit -m "refactor: use CONFIG constants in Player class"
```

---

## 验收检查清单

### Task 12 验收
- [ ] HUD 显示 "LV: 1"
- [ ] updateHUD 使用 LevelManager.currentLevelIndex
- [ ] 代码已提交

### Task 13 验收
- [ ] Player 构造函数使用 CONFIG.PLAYER 常量
- [ ] shoot 方法使用 CONFIG 射击冷却时间
- [ ] takeDamage 方法使用 CONFIG 伤害冷却时间
- [ ] HUD 显示 "HP: 5"（而不是 3）
- [ ] 所有玩家行为无变化（向后兼容）
- [ ] 代码已提交

---

## 完整集成测试

完成所有任务后，进行端到端测试：

**Step 1: 完整游戏流程**

1. 刷新浏览器
2. 点击 "START GAME"
3. 确认：
   - HUD 显示 "LV: 1" 和 "HP: 5"
   - 游戏正常运行
4. 玩游戏，击败 Boss
5. 确认：
   - 关卡过渡动画触发
   - 显示 "LEVEL 2" 文字
   - 玩家重置到起始位置，满血

**Step 2: 验证事件系统**

在浏览器控制台输入：

```javascript
// 订阅所有事件
Object.values(EventBus.EVENTS).forEach(event => {
    EventBus.on(event, (data) => console.log(`Event: ${event}`, data));
});

// 触发状态变化
GameStateMachine.changeState('paused');
```

预期输出: 控制台显示事件日志

**Step 3: 验证配置系统**

```javascript
console.log('Player max HP:', CONFIG.PLAYER.MAX_HP);
console.log('Level transition duration:', CONFIG.LEVELS.TRANSITION_DURATION);
console.log('Level 1 primary color:', CONFIG.COLORS.LEVEL1.primary);
```

预期输出: 正确的配置值

**Step 4: 最终提交**

```bash
git status
git log --oneline -10
```

---

## 故障排查

### 问题：HUD 不显示关卡号

**检查：**
1. 确认 index.html 中有 `<span id="level-val">1</span>`
2. 确认 updateHUD 函数中有关卡号更新逻辑
3. 在控制台输入：`document.getElementById('level-val')`

### 问题：HP 仍然显示为 3

**检查：**
1. 确认 player.js 构造函数使用了 `CONFIG.PLAYER.MAX_HP`
2. 确认 asset-manager.js 已正确加载（检查脚本顺序）
3. 在控制台输入：`CONFIG.PLAYER.MAX_HP`

### 问题：玩家行为异常

**检查：**
1. 确认所有硬编码值都已替换
2. 对比原始 player.js，检查是否有遗漏
3. 在控制台输入：`player` 查看玩家对象属性

---

## 完成标志

Task 01 全部完成后：

**代码结构：**
```
js/
├── core/
│   ├── event-bus.js       ✓
│   ├── asset-manager.js   ✓
│   ├── game-state.js      ✓
│   └── level-manager.js   ✓
├── levels/
│   ├── level-base.js      ✓
│   └── level1-forest.js   ✓
├── player.js              ✓ (使用 CONFIG)
├── main.js                ✓ (使用状态机和关卡管理器)
└── level.js               (保持不变)
```

**功能验证：**
- [x] 游戏能正常启动
- [x] HUD 显示关卡号
- [x] 玩家 HP 为 5
- [x] Boss 击败后触发关卡过渡
- [x] 所有核心事件正确触发

**Git 提交历史应该包含：**
- 所有核心模块的提交
- 关卡系统的提交
- 主循环改造的提交
- 集成优化的提交
