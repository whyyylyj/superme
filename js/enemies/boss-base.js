/**
 * boss-base.js
 *
 * BossBase - Boss基类，继承自EnemyBase，支持多阶段战斗和弹幕系统
 *
 * 特性:
 * - 多阶段战斗系统
 * - 弹幕发射能力
 * - Boss血条UI
 * - 阶段切换特效
 * - 复杂AI行为模式
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

class BossBase extends EnemyBase {
    /**
     * 创建Boss实例
     * @param {number} x - 初始X坐标
     * @param {number} y - 初始Y坐标
     * @param {Object} config - Boss配置
     * @param {string} config.name - Boss名称
     * @param {number} config.maxHp - 最大生命值
     * @param {number} config.phaseCount - 阶段数量
     * @param {number} config.width - 宽度
     * @param {number} config.height - 高度
     * @param {string} config.color - 颜色
     * @param {string} config.themeColor - 主题颜色（用于特效）
     * @param {boolean} config.canFly - 是否可以飞行
     */
    constructor(x, y, config = {}) {
        // 默认配置
        const defaultConfig = {
            name: 'Unknown Boss',
            maxHp: 500,
            phaseCount: 2,
            width: 120,
            height: 120,
            color: '#ff0000',
            themeColor: '#ff0000',
            canFly: false,
            aiType: 'stationary',
            hp: 500,
            speed: 80,
            damage: 2,
            score: 1000
        };

        const finalConfig = { ...defaultConfig, ...config };

        // 调用父类构造函数
        super(x, y, finalConfig);

        // Boss特有属性
        this.name = finalConfig.name;
        this.maxHp = finalConfig.maxHp;
        this.phaseCount = finalConfig.phaseCount;
        this.themeColor = finalConfig.themeColor;
        this.canFly = finalConfig.canFly;

        // 阶段系统
        this.currentPhase = 1;
        this.phaseThresholds = []; // 阶段转换阈值（血量百分比）
        this._initializePhaseThresholds();

        // 战斗状态
        this.battleState = 'entering'; // entering, idle, moving, attacking, pattern, dying
        this.stateTimer = 0;
        this.patternTimer = 0;

        // 行为模式
        this.attackPattern = 0;
        this.movePattern = 0;

        // 特效相关
        this.glowPower = 0;
        this.shakeAmount = 0;
        this.flashIntensity = 0;

        // 弹幕系统引用（需要等待DanmakuEngine实现）
        this.danmakuEngine = null;

        // 入场动画
        this.entering = true;
        this.enterProgress = 0;
    }

    /**
     * 初始化阶段阈值
     */
    _initializePhaseThresholds() {
        // 根据阶段数自动生成阈值
        for (let i = 1; i < this.phaseCount; i++) {
            const threshold = i / this.phaseCount;
            this.phaseThresholds.push(threshold);
        }
    }

    /**
     * 更新Boss
     */
    update(dt, player, platforms, bullets = null) {
        // 入场动画
        if (this.entering) {
            this.updateEntering(dt);
            return;
        }

        // 调用父类更新
        super.update(dt, player, platforms, bullets);

        // 阶段检测
        this.checkPhaseTransition();

        // 战斗行为
        this.updateBattleBehavior(dt, player);

        // 更新特效
        this.updateEffects(dt);
    }

    /**
     * 入场动画
     */
    updateEntering(dt) {
        this.enterProgress += dt * 0.5; // 2秒入场

        if (this.enterProgress >= 1) {
            this.entering = false;
            this.battleState = 'idle';
            this.stateTimer = 1;
            // 入场完成特效
            ParticleSystem.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.themeColor,
                50
            );
        }

        // 入场缩放动画
        this.scale = 0.5 + this.enterProgress * 0.5;
        this.glowPower = this.enterProgress * 20;
    }

    /**
     * 检查阶段转换
     */
    checkPhaseTransition() {
        const hpPercent = this.hp / this.maxHp;

        for (let i = this.phaseThresholds.length - 1; i >= 0; i--) {
            if (hpPercent <= this.phaseThresholds[i] && this.currentPhase <= i + 1) {
                this.transitionToPhase(i + 2);
                break;
            }
        }
    }

    /**
     * 转换到新阶段
     */
    transitionToPhase(newPhase) {
        if (newPhase > this.phaseCount) return;

        const oldPhase = this.currentPhase;
        this.currentPhase = newPhase;

        // 阶段转换特效
        this.flashIntensity = 1.0;
        this.shakeAmount = 20;

        // 爆炸特效
        ParticleSystem.createExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.themeColor,
            40
        );

        // 子类可以覆盖此方法来添加特定阶段的初始化
        this.onPhaseTransition(oldPhase, newPhase);
    }

    /**
     * 阶段转换回调（子类可覆盖）
     */
    onPhaseTransition(oldPhase, newPhase) {
        // 子类可以实现特定的阶段转换逻辑
    }

    /**
     * 更新战斗行为
     */
    updateBattleBehavior(dt, player) {
        this.stateTimer -= dt;
        this.patternTimer -= dt;

        // 状态机
        if (this.stateTimer <= 0) {
            this.chooseNextState();
        }

        switch (this.battleState) {
            case 'idle':
                this.updateIdleState(dt);
                break;
            case 'moving':
                this.updateMovingState(dt, player);
                break;
            case 'attacking':
                this.updateAttackingState(dt, player);
                break;
            case 'pattern':
                this.updatePatternState(dt, player);
                break;
        }
    }

    /**
     * 选择下一个状态
     */
    chooseNextState() {
        const r = Math.random();

        if (r < 0.2) {
            this.battleState = 'idle';
            this.stateTimer = 0.5 + Math.random() * 0.5;
        } else if (r < 0.5) {
            this.battleState = 'moving';
            this.stateTimer = 1.5 + Math.random() * 1;
            this.movePattern = Math.floor(Math.random() * 3);
        } else if (r < 0.7) {
            this.battleState = 'attacking';
            this.stateTimer = 2 + Math.random() * 1;
            this.attackPattern = Math.floor(Math.random() * this.getAttackPatternCount());
        } else {
            this.battleState = 'pattern';
            this.stateTimer = 3 + Math.random() * 2;
        }
    }

    /**
     * 获取攻击模式数量（子类可覆盖）
     */
    getAttackPatternCount() {
        return 3;
    }

    /**
     * 更新待机状态
     */
    updateIdleState(dt) {
        this.vx = 0;
        this.glowPower = Math.sin(Date.now() / 200) * 5 + 5;
    }

    /**
     * 更新移动状态
     */
    updateMovingState(dt, player) {
        this.glowPower = 5;

        switch (this.movePattern) {
            case 0: // 追踪玩家
                if (player.x < this.x) {
                    this.vx = -this.speed * (1 + this.currentPhase * 0.2);
                } else {
                    this.vx = this.speed * (1 + this.currentPhase * 0.2);
                }
                break;
            case 1: // 来回冲刺
                this.vx = Math.sin(Date.now() / 300) * this.speed * 2;
                break;
            case 2: // 圆形移动
                const angle = Date.now() / 500;
                this.vx = Math.cos(angle) * this.speed;
                if (this.canFly) {
                    this.vy = Math.sin(angle) * this.speed * 0.5;
                }
                break;
        }

        this.facing = this.vx >= 0 ? 1 : -1;
    }

    /**
     * 更新攻击状态
     */
    updateAttackingState(dt, player) {
        this.vx = 0;
        this.glowPower = 15 + Math.sin(Date.now() / 100) * 5;

        if (this.attackCooldown <= 0) {
            this.performAttack(player, this.attackPattern);
            this.attackCooldown = 0.8 - this.currentPhase * 0.1; // 后期阶段攻击更快
        }
    }

    /**
     * 更新模式状态
     */
    updatePatternState(dt, player) {
        this.glowPower = 20;

        // 复杂弹幕模式
        if (this.patternTimer <= 0) {
            this.performComplexPattern(player);
            this.patternTimer = 0.3;
        }

        this.patternTimer -= dt;
    }

    /**
     * 执行攻击（子类必须实现）
     */
    performAttack(player, pattern) {
        // 子类实现具体的攻击模式
        console.warn('BossBase.performAttack should be overridden by subclass');
    }

    /**
     * 执行复杂弹幕模式（子类可覆盖）
     */
    performComplexPattern(player) {
        // 默认实现：发射圆形弹幕
        this.fireCircularPattern(8 + this.currentPhase * 4);
    }

    /**
     * 圆形弹幕
     */
    fireCircularPattern(bulletCount) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        for (let i = 0; i < bulletCount; i++) {
            const angle = (Math.PI * 2 / bulletCount) * i;
            this.fireBullet(cx, cy, Math.cos(angle), Math.sin(angle));
        }
    }

    /**
     * 扇形弹幕
     */
    fireFanPattern(bulletCount, spreadAngle, player) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // 计算指向玩家的角度
        const baseAngle = Math.atan2(
            player.y + player.height / 2 - cy,
            player.x + player.width / 2 - cx
        );

        for (let i = 0; i < bulletCount; i++) {
            const angle = baseAngle + (i - bulletCount / 2) * (spreadAngle / bulletCount);
            this.fireBullet(cx, cy, Math.cos(angle), Math.sin(angle));
        }
    }

    /**
     * 螺旋弹幕
     */
    fireSpiralPattern(armCount, rotationSpeed) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        for (let i = 0; i < armCount; i++) {
            const angle = (Date.now() * rotationSpeed) + (Math.PI * 2 / armCount) * i;
            this.fireBullet(cx, cy, Math.cos(angle), Math.sin(angle));
        }
    }

    /**
     * 发射子弹（通用方法）
     */
    fireBullet(x, y, dirX, dirY, speed = 300, color = null) {
        // 如果有弹幕引擎，使用弹幕引擎
        if (this.danmakuEngine && typeof DanmakuPatterns !== 'undefined') {
            // 暂时使用简单子弹，等待弹幕系统实现
        }

        // 使用现有的子弹系统
        if (typeof Bullet !== 'undefined') {
            const bulletColor = color || this.themeColor;
            return new Bullet(x, y, dirX, dirY, speed, bulletColor, false);
        }
    }

    /**
     * 更新特效
     */
    updateEffects(dt) {
        // 闪光衰减
        if (this.flashIntensity > 0) {
            this.flashIntensity -= dt * 2;
            if (this.flashIntensity < 0) this.flashIntensity = 0;
        }

        // 震动衰减
        if (this.shakeAmount > 0) {
            this.shakeAmount -= dt * 20;
            if (this.shakeAmount < 0) this.shakeAmount = 0;
        }
    }

    /**
     * 受到伤害
     */
    takeDamage(damage) {
        // 入场期间无敌
        if (this.entering) return;

        super.takeDamage(damage);

        // Boss受伤特效
        this.shakeAmount = 5;
        this.flashIntensity = 0.3;

        if (this.hp <= 0) {
            this.die();
        }
    }

    /**
     * 死亡
     */
    die() {
        super.die();

        // Boss死亡大爆炸
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                ParticleSystem.createExplosion(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    this.themeColor,
                    30
                );
            }, i * 100);
        }

        // 最后的大爆炸
        setTimeout(() => {
            ParticleSystem.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '#ffffff',
                100
            );
            ParticleSystem.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.themeColor,
                80
            );
        }, 1000);
    }

    /**
     * 绘制Boss
     */
    draw(ctx, cameraX, cameraY) {
        ctx.save();

        // 应用震动
        let shakeX = 0, shakeY = 0;
        if (this.shakeAmount > 0) {
            shakeX = (Math.random() - 0.5) * this.shakeAmount;
            shakeY = (Math.random() - 0.5) * this.shakeAmount;
        }

        const drawX = this.x - cameraX + shakeX;
        const drawY = this.y - cameraY + shakeY;
        const drawW = this.width * this.scale;
        const drawH = this.height * this.scale;

        // Boss主体
        if (this.flashIntensity > 0.5) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = this.color;
        }

        // 强烈的发光效果
        ctx.shadowBlur = 30 + this.glowPower + (this.currentPhase - 1) * 5;
        ctx.shadowColor = this.themeColor;

        ctx.fillRect(drawX, drawY, drawW, drawH);

        // Boss面部
        this.drawBossFace(ctx, drawX, drawY, drawW, drawH);

        // 绘制Boss血条
        this.drawBossHealthBar(ctx);

        ctx.restore();
    }

    /**
     * 绘制Boss面部（子类可覆盖）
     */
    drawBossFace(ctx, x, y, w, h) {
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;

        // 邪恶的眼睛
        const eyeY = y + h * 0.3;

        // 左眼
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, eyeY);
        ctx.lineTo(x + w * 0.35, eyeY + h * 0.1);
        ctx.lineTo(x + w * 0.2, eyeY + h * 0.1);
        ctx.fill();

        // 右眼
        ctx.beginPath();
        ctx.moveTo(x + w * 0.65, eyeY);
        ctx.lineTo(x + w * 0.8, eyeY + h * 0.1);
        ctx.lineTo(x + w * 0.65, eyeY + h * 0.1);
        ctx.fill();

        // 嘴巴（带牙齿）
        const mouthY = y + h * 0.6;
        const mouthW = w * 0.5;
        const mouthX = x + w * 0.25;

        ctx.fillStyle = '#000000';
        ctx.fillRect(mouthX, mouthY, mouthW, h * 0.1);

        // 牙齿
        ctx.fillStyle = '#ffffff';
        const toothCount = 5;
        const toothW = mouthW / toothCount;
        for (let i = 0; i < toothCount; i++) {
            ctx.fillRect(mouthX + i * toothW + 2, mouthY, toothW - 4, h * 0.1);
        }

        // 阶段标记
        ctx.fillStyle = this.themeColor;
        ctx.font = 'bold 16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`P${this.currentPhase}`, x + w / 2, y - 15);
    }

    /**
     * 绘制Boss血条
     */
    drawBossHealthBar(ctx) {
        const barWidth = 400;
        const barHeight = 20;
        const barX = (ctx.canvas.width - barWidth) / 2;
        const barY = 30;

        // 血条背景
        ctx.fillStyle = '#222222';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 血条边框
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // 血量
        const healthPercent = this.hp / this.maxHp;
        const healthWidth = barWidth * healthPercent;

        // 血量颜色（根据阶段变化）
        const hue = 120 * healthPercent; // 从绿色到红色
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(barX + 2, barY + 2, healthWidth - 4, barHeight - 4);

        // Boss名称
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, ctx.canvas.width / 2, barY - 10);
    }
}
