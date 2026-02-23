/**
 * boss-level1-refactored.js (示例/参考)
 *
 * TreantKing - 第一关 Boss：树精王（参数化版本示例）
 *
 * 此文件展示了如何完全使用 BossConfig 来重构 Boss 类
 * 实际使用时可以替换 boss-level1.js
 *
 * @author SuperMe Development Team
 * @version 3.0 - Config-Driven Edition
 */

class TreantKingRefactored extends BossBase {
    constructor(x, y) {
        // 从配置加载
        const config = BossConfig.LEVEL1.TREANT_KING;
        
        super(x, y, BossConfigHelper.getBossBaseStats(1));

        // 保存配置引用
        this.config = config;

        // 树精王特有属性（使用配置）
        this.rootAttackCooldown = 0;
        this.summonCooldown = config.summon.initialCooldown;
        this.leafAngle = 0;

        // 弹幕系统
        this.weaver = new PatternWeaver(this);
        this.mutationLevel = 0;
        this.mutationIntensity = 0;
    }

    /**
     * 获取攻击模式数量（使用配置）
     */
    getAttackPatternCount() {
        // 阶段 1: 4 种基础攻击
        // 阶段 2: 6 种攻击（包括编织弹幕）
        return this.currentPhase === 1 ? 4 : 6;
    }

    /**
     * 执行攻击（使用配置的冷却时间）
     */
    performAttack(player, pattern) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // 应用基因变异
        const mutatedParams = BulletMutator.progressiveMutate(
            { speed: 250, size: 8 },
            0,
            this.mutationIntensity
        );

        switch (pattern) {
            case 0:
                this.fireLeafCircle(cx, cy, mutatedParams);
                break;
            case 1:
                this.fireVineWhip(cx, cy, player, mutatedParams);
                break;
            case 2:
                this.fireSeedScatter(cx, cy, mutatedParams);
                break;
            case 3:
                this.fireRootAttack(cx, cy, player);
                break;
            case 4:
                this.fireSpiralRainWeave(cx, cy);
                break;
            case 5:
                this.fireGardenBloomWeave(cx, cy);
                break;
        }

        // 使用配置的冷却时间
        const baseCooldown = BossConfigHelper.getAttackCooldown(1, this.currentPhase);
        const mutationMultiplier = 1 - (this.mutationIntensity * 0.3);
        this.attackCooldown = baseCooldown * mutationMultiplier;
    }

    /**
     * 树叶弹幕（圆形 + 基因变异）- 使用配置
     */
    fireLeafCircle(x, y, mutatedParams) {
        const config = this.config.bullets.leafCircle;
        
        // 根据阶段获取弹幕数量
        const baseCount = this.currentPhase === 1 ? config.phase1Count : config.phase2Count;
        const count = BulletMutator.applyDensity(baseCount, mutatedParams.density || 1);

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + this.leafAngle;
            const speed = config.baseSpeed * (0.8 + Math.random() * config.speedVariance);

            this.fireBullet(
                x, y,
                Math.cos(angle), Math.sin(angle),
                speed,
                mutatedParams.color || config.color
            );
        }

        this.leafAngle += this.config.effects.leafRotationSpeed;
    }

    /**
     * 藤蔓鞭挞（扇形弹幕 + 变异）- 使用配置
     */
    fireVineWhip(x, y, player, mutatedParams) {
        const config = this.config.bullets.vineWhip;
        
        const baseCount = this.currentPhase === 1 ? config.phase1Count : config.phase2Count;
        const count = BulletMutator.applyDensity(baseCount, mutatedParams.density || 1);
        const spread = config.spreadAngle;

        const baseAngle = Math.atan2(
            (player.y + player.height / 2) - y,
            (player.x + player.width / 2) - x
        );

        for (let i = 0; i < count; i++) {
            const angle = baseAngle - spread / 2 + (spread / (count - 1)) * i;
            const speed = mutatedParams.speed * (0.9 + Math.random() * 0.2);

            this.fireBullet(
                x, y,
                Math.cos(angle), Math.sin(angle),
                speed,
                mutatedParams.color
            );
        }
    }

    /**
     * 种子散布（随机散射 + 变异）- 使用配置
     */
    fireSeedScatter(x, y, mutatedParams) {
        const config = this.config.bullets.seedScatter;
        
        const baseCount = this.currentPhase === 1 ? config.phase1Count : config.phase2Count;
        const count = BulletMutator.applyDensity(baseCount, mutatedParams.density || 1);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = config.baseSpeed * (0.7 + Math.random() * config.speedVariance);

            this.fireBullet(
                x, y,
                Math.cos(angle), Math.sin(angle),
                speed,
                config.color
            );
        }
    }

    /**
     * 根须攻击（地面追踪弹）- 使用配置
     */
    fireRootAttack(x, y, player) {
        if (this.rootAttackCooldown > 0) return;

        const config = this.config.bullets.rootAttack;

        // 发射 3 枚根须弹，沿地面移动
        for (let i = -1; i <= 1; i++) {
            const rootX = x + i * 30;
            const dx = (player.x + player.width / 2) - rootX;
            const dist = Math.abs(dx);

            if (dist > 0) {
                const dirX = dx / dist;
                const speed = config.baseSpeed + this.mutationIntensity * config.speedBonus;
                this.fireBullet(rootX, y + this.height, dirX, 0, speed, config.color);
            }
        }

        this.rootAttackCooldown = 3;
    }

    /**
     * 召唤小树人 - 使用配置
     */
    spawnSeedling() {
        if (this.summonCooldown > 0) return;

        const config = this.config.summon;

        // 检查场上小树人数量
        const level = (typeof LevelManager !== 'undefined') ? LevelManager.currentLevel : null;
        if (level && level.enemies) {
            const currentMinions = level.enemies.filter(e => 
                e.type === 'seedling' || (e.name && e.name.includes('Seedling'))
            ).length;

            if (currentMinions >= config.maxMinions) return;
        }

        const spawnX = this.x + this.width / 2;
        const spawnY = this.y;

        if (typeof EnemyTypes !== 'undefined') {
            const seedling = EnemyTypes.createSeedling(spawnX - 10, spawnY);
            if (level && level.enemies) {
                level.enemies.push(seedling);
            }
        }

        this.summonCooldown = config.initialCooldown * 1.6;

        ParticleSystem.createExplosion(spawnX, spawnY + this.height, '#228b22', 20);
    }

    /**
     * 执行复杂弹幕模式
     */
    performComplexPattern(player) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        switch (this.currentPhase) {
            case 1:
                // 阶段 1：简单螺旋
                this.fireSpiralPattern(4, 0.004);
                break;

            case 2:
                // 阶段 2：双重螺旋 + 召唤
                this.fireSpiralPattern(6, 0.005);
                this.fireSpiralPattern(6, -0.003);
                
                // 使用配置的召唤概率
                if (Math.random() < 0.02) {
                    this.spawnSeedling();
                }
                break;
        }
    }

    /**
     * 阶段转换回调 - 使用配置
     */
    onPhaseTransition(oldPhase, newPhase) {
        const config = BossConfig.GENERAL.phaseTransition;

        this.shakeAmount = config.shakeAmount;
        this.flashIntensity = config.flashIntensity;

        // 特效爆炸
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                ParticleSystem.createExplosion(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    this.themeColor,
                    config.explosionParticleCount
                );
            }, i * 100);
        }

        // 阶段 2 开始召唤
        if (newPhase === 2) {
            setTimeout(() => this.spawnSeedling(), 500);
        }
    }

    /**
     * 绘制树精王
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

        // 主体
        if (this.flashIntensity > 0.5) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = this.color;
        }

        // 发光效果
        ctx.shadowBlur = 30 + this.glowPower + (this.currentPhase - 1) * 5;
        ctx.shadowColor = this.themeColor;

        ctx.fillRect(drawX, drawY, drawW, drawH);

        // 绘制 Boss 面部
        this.drawTreantFace(ctx, drawX, drawY, drawW, drawH);

        // 绘制 Boss 血条
        this.drawBossHealthBar(ctx);

        ctx.restore();
    }

    /**
     * 绘制树精王面部
     */
    drawTreantFace(ctx, x, y, w, h) {
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;

        // 眼睛
        const eyeY = y + h * 0.3;
        const eyeW = w * 0.15;
        const eyeH = h * 0.1;

        // 左眼
        ctx.beginPath();
        ctx.ellipse(x + w * 0.3, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();

        // 右眼
        ctx.beginPath();
        ctx.ellipse(x + w * 0.7, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛中的光点
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + w * 0.3, eyeY - h * 0.05, eyeW * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w * 0.7, eyeY - h * 0.05, eyeW * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 嘴巴（树皮纹理）
        ctx.strokeStyle = '#1a3a17';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + w * 0.5, y + h * 0.6, w * 0.2, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // 阶段标记
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`P${this.currentPhase}`, x + w / 2, y - 15);
    }

    /**
     * 死亡 - 使用配置
     */
    die() {
        const config = BossConfig.GENERAL.death;

        // 大爆炸序列
        for (let wave = 0; wave < config.waveCount; wave++) {
            setTimeout(() => {
                for (let i = 0; i < config.explosionPerWave; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * 100;
                    const px = this.x + this.width / 2 + Math.cos(angle) * dist;
                    const py = this.y + this.height / 2 + Math.sin(angle) * dist;

                    ParticleSystem.createExplosion(px, py, this.themeColor, 20);
                }
            }, wave * config.waveInterval);
        }

        // 最后的终极爆炸
        setTimeout(() => {
            ParticleSystem.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                config.finalExplosionColors[0],
                config.finalExplosionParticleCount[0]
            );
            ParticleSystem.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                config.finalExplosionColors[1],
                config.finalExplosionParticleCount[1]
            );
        }, config.finalExplosionDelay);

        super.die();
    }
}
