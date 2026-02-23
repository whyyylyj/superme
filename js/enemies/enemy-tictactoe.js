/**
 * 井字棋精灵敌人 - 彩蛋游戏触发者
 * 
 * 功能：
 * - 像普通敌人一样在关卡中游荡
 * - 显眼的金色外观 + 旋转井字符号
 * - 接触后触发井字棋挑战
 * - 每个关卡出现 2 次
 */

class EnemyTicTacToe extends Entity {
    constructor(x, y) {
        super(x, y, 40, 40, '#ffd700'); // 金色
        
        /**
         * 移动速度
         * @type {number}
         */
        this.vx = 60;
        
        /**
         * 巡逻距离（左右各 100px）
         * @type {number}
         */
        this.patrolDist = 100;
        
        /**
         * 起始 X 位置
         * @type {number}
         */
        this.startX = x;
        
        /**
         * 面向方向（1=右，-1=左）
         * @type {number}
         */
        this.facing = 1;
        
        /**
         * 重力加速度
         * @type {number}
         */
        this.gravity = 1500;
        
        /**
         * 是否激活状态（冷却中时不触发）
         * @type {boolean}
         */
        this.active = true;
        
        /**
         * 冷却时间（秒）
         * @type {number}
         */
        this.cooldown = 0;
        
        /**
         * 冷却总时间
         * @type {number}
         */
        this.cooldownTime = 3;
        
        /**
         * 标记删除
         * @type {boolean}
         */
        this.markedForDeletion = false;
        
        /**
         * 旋转角度（用于动画）
         * @type {number}
         */
        this.rotation = 0;
        
        /**
         * 脉冲强度（用于闪烁）
         * @type {number}
         */
        this.pulseIntensity = 0;
    }

    /**
     * 更新状态
     * @param {number} dt - 增量时间（秒）
     * @param {Player} player - 玩家对象
     * @param {Platform[]} platforms - 平台数组
     */
    update(dt, player, platforms) {
        // 冷却中时不触发
        if (this.cooldown > 0) {
            this.cooldown -= dt;
            return;
        }

        // 简单的巡逻 AI（左右移动）
        if (this.x > this.startX + this.patrolDist) {
            this.vx = -60;
            this.facing = -1;
        } else if (this.x < this.startX - this.patrolDist) {
            this.vx = 60;
            this.facing = 1;
        }

        // 应用重力
        this.vy += this.gravity * dt;

        // 移动 X
        this.x += this.vx * dt;

        // 移动 Y
        this.y += this.vy * dt;

        // 平台碰撞检测
        let onGround = false;
        for (let plat of platforms) {
            if (Physics.checkCollision(this, plat)) {
                if (this.vy > 0 && this.y + this.height - this.vy * dt <= plat.y) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    onGround = true;
                }
            }
        }

        // 边缘检测（防止走出平台）
        if (onGround) {
            let edge = true;
            for (let plat of platforms) {
                let checkX = this.facing === 1 ? this.x + this.width + 5 : this.x - 5;
                if (checkX >= plat.x && checkX <= plat.x + plat.width &&
                    this.y + this.height + 5 >= plat.y && this.y + this.height + 5 <= plat.y + plat.height) {
                    edge = false;
                    break;
                }
            }
            if (edge) {
                this.vx *= -1;
                this.facing *= -1;
            }
        }

        // 检查与玩家碰撞（触发井字棋）
        if (this.active && Physics.checkCollision(this, player)) {
            this.triggerChallenge(this.levelNumber || 1);
        }

        // 检查与子弹碰撞（触发井字棋）
        if (this.active && bullets) {
            for (let bullet of bullets) {
                if (!bullet.markedForDeletion && Physics.checkCollision(this, bullet)) {
                    // 标记子弹为删除
                    bullet.markedForDeletion = true;
                    // 触发井字棋挑战
                    this.triggerChallenge(this.levelNumber || 1);
                    break;
                }
            }
        }

        // 更新动画
        this.rotation += dt * Math.PI; // 每秒旋转 180 度
        this.pulseIntensity = Math.sin(Date.now() / 100) * 0.5 + 0.5; // 快速闪烁
    }

    /**
     * 触发井字棋挑战
     * @param {number} levelNumber - 当前关卡编号
     */
    triggerChallenge(levelNumber = 1) {
        // 设置冷却时间
        this.cooldown = this.cooldownTime;

        // 发送事件
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('TIC_TAC_TOE_TRIGGER', {
                levelNumber: levelNumber,
                triggerX: this.x,
                triggerY: this.y
            });
        }

        // 创建粒子效果
        if (typeof ParticleSystem !== 'undefined') {
            ParticleSystem.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '#ffd700',
                30
            );
        }
    }

    /**
     * 绘制敌人
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} cameraX
     * @param {number} cameraY
     */
    draw(ctx, cameraX, cameraY) {
        const x = this.x - cameraX;
        const y = this.y - cameraY;
        const centerX = x + this.width / 2;
        const centerY = y + this.height / 2;

        ctx.save();

        // 金色光晕
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20 + this.pulseIntensity * 20;

        // 半透明金色身体
        ctx.fillStyle = `rgba(255, 215, 0, ${0.6 + this.pulseIntensity * 0.4})`;
        ctx.fillRect(x, y, this.width, this.height);

        // 金色边框
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.8 + this.pulseIntensity * 0.2})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, this.width, this.height);

        // 旋转的井字符号
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 28px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('#', 0, 0);

        ctx.restore();

        // 冷却指示器
        if (this.cooldown > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('冷却中', centerX, y - 10);
            ctx.restore();
        }
    }
}
