# Task 05 — 第二关：地狱熔岩 (Nether Inferno)

> **前置阅读：** `00-ARCHITECTURE.md`  
> **依赖：** Task 01（核心基础设施）, Task 02（变身系统）, Task 03（弹幕系统）  
> **负责文件：** `js/levels/level2-nether.js`, `js/enemies/boss-level2.js`, 部分 `js/enemies/enemy-types.js`  
> **可与 Task 04/06 并行**

---

## 1. 关卡概述

| 属性 | 值 |
|------|-----|
| 关卡编号 | 2 |
| 主题名 | 地狱熔岩 (Nether Inferno) |
| 设计目标 | **弹幕挑战**——大量弹幕需要巧妙闪避，节奏加快 |
| 难度 | ★★★★☆ |
| 关卡长度 | 6000 像素宽 |
| 颜色方案 | 红橙色系（`CONFIG.COLORS.LEVEL2`） |
| 解锁变身 | 龙形态（Dragon）— 放置在后段高台 |
| Boss | 烈焰魔龙 (Inferno Dragon) |

---

## 2. 环境设计

### 2.1 视觉风格

**Minecraft 地狱 (Nether) + 熔岩洞穴**

- **背景**：深红色底 (`#1a0a00`) + 滚动的岩浆泡泡
- **平台**：黑曜石质感 — 深紫黑色 + 红色纹理裂纹
- **装饰**：
  - 岩浆河（底部流动的橙红色液体动画）
  - 掉落的火星粒子（从上方飘下）
  - 熔岩柱（装饰性，从天花板向下长的石钟乳）
  - 岩浆喷泉（间歇性的粒子柱，造成伤害区域）

### 2.2 特殊地形

#### 岩浆区

- 关卡底部 (Y > 550) 不是空白而是**岩浆**
- 掉入岩浆 → 每 0.5 秒受到 1 点伤害，并被缓慢推出
- 龙形态免疫岩浆伤害

#### 岩浆喷泉 (Geyser)

- 地面上的特定位置，间隔 3 秒喷发一次
- 喷发时向上发射一列火焰弹幕 (`DanmakuPatterns.laser`)
- 有预警动画（喷发前地面闪烁 1 秒）

### 2.3 背景绘制

```javascript
drawBackground(ctx, cameraX, cameraY, canvas) {
    // Layer 1: 深红底
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Layer 2: 远处熔岩流（视差 0.2x）
    ctx.fillStyle = '#331100';
    const lavaOffset = cameraX * 0.2;
    for (let i = 0; i < canvas.width + 100; i += 80) {
        const x = i - (lavaOffset % 80);
        const height = 150 + Math.sin(x * 0.02 + Date.now() / 2000) * 30;
        ctx.fillRect(x, canvas.height - height, 80, height);
    }

    // Layer 3: 天花板石钟乳（视差 0.4x）
    ctx.fillStyle = '#2a1500';
    const stalOffset = cameraX * 0.4;
    for (let i = 0; i < 20; i++) {
        const sx = i * 180 - stalOffset;
        const sh = 30 + (i * 37) % 60;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + 15, sh);
        ctx.lineTo(sx + 30, 0);
        ctx.fill();
    }

    // Layer 4: 火星粒子（从上方飘下）
    ctx.fillStyle = '#ff6600';
    for (let i = 0; i < 15; i++) {
        const fx = (i * 193 + Date.now() / 50) % canvas.width;
        const fy = (i * 71 + Date.now() / 30) % canvas.height;
        ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 300 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Layer 5: 底部岩浆（视差 0.1x，上下波动）
    const lavaY = canvas.height - 50;
    const lavaGrad = ctx.createLinearGradient(0, lavaY, 0, canvas.height);
    lavaGrad.addColorStop(0, '#ff4400');
    lavaGrad.addColorStop(0.5, '#ff6600');
    lavaGrad.addColorStop(1, '#ffaa00');
    ctx.fillStyle = lavaGrad;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 20) {
        const y = lavaY + Math.sin(x * 0.03 + Date.now() / 500) * 8;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}
```

### 2.4 平台样式

```javascript
// 黑曜石平台：深紫黑色 + 红色裂纹
drawPlatform(ctx, plat, cameraX, cameraY) {
    const px = plat.x - cameraX;
    const py = plat.y - cameraY;

    // 黑曜石基底
    ctx.fillStyle = '#1a0a1a';
    ctx.fillRect(px, py, plat.width, plat.height);

    // 裂纹纹理
    ctx.strokeStyle = '#ff220044';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // 生成固定随机裂纹（基于位置的伪随机）
    for (let i = 0; i < plat.width; i += 25) {
        const seed = (plat.x + i) * 31;
        const y1 = py + (seed % plat.height);
        const y2 = py + ((seed * 7) % plat.height);
        ctx.moveTo(px + i, y1);
        ctx.lineTo(px + i + 12, y2);
    }
    ctx.stroke();

    // 红色发光边缘
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ff4400';
    ctx.strokeStyle = '#ff440066';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, plat.width, plat.height);
    ctx.shadowBlur = 0;
}
```

---

## 3. 关卡地图布局

```
宽度: 6000px, 高度: 600px

区域划分：
[0-1500]        入口走廊 — 黑曜石平台，跌落岩浆，学习跳跃节奏
[1500-3000]     喷泉区 — 岩浆喷泉间歇性喷发，需要把握地形
[3000-4200]     垂直攀爬区 — 向上攀爬的平台路线，放置龙形态变身
[4200-5000]     岩浆河道 — 需要飞行或精准跳跃跨过
[5000-6000]     Boss 竞技场 — 大型平台 + Boss 战

布局草图：

Y:0  ______________________________________________________________________
     |                                                                      |
Y:100|                           [浮台↑]                                    |
     |                        [浮台↑]                                       |
Y:200|                     [浮台↑]    [龙道具]                [浮台]         |
     |                  [浮台↑]                                    [浮台]    |
Y:300|   [浮台]  [浮台]    [浮台]                   [浮台--浮台]        ████|
     |                                                                  ████|
Y:400|                                                [小岛]           ████|
     |  [敌]    [敌]  [喷泉] [敌] [喷泉]    [敌]               [Boss]  ████|
Y:500|█████ ████ █████ ██████ ████ █████ ████               █████████████████|
     |▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ≈≈≈岩浆≈≈≈ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓|
      0       1000      2000      3000     4000     5000               6000
```

---

## 4. 敌人配置

### 4.1 地狱杂兵——火焰史莱姆 (Magma Slime)

| 属性 | 值 |
|------|-----|
| 外观 | 扁圆形的橙红色软体生物，有跳动动画 |
| HP | 3 |
| 移动 | 跳跃式前进（每 1.5 秒跳一次） |
| 攻击 | 接触伤害；死亡时爆炸产生 4 颗小弹幕 |
| 颜色 | `#ff6600` |

### 4.2 地狱飞兵——烈焰蝙蝠 (Fire Bat)

| 属性 | 值 |
|------|-----|
| 外观 | 红黑色蝙蝠形状 |
| HP | 2 |
| 移动 | 锯齿形路线飞行（左右+上下） |
| 攻击 | 每 1.5 秒向下方扔一颗火球 |
| 颜色 | `#aa2200` |

### 4.3 地狱精英——黑曜石卫兵 (Obsidian Guard)

| 属性 | 值 |
|------|-----|
| 外观 | 大型方块盔甲，发光紫黑色 |
| HP | 6 |
| 移动 | 缓慢巡逻 |
| 攻击 | 每 2 秒发射圆形弹幕 (`DanmakuPatterns.circle`, 8 发) |
| 颜色 | `#220033` |

---

## 5. 道具放置

| 位置 (x) | 道具类型 | 目的 |
|-----------|---------|------|
| 500 | `'shield'` | 早期保护 |
| 1200 | `'rapid'` | 对付密集敌人 |
| 2000 | `'speed'` | 躲避喷泉 |
| 3100 | `'transform_dragon'` | **龙形态首次体验！** 用于飞越岩浆河 |
| 4000 | `'spread'` | Boss 战前武器 |
| 4800 | `'star'` | Boss 战前无敌 |

---

## 6. Boss：烈焰魔龙 (Inferno Dragon)

### 6.1 基本信息

| 属性 | 值 |
|------|-----|
| 尺寸 | 150×100 像素 |
| HP | 120 |
| 颜色 | 深红 (`#990000`) → 阶段变化 |
| 阶段 | 3 阶段 |
| 行为 | **可飞行**，在竞技场上空盘旋 |

### 6.2 外观

- 巨大的龙形方块剪影
- 翅膀上下拍动
- 嘴部发光（攻击前闪烁）
- 身体周围漂浮火焰粒子

### 6.3 行为 — 阶段 1 (HP > 66%)

| 攻击 | 弹幕花样 | 频率 |
|------|----------|------|
| 火球吐息 | `DanmakuPatterns.fan()` — 5 发扇形 | 每 3 秒 |
| 空中俯冲 | 快速飞向玩家位置 | 每 6 秒 |
| 移动 | 在竞技场上方左右飞行 | 持续 |

### 6.4 行为 — 阶段 2 (HP 33%~66%)

颜色变为 `#ff4400`

| 攻击 | 弹幕花样 | 频率 |
|------|----------|------|
| 火焰旋风 | `DanmakuPatterns.spiral()` — 4 臂持续旋转发射器 | 持续 4 秒窗口 |
| 岩浆喷泉 | `DanmakuPatterns.rain()` — 从上方大面积落下 | 每 4 秒 |
| 连续火球 | `DanmakuPatterns.fan()` — 7 发更宽扇形 | 每 2 秒 |
| 移动 | 更快速，偶尔瞬移 | 持续 |

### 6.5 行为 — 阶段 3 (HP < 33%)

颜色变为 `#ffaa00`，身体发出强烈光芒

| 攻击 | 弹幕花样 | 频率 |
|------|----------|------|
| 花瓣地狱 | `DanmakuPatterns.flower()` — 6 瓣华丽弹幕 | 每 5 秒 |
| 十字激光 | `DanmakuPatterns.cross()` — 旋转十字 | 持续旋转 |
| 终极吐息 | `DanmakuPatterns.laser()` — 水平扫射激光 | 每 3 秒 |
| 暴怒冲撞 | 高速来回冲锋 | 持续 |

### 6.6 代码骨架

```javascript
// boss-level2.js

class BossInfernoDragon extends BossBase {
    constructor(x, y) {
        super(x, y, 150, 100);
        this.name = 'Inferno Dragon';
        this.maxHp = 120;
        this.hp = this.maxHp;
        this.color = '#990000';

        this.canFly = true;
        this.flyTargetX = x;
        this.flyTargetY = y - 100;

        this.wingAngle = 0;
        this.phase = 1;
        this.attackTimer = 0;
        this.spiralEmitter = null;
    }

    update(dt, player, bullets, platforms) {
        super.update(dt, player, bullets, platforms);

        // 阶段检查
        if (this.hp <= this.maxHp * 0.66 && this.phase === 1) {
            this.enterPhase(2);
        }
        if (this.hp <= this.maxHp * 0.33 && this.phase === 2) {
            this.enterPhase(3);
        }

        // 飞行逻辑
        this.wingAngle += dt * 6;
        this.updateFlight(dt, player);

        // 攻击
        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            this.chooseAttack(player, bullets);
        }
    }

    updateFlight(dt, player) {
        // 向目标位置飞行
        const dx = this.flyTargetX - this.x;
        const dy = this.flyTargetY - this.y;
        const speed = 100 + (this.phase - 1) * 50;

        this.x += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);
        this.y += Math.sign(dy) * Math.min(Math.abs(dy), speed * dt);

        // 定期更换目标位置
        // ...
    }

    enterPhase(phase) {
        this.phase = phase;
        if (phase === 2) this.color = '#ff4400';
        if (phase === 3) this.color = '#ffaa00';

        EventBus.emit('boss:phase', { phase, bossName: this.name });
        ParticleSystem.createExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.color, 80
        );
    }

    draw(ctx, cameraX, cameraY) {
        const px = this.x - cameraX;
        const py = this.y - cameraY;

        ctx.save();

        // 身体
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(px + 20, py + 20, 110, 60);

        // 头部
        ctx.fillRect(px + 130, py + 25, 30, 40);

        // 翅膀拍动
        const wingY = Math.sin(this.wingAngle) * 15;
        ctx.fillStyle = '#770000';

        // 上翅
        ctx.beginPath();
        ctx.moveTo(px + 40, py + 20);
        ctx.lineTo(px + 75, py - 20 + wingY);
        ctx.lineTo(px + 100, py + 20);
        ctx.closePath();
        ctx.fill();

        // 眼睛
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffff00';
        ctx.fillRect(px + 140, py + 32, 10, 8);

        // 嘴部火焰
        if (this.attackTimer < 0.5) {
            ctx.fillStyle = '#ff8800';
            ctx.shadowColor = '#ff8800';
            ctx.fillRect(px + 160, py + 40, 15, 8);
        }

        ctx.restore();
    }
}
```

---

## 7. 特殊机制

### 7.1 岩浆伤害

```javascript
// 在关卡 update 中
if (player.y + player.height > 550) {
    // 龙形态免疫
    if (TransformSystem.currentForm.name !== 'Dragon') {
        player.takeDamage(); // 每次只扣一次，靠 damageCooldown 控制频率
    }
    // 将玩家弹出岩浆
    player.vy = -300;
}
```

### 7.2 岩浆喷泉 (Geyser)

```javascript
class LavaGeyser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.timer = 0;
        this.interval = 3;   // 3 秒喷发一次
        this.warning = false;
        this.active = false;
    }

    update(dt, bullets) {
        this.timer += dt;

        // 预警阶段（喷发前 1 秒）
        this.warning = (this.timer > this.interval - 1 && !this.active);

        if (this.timer >= this.interval) {
            this.timer = 0;
            this.active = true;

            // 向上喷射弹幕
            const configs = DanmakuPatterns.laser(
                this.x, this.y, -Math.PI / 2, // 向上
                { count: 8, speed: 500, color: '#ff6600' }
            );
            DanmakuEngine.fireBullets(configs, bullets);

            // 粒子效果
            ParticleSystem.createExplosion(this.x, this.y, '#ff4400', 20);

            setTimeout(() => { this.active = false; }, 500);
        }
    }

    draw(ctx, cameraX, cameraY) {
        const px = this.x - cameraX;
        const py = this.y - cameraY;

        // 喷泉口
        ctx.fillStyle = '#ff440088';
        ctx.fillRect(px - 10, py - 5, 20, 10);

        // 预警闪烁
        if (this.warning) {
            ctx.fillStyle = Math.floor(Date.now() / 200) % 2 === 0 ? '#ff660088' : '#ff000044';
            ctx.fillRect(px - 15, py - 10, 30, 15);
        }
    }
}
```

---

## 8. 验收标准

- [ ] 地狱主题背景有岩浆流动动画
- [ ] 黑曜石平台有裂纹纹理
- [ ] 岩浆区掉落会受到持续伤害（龙形态免疫）
- [ ] 岩浆喷泉定时喷发弹幕，有预警动画
- [ ] 火焰史莱姆有跳跃移动动画，死亡爆炸
- [ ] 烈焰蝙蝠锯齿飞行路线正确
- [ ] 黑曜石卫兵发射圆形弹幕
- [ ] Boss 三个阶段攻击模式各不相同
- [ ] Boss 使用花瓣弹幕 + 螺旋弹幕等华丽效果
- [ ] 龙形态变身道具放置在需要飞行的位置前
- [ ] 难度明显高于第一关

---

## 9. 不要做的事

- ❌ 不要修改核心模块、变身系统、弹幕引擎的代码
- ❌ 不要设计第一关或第三关的内容
- ❌ 不要修改其他关卡文件

---

*完成后，确保关卡可以独立运行和测试。*
