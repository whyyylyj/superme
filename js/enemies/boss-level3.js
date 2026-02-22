/**
 * boss-level3.js
 *
 * SkyTyrant - 第三关Boss：天空暴君（最终Boss）
 *
 * 特性:
 * - 4个战斗阶段
 * - 复杂弹幕地狱
 * - 多种攻击模式组合
 * - 最终Boss的华丽演出
 *
 * 阶段1:
 * - 基础弹幕攻击
 * - 缓慢移动
 *
 * 阶段2 (HP < 75%):
 * - 双弹幕组合
 * - 召唤天使球
 *
 * 阶段3 (HP < 50%):
 * - 三重弹幕系统
 * - 激光攻击
 * - 召唤虚空行者
 *
 * 阶段4 (HP < 25%):
 * - 全弹幕地狱
 * - 所有攻击模式同时使用
 * - 终极弹幕艺术
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

class SkyTyrant extends BossBase {
    constructor(x, y) {
        super(x, y, {
            name: 'Sky Tyrant',
            maxHp: 1000,
            phaseCount: 4,
            width: 150,
            height: 150,
            color: '#8a2be2', // 蓝紫色
            themeColor: '#9932cc', // 暗紫色
            canFly: true,
            speed: 120,
            damage: 3
        });

        // 天空暴君特有属性
        this.laserCooldown = 5;
        this.summonCooldown = 10;
        this.ultimateMode = false;
        this.trailParticles = [];
    }

    /**
     * 获取攻击模式数量
     */
    getAttackPatternCount() {
        return 6; // 6种攻击模式
    }

    /**
     * 执行攻击
     */
    performAttack(player, pattern) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        switch (pattern) {
            case 0:
                // 模式1：光之弹幕（圆形）
                this.fireLightCircle(cx, cy);
                break;
            case 1:
                // 模式2：虚空扇形
                this.fireVoidFan(cx, cy, player);
                break;
            case 2:
                // 模式3：螺旋弹幕
                this.fireSpiralPattern(5, 0.005);
                break;
            case 3:
                // 模式4：追踪光弹
                this.fireHomingLight(cx, cy, player);
                break;
            case 4:
                // 模式5：十字弹幕
                this.fireCrossPattern(cx, cy);
                break;
            case 5:
                // 模式6：花朵弹幕
                this.fireCosmicFlower(cx, cy);
                break;
        }

        this.attackCooldown = this.currentPhase === 1 ? 1.8 :
                            this.currentPhase === 2 ? 1.5 :
                            this.currentPhase === 3 ? 1.2 : 0.8;
    }

    /**
     * 光之弹幕（圆形）
     */
    fireLightCircle(x, y) {
        const count = this.currentPhase === 1 ? 10 :
                      this.currentPhase === 2 ? 14 :
                      this.currentPhase === 3 ? 18 : 24;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 280;
            this.fireBullet(x, y, Math.cos(angle), Math.sin(angle), speed, '#e6e6fa');
        }
    }

    /**
     * 虚空扇形
     */
    fireVoidFan(x, y, player) {
        const count = this.currentPhase <= 2 ? 8 : 12;
        const spread = Math.PI / 3;

        this.fireFanPattern(count, spread, player);
    }

    /**
     * 追踪光弹
     */
    fireHomingLight(x, y, player) {
        const dx = player.x + player.width / 2 - x;
        const dy = player.y + player.height / 2 - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const angle = Math.atan2(dy, dx);
            const count = this.currentPhase >= 3 ? 5 : 3;

            for (let i = 0; i < count; i++) {
                const spread = (i - (count - 1) / 2) * 0.15;
                this.fireBullet(x, y, Math.cos(angle + spread), Math.sin(angle + spread), 300, '#dda0dd');
            }
        }
    }

    /**
     * 宇宙花朵弹幕
     */
    fireCosmicFlower(x, y) {
        const petals = this.currentPhase === 1 ? 6 :
                       this.currentPhase === 2 ? 8 :
                       this.currentPhase === 3 ? 10 : 12;
        const bulletsPerPetal = 5;

        for (let p = 0; p < petals; p++) {
            const petalAngle = (Math.PI * 2 / petals) * p + Date.now() * 0.003;

            for (let b = 0; b < bulletsPerPetal; b++) {
                const angle = petalAngle + (b - bulletsPerPetal / 2) * 0.12;
                const speed = 200 + b * 30;
                this.fireBullet(x, y, Math.cos(angle), Math.sin(angle), speed, '#ba55d3');
            }
        }
    }

    /**
     * 发射激光（阶段3+）
     */
    fireLaser(player) {
        if (this.laserCooldown > 0 || this.currentPhase < 3) return;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const angle = Math.atan2(
            player.y + player.height / 2 - cy,
            player.x + player.width / 2 - cx
        );

        // 激光弹幕（密集直线）
        for (let i = 0; i < 20; i++) {
            const spread = (i - 10) * 0.02;
            this.fireBullet(cx, cy, Math.cos(angle + spread), Math.sin(angle + spread), 500, '#ff00ff');
        }

        this.laserCooldown = 6;
    }

    /**
     * 召唤随从
     */
    spawnMinion() {
        if (this.summonCooldown > 0) return;

        const spawnX = this.x + this.width / 2;
        const spawnY = this.y + this.height;

        // 根据阶段召唤不同的敌人
        const enemyType = this.currentPhase === 2 ? 'angel_orb' :
                         this.currentPhase === 3 ? 'void_walker' : 'light_orb';

        if (typeof EnemyTypes !== 'undefined') {
            const minion = EnemyTypes.createForLevel(3, enemyType, spawnX - 15, spawnY);
            if (typeof LevelMap !== 'undefined' && LevelMap.enemies) {
                LevelMap.enemies.push(minion);
            }

            // 阶段4召唤多个
            if (this.currentPhase === 4) {
                setTimeout(() => {
                    const minion2 = EnemyTypes.createForLevel(3, enemyType, spawnX - 40, spawnY);
                    LevelMap.enemies.push(minion2);
                }, 500);

                setTimeout(() => {
                    const minion3 = EnemyTypes.createForLevel(3, enemyType, spawnX + 10, spawnY);
                    LevelMap.enemies.push(minion3);
                }, 1000);
            }
        }

        this.summonCooldown = this.currentPhase === 2 ? 12 : this.currentPhase === 3 ? 10 : 8;

        ParticleSystem.createExplosion(spawnX + 15, spawnY, '#9932cc', 20);
    }

    /**
     * 执行复杂弹幕模式
     */
    performComplexPattern(player) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        switch (this.currentPhase) {
            case 1:
                // 阶段1：简单螺旋
                this.fireSpiralPattern(4, 0.004);
                break;

            case 2:
                // 阶段2：双重螺旋
                this.fireSpiralPattern(6, 0.005);
                this.fireSpiralPattern(6, -0.003);
                // 尝试召唤
                if (Math.random() < 0.02) {
                    this.spawnMinion();
                }
                break;

            case 3:
                // 阶段3：三重螺旋 + 激光
                this.fireSpiralPattern(8, 0.006);
                this.fireSpiralPattern(8, -0.004);
                this.fireSpiralPattern(8, 0.002);
                this.fireLaser(player);
                if (Math.random() < 0.03) {
                    this.spawnMinion();
                }
                break;

            case 4:
                // 阶段4：终极弹幕地狱
                this.fireUltimatePattern(cx, cy, player);
                break;
        }
    }

    /**
     * 终极弹幕模式
     */
    fireUltimatePattern(x, y, player) {
        // 多重螺旋
        for (let s = 0; s < 4; s++) {
            this.fireSpiralPattern(10, 0.008 + s * 0.002);
        }

        // 花朵弹幕
        this.fireCosmicFlower(x, y);

        // 圆形弹幕
        this.fireLightCircle(x, y);

        // 激光
        this.fireLaser(player);

        // 频繁召唤
        if (Math.random() < 0.05) {
            this.spawnMinion();
        }

        // 轨迹粒子特效
        this.addTrailParticle();
    }

    /**
     * 添加轨迹粒子
     */
    addTrailParticle() {
        this.trailParticles.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            life: 1,
            color: this.themeColor
        });
    }

    /**
     * 更新Boss
     */
    update(dt, player, platforms, bullets) {
        // 更新冷却
        if (this.laserCooldown > 0) this.laserCooldown -= dt;
        if (this.summonCooldown > 0) this.summonCooldown -= dt;

        // 更新轨迹粒子
        this.trailParticles = this.trailParticles.filter(p => {
            p.life -= dt * 2;
            return p.life > 0;
        });

        // 阶段4更激进的行为
        if (this.currentPhase === 4 && !this.entering) {
            if (this.stateTimer <= 0) {
                this.battleState = 'pattern';
                this.stateTimer = 1;
            }
        }

        super.update(dt, player, platforms, bullets);
    }

    /**
     * 阶段转换回调
     */
    onPhaseTransition(oldPhase, newPhase) {
        this.shakeAmount = 40;
        this.flashIntensity = 1.0;

        // 特效爆炸
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                ParticleSystem.createExplosion(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    this.themeColor,
                    30
                );
            }, i * 100);
        }

        // 召唤随从
        if (newPhase === 2) {
            setTimeout(() => this.spawnMinion(), 500);
        } else if (newPhase === 3) {
            setTimeout(() => {
                this.spawnMinion();
                setTimeout(() => this.spawnMinion(), 500);
            }, 500);
        } else if (newPhase === 4) {
            // 阶段4：终极模式开始
            this.ultimateMode = true;
            setTimeout(() => {
                for (let i = 0; i < 4; i++) {
                    setTimeout(() => this.spawnMinion(), i * 300);
                }
            }, 500);
        }
    }

    /**
     * 绘制天空暴君
     */
    draw(ctx, cameraX, cameraY) {
        // 绘制轨迹粒子
        this.drawTrailParticles(ctx, cameraX, cameraY);

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
        const glowIntensity = 40 + this.glowPower + (this.currentPhase - 1) * 15;
        ctx.shadowBlur = glowIntensity;
        ctx.shadowColor = this.themeColor;

        // 绘制Boss主体
        this.drawSkyTyrantBody(ctx, drawX, drawY, scale);

        // 绘制Boss血条
        this.drawBossHealthBar(ctx);

        ctx.restore();
    }

    /**
     * 绘制轨迹粒子
     */
    drawTrailParticles(ctx, cameraX, cameraY) {
        this.trailParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life * 0.5;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x - cameraX, p.y - cameraY, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * 绘制天空暴君主体
     */
    drawSkyTyrantBody(ctx, x, y, scale) {
        const w = this.width * scale;
        const h = this.height * scale;

        // 主体渐变
        const bodyGradient = ctx.createRadialGradient(
            x + w / 2, y + h / 2, 0,
            x + w / 2, y + h / 2, w / 2
        );
        bodyGradient.addColorStop(0, '#dda0dd');
        bodyGradient.addColorStop(0.5, '#9932cc');
        bodyGradient.addColorStop(1, '#4b0082');

        ctx.fillStyle = this.flashIntensity > 0.5 ? '#ffffff' : bodyGradient;

        // 核心（圆形）
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 外环
        ctx.strokeStyle = '#e6e6fa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
        ctx.stroke();

        // 旋转的光环
        const ringAngle = Date.now() * 0.002;
        ctx.strokeStyle = 'rgba(186, 85, 211, 0.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = ringAngle + (Math.PI / 2) * i;
            const rx = x + w / 2 + Math.cos(angle) * w / 1.8;
            const ry = y + h / 2 + Math.sin(angle) * h / 1.8;

            ctx.beginPath();
            ctx.arc(rx, ry, 15, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 能量尖刺
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + ringAngle;
            const sx = x + w / 2 + Math.cos(angle) * w / 2.2;
            const sy = y + h / 2 + Math.sin(angle) * h / 2.2;

            ctx.fillStyle = '#ba55d3';
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(
                sx + Math.cos(angle) * 20,
                sy + Math.sin(angle) * 20
            );
            ctx.lineTo(
                sx + Math.cos(angle + 0.3) * 10,
                sy + Math.sin(angle + 0.3) * 10
            );
            ctx.closePath();
            ctx.fill();
        }

        // Boss面容
        this.drawSkyTyrantFace(ctx, x, y, w, h);

        // 阶段标记
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`P${this.currentPhase}`, x + w / 2, y - 15);
    }

    /**
     * 绘制天空暴君面容
     */
    drawSkyTyrantFace(ctx, x, y, w, h) {
        const faceX = x + w / 2;
        const faceY = y + h / 2;

        // 眼睛
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';

        // 左眼
        ctx.beginPath();
        ctx.arc(faceX - 20, faceY - 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // 右眼
        ctx.beginPath();
        ctx.arc(faceX + 20, faceY - 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛中的光点
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(faceX - 20, faceY - 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(faceX + 20, faceY - 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // 嘴巴（神秘的微笑）
        ctx.strokeStyle = '#4b0082';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(faceX, faceY + 20, 15, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // 额头宝石
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.arc(faceX, faceY - 35, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 死亡（终极演出）
     */
    die() {
        // 超级大爆炸序列
        for (let wave = 0; wave < 5; wave++) {
            setTimeout(() => {
                for (let i = 0; i < 15; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * 100;
                    const px = this.x + this.width / 2 + Math.cos(angle) * dist;
                    const py = this.y + this.height / 2 + Math.sin(angle) * dist;

                    ParticleSystem.createExplosion(px, py, this.themeColor, 20);
                }
            }, wave * 200);
        }

        // 最后的终极爆炸
        setTimeout(() => {
            ParticleSystem.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '#ffffff',
                150
            );
            ParticleSystem.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.themeColor,
                100
            );
            ParticleSystem.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '#ff00ff',
                80
            );
        }, 1200);

        super.die();
    }
}
