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

        // 井字棋触发点系统
        this.ticTacToeTriggers = []; // 已激活的触发点
        this.ticTacToeCooldowns = new Map(); // 触发点冷却时间映射
        this.possibleTriggerLocations = []; // 可能的触发点位置
        this.triggerCooldownTime = 300; // 5分钟冷却时间（秒）
    }

    /**
     * 添加可能的井字棋触发点位置
     * @param {Object} location - {x, y} 触发点位置
     */
    addPossibleTriggerLocation(location) {
        this.possibleTriggerLocations.push({
            x: location.x,
            y: location.y,
            width: 60,
            height: 60,
            active: false,
            cooldown: 0
        });
    }

    /**
     * 随机激活指定数量的触发点
     * @param {number} count - 要激活的触发点数量
     */
    activateRandomTriggers(count) {
        const available = this.possibleTriggerLocations.filter(loc => !loc.active);

        // 如果请求数量超过可用数量，激活所有可用的
        const toActivate = Math.min(count, available.length);

        if (toActivate === 0) return;

        // 随机选择位置
        const shuffled = available.sort(() => Math.random() - 0.5);

        for (let i = 0; i < toActivate; i++) {
            shuffled[i].active = true;
            this.ticTacToeTriggers.push(shuffled[i]);
        }
    }

    /**
     * 创建暂存点
     * @param {number} x
     * @param {number} y
     */
    createCheckpoint(x, y) {
        this.checkpoints.push({
            x: x,
            y: y,
            width: 40,
            height: 60,
            active: false,
            draw(ctx, cameraX, cameraY) {
                ctx.save();
                ctx.translate(this.x - cameraX, this.y - cameraY);
                // Draw flagpole
                ctx.fillStyle = '#cccccc';
                ctx.fillRect(0, 0, 4, this.height);
                // Draw flag
                ctx.fillStyle = this.active ? '#00ff00' : '#ff0000';
                ctx.beginPath();
                ctx.moveTo(4, 0);
                ctx.lineTo(this.width, 15);
                ctx.lineTo(4, 30);
                ctx.fill();

                if (this.active) {
                    ctx.shadowColor = '#00ff00';
                    ctx.shadowBlur = 10;
                    ctx.fillStyle = '#00ff00';
                    ctx.font = '10px "Press Start 2P"';
                    ctx.fillText('SAVED', -5, -10);
                }
                ctx.restore();
            }
        });
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
            if (!cp.active && Physics.checkCollision(player, cp)) {
                cp.active = true;
                if (typeof LevelManager !== 'undefined') {
                    LevelManager.setCheckpoint(this.levelNumber - 1, cp.x, cp.y - player.height); // Spawn slightly above checkpoint
                }
                if (typeof showLevelMessage !== 'undefined') {
                    showLevelMessage('CHECKPOINT REACHED', 'PROGRESS SAVED', 2000);
                }
            }
            if (cp.update) cp.update(dt);
        });

        // 更新井字棋触发点
        this.ticTacToeTriggers.forEach(trigger => {
            // 更新冷却时间
            if (trigger.cooldown > 0) {
                trigger.cooldown -= dt;
                return;
            }

            // 检查玩家是否接触到触发点
            if (trigger.active && !trigger.cooldown && Physics.checkCollision(player, trigger)) {
                // 触发井字棋游戏
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('TIC_TAC_TOE_TRIGGER', {
                        levelNumber: this.levelNumber,
                        triggerX: trigger.x,
                        triggerY: trigger.y
                    });
                }

                // 设置冷却时间
                trigger.cooldown = this.triggerCooldownTime;

                // 暂时禁用触发点（可选）
                trigger.active = false;
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

        // 渲染井字棋触发点
        this.ticTacToeTriggers.forEach(trigger => {
            if (trigger.active && trigger.cooldown <= 0) {
                this.drawTicTacToeTrigger(ctx, trigger, cameraX, cameraY);
            }
        });

        this.platforms.forEach(p => p.draw(ctx, cameraX, cameraY));
        this.powerups.forEach(p => p.draw(ctx, cameraX, cameraY));
        this.enemies.forEach(e => e.draw(ctx, cameraX, cameraY));
        if (this.boss && !this.boss.markedForDeletion) {
            this.boss.draw(ctx, cameraX, cameraY);
        }
    }

    /**
     * 绘制井字棋触发点
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} trigger - 触发点对象
     * @param {number} cameraX
     * @param {number} cameraY
     */
    drawTicTacToeTrigger(ctx, trigger, cameraX, cameraY) {
        const x = trigger.x - cameraX;
        const y = trigger.y - cameraY;

        ctx.save();

        // 闪烁效果（使用时间）
        const flashIntensity = Math.sin(Date.now() / 200) * 0.5 + 0.5;

        // 金色光晕
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20 * flashIntensity;
        ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + 0.2 * flashIntensity})`;
        ctx.fillRect(x, y, trigger.width, trigger.height);

        // 金色边框
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + 0.5 * flashIntensity})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, trigger.width, trigger.height);

        // # 符号
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 24px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('#', x + trigger.width / 2, y + trigger.height / 2);

        ctx.restore();
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

        // 清理井字棋触发点
        this.ticTacToeTriggers = [];
        this.ticTacToeCooldowns.clear();
        this.possibleTriggerLocations = [];
    }

    // Getter 方法
    get width() {
        return this.config.width || 3000;
    }

    get height() {
        return this.config.height || 600;
    }
}
