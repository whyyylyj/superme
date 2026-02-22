# Task 02 — 变身系统 (Transform System)

> **前置阅读：** `00-ARCHITECTURE.md`  
> **负责文件：** `js/transform/` 目录全部文件，`js/player.js` 改造  
> **可并行：** ✅ 与 Task 01/03/07 并行开发（只需遵循接口约定）

---

## 1. 任务目标

实现**角色变身系统**——玩家通过拾取特定道具可以切换形态，每种形态有独特的外观、属性和技能。变身是整个游戏的核心差异化玩法。

---

## 2. 四种形态设计

### 2.1 普通形态 (Normal)

| 属性 | 值 |
|------|-----|
| 颜色 | `#00ffcc`（霓虹青） |
| 移动速度 | 300 |
| 飞行 | ❌ 不可飞行 |
| 射击 | 单发直线子弹 |
| 跳跃 | 三段跳 |
| 特点 | 基础形态，平衡型 |

**外观绘制：**
- 30×40 像素方块人物
- 发光轮廓
- 眼睛跟随朝向

### 2.2 机甲形态 (Mecha)

灵感：魂斗罗的武装强化

| 属性 | 值 |
|------|-----|
| 颜色 | `#cccccc`（金属银） |
| 移动速度 | 250（略慢） |
| 飞行 | ❌ 不可飞行 |
| 射击 | **重型散弹** — 5 发扇形子弹同时射出 |
| 跳跃 | 二段跳（更重） |
| 特殊能力 | 受到伤害减半；子弹伤害 ×2 |
| 持续时间 | 12 秒 |

**外观绘制：**
- 40×45 像素（比普通形态大）
- 肩部有方形"装甲垫"
- 手部替换为"炮管"造型
- 金属质感：灰色基底 + 亮白色高光线
- 背部有蓝色喷射口（闪烁动画）

### 2.3 龙形态 (Dragon)

灵感：Minecraft 末影龙 + 东方的飞行 boss

| 属性 | 值 |
|------|-----|
| 颜色 | `#ff6600`（烈焰橙） |
| 移动速度 | 350（更快） |
| 飞行 | ✅ 可自由飞行（上下左右） |
| 射击 | **火焰吐息** — 前方扇形连续火焰弹幕 |
| 跳跃 | N/A（直接飞行） |
| 特殊能力 | 免疫熔岩伤害；飞行时留下火焰尾迹粒子 |
| 持续时间 | 10 秒 |

**外观绘制：**
- 35×35 像素核心体
- 两侧画三角形"翅膀"（上下拍动动画）
- 头部有两个三角"角"
- 尾部拖有火焰粒子尾迹
- 颜色渐变：橙 → 红

### 2.4 幻影形态 (Phantom)

灵感：东方幻想天的幻想特性

| 属性 | 值 |
|------|-----|
| 颜色 | `#aa00ff`（幻影紫） |
| 移动速度 | 400（最快） |
| 飞行 | ✅ 可飞行（悬浮状态） |
| 射击 | **追踪弹幕** — 发射自动追踪最近敌人的子弹 |
| 跳跃 | N/A（悬浮） |
| 特殊能力 | **穿墙**（可穿过平台）；半透明外观；无敌 |
| 持续时间 | 8 秒（最短，因为最强） |

**外观绘制：**
- 30×40 像素，但半透明（globalAlpha = 0.6）
- 持续产生紫色幻影残像粒子
- 轮廓发出脉冲式紫色光芒
- 内部闪烁星点

---

## 3. 需要创建的文件

### 3.1 `js/transform/form-normal.js`

```javascript
// form-normal.js
class FormNormal {
    constructor() {
        this.name = 'Normal';
        this.color = CONFIG.FORMS.NORMAL;
        this.speed = CONFIG.PLAYER.BASE_SPEED;
        this.canFly = false;
        this.maxJumps = CONFIG.PLAYER.MAX_JUMPS;
        this.damageMultiplier = 1;   // 受伤倍率
        this.attackMultiplier = 1;   // 攻击倍率
        this.duration = Infinity;    // 永久
        this.passThrough = false;    // 不能穿墙
    }

    onEnter(player) {
        // 普通形态无特殊进入效果
    }

    onExit(player) {
        // 无退出效果
    }

    update(dt, player) {
        // 无额外逻辑
    }

    shoot(player, bullets) {
        // 直接使用 player 原有的射击逻辑（根据 weapon 属性）
        const bulletSpeed = CONFIG.PLAYER.BULLET_SPEED;
        const startX = player.facing === 1 ? player.x + player.width : player.x - 10;
        const startY = player.y + player.height / 2 - 5;

        if (player.weapon === 'normal') {
            bullets.push(new Bullet(startX, startY, player.facing, 0, bulletSpeed, '#00ffff'));
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_NORMAL;
        } else if (player.weapon === 'rapid') {
            bullets.push(new Bullet(startX, startY, player.facing, 0, bulletSpeed + 200, '#cc00ff'));
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_RAPID;
        } else if (player.weapon === 'spread') {
            bullets.push(new Bullet(startX, startY, player.facing, 0, bulletSpeed, '#ff00ff'));
            bullets.push(new Bullet(startX, startY, player.facing, -0.2, bulletSpeed, '#ff00ff'));
            bullets.push(new Bullet(startX, startY, player.facing, 0.2, bulletSpeed, '#ff00ff'));
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_SPREAD;
        }
    }

    draw(ctx, player, cameraX, cameraY) {
        // 使用 player 的原始绘制逻辑
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(player.x - cameraX, player.y - cameraY, player.width, player.height);

        // 眼睛
        ctx.fillStyle = 'black';
        ctx.shadowBlur = 0;
        let eyeOffsetX = player.facing === 1 ? 20 : 5;
        ctx.fillRect(player.x - cameraX + eyeOffsetX, player.y - cameraY + 10, 5, 5);
    }
}
```

### 3.2 `js/transform/form-mecha.js`

```javascript
// form-mecha.js
class FormMecha {
    constructor() {
        this.name = 'Mecha';
        this.color = CONFIG.FORMS.MECHA;
        this.speed = 250;
        this.canFly = false;
        this.maxJumps = 2;
        this.damageMultiplier = 0.5;   // 受伤减半
        this.attackMultiplier = 2;     // 伤害翻倍
        this.duration = 12;
        this.passThrough = false;

        this.jetTimer = 0; // 喷射口闪烁计时
    }

    onEnter(player) {
        // 变身特效：金属碎片爆炸
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#cccccc', 40
        );
        // 扩大碰撞体积
        player.width = 40;
        player.height = 45;
    }

    onExit(player) {
        // 恢复体积
        player.width = 30;
        player.height = 40;
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#cccccc', 20
        );
    }

    update(dt, player) {
        this.jetTimer += dt;
    }

    shoot(player, bullets) {
        const bulletSpeed = CONFIG.PLAYER.BULLET_SPEED;
        const startX = player.facing === 1 ? player.x + player.width : player.x - 10;
        const startY = player.y + player.height / 2;

        // 5 发扇形散弹
        const spreadAngles = [-0.4, -0.2, 0, 0.2, 0.4];
        spreadAngles.forEach(angle => {
            const b = new Bullet(startX, startY, player.facing, angle, bulletSpeed, '#ffff88');
            b.damage = 2; // 双倍伤害
            bullets.push(b);
        });

        player.shootCooldown = 0.35; // 重型武器射速较慢
    }

    draw(ctx, player, cameraX, cameraY) {
        const px = player.x - cameraX;
        const py = player.y - cameraY;

        // 主体（金属色）
        ctx.fillStyle = '#aaaaaa';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#888888';
        ctx.fillRect(px, py, player.width, player.height);

        // 装甲高光线
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 2, py + 5);
        ctx.lineTo(px + player.width - 2, py + 5);
        ctx.moveTo(px + 2, py + player.height - 5);
        ctx.lineTo(px + player.width - 2, py + player.height - 5);
        ctx.stroke();

        // 肩甲
        ctx.fillStyle = '#888888';
        ctx.fillRect(px - 5, py, 10, 12);
        ctx.fillRect(px + player.width - 5, py, 10, 12);

        // 炮管
        const gunX = player.facing === 1 ? px + player.width : px - 12;
        ctx.fillStyle = '#666666';
        ctx.fillRect(gunX, py + player.height / 2 - 3, 12, 6);

        // 喷射口（闪烁）
        if (Math.sin(this.jetTimer * 10) > 0) {
            ctx.fillStyle = '#4488ff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#4488ff';
            ctx.fillRect(px + player.width / 2 - 4, py + player.height, 8, 5);
        }

        // 眼睛（红色 LED）
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ff0000';
        const eyeX = player.facing === 1 ? px + 28 : px + 5;
        ctx.fillRect(eyeX, py + 12, 6, 3);

        ctx.shadowBlur = 0;
    }
}
```

### 3.3 `js/transform/form-dragon.js`

```javascript
// form-dragon.js
class FormDragon {
    constructor() {
        this.name = 'Dragon';
        this.color = CONFIG.FORMS.DRAGON;
        this.speed = 350;
        this.canFly = true;
        this.maxJumps = Infinity;
        this.damageMultiplier = 1;
        this.attackMultiplier = 1.5;
        this.duration = 10;
        this.passThrough = false;

        this.wingAngle = 0;
        this.trailTimer = 0;
    }

    onEnter(player) {
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#ff6600', 50
        );
        player.width = 35;
        player.height = 35;
    }

    onExit(player) {
        player.width = 30;
        player.height = 40;
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#ff6600', 30
        );
    }

    update(dt, player) {
        this.wingAngle += dt * 8;
        this.trailTimer += dt;

        // 火焰尾迹粒子
        if (this.trailTimer > 0.05) {
            this.trailTimer = 0;
            const tailX = player.facing === 1
                ? player.x - 5
                : player.x + player.width + 5;
            const tailY = player.y + player.height / 2;

            ParticleSystem.createExplosion(tailX, tailY, '#ff4400', 2);
        }
    }

    shoot(player, bullets) {
        const startX = player.facing === 1 ? player.x + player.width : player.x - 10;
        const startY = player.y + player.height / 2;

        // 火焰吐息：连续 3 发扇形，带随机偏移
        for (let i = 0; i < 3; i++) {
            const angle = (Math.random() - 0.5) * 0.5;
            const speed = 500 + Math.random() * 200;
            const b = new Bullet(startX, startY, player.facing, angle, speed, '#ff4400');
            b.life = 60; // 较短寿命，像火焰
            b.damage = 1.5;
            bullets.push(b);
        }

        player.shootCooldown = 0.1; // 快速吐息
    }

    draw(ctx, player, cameraX, cameraY) {
        const px = player.x - cameraX;
        const py = player.y - cameraY;
        const cx = px + player.width / 2;
        const cy = py + player.height / 2;

        ctx.save();

        // 身体（橙色渐变）
        const grad = ctx.createLinearGradient(px, py, px + player.width, py + player.height);
        grad.addColorStop(0, '#ff6600');
        grad.addColorStop(1, '#ff2200');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff4400';
        ctx.fillRect(px, py, player.width, player.height);

        // 翅膀
        const wingFlap = Math.sin(this.wingAngle) * 12;
        ctx.fillStyle = '#ff8800';

        // 左翅
        ctx.beginPath();
        ctx.moveTo(px, cy);
        ctx.lineTo(px - 15, cy - 10 + wingFlap);
        ctx.lineTo(px - 5, cy + 5);
        ctx.closePath();
        ctx.fill();

        // 右翅
        ctx.beginPath();
        ctx.moveTo(px + player.width, cy);
        ctx.lineTo(px + player.width + 15, cy - 10 + wingFlap);
        ctx.lineTo(px + player.width + 5, cy + 5);
        ctx.closePath();
        ctx.fill();

        // 角
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(px + 8, py);
        ctx.lineTo(px + 5, py - 10);
        ctx.lineTo(px + 12, py);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px + player.width - 8, py);
        ctx.lineTo(px + player.width - 5, py - 10);
        ctx.lineTo(px + player.width - 12, py);
        ctx.closePath();
        ctx.fill();

        // 眼睛
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffff00';
        const eyeX = player.facing === 1 ? px + 22 : px + 5;
        ctx.fillRect(eyeX, py + 10, 6, 4);

        ctx.restore();
    }
}
```

### 3.4 `js/transform/form-phantom.js`

```javascript
// form-phantom.js
class FormPhantom {
    constructor() {
        this.name = 'Phantom';
        this.color = CONFIG.FORMS.PHANTOM;
        this.speed = 400;
        this.canFly = true;
        this.maxJumps = Infinity;
        this.damageMultiplier = 0;  // 无敌
        this.attackMultiplier = 1;
        this.duration = 8;
        this.passThrough = true;    // 穿墙

        this.ghostTimer = 0;
        this.pulseValue = 0;
    }

    onEnter(player) {
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#aa00ff', 60
        );
    }

    onExit(player) {
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#aa00ff', 30
        );
    }

    update(dt, player) {
        this.ghostTimer += dt;
        this.pulseValue = Math.sin(this.ghostTimer * 5) * 0.3 + 0.5;

        // 残像粒子
        if (Math.random() < 0.3) {
            const p = new Particle(
                player.x + Math.random() * player.width,
                player.y + Math.random() * player.height,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                Math.random() * 3 + 1,
                '#aa00ff',
                20
            );
            ParticleSystem.particles.push(p);
        }
    }

    shoot(player, bullets) {
        const startX = player.x + player.width / 2;
        const startY = player.y + player.height / 2;

        // 追踪弹：先发射到前方，但子弹有追踪属性
        // 我们通过给 Bullet 添加 homing 属性来实现
        const b = new Bullet(startX, startY, player.facing, 0, 600, '#dd44ff');
        b.homing = true;       // 追踪标记（需要在 bullet.js 或 danmaku 中处理）
        b.homingStrength = 5;  // 追踪强度
        b.life = 180;          // 更长存活
        bullets.push(b);

        player.shootCooldown = 0.15;
    }

    draw(ctx, player, cameraX, cameraY) {
        const px = player.x - cameraX;
        const py = player.y - cameraY;

        ctx.save();

        // 半透明主体
        ctx.globalAlpha = this.pulseValue;
        ctx.fillStyle = '#aa00ff';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#aa00ff';
        ctx.fillRect(px, py, player.width, player.height);

        // 内部星点闪烁
        ctx.globalAlpha = 1;
        for (let i = 0; i < 4; i++) {
            const sx = px + Math.sin(this.ghostTimer * 3 + i * 2) * player.width / 3 + player.width / 2;
            const sy = py + Math.cos(this.ghostTimer * 2 + i * 3) * player.height / 3 + player.height / 2;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 发光轮廓
        ctx.globalAlpha = this.pulseValue * 0.8;
        ctx.strokeStyle = '#cc44ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(px - 2, py - 2, player.width + 4, player.height + 4);

        // 眼睛（始终可见）
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';
        const eyeX = player.facing === 1 ? px + 20 : px + 5;
        ctx.fillRect(eyeX, py + 12, 5, 3);

        ctx.restore();
    }
}
```

### 3.5 `js/transform/transform-system.js`

变身管理器：

```javascript
// transform-system.js

const TransformSystem = {
    forms: {},         // 注册的形态 { name: FormInstance }
    currentForm: null, // 当前形态
    timer: 0,          // 计时器
    defaultFormName: 'Normal',

    /**
     * 初始化：注册所有形态
     */
    init() {
        this.registerForm(new FormNormal());
        this.registerForm(new FormMecha());
        this.registerForm(new FormDragon());
        this.registerForm(new FormPhantom());
        this.currentForm = this.forms['Normal'];
        this.timer = 0;
    },

    registerForm(form) {
        this.forms[form.name] = form;
    },

    /**
     * 触发变身
     * @param {string} formName - 目标形态名
     * @param {Player} player - 玩家对象
     */
    transform(formName, player) {
        if (!this.forms[formName]) {
            console.warn(`Unknown form: ${formName}`);
            return;
        }

        const previousForm = this.currentForm;

        // 退出旧形态
        if (previousForm) {
            previousForm.onExit(player);
        }

        // 进入新形态
        this.currentForm = this.forms[formName];
        this.currentForm.onEnter(player);

        // 非默认形态有持续时间
        if (this.currentForm.duration !== Infinity) {
            this.timer = this.currentForm.duration;
        } else {
            this.timer = 0;
        }

        EventBus.emit('player:transform', {
            formName: formName,
            previousForm: previousForm ? previousForm.name : null
        });
    },

    /**
     * 每帧更新
     */
    update(dt, player) {
        if (this.currentForm) {
            this.currentForm.update(dt, player);
        }

        // 计时器倒计时（非默认形态）
        if (this.timer > 0) {
            this.timer -= dt;
            if (this.timer <= 0) {
                // 时间到，回归默认形态
                this.transform(this.defaultFormName, player);
            }
        }
    },

    /**
     * 获取当前形态的属性
     */
    getSpeed() {
        return this.currentForm ? this.currentForm.speed : CONFIG.PLAYER.BASE_SPEED;
    },

    canFly() {
        return this.currentForm ? this.currentForm.canFly : false;
    },

    canPassThrough() {
        return this.currentForm ? this.currentForm.passThrough : false;
    },

    getDamageMultiplier() {
        return this.currentForm ? this.currentForm.damageMultiplier : 1;
    },

    getAttackMultiplier() {
        return this.currentForm ? this.currentForm.attackMultiplier : 1;
    },

    /**
     * 委托射击给当前形态
     */
    shoot(player, bullets) {
        if (this.currentForm) {
            this.currentForm.shoot(player, bullets);
        }
    },

    /**
     * 委托绘制给当前形态
     */
    draw(ctx, player, cameraX, cameraY) {
        if (this.currentForm) {
            this.currentForm.draw(ctx, player, cameraX, cameraY);
        }
    },

    /**
     * 获取剩余变身时间（秒）
     */
    getRemainingTime() {
        return Math.max(0, this.timer);
    },

    /**
     * 重置为默认形态
     */
    reset(player) {
        if (this.currentForm && this.currentForm.name !== this.defaultFormName) {
            this.currentForm.onExit(player);
        }
        this.currentForm = this.forms[this.defaultFormName];
        this.timer = 0;
    }
};
```

---

## 4. 改造 `player.js`

### 4.1 关键变更

| 原逻辑 | 新逻辑 |
|--------|--------|
| `this.speed = 300` 硬编码 | `this.speed = TransformSystem.getSpeed()` |
| `this.bambooMode` 飞行 | `TransformSystem.canFly()` 飞行 |
| `shoot()` 方法内联子弹逻辑 | `TransformSystem.shoot(this, bullets)` |
| `draw()` 方法内联绘制 | `TransformSystem.draw(ctx, this, cameraX, cameraY)` |
| `takeDamage()` 直接减 HP | `takeDamage()` 先检查 `TransformSystem.getDamageMultiplier()` |
| `checkCollisions()` 总是碰撞 | 如果 `TransformSystem.canPassThrough()` 则跳过平台碰撞 |

### 4.2 改造后的 Player 代码要点

```javascript
class Player extends Entity {
    constructor(x, y) {
        super(x, y, 30, 40, '#00ffcc');
        // ... 其他初始化 ...

        // 初始化变身系统
        TransformSystem.init();
    }

    update(dt, platforms, levelWidth) {
        // 更新变身系统
        TransformSystem.update(dt, this);

        // 速度从变身系统获取
        this.speed = TransformSystem.getSpeed();

        // 飞行判断
        if (TransformSystem.canFly()) {
            // 自由飞行逻辑
            if (Input.up) this.vy = -this.speed;
            else if (Input.down) this.vy = this.speed;
            else this.vy = 0;
        } else {
            // 原有重力和跳跃逻辑
            this.vy += this.gravity * dt;
            // ...
        }

        // 碰撞检测（穿墙处理）
        if (!TransformSystem.canPassThrough()) {
            this.checkCollisions(platforms, 'x');
            // ...
            this.checkCollisions(platforms, 'y');
        }
    }

    shoot(bullets) {
        if (this.shootCooldown > 0) return;
        TransformSystem.shoot(this, bullets);
    }

    takeDamage() {
        const dmgMult = TransformSystem.getDamageMultiplier();
        if (dmgMult === 0) return; // 无敌形态

        if (this.invincible || this.damageCooldown > 0) return;

        if (this.shieldMode) {
            this.shieldMode = false;
            this.damageCooldown = 1.0;
            return;
        }

        // 应用伤害倍率
        const damage = Math.ceil(1 * dmgMult);
        this.hp -= damage;
        this.damageCooldown = CONFIG.PLAYER.DAMAGE_COOLDOWN;
        // ...
    }

    draw(ctx, cameraX, cameraY) {
        if (this.damageCooldown > 0) {
            if (Math.floor(Date.now() / 100) % 2 === 0) return;
        }

        ctx.save();

        // 委托给变身系统绘制
        TransformSystem.draw(ctx, this, cameraX, cameraY);

        // Shield 光环（所有形态通用）
        if (this.shieldMode) {
            ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#0000ff';
            ctx.strokeRect(this.x - cameraX - 4, this.y - cameraY - 4,
                          this.width + 8, this.height + 8);
        }

        ctx.restore();
    }
}
```

---

## 5. 改造 `powerup.js`

新增变身道具类型：

| 类型 | 颜色 | 效果 |
|------|------|------|
| `'transform_mecha'` | `#cccccc` | 变身为机甲 |
| `'transform_dragon'` | `#ff6600` | 变身为龙 |
| `'transform_phantom'` | `#aa00ff` | 变身为幻影 |

在 `checkPowerupCollisions()` （位于 `main.js`）中添加处理：

```javascript
case 'transform_mecha':
    TransformSystem.transform('Mecha', player);
    break;
case 'transform_dragon':
    TransformSystem.transform('Dragon', player);
    break;
case 'transform_phantom':
    TransformSystem.transform('Phantom', player);
    break;
```

---

## 6. HUD 显示

在 HUD 中显示当前形态和剩余时间：

```javascript
// 在 updateHUD() 中添加
const formName = TransformSystem.currentForm
    ? TransformSystem.currentForm.name : 'Normal';

let formText = formName.toUpperCase();
const remaining = TransformSystem.getRemainingTime();
if (remaining > 0) {
    formText += ` (${Math.ceil(remaining)}s)`;
}
uiPowerup.innerText = formText;
```

---

## 7. 验收标准

- [ ] 四种形态都能正确初始化
- [ ] 拾取变身道具后角色外观和属性立即变化
- [ ] 变身有持续时间，时间到后自动回归普通形态
- [ ] 每种形态的射击方式不同且视觉明显
- [ ] 机甲形态受伤减半，碰撞体积变大
- [ ] 龙形态可以飞行，有火焰尾迹
- [ ] 幻影形态可穿墙，半透明效果
- [ ] 变身时有粒子爆炸特效
- [ ] HUD 正确显示当前形态和倒计时
- [ ] 新的 `player.js` 逻辑与旧的竹蜻蜓和无敌模式兼容

---

## 8. 不要做的事

- ❌ 不要修改 `entity.js`, `physics.js`, `input.js`（这些是稳定基础）
- ❌ 不要实现弹幕引擎（那是 Task 03 的工作）
- ❌ 不要实现关卡内容（那是 Task 04-06 的工作）
- ❌ 不要修改 `main.js` 的整体结构（那是 Task 01 的工作），只在 `checkPowerupCollisions` 中添加 case

---

*完成后，通知 Task 04-06 的 Agent：变身道具可以在关卡中放置了。*
