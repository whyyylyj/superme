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
        this.enemies.forEach(e => e.update(dt, player, this.platforms, bullets));
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);

        // 更新道具
        this.powerups.forEach(p => p.update(dt, this.platforms));

        // 更新 Boss
        if (this.boss && !this.boss.markedForDeletion) {
            this.boss.update(dt, player, this.platforms, bullets);
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
