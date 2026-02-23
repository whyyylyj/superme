/**
 * boss-level1.js
 *
 * TreantKing - 第一关Boss：树精王（弹幕编织版本）
 *
 * 特性:
 * - 2个战斗阶段
 * - 森林主题弹幕（树叶、藤蔓、种子）
 * - 自然系攻击模式
 * - 召唤小树人
 * - 弹幕基因变异系统
 * - 弹幕组合编织系统
 *
 * 阶段1:
 * - 基础弹幕攻击（圆形、扇形）
 * - 轻微基因变异
 * - 缓慢移动
 *
 * 阶段2 (HP < 50%):
 * - 复杂弹幕模式（螺旋、花朵）
 * - 高强度变异
 * - 弹幕组合攻击
 * - 移动速度提升
 * - 召唤小树人
 *
 * @author SuperMe Development Team
 * @version 2.0 - Pattern Weaver Edition
 */

class TreantKing extends BossBase {
    constructor(x, y) {
        super(x, y, {
            name: 'Treant King',
            maxHp: 150,
            hp: 150,          // 🔧 P1修复：显式传递 hp，避免继承自 EnemyBase 的默认低生命值
            phaseCount: 2,
            width: 120,
            height: 140,
            color: '#2d5a27', // 深绿色
            themeColor: '#4a7c43', // 森林绿
            canFly: false,
            speed: 60,
            damage: 2
        });

        // 树精王特有属性
        this.rootAttackCooldown = 0;
        this.summonCooldown = 5; // 初始召唤冷却
        this.leafAngle = 0; // 叶子攻击角度

        // 弹幕系统
        this.weaver = new PatternWeaver(this);
        this.mutationLevel = 0; // 变异等级（每次受伤+1）
        this.mutationIntensity = 0; // 变异强度（0-1）
    }

    /**
     * 获取攻击模式数量
     */
    getAttackPatternCount() {
        // 阶段1: 4种基础攻击
        // 阶段2: 6种攻击（包括编织弹幕）
        return this.currentPhase === 1 ? 4 : 6;
    }

    /**
     * 执行攻击
     */
    performAttack(player, pattern) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // 应用基因变异
        const mutatedParams = BulletMutator.progressiveMutate(
            { speed: 250, size: 8 },
            0, // 第一关配色
            this.mutationIntensity
        );

        switch (pattern) {
            case 0:
                // 模式1：树叶弹幕（圆形 + 变异）
                this.fireLeafCircle(cx, cy, mutatedParams);
                break;
            case 1:
                // 模式2：藤蔓鞭挞（扇形 + 变异）
                this.fireVineWhip(cx, cy, player, mutatedParams);
                break;
            case 2:
                // 模式3：种子散布（散射 + 变异）
                this.fireSeedScatter(cx, cy, mutatedParams);
                break;
            case 3:
                // 模式4：根须攻击（地面追踪）
                this.fireRootAttack(cx, cy, player);
                break;
            case 4:
                // 模式5：螺旋雨（编织弹幕 - 仅阶段2）
                this.fireSpiralRainWeave(cx, cy);
                break;
            case 5:
                // 模式6：花园绽放（编织弹幕 - 仅阶段2）
                this.fireGardenBloomWeave(cx, cy);
                break;
        }

        // 根据阶段和变异等级调整攻击冷却
        let baseCooldown = this.currentPhase === 1 ? 1.2 : 0.9;
        const mutationMultiplier = 1 - (this.mutationIntensity * 0.3); // 变异越高，攻击越快
        this.attackCooldown = baseCooldown * mutationMultiplier;
    }

    /**
     * 树叶弹幕（圆形 + 基因变异）
     */
    fireLeafCircle(x, y, mutatedParams) {
        const baseCount = this.currentPhase === 1 ? 8 : 12;
        const count = BulletMutator.applyDensity(baseCount, mutatedParams.density || 1);

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + this.leafAngle;
            const speed = mutatedParams.speed * (0.8 + Math.random() * 0.4); // 速度有轻微随机

            this.fireBullet(
                x, y,
                Math.cos(angle), Math.sin(angle),
                speed,
                mutatedParams.color
            );
        }

        this.leafAngle += Math.PI / 8; // 旋转弹幕
    }

    /**
     * 藤蔓鞭挞（扇形弹幕 + 变异）
     */
    fireVineWhip(x, y, player, mutatedParams) {
        const baseCount = this.currentPhase === 1 ? 5 : 7;
        const count = BulletMutator.applyDensity(baseCount, mutatedParams.density || 1);
        const spread = Math.PI / 3; // 60度扇形

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
     * 种子散布（随机散射 + 变异）
     */
    fireSeedScatter(x, y, mutatedParams) {
        const baseCount = this.currentPhase === 1 ? 6 : 10;
        const count = BulletMutator.applyDensity(baseCount, mutatedParams.density || 1);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = mutatedParams.speed * (0.7 + Math.random() * 0.6);

            // 种子用棕色
            this.fireBullet(
                x, y,
                Math.cos(angle), Math.sin(angle),
                speed,
                '#8b4513'
            );
        }
    }

    /**
     * 根须攻击（地面追踪弹）
     */
    fireRootAttack(x, y, player) {
        if (this.rootAttackCooldown > 0) return;

        // 发射3枚根须弹，沿地面移动
        for (let i = -1; i <= 1; i++) {
            const rootX = x + i * 30;
            const dx = (player.x + player.width / 2) - rootX;
            const dist = Math.abs(dx);

            if (dist > 0) {
                const dirX = dx / dist;
                const speed = 200 + this.mutationIntensity * 50; // 变异越高速度越快
                this.fireBullet(rootX, y + this.height, dirX, 0, speed, '#654321');
            }
        }

        this.rootAttackCooldown = 3; // 3秒冷却
    }

    /**
     * 螺旋雨编织弹幕（阶段2）
     */
    fireSpiralRainWeave(x, y) {
        // 应用基因变异到预设
        const mutatedParams1 = BulletMutator.mutatePattern(
            { speed: 250, color: '#4a7c43' },
            0
        );
        const mutatedParams2 = BulletMutator.mutatePattern(
            { speed: 200, color: '#90ee90' },
            0
        );

        // 创建编织弹幕
        const weave = this.weaver.combine(
            'spiral', { arms: 5, speed: mutatedParams1.speed, color: mutatedParams1.color },
            'rain', { count: 6, speed: mutatedParams2.speed, color: mutatedParams2.color },
            'parallel',
            5
        );

        this.weaver.startWeave('spiralRain', weave);
    }

    /**
     * 花园绽放编织弹幕（阶段2）
     */
    fireGardenBloomWeave(x, y) {
        // 应用基因变异
        const mutatedParams1 = BulletMutator.mutatePattern(
            { speed: 250, color: '#00ff7f' },
            0
        );

        // 创建编织弹幕
        const weave = this.weaver.combine(
            'circle', { count: 12, speed: mutatedParams1.speed, color: mutatedParams1.color },
            'flower', { petals: 6, bulletsPerPetal: 5, speed: 200, color1: '#ff69b4', color2: '#ffccee' },
            'sequential',
            5
        );

        this.weaver.startWeave('gardenBloom', weave);
    }

    /**
     * 执行复杂弹幕模式（阶段转换时使用）
     */
    performComplexPattern(player) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        if (this.currentPhase === 1) {
            // 阶段1：简单螺旋 + 变异
            const mutatedParams = BulletMutator.mutatePattern({ speed: 200 }, 0);
            this.fireSpiralPattern(3, 0.003, mutatedParams);
        } else {
            // 阶段2：花朵弹幕 + 高强度变异
            const mutatedParams = BulletMutator.progressiveMutate(
                { speed: 220 },
                0,
                0.5 // 高强度变异
            );
            this.fireFlowerPattern(cx, cy, mutatedParams);

            // 尝试召唤小树人
            if (this.summonCooldown <= 0) {
                this.spawnSeedling();
                this.summonCooldown = 8; // 8秒冷却
            }
        }
    }

    /**
     * 花朵弹幕（美丽的6瓣花形状 + 变异）
     */
    fireFlowerPattern(x, y, mutatedParams) {
        const petalCount = 6;
        const bulletPerPetal = 5;

        for (let p = 0; p < petalCount; p++) {
            const petalAngle = (Math.PI * 2 / petalCount) * p + Date.now() * 0.001;

            for (let b = 0; b < bulletPerPetal; b++) {
                const angle = petalAngle + (b - bulletPerPetal / 2) * 0.1;
                const speed = mutatedParams.speed * (0.7 + b * 0.1);

                this.fireBullet(
                    x, y,
                    Math.cos(angle), Math.sin(angle),
                    speed,
                    b % 2 === 0 ? '#ff69b4' : '#ffccee'
                );
            }
        }
    }

    /**
     * 召唤小树人
     */
    spawnSeedling() {
        // 在Boss附近召唤小树人
        const spawnX = this.x + this.width / 2 - 15 + (Math.random() - 0.5) * 100;
        const spawnY = this.y + this.height;

        // 创建小树人敌人（使用EnemyTypes工厂，如果存在）
        if (typeof EnemyTypes !== 'undefined' && EnemyTypes.createSeedling) {
            const seedling = EnemyTypes.createSeedling(spawnX, spawnY);
            
            // 🔧 P1修复：将敌人添加到当前关卡的敌人数组中
            const level = (typeof LevelManager !== 'undefined') ? LevelManager.currentLevel : null;
            if (level && level.enemies) {
                level.enemies.push(seedling);
            }
        }

        // 召唤特效
        ParticleSystem.createExplosion(spawnX + 15, spawnY, '#4a7c43', 20);
    }

    /**
     * 受到伤害时增加变异等级
     */
    takeDamage(damage) {
        super.takeDamage(damage);

        // 增加变异等级
        this.mutationLevel++;

        // 计算变异强度（基于当前HP百分比）
        const hpPercent = this.hp / this.maxHp;
        this.mutationIntensity = 1 - hpPercent; // HP越低，变异越强
    }

    /**
     * 更新Boss
     */
    update(dt, player, platforms, bullets) {
        // 更新召唤冷却
        if (this.summonCooldown > 0) {
            this.summonCooldown -= dt;
        }
        if (this.rootAttackCooldown > 0) {
            this.rootAttackCooldown -= dt;
        }

        // 更新编织弹幕
        this.weaver.update(dt);

        super.update(dt, player, platforms, bullets);
    }

    /**
     * 阶段转换回调
     */
    onPhaseTransition(oldPhase, newPhase) {
        if (newPhase === 2) {
            // 进入阶段2特效
            this.shakeAmount = 30;
            this.flashIntensity = 1.0;

            // 更多的爆炸特效
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    ParticleSystem.createExplosion(
                        this.x + Math.random() * this.width,
                        this.y + Math.random() * this.height,
                        '#4a7c43',
                        20
                    );
                }, i * 100);
            }

            // 召唤2个小树人
            setTimeout(() => {
                this.spawnSeedling();
                setTimeout(() => this.spawnSeedling(), 500);
            }, 500);

            // 提升变异强度
            this.mutationIntensity = 0.3;
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
        const scale = this.scale;

        // 发光效果
        ctx.shadowBlur = 25 + this.glowPower;
        ctx.shadowColor = this.themeColor;

        // 绘制树干
        const trunkGradient = ctx.createLinearGradient(drawX, drawY, drawX + this.width * scale, drawY);
        trunkGradient.addColorStop(0, '#3d2817'); // 深棕色
        trunkGradient.addColorStop(0.5, '#654321'); // 棕色
        trunkGradient.addColorStop(1, '#3d2817');
        ctx.fillStyle = trunkGradient;

        // 树干主体
        ctx.fillRect(
            drawX + this.width * scale * 0.3,
            drawY + this.height * scale * 0.3,
            this.width * scale * 0.4,
            this.height * scale * 0.7
        );

        // 树冠（由多个圆组成）
        ctx.fillStyle = this.flashIntensity > 0.5 ? '#ffffff' : '#2d5a27';
        ctx.shadowColor = '#4a7c43';

        const crownCenters = [
            { x: 0.5, y: 0.2 },
            { x: 0.2, y: 0.35 },
            { x: 0.8, y: 0.35 },
            { x: 0.3, y: 0.1 },
            { x: 0.7, y: 0.1 }
        ];

        crownCenters.forEach(center => {
            ctx.beginPath();
            ctx.arc(
                drawX + this.width * scale * center.x,
                drawY + this.height * scale * center.y,
                this.width * scale * 0.25,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        // 绘制树精面部
        this.drawTreantFace(ctx, drawX, drawY, scale);

        // 绘制Boss血条
        this.drawBossHealthBar(ctx);

        // 绘制变异强度指示器（新增）
        this.drawMutationIndicator(ctx, drawX, drawY, scale);

        ctx.restore();
    }

    /**
     * 绘制树精面部
     */
    drawTreantFace(ctx, x, y, scale) {
        const faceX = x + this.width * scale * 0.5;
        const faceY = y + this.height * scale * 0.5;

        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;

        // 愤怒的眼睛
        // 左眼
        ctx.beginPath();
        ctx.moveTo(faceX - 15, faceY - 5);
        ctx.lineTo(faceX - 5, faceY + 5);
        ctx.lineTo(faceX - 15, faceY + 5);
        ctx.fill();

        // 右眼
        ctx.beginPath();
        ctx.moveTo(faceX + 5, faceY - 5);
        ctx.lineTo(faceX + 15, faceY + 5);
        ctx.lineTo(faceX + 5, faceY + 5);
        ctx.fill();

        // 嘴巴
        ctx.beginPath();
        ctx.arc(faceX, faceY + 20, 10, 0, Math.PI);
        ctx.fill();

        // 树枝角
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(faceX - 20, faceY - 15);
        ctx.lineTo(faceX - 30, faceY - 30);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(faceX + 20, faceY - 15);
        ctx.lineTo(faceX + 30, faceY - 30);
        ctx.stroke();

        // 阶段标记
        ctx.fillStyle = this.themeColor;
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`P${this.currentPhase}`, faceX, y - 10);
    }

    /**
     * 绘制变异强度指示器
     */
    drawMutationIndicator(ctx, x, y, scale) {
        if (this.mutationIntensity <= 0) return;

        const barWidth = 60;
        const barHeight = 6;
        const barX = x + this.width * scale * 0.5 - barWidth / 2;
        const barY = y - 20;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 变异强度条
        const intensityWidth = barWidth * this.mutationIntensity;
        const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, '#ff0000');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, intensityWidth, barHeight);

        // 边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}
