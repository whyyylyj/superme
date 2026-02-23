# Task 03 — 弹幕系统 (Danmaku / Bullet Hell Engine)

> **前置阅读：** `00-ARCHITECTURE.md`  
> **负责文件：** `js/danmaku/` 目录全部文件，`js/bullet.js` 改造  
> **可并行：** ✅ 与 Task 01/02/07 并行开发

---

## 1. 任务目标

构建一个**高性能弹幕引擎**，支持多种华丽的子弹花样（Pattern），用于 Boss 攻击和玩家特殊技能。

灵感来源：
- **东方 Project** — 扇形弹幕、旋转弹幕、符卡（Spell Card）
- **魂斗罗** — 密集散射、追踪弹
- **子弹地狱游戏通用** — 大量子弹同屏的视觉冲击

---

## 2. 核心设计

### 2.1 对象池 (Bullet Pool)

当屏幕上同时存在数百颗子弹时，频繁的 `new/delete` 会导致 GC 卡顿。需要预分配对象池。

### 2.2 弹幕花样 (Pattern)

每种花样是一个**函数**，接收原点坐标和参数，返回一组子弹配置。

### 2.3 弹幕发射器 (Emitter)

持续性弹幕效果需要"发射器"——一个在多帧内持续产生子弹的控制器。

---

## 3. 需要创建的文件

### 3.1 `js/danmaku/bullet-pool.js`

```javascript
// bullet-pool.js

class BulletPool {
    constructor(maxSize) {
        this.pool = [];
        this.maxSize = maxSize || CONFIG.DANMAKU.BULLET_POOL_SIZE;

        // 预分配
        for (let i = 0; i < this.maxSize; i++) {
            const b = new Bullet(0, 0, 0, 0, 0, '#ffffff', false);
            b.active = false;
            this.pool.push(b);
        }
    }

    /**
     * 从池中获取一个可用的子弹
     * @returns {Bullet|null}
     */
    acquire(x, y, dx, dy, speed, color, friendly) {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                const b = this.pool[i];
                b.x = x;
                b.y = y;
                b.vx = dx * speed;
                b.vy = dy * speed;
                b.color = color;
                b.friendly = friendly;
                b.damage = 1;
                b.life = CONFIG.DANMAKU.DEFAULT_BULLET_LIFE;
                b.markedForDeletion = false;
                b.active = true;
                b.homing = false;
                b.homingStrength = 0;
                b.width = 10;
                b.height = 10;
                return b;
            }
        }
        // 池满了，返回 null（或可选择丢弃最老的子弹）
        console.warn('Bullet pool exhausted!');
        return null;
    }

    /**
     * 回收子弹
     */
    release(bullet) {
        bullet.active = false;
        bullet.markedForDeletion = false;
    }

    /**
     * 获取所有活跃子弹
     */
    getActiveBullets() {
        return this.pool.filter(b => b.active);
    }

    /**
     * 批量回收已标记删除的子弹
     */
    cleanup() {
        this.pool.forEach(b => {
            if (b.active && b.markedForDeletion) {
                this.release(b);
            }
        });
    }

    /**
     * 回收所有
     */
    releaseAll() {
        this.pool.forEach(b => this.release(b));
    }

    /**
     * 当前活跃子弹数
     */
    get activeCount() {
        return this.pool.filter(b => b.active).length;
    }
}
```

---

### 3.2 `js/danmaku/patterns.js`

弹幕花样库——**这是弹幕系统的核心创意部分**：

```javascript
// patterns.js

const DanmakuPatterns = {

    /**
     * 圆形弹幕 — 从中心向四周均匀发射
     * 用途：Boss 基础攻击
     */
    circle(originX, originY, options = {}) {
        const {
            count = 16,
            speed = 300,
            color = '#ff5500',
            friendly = false,
            offset = 0
        } = options;

        const bullets = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + offset;
            bullets.push({
                x: originX, y: originY,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed, color, friendly
            });
        }
        return bullets;
    },

    /**
     * 扇形弹幕 — 向目标方向发射扇形弹
     * 用途：Boss 朝玩家方向攻击
     */
    fan(originX, originY, targetX, targetY, options = {}) {
        const {
            count = 5,
            spreadAngle = Math.PI / 4,  // 扇形张角
            speed = 400,
            color = '#ffaa00',
            friendly = false
        } = options;

        const baseAngle = Math.atan2(targetY - originY, targetX - originX);
        const bullets = [];

        for (let i = 0; i < count; i++) {
            const angle = baseAngle - spreadAngle / 2 + (spreadAngle / (count - 1)) * i;
            bullets.push({
                x: originX, y: originY,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed, color, friendly
            });
        }
        return bullets;
    },

    /**
     * 螺旋弹幕 — 持续旋转发射
     * 用途：Boss 中阶段攻击
     * 注意：这个需要通过 Emitter 多次调用，每次传递不同的 offset
     */
    spiral(originX, originY, options = {}) {
        const {
            arms = 3,       // 螺旋臂数
            speed = 250,
            color = '#ff00ff',
            friendly = false,
            offset = 0      // 每帧递增这个值实现旋转
        } = options;

        const bullets = [];
        for (let i = 0; i < arms; i++) {
            const angle = (Math.PI * 2 / arms) * i + offset;
            bullets.push({
                x: originX, y: originY,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed, color, friendly
            });
        }
        return bullets;
    },

    /**
     * 雨幕弹幕 — 从上方大范围落下
     * 用途：Boss 范围攻击
     */
    rain(areaX, areaWidth, originY, options = {}) {
        const {
            count = 8,
            speed = 200,
            color = '#44aaff',
            friendly = false,
            spreadX = 0.3
        } = options;

        const bullets = [];
        for (let i = 0; i < count; i++) {
            const x = areaX + Math.random() * areaWidth;
            const dx = (Math.random() - 0.5) * spreadX;
            bullets.push({
                x: x, y: originY,
                dx: dx,
                dy: 1,
                speed: speed + Math.random() * 100,
                color, friendly
            });
        }
        return bullets;
    },

    /**
     * 十字弹幕 — 四个方向的密集直线弹
     * 用途：地狱关 Boss
     */
    cross(originX, originY, options = {}) {
        const {
            count = 5,       // 每个方向的数量
            speed = 350,
            color = '#ff4444',
            friendly = false,
            offset = 0,
            spacing = 15     // 子弹间距
        } = options;

        const directions = [
            { dx: 1, dy: 0 },   // 右
            { dx: -1, dy: 0 },  // 左
            { dx: 0, dy: 1 },   // 下
            { dx: 0, dy: -1 },  // 上
        ];

        const bullets = [];
        // 旋转偏移
        const cos = Math.cos(offset);
        const sin = Math.sin(offset);

        directions.forEach(dir => {
            const rdx = dir.dx * cos - dir.dy * sin;
            const rdy = dir.dx * sin + dir.dy * cos;

            for (let i = 0; i < count; i++) {
                bullets.push({
                    x: originX + rdx * spacing * i,
                    y: originY + rdy * spacing * i,
                    dx: rdx,
                    dy: rdy,
                    speed, color, friendly
                });
            }
        });
        return bullets;
    },

    /**
     * 花瓣弹幕 — 东方 Project 风格的美丽花型弹幕
     * 用途：终极 Boss 特殊攻击
     */
    flower(originX, originY, options = {}) {
        const {
            petals = 6,      // 花瓣数
            bulletsPerPetal = 5,
            speed = 200,
            color1 = '#ff88cc',
            color2 = '#ffccee',
            friendly = false,
            offset = 0,
            radius = 0
        } = options;

        const bullets = [];
        for (let p = 0; p < petals; p++) {
            const petalAngle = (Math.PI * 2 / petals) * p + offset;

            for (let b = 0; b < bulletsPerPetal; b++) {
                const t = b / bulletsPerPetal;
                // 花瓣曲线
                const angle = petalAngle + Math.sin(t * Math.PI) * 0.5;
                const bulletSpeed = speed * (0.7 + t * 0.6);
                const color = b % 2 === 0 ? color1 : color2;

                bullets.push({
                    x: originX + Math.cos(petalAngle) * radius,
                    y: originY + Math.sin(petalAngle) * radius,
                    dx: Math.cos(angle),
                    dy: Math.sin(angle),
                    speed: bulletSpeed,
                    color, friendly
                });
            }
        }
        return bullets;
    },

    /**
     * 激光弹幕 — 密集直线
     * 用途：魂斗罗风格 Boss 攻击
     */
    laser(originX, originY, angle, options = {}) {
        const {
            count = 10,
            speed = 800,
            spacing = 5,     // 子弹间时间偏移产生的间距
            color = '#ff0000',
            friendly = false
        } = options;

        const bullets = [];
        for (let i = 0; i < count; i++) {
            bullets.push({
                x: originX - Math.cos(angle) * spacing * i,
                y: originY - Math.sin(angle) * spacing * i,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed, color, friendly
            });
        }
        return bullets;
    },

    /**
     * 随机散射 — 魂斗罗散弹风格
     * 用途：玩家散弹武器或敌人随机攻击
     */
    scatter(originX, originY, facing, options = {}) {
        const {
            count = 8,
            speed = 600,
            spread = 0.6,  // 散布角度
            color = '#ffff00',
            friendly = true
        } = options;

        const bullets = [];
        const baseAngle = facing === 1 ? 0 : Math.PI;

        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * spread;
            const bulletSpeed = speed + (Math.random() - 0.5) * 200;
            bullets.push({
                x: originX, y: originY,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed: bulletSpeed,
                color, friendly
            });
        }
        return bullets;
    }
};
```

---

### 3.3 `js/danmaku/danmaku-engine.js`

弹幕发射器管理：

```javascript
// danmaku-engine.js

/**
 * 弹幕发射器 - 持续性弹幕效果的控制器
 */
class DanmakuEmitter {
    /**
     * @param {Object} config
     * @param {string} config.pattern - 花样名（DanmakuPatterns 的方法名）
     * @param {number} config.originX - 发射原点 X
     * @param {number} config.originY - 发射原点 Y
     * @param {number} config.duration - 持续时间（秒）
     * @param {number} config.interval - 发射间隔（秒）
     * @param {Object} config.patternOptions - 传给花样函数的参数
     * @param {Function} config.onUpdate - 每次发射前的回调（可更新 originX/Y 和 options）
     */
    constructor(config) {
        this.pattern = config.pattern;
        this.originX = config.originX || 0;
        this.originY = config.originY || 0;
        this.duration = config.duration || 5;
        this.interval = config.interval || 0.1;
        this.patternOptions = config.patternOptions || {};
        this.onUpdate = config.onUpdate || null;

        this.timer = 0;
        this.elapsed = 0;
        this.active = true;
        this.offset = 0;  // 自动递增的偏移值（用于旋转弹幕）
    }

    update(dt) {
        if (!this.active) return [];

        this.elapsed += dt;
        this.timer -= dt;

        if (this.elapsed >= this.duration) {
            this.active = false;
            return [];
        }

        if (this.timer <= 0) {
            this.timer = this.interval;
            this.offset += 0.1; // 自动旋转

            // 回调更新参数
            if (this.onUpdate) {
                this.onUpdate(this);
            }

            // 调用花样函数
            const options = {
                ...this.patternOptions,
                offset: this.offset
            };

            const patternFn = DanmakuPatterns[this.pattern];
            if (patternFn) {
                return patternFn(this.originX, this.originY, options);
            }
        }

        return [];
    }
}

/**
 * 弹幕引擎 - 统一管理所有发射器和子弹
 */
const DanmakuEngine = {
    emitters: [],
    bulletPool: null,

    init() {
        this.bulletPool = new BulletPool(CONFIG.DANMAKU.BULLET_POOL_SIZE);
        this.emitters = [];
    },

    /**
     * 创建一个弹幕发射器
     * @param {Object} config - DanmakuEmitter 配置
     * @returns {DanmakuEmitter}
     */
    createEmitter(config) {
        const emitter = new DanmakuEmitter(config);
        this.emitters.push(emitter);
        return emitter;
    },

    /**
     * 一次性发射一组弹幕
     * @param {Array} bulletConfigs - 从 DanmakuPatterns 返回的子弹配置数组
     * @param {Array} targetBulletsArray - 要填入的子弹数组
     */
    fireBullets(bulletConfigs, targetBulletsArray) {
        bulletConfigs.forEach(config => {
            const bullet = new Bullet(
                config.x, config.y,
                config.dx, config.dy,
                config.speed,
                config.color,
                config.friendly
            );
            if (config.damage) bullet.damage = config.damage;
            if (config.life) bullet.life = config.life;
            targetBulletsArray.push(bullet);
        });
    },

    /**
     * 每帧更新所有发射器
     * @param {number} dt
     * @param {Array} targetBulletsArray
     */
    update(dt, targetBulletsArray) {
        this.emitters.forEach(emitter => {
            const bulletConfigs = emitter.update(dt);
            if (bulletConfigs.length > 0) {
                this.fireBullets(bulletConfigs, targetBulletsArray);
            }
        });

        // 清理已完成的发射器
        this.emitters = this.emitters.filter(e => e.active);
    },

    /**
     * 清理所有
     */
    reset() {
        this.emitters = [];
        if (this.bulletPool) this.bulletPool.releaseAll();
    }
};
```

---

## 4. 改造 `bullet.js`

### 4.1 新增属性

在 `Bullet` 类中添加以下属性：

```javascript
class Bullet extends Entity {
    constructor(x, y, dx, dy, speed, color = '#ff00ff', friendly = true) {
        super(x, y, 10, 10, color);
        this.vx = dx * speed;
        this.vy = dy * speed;
        this.friendly = friendly;
        this.damage = 1;
        this.life = CONFIG.DANMAKU.DEFAULT_BULLET_LIFE;

        // 新增属性
        this.active = true;           // 对象池用
        this.homing = false;          // 是否追踪
        this.homingStrength = 0;     // 追踪强度
        this.homingTarget = null;    // 追踪目标
    }

    update(dt) {
        // 追踪逻辑
        if (this.homing && this.homingTarget && !this.homingTarget.markedForDeletion) {
            const tx = this.homingTarget.x + this.homingTarget.width / 2;
            const ty = this.homingTarget.y + this.homingTarget.height / 2;
            const bx = this.x + this.width / 2;
            const by = this.y + this.height / 2;

            const angle = Math.atan2(ty - by, tx - bx);
            const currentAngle = Math.atan2(this.vy, this.vx);
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

            // 逐渐转向
            let diff = angle - currentAngle;
            // 规范化角度差到 [-PI, PI]
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            const turnRate = this.homingStrength * dt;
            const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnRate);

            this.vx = Math.cos(newAngle) * speed;
            this.vy = Math.sin(newAngle) * speed;
        }

        super.update(dt);
        this.life -= dt * 60;

        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx, cameraX, cameraY) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(
            this.x - cameraX + this.width / 2,
            this.y - cameraY + this.height / 2,
            this.width / 2, 0, Math.PI * 2
        );
        ctx.fill();

        // 追踪弹拖尾
        if (this.homing) {
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(
                this.x - cameraX + this.width / 2 - this.vx * 0.02,
                this.y - cameraY + this.height / 2 - this.vy * 0.02,
                this.width / 2 * 0.7, 0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }
}
```

### 4.2 追踪弹的目标分配

在 `main.js` 的 `update()` 中，为有追踪属性的友方子弹分配最近的敌人作为目标：

```javascript
// 在 bullets 更新逻辑中添加
bullets.forEach(b => {
    if (b.homing && b.friendly && !b.homingTarget) {
        // 找最近的敌人
        let nearest = null;
        let nearestDist = Infinity;

        const level = LevelManager.currentLevel;
        const enemies = level ? level.enemies : [];

        enemies.forEach(e => {
            if (e.markedForDeletion) return;
            const dist = Math.hypot(e.x - b.x, e.y - b.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = e;
            }
        });

        // 也检查 Boss
        if (level && level.boss && !level.boss.markedForDeletion) {
            const dist = Math.hypot(level.boss.x - b.x, level.boss.y - b.y);
            if (dist < nearestDist) {
                nearest = level.boss;
            }
        }

        b.homingTarget = nearest;
    }
});
```

---

## 5. Boss 如何使用弹幕系统

### 5.1 简单调用（一次性）

```javascript
// Boss 的 shootPattern 方法中
shootPattern(player, bullets) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;

    // 扇形弹幕
    const configs = DanmakuPatterns.fan(cx, cy, px, py, {
        count: 7,
        spreadAngle: Math.PI / 3,
        speed: 350,
        color: '#ff8800'
    });

    DanmakuEngine.fireBullets(configs, bullets);
}
```

### 5.2 持续发射器（螺旋弹幕）

```javascript
// Boss 进入第二阶段时
onPhaseTwo() {
    DanmakuEngine.createEmitter({
        pattern: 'spiral',
        originX: this.x + this.width / 2,
        originY: this.y + this.height / 2,
        duration: 5,
        interval: 0.08,
        patternOptions: {
            arms: 4,
            speed: 250,
            color: '#ff00ff'
        },
        onUpdate: (emitter) => {
            // 跟随 Boss 位置
            emitter.originX = this.x + this.width / 2;
            emitter.originY = this.y + this.height / 2;
        }
    });
}
```

---

## 6. 性能注意事项

1. **子弹数量限制**：如果 `bullets.length > CONFIG.DANMAKU.MAX_BULLETS`，停止生成新子弹
2. **离屏清理**：子弹离开画面（含 cameraX 偏移）200 像素以上时标记删除
3. **跳过不可见绘制**：`draw()` 中先判断子弹是否在可见范围内

```javascript
// 在 bullet.draw() 开头添加可见性检查
draw(ctx, cameraX, cameraY) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    if (screenX < -50 || screenX > CONFIG.CANVAS_WIDTH + 50 ||
        screenY < -50 || screenY > CONFIG.CANVAS_HEIGHT + 50) {
        return; // 不可见，跳过绘制
    }
    // ... 正常绘制
}
```

---

## 7. 验收标准

- [ ] `BulletPool` 对象池能正常 acquire/release 子弹
- [ ] 所有 8 种弹幕花样 (`circle`, `fan`, `spiral`, `rain`, `cross`, `flower`, `laser`, `scatter`) 都能正确生成子弹
- [ ] `DanmakuEmitter` 能在指定时间内持续发射弹幕
- [ ] 追踪弹能平滑转向朝最近的敌人
- [ ] 屏幕上 200+ 子弹时游戏仍保持 60fps
- [ ] 子弹离屏后被正确回收
- [ ] Boss 可以轻松调用弹幕花样
- [ ] 弹幕视觉效果**华丽**（发光、拖尾、颜色丰富）

---

## 8. 不要做的事

- ❌ 不要实现具体的 Boss 类（那是 Task 04-06 的工作）
- ❌ 不要修改 `player.js`（那是 Task 02 的工作）
- ❌ 不要修改关卡内容（那是 Task 04-06 的工作）
- ❌ 不要引入 WebGL 或其他渲染框架（保持 Canvas 2D）

---

*完成后，通知 Task 04-06 的 Agent：弹幕系统已就绪，Boss 可以调用花样了。*
