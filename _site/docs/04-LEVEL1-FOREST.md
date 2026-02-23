# Task 04 — 第一关：像素森林 (Pixel Forest)

> **前置阅读：** `00-ARCHITECTURE.md`  
> **依赖：** Task 01（核心基础设施）, Task 02（变身系统）, Task 03（弹幕系统）  
> **负责文件：** `js/levels/level1-forest.js`, `js/enemies/boss-level1.js`, 部分 `js/enemies/enemy-types.js`  
> **可与 Task 05/06 并行**

---

## 1. 关卡概述

| 属性 | 值 |
|------|-----|
| 关卡编号 | 1 |
| 主题名 | 像素森林 (Pixel Forest) |
| 设计目标 | **入门引导**——教会玩家操作、射击和变身 |
| 难度 | ★★☆☆☆ |
| 关卡长度 | 5000 像素宽 |
| 颜色方案 | 绿色系（`CONFIG.COLORS.LEVEL1`） |
| 解锁变身 | 机甲形态（Mecha） — 放置在中段 |
| Boss | 树精王 (Treant King) |

---

## 2. 环境设计

### 2.1 视觉风格

**Minecraft 像素方块 + 自然森林**

- **背景**：深绿色底 (`#0a1a0a`) + 视差滚动的树影
- **平台**：草绿色方块，带草纹理 — 顶部浅绿，底部深棕
- **装饰**：
  - 方块树（Minecraft 风格，随机大小的棕色树干 + 绿色树冠）
  - 漂浮的绿色粒子（萤火虫效果）
  - 远处山丘轮廓（视差层）
  - 河流段（蓝色动画方块，掉下去不死但会受伤并被弹回）

### 2.2 背景绘制

```javascript
drawBackground(ctx, cameraX, cameraY, canvas) {
    // Layer 1: 深色底
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Layer 2: 远处山丘（视差 0.2x）
    ctx.fillStyle = '#0d2a0d';
    const hillOffset = cameraX * 0.2;
    // 绘制几个重叠的半圆作为山丘
    for (let i = 0; i < 5; i++) {
        const hx = i * 300 - hillOffset;
        ctx.beginPath();
        ctx.arc(hx, canvas.height, 200 + i * 50, Math.PI, 0);
        ctx.fill();
    }

    // Layer 3: 树影（视差 0.4x）
    ctx.fillStyle = '#0a2a0a';
    const treeOffset = cameraX * 0.4;
    for (let i = 0; i < 15; i++) {
        const tx = i * 200 - treeOffset;
        // 树干
        ctx.fillRect(tx + 10, canvas.height - 200, 15, 150);
        // 树冠
        ctx.beginPath();
        ctx.arc(tx + 17, canvas.height - 220, 35, 0, Math.PI * 2);
        ctx.fill();
    }

    // Layer 4: 萤火虫粒子（视差 0.6x）
    ctx.fillStyle = '#88ff44';
    const fireflyOffset = cameraX * 0.6;
    for (let i = 0; i < 20; i++) {
        const fx = (i * 137 + Math.sin(Date.now() / 1000 + i) * 30) - fireflyOffset;
        const fy = 100 + Math.sin(Date.now() / 800 + i * 2) * 50 + (i % 5) * 80;
        ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 500 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(fx % (canvas.width + 100), fy, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
```

### 2.3 平台样式

覆写 `Platform.draw()` 或在 `level-base.js` 中提供颜色配置：

```javascript
// 森林平台：顶部草绿色 + 泥土色主体
drawPlatform(ctx, plat, cameraX, cameraY) {
    const px = plat.x - cameraX;
    const py = plat.y - cameraY;

    // 泥土层
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(px, py, plat.width, plat.height);

    // 草皮层（顶部 4px）
    ctx.fillStyle = '#44aa44';
    ctx.fillRect(px, py, plat.width, Math.min(4, plat.height));

    // 草丛装饰
    ctx.fillStyle = '#66cc44';
    for (let i = 0; i < plat.width; i += 12) {
        const gh = 3 + Math.sin(i * 0.5) * 2;
        ctx.fillRect(px + i, py - gh, 4, gh);
    }
}
```

---

## 3. 关卡地图布局

```
宽度: 5000px, 高度: 600px

区域划分：
[0-1200]        教学区 — 简单平台，少量敌人，教操作
[1200-2500]     森林深处 — 更多敌人，悬空平台，放置机甲变身道具
[2500-3500]     河流区 — 有掉落危险的河段，需要跳跃
[3500-5000]     Boss 区域 — 准备道具，Boss 战

布局草图：

Y:0  ___________________________________________________________________________________________
     |                                                                                           |
Y:100|   [平台]                    [浮台]            [浮台]                           [浮台]      |
     |            [浮台]                                        [浮台]                             |
Y:200|                     [浮台]         [机甲道具]                    [浮台]                     |
     |   [速度]                                                              [浮台]               |
Y:300|                [浮台]                                                                     |
     |        [敌]             [敌] [敌]        [敌]            [敌]                [Boss区]      |
Y:400|                                                                                           |
     | ███  [地面] ████   [地面] █████  [地面]█ ~~河流~~  [地面]████   [Boss平台]████████████      |
Y:500|█████████████████████████████████████████~~~~~~~~~~████████████████████████████████████████  |
     |_____________________________________________________________________________________________|
      0         500      1000      1500      2000      2500     3000      3500     4000     5000
```

---

## 4. 敌人配置

### 4.1 森林杂兵——蘑菇怪 (Shroom)

| 属性 | 值 |
|------|-----|
| 外观 | 带红色斑点的方块蘑菇，有脚 |
| HP | 2 |
| 移动 | 巡逻：左右来回走，遇到边缘转向 |
| 攻击 | 接触伤害 |
| 颜色 | `#cc4444` |

### 4.2 森林飞兵——鸟人 (BirdMan)

| 属性 | 值 |
|------|-----|
| 外观 | 带翅膀的方块鸟 |
| HP | 2 |
| 移动 | 在固定区域上下飘浮 |
| 攻击 | 每 2 秒向玩家方向发射 1 颗子弹 |
| 颜色 | `#88aa44` |

### 4.3 在 `enemy-types.js` 中定义

```javascript
class Shroom extends EnemyBase {
    constructor(x, y) {
        super(x, y, 30, 30, '#cc4444');
        this.type = 'shroom';
        this.hp = 2;
        this.patrolSpeed = 80;
    }

    draw(ctx, cameraX, cameraY) {
        // 蘑菇帽（红色半圆 + 白色斑点）
        // 蘑菇柄（棕色小方块）
        // 小脚（来回走时有动画）
    }
}

class BirdMan extends EnemyBase {
    constructor(x, y) {
        super(x, y, 25, 25, '#88aa44');
        this.type = 'birdman';
        this.hp = 2;
        this.shootTimer = 2;
        this.floatY = y;
        this.floatAmplitude = 40;
    }

    update(dt, platforms, player, bullets) {
        // 上下浮动
        this.y = this.floatY + Math.sin(Date.now() / 500) * this.floatAmplitude;

        // 射击倒计时
        this.shootTimer -= dt;
        if (this.shootTimer <= 0 && player) {
            this.shootTimer = 2;
            // 向玩家发射一颗子弹
            const angle = Math.atan2(
                player.y - this.y,
                player.x - this.x
            );
            bullets.push(new Bullet(
                this.x + this.width / 2,
                this.y + this.height / 2,
                Math.cos(angle), Math.sin(angle),
                300, '#aaff44', false
            ));
        }
    }
}
```

---

## 5. 道具放置

| 位置 (x) | 道具类型 | 目的 |
|-----------|---------|------|
| 300 | `'speed'` | 早期速度加成，教学 |
| 800 | `'spread'` | 散弹武器体验 |
| 1800 | `'transform_mecha'` | **首次变身体验！** 重点时刻 |
| 2200 | `'rapid'` | 快速射击 |
| 3300 | `'shield'` | Boss 战前的保护 |
| 3600 | `'star'` | 无敌星，给玩家信心 |

---

## 6. Boss：树精王 (Treant King)

### 6.1 基本信息

| 属性 | 值 |
|------|-----|
| 尺寸 | 120×120 像素 |
| HP | 80 |
| 颜色 | 棕色 (`#664422`) + 绿色树冠 |
| 阶段 | 2 阶段 |

### 6.2 外观

- 巨大的方块树干
- 顶部有绿色方块树冠
- "眼睛"是两个发光的黄色窗口
- 树根作为"脚"

### 6.3 行为 — 阶段 1 (HP > 50%)

| 攻击 | 弹幕花样 | 频率 |
|------|----------|------|
| 落叶雨 | `DanmakuPatterns.rain()` — 从上方落下绿色弹幕 | 每 4 秒 |
| 树枝投掷 | `DanmakuPatterns.fan()` — 3 发扇形棕色弹 | 每 2.5 秒 |
| 缓慢移动 | 朝玩家方向缓慢移动 | 持续 |

### 6.4 行为 — 阶段 2 (HP ≤ 50%)

| 攻击 | 弹幕花样 | 频率 |
|------|----------|------|
| 暴怒落叶 | `DanmakuPatterns.rain()` — 更密集 | 每 2.5 秒 |
| 旋转根须 | `DanmakuPatterns.spiral()` — 4 臂旋转弹幕 | 创建发射器，持续 3 秒 |
| 冲锋 | 快速冲向玩家 | 每 5 秒 |

**阶段过渡动画：** 树冠变红，大量叶子粒子爆炸

### 6.5 代码骨架

```javascript
// boss-level1.js

class BossTreeant extends BossBase {
    constructor(x, y) {
        super(x, y, 120, 120);
        this.name = 'Treant King';
        this.maxHp = 80;
        this.hp = this.maxHp;
        this.color = '#664422';

        this.attackTimer = 0;
        this.phase = 1;
        this.chargeTimer = 0;
    }

    update(dt, player, bullets, platforms) {
        super.update(dt, player, bullets, platforms);

        // 阶段检查
        if (this.hp <= this.maxHp * 0.5 && this.phase === 1) {
            this.enterPhase2();
        }

        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            this.chooseAttack(player, bullets);
        }
    }

    chooseAttack(player, bullets) {
        if (this.phase === 1) {
            const r = Math.random();
            if (r < 0.5) {
                // 落叶雨
                const configs = DanmakuPatterns.rain(
                    this.x - 200, 600, this.y - 100,
                    { count: 6, speed: 180, color: '#44aa22' }
                );
                DanmakuEngine.fireBullets(configs, bullets);
                this.attackTimer = 4;
            } else {
                // 扇形攻击
                const px = player.x + player.width / 2;
                const py = player.y + player.height / 2;
                const configs = DanmakuPatterns.fan(
                    this.x + this.width / 2, this.y + this.height / 2,
                    px, py,
                    { count: 3, speed: 350, color: '#886622' }
                );
                DanmakuEngine.fireBullets(configs, bullets);
                this.attackTimer = 2.5;
            }
        } else {
            // Phase 2 更激烈的攻击...
        }
    }

    enterPhase2() {
        this.phase = 2;
        this.color = '#884422';
        EventBus.emit('boss:phase', { phase: 2, bossName: this.name });
        ParticleSystem.createExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            '#44ff22', 60
        );
    }

    draw(ctx, cameraX, cameraY) {
        const px = this.x - cameraX;
        const py = this.y - cameraY;

        ctx.save();

        // 树干
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#886644';
        ctx.fillRect(px + 20, py + 40, 80, 80);

        // 树冠
        ctx.fillStyle = this.phase === 1 ? '#228822' : '#882222';
        ctx.shadowColor = this.phase === 1 ? '#44ff44' : '#ff4444';
        ctx.fillRect(px, py, 120, 50);
        ctx.fillRect(px + 10, py - 20, 100, 30);

        // 眼睛
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffff00';
        ctx.fillRect(px + 35, py + 55, 15, 10);
        ctx.fillRect(px + 70, py + 55, 15, 10);

        // 根须/脚
        ctx.fillStyle = '#553311';
        ctx.shadowBlur = 0;
        ctx.fillRect(px + 15, py + 115, 20, 10);
        ctx.fillRect(px + 85, py + 115, 20, 10);

        ctx.restore();
    }
}
```

---

## 7. 关卡完成条件

- 击败树精王 Boss → `isCompleted` 设为 `true`
- 触发 `EventBus.emit('level:complete', { levelNumber: 1 })`
- 显示 "LEVEL 1 CLEAR!" 文字动画
- 等待 2 秒后过渡到第二关

---

## 8. 验收标准

- [ ] 关卡背景有多层视差滚动效果
- [ ] 平台有森林主题样式（草皮 + 泥土）
- [ ] 萤火虫粒子在背景中飘浮
- [ ] 蘑菇怪和鸟人敌人行为正确
- [ ] 机甲变身道具出现在中段，拾取后变身成功
- [ ] Boss 有两个阶段，每个阶段攻击模式不同
- [ ] Boss 使用弹幕系统（`DanmakuPatterns`）发射攻击
- [ ] 击败 Boss 后关卡标记完成
- [ ] 难度适中，新手可以通关

---

## 9. 不要做的事

- ❌ 不要修改核心模块代码（Task 01 负责）
- ❌ 不要修改变身系统代码（Task 02 负责）
- ❌ 不要修改弹幕引擎代码（Task 03 负责）
- ❌ 不要设计第二关和第三关的内容

---

*完成后，确保关卡可以独立运行和测试。*
