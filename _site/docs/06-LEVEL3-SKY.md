# Task 06 — 第三关：天空圣殿 (Sky Temple)

> **前置阅读：** `00-ARCHITECTURE.md`  
> **依赖：** Task 01（核心基础设施）, Task 02（变身系统）, Task 03（弹幕系统）  
> **负责文件：** `js/levels/level3-sky.js`, `js/enemies/boss-level3.js`, 部分 `js/enemies/enemy-types.js`  
> **可与 Task 04/05 并行**

---

## 1. 关卡概述

| 属性 | 值 |
|------|-----|
| 关卡编号 | 3 |
| 主题名 | 天空圣殿 (Sky Temple) |
| 设计目标 | **终极挑战**——全飞行战斗，密集弹幕，最终 Boss |
| 难度 | ★★★★★ |
| 关卡长度 | 7000 像素宽 |
| 颜色方案 | 蓝紫色系（`CONFIG.COLORS.LEVEL3`） |
| 解锁变身 | 幻影形态（Phantom）— 放置在 Boss 战前 |
| Boss | 天空暴君 (Sky Tyrant) |

---

## 2. 环境设计

### 2.1 视觉风格

**天空宫殿 + 东方幻想天风格**

- **背景**：深蓝色天空渐变 + 云层 + 星星
- **平台**：半透明水晶质感浮空岛 — 白蓝色 + 八角形装饰
- **装饰**：
  - 多层云彩（慢速视差滚动）
  - 光柱效果（从天而降的亮白色光束）
  - 闪烁的星星
  - 环形水晶装饰（浮动在某些平台上方）

### 2.2 特殊设计：全飞行关卡

**这一关没有地面！** 所有平台都是浮空岛，掉落就会落入虚空死亡。
关卡设计偏向**飞行战斗**：

- 前半段有足够的平台可以跳跃
- 后半段平台越来越稀疏，鼓励使用飞行变身
- Boss 战是完全的空中战斗

### 2.3 背景绘制

```javascript
drawBackground(ctx, cameraX, cameraY, canvas) {
    // Layer 1: 天空渐变
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#0a0a3a');
    skyGrad.addColorStop(0.5, '#1a1a5a');
    skyGrad.addColorStop(1, '#2a2a7a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Layer 2: 星星
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
        const sx = ((i * 127 + 50) % canvas.width);
        const sy = ((i * 89 + 30) % (canvas.height * 0.6));
        const brightness = 0.3 + Math.sin(Date.now() / 1000 + i * 1.5) * 0.3;
        ctx.globalAlpha = brightness;
        const size = (i % 3 === 0) ? 2 : 1;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Layer 3: 远处云层（视差 0.15x）
    const cloudOffset1 = cameraX * 0.15;
    ctx.fillStyle = 'rgba(100, 100, 180, 0.15)';
    for (let i = 0; i < 8; i++) {
        const cx = i * 250 - cloudOffset1 + Math.sin(Date.now() / 5000 + i) * 20;
        const cy = 200 + (i % 3) * 100;
        drawCloud(ctx, cx, cy, 100 + i * 20, 30);
    }

    // Layer 4: 近处云层（视差 0.4x）
    const cloudOffset2 = cameraX * 0.4;
    ctx.fillStyle = 'rgba(150, 150, 220, 0.2)';
    for (let i = 0; i < 6; i++) {
        const cx = i * 300 - cloudOffset2;
        const cy = 350 + (i % 2) * 80;
        drawCloud(ctx, cx, cy, 80 + i * 15, 20);
    }

    // Layer 5: 光柱效果
    ctx.fillStyle = 'rgba(200, 200, 255, 0.05)';
    const lightOffset = cameraX * 0.3;
    for (let i = 0; i < 3; i++) {
        const lx = (i * 800 + 400) - lightOffset;
        if (lx > -100 && lx < canvas.width + 100) {
            ctx.fillRect(lx, 0, 40, canvas.height);
        }
    }
}

// 辅助：绘制云朵
function drawCloud(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - width / 4, y + 5, width / 3, height / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + width / 4, y + 5, width / 3, height / 3, 0, 0, Math.PI * 2);
    ctx.fill();
}
```

### 2.4 平台样式

```javascript
// 水晶浮空岛：半透明 + 发光边缘
drawPlatform(ctx, plat, cameraX, cameraY) {
    const px = plat.x - cameraX;
    const py = plat.y - cameraY;

    ctx.save();

    // 半透明水晶
    ctx.globalAlpha = 0.7;
    const crystalGrad = ctx.createLinearGradient(px, py, px, py + plat.height);
    crystalGrad.addColorStop(0, '#aaaaff');
    crystalGrad.addColorStop(1, '#6666cc');
    ctx.fillStyle = crystalGrad;
    ctx.fillRect(px, py, plat.width, plat.height);

    // 发光边缘
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#ccccff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#aaaaff';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, plat.width, plat.height);

    // 内部光纹
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < plat.width; i += 30) {
        ctx.moveTo(px + i, py);
        ctx.lineTo(px + i + 15, py + plat.height);
    }
    ctx.stroke();

    ctx.restore();
}
```

---

## 3. 关卡地图布局

```
宽度: 7000px, 高度: 600px（但没有地面，掉死）

区域划分：
[0-1800]        入口浮岛群 — 相对密集的平台，学习空中移动
[1800-3500]     神殿走廊 — 移动平台、光柱陷阱、天使兵
[3500-5000]     破碎天路 — 平台越来越小和稀疏，空中敌人密集
[5000-5500]     最后的平台 — 补给道具 + 幻影变身道具
[5500-7000]     Boss 竞技场 — 巨大的开放空间，纯空中 Boss 战

布局草图：

Y:0  ______________________________________________________________________
     |          ☆ ☆        ☆            ☆     ☆          ☆                 |
Y:100|   [浮岛]      [浮岛]     [浮岛]          [小]  [小]    [Boss区域]    |
     |      [浮岛]          [浮岛]                 [小]            │        |
Y:200|  [浮岛]    [浮岛]          [移动台]     [敌]      [幻影]   │        |
     |      [敌]      [光柱]         [移动台]         [敌]  Boss   │        |
Y:300|[起始]    [浮岛]    [浮岛]         [浮岛] [敌]       [补给]  │        |
     |   [浮岛]     [敌]       [浮岛]       [小]                   │        |
Y:400|         [浮岛]    [光柱]     [浮岛] [敌]                    │        |
     |                                                              │        |
Y:500|                        （虚空 — 掉落即死）                  │        |
     |_____________________________________________________________________|
      0       1000      2000      3000     4000    5000    6000      7000
```

---

## 4. 敌人配置

### 4.1 天空杂兵——天使兵 (Angel Soldier)

| 属性 | 值 |
|------|-----|
| 外观 | 白色方块 + 蓝色翅膀 + 光环 |
| HP | 3 |
| 移动 | 缓慢悬浮 + 接近玩家时加速 |
| 攻击 | 每 2 秒发射 3 发扇形光弹 (`DanmakuPatterns.fan`) |
| 颜色 | `#aaaaff` |

### 4.2 天空精英——符文守卫 (Rune Guardian)

| 属性 | 值 |
|------|-----|
| 外观 | 大型六角形水晶体，有旋转符文环 |
| HP | 8 |
| 移动 | 固定位置悬浮，不追踪玩家 |
| 攻击 | 每 3 秒发射圆形弹幕 (`DanmakuPatterns.circle`, 12 发) |
| 特殊 | 有护盾：前 5 次攻击被挡（显示护盾闪烁），之后才开始扣 HP |
| 颜色 | `#6666ff` |

### 4.3 天空飞行兵——弹幕天使 (Danmaku Angel)

| 属性 | 值 |
|------|-----|
| 外观 | 小型飞行体，发光核心 + 透明翅膀 |
| HP | 2 |
| 移动 | 高速绕圈飞行 |
| 攻击 | 持续发射螺旋弹幕 (`DanmakuPatterns.spiral`, 2 臂) |
| 颜色 | `#ffaaff` |
| 特点 | 数量多，成群出现（3-4 只一组） |

---

## 5. 特殊机制

### 5.1 移动平台

```javascript
class MovingPlatform extends Platform {
    constructor(x, y, width, height, moveAxis, moveRange, moveSpeed) {
        super(x, y, width, height, '#aaaaff');
        this.startX = x;
        this.startY = y;
        this.moveAxis = moveAxis;   // 'x' 或 'y'
        this.moveRange = moveRange; // 移动范围（像素）
        this.moveSpeed = moveSpeed; // 移动速度
        this.moveTimer = 0;
    }

    update(dt) {
        this.moveTimer += dt * this.moveSpeed;
        if (this.moveAxis === 'x') {
            this.x = this.startX + Math.sin(this.moveTimer) * this.moveRange;
        } else {
            this.y = this.startY + Math.sin(this.moveTimer) * this.moveRange;
        }
    }
}
```

### 5.2 光柱陷阱

- 垂直光柱从天花板到地面
- 每 4 秒激活一次，持续 1.5 秒
- 激活时接触光柱受伤
- 预警：激活前光柱颜色变亮 1 秒

```javascript
class LightPillar {
    constructor(x, width = 40) {
        this.x = x;
        this.width = width;
        this.timer = 0;
        this.interval = 4;      // 4 秒周期
        this.activeDuration = 1.5;
        this.warningDuration = 1;
        this.state = 'idle';    // idle, warning, active
    }

    update(dt) {
        this.timer += dt;
        const phase = this.timer % this.interval;

        if (phase < this.interval - this.warningDuration - this.activeDuration) {
            this.state = 'idle';
        } else if (phase < this.interval - this.activeDuration) {
            this.state = 'warning';
        } else {
            this.state = 'active';
        }
    }

    checkCollision(player) {
        if (this.state !== 'active') return false;
        return player.x + player.width > this.x &&
               player.x < this.x + this.width;
    }

    draw(ctx, cameraX, cameraY, canvasHeight) {
        const px = this.x - cameraX;
        ctx.save();

        switch (this.state) {
            case 'idle':
                ctx.fillStyle = 'rgba(100, 100, 255, 0.03)';
                ctx.fillRect(px, 0, this.width, canvasHeight);
                break;
            case 'warning':
                const blink = Math.sin(Date.now() / 100) > 0;
                ctx.fillStyle = blink ? 'rgba(255, 200, 100, 0.15)' : 'rgba(255, 200, 100, 0.05)';
                ctx.fillRect(px, 0, this.width, canvasHeight);
                break;
            case 'active':
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#ffffff';
                ctx.fillRect(px, 0, this.width, canvasHeight);
                // 边缘粒子
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 5; i++) {
                    const py = Math.random() * canvasHeight;
                    ctx.globalAlpha = Math.random() * 0.5;
                    ctx.beginPath();
                    ctx.arc(px + Math.random() * this.width, py, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
        }

        ctx.restore();
    }
}
```

### 5.3 虚空死亡

掉出画面下方 → 立即死亡（不像第二关的岩浆有缓冲）

```javascript
if (player.y > CONFIG.CANVAS_HEIGHT + 100) {
    player.hp = 0;
    player.markedForDeletion = true;
}
```

---

## 6. 道具放置

| 位置 (x) | 道具类型 | 目的 |
|-----------|---------|------|
| 300 | `'speed'` | 加速移动 |
| 1000 | `'spread'` | 更多火力 |
| 1500 | `'transform_mecha'` | 机甲体验（辅助清怪） |
| 2500 | `'shield'` | 保护 |
| 3200 | `'rapid'` | 快速射击 |
| 4500 | `'star'` | 无敌穿过困难区域 |
| 5200 | `'transform_phantom'` | **幻影形态首次体验！** Boss 战前关键道具 |
| 5400 | `'shield'` | Boss 战前保护 |

---

## 7. Boss：天空暴君 (Sky Tyrant)

### 7.1 基本信息

| 属性 | 值 |
|------|-----|
| 尺寸 | 180×180 像素 |
| HP | 200（最终 Boss 要持久） |
| 颜色 | 蓝白色 (`#aaaaff`) → 阶段变化 |
| 阶段 | **4 阶段**（最终 Boss 要有足够的差别） |
| 行为 | 完全飞行，在竞技场中自由移动 |

### 7.2 外观

- 巨大的几何体 — 八角形/菱形
- 周围环绕旋转的符文碎片
- 核心发光（颜色随阶段变化）
- 整体有"神圣"和"威严"的感觉
- 碎片化——受伤时外层碎片脱落

### 7.3 行为 — 阶段 1 (HP > 75%)

**"圣光试炼"**

| 攻击 | 弹幕花样 | 频率 |
|------|----------|------|
| 圣光散射 | `DanmakuPatterns.circle()` — 16 发白色光弹 | 每 3 秒 |
| 追踪光球 | 2 发追踪弹 (homing) | 每 4 秒 |
| 移动 | 缓慢在竞技场中心浮动 | 持续 |

### 7.4 行为 — 阶段 2 (HP 50%~75%)

**"星辰裁决"**

颜色变为 `#8888ff`

| 攻击 | 弹幕花样 | 频率 |
|------|----------|------|
| 十字星辰 | `DanmakuPatterns.cross()` — 旋转十字激光 | 发射器，持续 4 秒 |
| 扇形光波 | `DanmakuPatterns.fan()` — 9 发宽扇形 | 每 2.5 秒 |
| 圣光落幕 | `DanmakuPatterns.rain()` — 大面积光弹雨 | 每 5 秒 |
| 移动 | 更快，开始追踪玩家 | 持续 |

### 7.5 行为 — 阶段 3 (HP 25%~50%)

**"幻想弹幕"**（东方 Project 致敬）

颜色变为 `#ff88ff`

| 攻击 | 弹幕花样 | 频率 |
|------|----------|------|
| 花瓣弹幕 | `DanmakuPatterns.flower()` — 8 瓣粉紫色花 | 每 4 秒 |
| 双螺旋 | `DanmakuPatterns.spiral()` — 6 臂双向旋转 | 发射器，交替 |
| 激光扫射 | `DanmakuPatterns.laser()` — 水平/垂直扫射 | 每 3 秒 |
| 瞬移 | 消失 → 在玩家附近重现 | 每 5 秒 |

### 7.6 行为 — 阶段 4 (HP < 25%)

**"终焉审判"**（最终狂暴阶段）

颜色变为 `#ffffff`，全身发出耀眼白光

| 攻击 | 弹幕花样 | 频率 |
|------|----------|------|
| 全屏弹幕 | 所有花样随机组合发射！ | 每 2 秒 |
| 符文炸弹 | 在玩家位置放置延时爆炸圆形弹幕 | 每 3 秒 |
| 连续激光 | 多方向 `laser` 连发 | 持续 |
| 移动 | 极速追踪 + 冲撞 | 持续 |

### 7.7 代码骨架

```javascript
// boss-level3.js

class BossSkyTyrant extends BossBase {
    constructor(x, y) {
        super(x, y, 180, 180);
        this.name = 'Sky Tyrant';
        this.maxHp = 200;
        this.hp = this.maxHp;
        this.color = '#aaaaff';

        this.canFly = true;
        this.phase = 1;
        this.attackTimer = 0;
        this.rotationAngle = 0;  // 外围碎片旋转

        this.teleportTimer = 0;
        this.fragments = 8;  // 外围碎片数量（受伤减少）
    }

    update(dt, player, bullets, platforms) {
        super.update(dt, player, bullets, platforms);

        // 阶段检查
        this.checkPhaseTransition();

        // 旋转
        this.rotationAngle += dt * (1 + this.phase * 0.5);

        // 碎片跟随 HP 减少
        this.fragments = Math.max(0, Math.floor((this.hp / this.maxHp) * 8));

        // 攻击
        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            this.executeAttack(player, bullets);
        }

        // 飞行追踪
        this.updateMovement(dt, player);
    }

    checkPhaseTransition() {
        const hpPercent = this.hp / this.maxHp;
        let newPhase = 1;
        if (hpPercent <= 0.25) newPhase = 4;
        else if (hpPercent <= 0.50) newPhase = 3;
        else if (hpPercent <= 0.75) newPhase = 2;

        if (newPhase !== this.phase) {
            this.phase = newPhase;
            EventBus.emit('boss:phase', { phase: this.phase, bossName: this.name });
            ParticleSystem.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.color, 100
            );
            // 更新颜色
            const colors = { 1: '#aaaaff', 2: '#8888ff', 3: '#ff88ff', 4: '#ffffff' };
            this.color = colors[this.phase];
        }
    }

    executeAttack(player, bullets) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;

        switch (this.phase) {
            case 1:
                this.phase1Attack(cx, cy, px, py, bullets);
                break;
            case 2:
                this.phase2Attack(cx, cy, px, py, bullets);
                break;
            case 3:
                this.phase3Attack(cx, cy, px, py, bullets);
                break;
            case 4:
                this.phase4Attack(cx, cy, px, py, bullets);
                break;
        }
    }

    phase1Attack(cx, cy, px, py, bullets) {
        // 圣光散射
        const configs = DanmakuPatterns.circle(cx, cy, {
            count: 16, speed: 250, color: '#ccccff'
        });
        DanmakuEngine.fireBullets(configs, bullets);
        this.attackTimer = 3;
    }

    // ... 其他阶段攻击方法

    draw(ctx, cameraX, cameraY) {
        const px = this.x - cameraX;
        const py = this.y - cameraY;
        const cx = px + this.width / 2;
        const cy = py + this.height / 2;

        ctx.save();

        // 外围旋转碎片
        for (let i = 0; i < this.fragments; i++) {
            const angle = (Math.PI * 2 / 8) * i + this.rotationAngle;
            const rx = cx + Math.cos(angle) * 100;
            const ry = cy + Math.sin(angle) * 100;

            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.6;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;

            // 菱形碎片
            ctx.beginPath();
            ctx.moveTo(rx, ry - 10);
            ctx.lineTo(rx + 7, ry);
            ctx.lineTo(rx, ry + 10);
            ctx.lineTo(rx - 7, ry);
            ctx.closePath();
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        // 主体（八角形）
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i - Math.PI / 8;
            const r = 70;
            const vx = cx + Math.cos(angle) * r;
            const vy = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.fill();

        // 核心光球
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 20 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2);
        ctx.fill();

        // "眼睛"
        ctx.fillStyle = '#000044';
        ctx.shadowBlur = 0;
        ctx.fillRect(cx - 15, cy - 5, 10, 10);
        ctx.fillRect(cx + 5, cy - 5, 10, 10);

        ctx.restore();
    }
}
```

---

## 8. 关卡完成条件

- 击败天空暴君 → 触发**最终胜利序列**
- **胜利序列：**
  1. Boss 爆炸：巨大的粒子爆炸（100+ 粒子）
  2. 慢动作效果（dt *= 0.3）持续 2 秒
  3. 全屏白色闪光渐变
  4. 烟花庆典：持续产生五彩烟花粒子
  5. 显示 "CONGRATULATIONS!" 文字
  6. 显示通关统计（时间、击杀数等，如果有跟踪的话）
  7. "PLAY AGAIN" 按钮

```javascript
// 胜利序列
onBossDefeated() {
    EventBus.emit('boss:defeat', { bossName: 'Sky Tyrant', levelNumber: 3 });
    EventBus.emit('game:win', {});

    // 延迟创建大量烟花
    let fireworkTimer = 0;
    const fireworkInterval = setInterval(() => {
        fireworkTimer += 0.2;
        ParticleSystem.createFirework(
            this.boss.x + Math.random() * 400 - 200,
            this.boss.y + Math.random() * 300 - 150
        );
        if (fireworkTimer > 5) clearInterval(fireworkInterval);
    }, 200);
}
```

---

## 9. 验收标准

- [ ] 天空主题背景有星星、云层、光柱效果
- [ ] 水晶浮空岛平台半透明且发光
- [ ] 掉入虚空立即死亡
- [ ] 移动平台正确运动且玩家可以站在上面
- [ ] 光柱陷阱有预警且接触伤害
- [ ] 天使兵发射扇形弹幕
- [ ] 符文守卫有护盾机制
- [ ] 弹幕天使成群出现且发射螺旋弹幕
- [ ] Boss 四个阶段攻击模式差异明显
- [ ] Boss 第三阶段使用花瓣弹幕（东方 Project 致敬）
- [ ] Boss 第四阶段全屏弹幕压力巨大
- [ ] 击败 Boss 后有华丽的胜利烟花序列
- [ ] 幻影变身道具在 Boss 战前出现
- [ ] 难度为全游戏最高

---

## 10. 不要做的事

- ❌ 不要修改核心模块、变身系统、弹幕引擎的代码
- ❌ 不要设计第一关或第二关的内容
- ❌ 不要修改 `main.js` 的核心结构

---

*完成后，确保关卡可以独立运行和测试。这是最终关卡，需要额外的打磨和测试！*
