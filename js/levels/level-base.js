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
        this.checkpoints = [];
        this.boss = null;
        this.isCompleted = false;
    }

    /**
     * 创建暂存点
     * @param {number} x
     * @param {number} y
     */
    createCheckpoint(x, y) {
        const checkpoint = {
            x: x,
            y: y,
            width: 80,  // 增大宽度：40 → 80
            height: 120, // 增大高度：60 → 120
            active: false,
            pulseTime: 0,  // 脉动动画时间
            particles: [], // 粒子数组

            // 更新动画
            update(dt) {
                this.pulseTime += dt * 3; // 脉动速度

                // 更新粒子（如果已激活）
                if (this.active) {
                    // 生成新粒子
                    if (Math.random() < 0.3) {
                        this.particles.push({
                            x: this.width / 2,
                            y: this.height / 2,
                            vx: (Math.random() - 0.5) * 100,
                            vy: -Math.random() * 80 - 50,
                            life: 1.0,
                            size: Math.random() * 4 + 2
                        });
                    }

                    // 更新粒子位置和生命
                    this.particles = this.particles.filter(p => {
                        p.x += p.vx * dt;
                        p.y += p.vy * dt;
                        p.life -= dt * 0.8;
                        return p.life > 0;
                    });
                }
            },

            draw(ctx, cameraX, cameraY) {
                ctx.save();
                const screenX = this.x - cameraX;
                const screenY = this.y - cameraY;
                ctx.translate(screenX, screenY);

                // 计算脉动效果（呼吸灯）
                const pulse = (Math.sin(this.pulseTime) + 1) / 2; // 0 ~ 1
                const glowSize = this.active ? 15 + pulse * 10 : 5 + pulse * 3;

                // 绘制光晕
                if (this.active) {
                    ctx.shadowColor = '#00ff00';
                    ctx.shadowBlur = glowSize;
                } else {
                    ctx.shadowColor = '#ffaa00';
                    ctx.shadowBlur = glowSize;
                }

                // 绘制旗杆（更粗）
                ctx.fillStyle = this.active ? '#00ffcc' : '#cccccc';
                ctx.fillRect(-2, -this.height, 6, this.height);

                // 绘制底座
                ctx.fillStyle = this.active ? '#00aa88' : '#888888';
                ctx.fillRect(-15, 0, 36, 12);

                // 绘制旗帜（更大）
                const flagColor = this.active ? '#00ff00' : '#ff4444';
                ctx.fillStyle = flagColor;
                ctx.beginPath();
                ctx.moveTo(4, -this.height + 10);
                ctx.lineTo(this.width, -this.height + 35);
                ctx.lineTo(4, -this.height + 60);
                ctx.fill();

                // 旗帜上的星星图标（激活时）
                if (this.active) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '20px Arial';
                    ctx.fillText('★', 15, -this.height + 42);
                }

                // 绘制文字 "CHECKPOINT"（更大更明显）
                ctx.shadowBlur = this.active ? 20 : 10;
                ctx.fillStyle = this.active ? '#00ff00' : '#ffaa00';
                ctx.font = 'bold 14px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('CHECKPOINT', this.width / 2, -this.height - 15);

                // 激活状态下的额外文字
                if (this.active) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 10px "Press Start 2P", monospace';
                    ctx.fillText('✓ SAVED', this.width / 2, 25);
                }

                // 绘制粒子效果
                if (this.active && this.particles.length > 0) {
                    this.particles.forEach(p => {
                        ctx.globalAlpha = p.life;
                        ctx.fillStyle = '#00ff00';
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    ctx.globalAlpha = 1.0;
                }

                // 绘制碰撞检测区域提示（半透明框）
                ctx.globalAlpha = 0.1;
                ctx.fillStyle = this.active ? '#00ff00' : '#ffaa00';
                ctx.fillRect(0, -this.height + 60, this.width, this.height);
                ctx.globalAlpha = 1.0;

                ctx.restore();
            },

            // 扩大碰撞检测区域
            getCollisionBox() {
                return {
                    x: this.x - 20,
                    y: this.y - this.height + 60,
                    width: this.width + 40,
                    height: this.height
                };
            }
        };

        this.checkpoints.push(checkpoint);
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
        // 更新并检查暂存点
        this.checkpoints.forEach(cp => {
            // 更新动画
            if (cp.update) cp.update(dt);

            // 检查碰撞（使用扩大后的碰撞箱）
            if (!cp.active) {
                const collisionBox = cp.getCollisionBox ? cp.getCollisionBox() : cp;
                if (Physics.checkCollision(player, collisionBox)) {
                    cp.active = true;
                    if (typeof LevelManager !== 'undefined') {
                        LevelManager.setCheckpoint(this.levelNumber - 1, cp.x, cp.y - player.height);
                    }
                    if (typeof showLevelMessage !== 'undefined') {
                        showLevelMessage('CHECKPOINT REACHED', 'PROGRESS SAVED', 2000);
                    }
                    // 触发屏幕闪烁效果
                    if (typeof ScreenEffects !== 'undefined') {
                        ScreenEffects.flash(0.3, '#00ff00');
                    }
                    // 播放 checkpoint 音效
                    if (typeof AudioManager !== 'undefined' && AudioManager.sfx) {
                        AudioManager.sfx.checkpoint();
                    }
                }
            }
        });

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
        this.checkpoints.forEach(cp => {
            if (cp.draw) cp.draw(ctx, cameraX, cameraY);
        });

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
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        // 简单的网格背景
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const parallaxOffsetX = (cameraX * 0.5) % 50;

        ctx.beginPath();
        for (let x = -parallaxOffsetX; x < CONFIG.CANVAS_WIDTH; x += 50) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
        }
        for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += 50) {
            ctx.moveTo(0, y);
            ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
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
        this.checkpoints = [];
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
