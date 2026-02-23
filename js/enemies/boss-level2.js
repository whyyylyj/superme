/**
 * boss-level2.js
 *
 * InfernoDragon - 第二关Boss：烈焰魔龙
 *
 * 特性:
 * - 3个战斗阶段
 * - 飞行Boss
 * - 火焰主题弹幕（火球、火焰喷射、陨石）
 * - 熔岩召唤能力
 *
 * 阶段1:
 * - 地面攻击为主
 * - 火球弹幕
 * - 飞行轰炸
 *
 * 阶段2 (HP < 66%):
 * - 频繁飞行
 * - 火焰喷射
 * - 召唤火元素
 *
 * 阶段3 (HP < 33%):
 * - 持续飞行
 * - 陨石雨
 * - 全面火焰弹幕地狱
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

class InfernoDragon extends BossBase {
    constructor(x, y) {
        super(x, y, {
            name: 'Inferno Dragon',
            maxHp: 600,
            phaseCount: 3,
            width: 140,
            height: 100,
            color: '#ff4500', // 橙红色
            themeColor: '#ff6600', // 火焰橙
            canFly: true,
            speed: 100,
            damage: 2
        });

        // 魔龙特有属性
        this.wingFlapCooldown = 0;
        this.meteorCooldown = 8; // 陨石冷却
        this.fireBreathTimer = 0;
        this.isFireBreathing = false;
        this.flightHeight = 200; // 飞行高度
    }

    /**
     * 获取攻击模式数量
     */
    getAttackPatternCount() {
        return 5; // 5种攻击模式
    }

    /**
     * 执行攻击
     */
    performAttack(player, pattern) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        switch (pattern) {
            case 0:
                // 模式1：火球弹幕（圆形）
                this.fireFireballCircle(cx, cy);
                break;
            case 1:
                // 模式2：火焰喷射（扇形）
                this.fireFlameStream(cx, cy, player);
                break;
            case 2:
                // 模式3：火雨（散射）
                this.fireMeteorShower(cx, cy);
                break;
            case 3:
                // 模式4：追踪火球
                this.fireHomingFireball(cx, cy, player);
                break;
            case 4:
                // 模式5：火焰十字
                this.fireCrossPattern(cx, cy);
                break;
        }

        this.attackCooldown = this.currentPhase === 1 ? 1.5 : this.currentPhase === 2 ? 1.2 : 0.9;
    }

    /**
     * 火球弹幕（圆形）
     */
    fireFireballCircle(x, y) {
        const count = this.currentPhase === 1 ? 8 : this.currentPhase === 2 ? 12 : 16;
        const speed = 300;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            this.fireBullet(x, y, Math.cos(angle), Math.sin(angle), speed, '#ff4500');
        }
    }

    /**
     * 火焰喷射（扇形弹幕）
     */
    fireFlameStream(x, y, player) {
        const count = this.currentPhase === 1 ? 7 : 10;
        const spread = Math.PI / 4; // 45度扇形

        this.fireFanPattern(count, spread, player);
    }

    /**
     * 火雨（从天而降）
     */
    fireMeteorShower(x, y) {
        const count = this.currentPhase === 1 ? 5 : this.currentPhase === 2 ? 8 : 12;

        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 600;
            const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.5; // 向下带随机
            const speed = 250 + Math.random() * 150;

            // 从上方发射
            this.fireBullet(x + offsetX, y - 200, Math.cos(angle), Math.sin(angle), speed, '#ff0000');
        }
    }

    /**
     * 追踪火球
     */
    fireHomingFireball(x, y, player) {
        const dx = player.x + player.width / 2 - x;
        const dy = player.y + player.height / 2 - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const speed = 280;
            const count = this.currentPhase >= 2 ? 3 : 1;

            for (let i = 0; i < count; i++) {
                const angleSpread = (i - (count - 1) / 2) * 0.2;
                const angle = Math.atan2(dy, dx) + angleSpread;
                this.fireBullet(x, y, Math.cos(angle), Math.sin(angle), speed, '#ff6600');
            }
        }
    }

    /**
     * 火焰十字弹幕
     */
    fireCrossPattern(x, y) {
        const arms = 4;
        const bulletsPerArm = this.currentPhase === 1 ? 5 : 8;

        for (let a = 0; a < arms; a++) {
            const baseAngle = (Math.PI / 2) * a;
            for (let b = 1; b <= bulletsPerArm; b++) {
                const angle = baseAngle;
                const speed = 200 + b * 30;
                this.fireBullet(x, y, Math.cos(angle), Math.sin(angle), speed, '#ff8c00');
            }
        }
    }

    /**
     * 执行复杂弹幕模式
     */
    performComplexPattern(player) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        switch (this.currentPhase) {
            case 1:
                // 阶段1：螺旋火焰
                this.fireSpiralPattern(4, 0.004);
                break;
            case 2:
                // 阶段2：火焰花朵
                this.fireFlowerPattern(cx, cy);
                // 尝试召唤火元素
                if (Math.random() < 0.02) {
                    this.spawnFireElement();
                }
                break;
            case 3:
                // 阶段3：陨石雨
                if (this.meteorCooldown <= 0) {
                    this.fireMeteorShower(cx, cy);
                    this.meteorCooldown = 3;
                }
                // 同时发射螺旋
                this.fireSpiralPattern(6, 0.006);
                break;
        }
    }

    /**
     * 火焰花朵弹幕
     */
    fireFlowerPattern(x, y) {
        const petals = 8;
        const bulletsPerPetal = 4;

        for (let p = 0; p < petals; p++) {
            const petalAngle = (Math.PI * 2 / petals) * p + Date.now() * 0.002;

            for (let b = 0; b < bulletsPerPetal; b++) {
                const angle = petalAngle + (b - bulletsPerPetal / 2) * 0.15;
                const speed = 220 + b * 25;
                this.fireBullet(x, y, Math.cos(angle), Math.sin(angle), speed, '#ff4500');
            }
        }
    }

    /**
     * 召唤火元素
     */
    spawnFireElement() {
        const spawnX = this.x + this.width / 2 - 14 + (Math.random() - 0.5) * 100;
        const spawnY = this.y + this.height;

        if (typeof EnemyTypes !== 'undefined') {
            const fireElement = EnemyTypes.createFireElement(spawnX, spawnY);
            
            // 🔧 P1修复：将敌人添加到当前关卡的敌人数组中
            const level = (typeof LevelManager !== 'undefined') ? LevelManager.currentLevel : null;
            if (level && level.enemies) {
                level.enemies.push(fireElement);
            }
        }

        ParticleSystem.createExplosion(spawnX + 14, spawnY, '#ff4500', 15);
    }

    /**
     * 更新Boss
     */
    update(dt, player, platforms, bullets) {
        // 更新冷却
        if (this.meteorCooldown > 0) {
            this.meteorCooldown -= dt;
        }

        // 阶段行为调整
        if (this.currentPhase >= 2 && !this.entering) {
            // 阶段2+频繁飞行
            if (this.stateTimer <= 0 && this.battleState !== 'pattern') {
                this.battleState = 'moving';
                this.stateTimer = 2;
                this.movePattern = 2; // 圆形移动
            }
        }

        if (this.currentPhase === 3 && !this.entering) {
            // 阶段3持续飞行，更高
            this.flightHeight = 150;
        }

        super.update(dt, player, platforms, bullets);
    }

    /**
     * 阶段转换回调
     */
    onPhaseTransition(oldPhase, newPhase) {
        this.shakeAmount = 30;
        this.flashIntensity = 1.0;

        // 特效爆炸
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                ParticleSystem.createExplosion(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    '#ff6600',
                    25
                );
            }, i * 100);
        }

        if (newPhase === 2) {
            // 召唤2个火元素
            setTimeout(() => {
                this.spawnFireElement();
                setTimeout(() => this.spawnFireElement(), 500);
            }, 500);
        } else if (newPhase === 3) {
            // 阶段3：大爆炸并召唤多个火元素
            for (let i = 0; i < 3; i++) {
                setTimeout(() => this.spawnFireElement(), i * 300);
            }
        }
    }

    /**
     * 绘制烈焰魔龙
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
        const scale = this.scale;

        // 发光效果
        ctx.shadowBlur = 30 + this.glowPower + (this.currentPhase - 1) * 10;
        ctx.shadowColor = this.themeColor;

        // 绘制龙身
        this.drawDragonBody(ctx, drawX, drawY, scale);

        // 绘制Boss血条
        this.drawBossHealthBar(ctx);

        ctx.restore();
    }

    /**
     * 绘制龙身
     */
    drawDragonBody(ctx, x, y, scale) {
        const w = this.width * scale;
        const h = this.height * scale;

        // 身体渐变
        const bodyGradient = ctx.createLinearGradient(x, y, x, y + h);
        bodyGradient.addColorStop(0, '#ff6600');
        bodyGradient.addColorStop(0.5, '#ff4500');
        bodyGradient.addColorStop(1, '#cc3300');

        ctx.fillStyle = this.flashIntensity > 0.5 ? '#ffffff' : bodyGradient;

        // 主体（椭圆）
        ctx.beginPath();
        ctx.ellipse(x + w * 0.4, y + h * 0.5, w * 0.4, h * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // 头部
        ctx.beginPath();
        ctx.ellipse(x + w * 0.8, y + h * 0.4, w * 0.25, h * 0.25, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // 翅膀（左）
        this.drawWing(ctx, x + w * 0.3, y + h * 0.3, -1);
        // 翅膀（右）
        this.drawWing(ctx, x + w * 0.5, y + h * 0.3, 1);

        // 尾巴
        ctx.beginPath();
        ctx.moveTo(x + w * 0.1, y + h * 0.5);
        ctx.quadraticCurveTo(x - w * 0.1, y + h * 0.4, x - w * 0.2, y + h * 0.5);
        ctx.quadraticCurveTo(x - w * 0.1, y + h * 0.6, x + w * 0.1, y + h * 0.5);
        ctx.fill();

        // 龙面
        this.drawDragonFace(ctx, x, y, w, h);

        // 阶段标记
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`P${this.currentPhase}`, x + w * 0.5, y - 10);
    }

    /**
     * 绘制翅膀
     */
    drawWing(ctx, x, y, direction) {
        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + direction * 40, y - 30);
        ctx.lineTo(x + direction * 50, y + 10);
        ctx.closePath();
        ctx.fill();

        // 翅膀骨架
        ctx.strokeStyle = '#cc3300';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + direction * 40, y - 30);
        ctx.moveTo(x, y);
        ctx.lineTo(x + direction * 50, y + 10);
        ctx.stroke();
    }

    /**
     * 绘制龙面
     */
    drawDragonFace(ctx, x, y, w, h) {
        const faceX = x + w * 0.85;
        const faceY = y + h * 0.35;

        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;

        // 邪恶的眼睛
        ctx.beginPath();
        ctx.moveTo(faceX - 15, faceY - 5);
        ctx.lineTo(faceX - 5, faceY + 5);
        ctx.lineTo(faceX - 15, faceY + 5);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(faceX + 5, faceY - 5);
        ctx.lineTo(faceX + 15, faceY + 5);
        ctx.lineTo(faceX + 5, faceY + 5);
        ctx.fill();

        // 嘴巴（张开）
        ctx.beginPath();
        ctx.arc(faceX, faceY + 20, 12, 0, Math.PI);
        ctx.fill();

        // 牙齿
        ctx.fillStyle = '#ffffff';
        const teeth = 5;
        for (let i = 0; i < teeth; i++) {
            const toothX = faceX - 10 + i * 5;
            ctx.fillRect(toothX, faceY + 20, 3, 6);
        }

        // 龙角
        ctx.fillStyle = '#cc3300';
        ctx.beginPath();
        ctx.moveTo(faceX - 18, faceY - 10);
        ctx.lineTo(faceX - 25, faceY - 30);
        ctx.lineTo(faceX - 12, faceY - 15);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(faceX + 18, faceY - 10);
        ctx.lineTo(faceX + 25, faceY - 30);
        ctx.lineTo(faceX + 12, faceY - 15);
        ctx.fill();
    }
}
