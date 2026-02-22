/**
 * boss-level1.js
 *
 * TreantKing - 第一关Boss：树精王
 *
 * 特性:
 * - 2个战斗阶段
 * - 森林主题弹幕（树叶、藤蔓、种子）
 * - 自然系攻击模式
 * - 召唤小树人
 *
 * 阶段1:
 * - 基础弹幕攻击（圆形、扇形）
 * - 缓慢移动
 *
 * 阶段2 (HP < 50%):
 * - 复杂弹幕模式（螺旋、花朵）
 * - 移动速度提升
 * - 召唤小树人
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

class TreantKing extends BossBase {
    constructor(x, y) {
        super(x, y, {
            name: 'Treant King',
            maxHp: 300,
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
    }

    /**
     * 获取攻击模式数量
     */
    getAttackPatternCount() {
        return 4; // 4种攻击模式
    }

    /**
     * 执行攻击
     */
    performAttack(player, pattern) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        switch (pattern) {
            case 0:
                // 模式1：树叶弹幕（圆形）
                this.fireLeafCircle(cx, cy);
                break;
            case 1:
                // 模式2：藤蔓鞭挞（扇形）
                this.fireVineWhip(cx, cy, player);
                break;
            case 2:
                // 模式3：种子散布（散射）
                this.fireSeedScatter(cx, cy);
                break;
            case 3:
                // 模式4：根须攻击（地面追踪）
                this.fireRootAttack(cx, cy, player);
                break;
        }

        this.attackCooldown = this.currentPhase === 1 ? 1.2 : 0.9;
    }

    /**
     * 树叶弹幕（圆形）
     */
    fireLeafCircle(x, y) {
        const count = this.currentPhase === 1 ? 8 : 12;
        const speed = 250;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + this.leafAngle;
            this.fireBullet(x, y, Math.cos(angle), Math.sin(angle), speed, '#4a7c43');
        }

        this.leafAngle += Math.PI / 8; // 旋转弹幕
    }

    /**
     * 藤蔓鞭挞（扇形弹幕）
     */
    fireVineWhip(x, y, player) {
        const count = this.currentPhase === 1 ? 5 : 7;
        const spread = Math.PI / 3; // 60度扇形

        this.fireFanPattern(count, spread, player);
    }

    /**
     * 种子散布（随机散射）
     */
    fireSeedScatter(x, y) {
        const count = this.currentPhase === 1 ? 6 : 10;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 200 + Math.random() * 100;
            this.fireBullet(x, y, Math.cos(angle), Math.sin(angle), speed, '#8b4513');
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
            const dx = player.x - rootX;
            const dist = Math.abs(dx);

            if (dist > 0) {
                const dirX = dx / dist;
                this.fireBullet(rootX, y + this.height, dirX, 0, 200, '#654321');
            }
        }

        this.rootAttackCooldown = 3; // 3秒冷却
    }

    /**
     * 执行复杂弹幕模式
     */
    performComplexPattern(player) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        if (this.currentPhase === 1) {
            // 阶段1：简单螺旋
            this.fireSpiralPattern(3, 0.003);
        } else {
            // 阶段2：花朵弹幕
            this.fireFlowerPattern(cx, cy);

            // 尝试召唤小树人
            if (this.summonCooldown <= 0) {
                this.spawnSeedling();
                this.summonCooldown = 8; // 8秒冷却
            }
        }
    }

    /**
     * 花朵弹幕（美丽的6瓣花形状）
     */
    fireFlowerPattern(x, y) {
        const petalCount = 6;
        const bulletPerPetal = 5;

        for (let p = 0; p < petalCount; p++) {
            const petalAngle = (Math.PI * 2 / petalCount) * p + Date.now() * 0.001;

            for (let b = 0; b < bulletPerPetal; b++) {
                const angle = petalAngle + (b - bulletPerPetal / 2) * 0.1;
                const speed = 200 + b * 20;
                this.fireBullet(x, y, Math.cos(angle), Math.sin(angle), speed, '#ff69b4');
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
            // 将敌人添加到游戏（需要通过事件系统或直接添加）
            // 暂时通过全局LevelMap添加
            if (typeof LevelMap !== 'undefined' && LevelMap.enemies) {
                LevelMap.enemies.push(seedling);
            }
        }

        // 召唤特效
        ParticleSystem.createExplosion(spawnX + 15, spawnY, '#4a7c43', 20);
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
}
