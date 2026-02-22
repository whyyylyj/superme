# Task 07-08 - 关卡系统基础实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 创建关卡基类和第一关临时包装器，为多关卡系统奠定基础。

**架构:** 使用 LevelBase 抽象类定义关卡接口，通过包装模式将现有 LevelMap 适配到新系统。

**技术栈:** 原生 JavaScript (ES6 Class)

---

## 前置条件

确保已完成：
- [x] js/core/ 目录已创建
- [x] EventBus, CONFIG, GameStateMachine, LevelManager 已实现
- [x] index.html 脚本加载顺序已更新

---

## Task 7: 创建关卡基类 (LevelBase)

**文件:**
- 创建目录: `js/levels/`
- 创建文件: `js/levels/level-base.js`

**Step 1: 创建 levels 目录**

```bash
mkdir -p js/levels
```

**Step 2: 创建 LevelBase 类**

创建文件 `js/levels/level-base.js`：

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

**Step 3: 验证文件创建成功**

```bash
ls -la js/levels/
```

预期输出: 包含 `level-base.js` 文件

**Step 4: 提交**

```bash
git add js/levels/level-base.js
git commit -m "feat: add LevelBase class for level interface"
```

---

## Task 8: 创建第一关包装器

**文件:**
- 创建: `js/levels/level1-forest.js`

**Step 1: 创建 Level1Forest 类**

创建文件 `js/levels/level1-forest.js`：

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

## 验收检查清单

- [ ] `js/levels/` 目录已创建
- [ ] `level-base.js` 文件存在且包含 LevelBase 类
- [ ] `level1-forest.js` 文件存在且继承自 LevelBase
- [ ] 两个文件都已提交到 git

---

## 注意事项

1. **不要修改** `js/level.js` 文件（保留原有逻辑）
2. **不要修改** `js/main.js` 文件（由主任务负责）
3. 确保文件编码为 UTF-8
4. 完成后通知主任务，以便继续集成

---

## 完成标志

任务完成后，新的目录结构应该是：

```
js/
├── levels/
│   ├── level-base.js       ← 新创建
│   └── level1-forest.js    ← 新创建
└── level.js                ← 保持不变
```
