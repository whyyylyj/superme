/**
 * level3-sky.js
 *
 * Level3Sky - 第三关：天空圣殿（最终关卡）
 *
 * 特性:
 * - 7000px 宽度
 * - 纯空中战斗（无地面）
 * - 移动平台系统
 * - 掉落即死机制
 * - 光柱陷阱
 * - 天空主题敌人
 * - Boss: SkyTyrant (天空暴君) - 最终Boss
 *
 * 机制:
 * - 无地面：关卡底部虚空，掉落=死亡
 * - 移动平台：不断移动的平台
 * - 光柱陷阱：随机出现的光柱造成伤害
 * - 传送门：某些区域快速传送
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

class Level3Sky extends LevelBase {
    constructor() {
        super(3, 'Sky Temple', {
            width: 7000,
            height: 600,
            bgColor: '#0a0a1a', // 深蓝紫色背景
            themeColor: '#9932cc'
        });

        // 特殊机制
        this.movingPlatforms = []; // 移动平台
        this.lightPillars = []; // 光柱陷阱
        this.voidLine = 550; // 虚空死亡线
        this.backgroundLayers = [];
    }

    /**
     * 初始化关卡
     */
    init() {
        console.log('🌌 初始化第三关：天空圣殿');

        this.generateBackgroundLayers();
        this.generateMovingPlatforms();
        this.generateLightPillars();
        this.generateEnemies();
        this.generatePowerups();
        this.generateBoss();

        console.log(`✅ 第三关初始化完成: ${this.movingPlatforms.length} 移动平台, ${this.enemies.length} 敌人, ${this.lightPillars.length} 光柱`);
    }

    /**
     * 生成背景层
     */
    generateBackgroundLayers() {
        // 远景：星空
        this.backgroundLayers.push({
            type: 'starfield',
            parallax: 0.05,
            color: '#1a1a2e'
        });

        // 中景：云层
        this.backgroundLayers.push({
            type: 'clouds',
            parallax: 0.2,
            color: '#2a2a4e'
        });

        // 近景：圣殿遗迹
        this.backgroundLayers.push({
            type: 'temple_ruins',
            parallax: 0.4,
            color: '#3a3a6e'
        });
    }

    /**
     * 生成移动平台
     */
    generateMovingPlatforms() {
        // ============ 区域1: 入口训练 (0-1750px) ============
        // 简单的左右移动平台
        this.movingPlatforms.push({
            x: 200,
            y: 400,
            width: 120,
            height: 20,
            moveX: 200,
            speed: 1,
            color: '#4a4a8a'
        });

        this.movingPlatforms.push({
            x: 600,
            y: 300,
            width: 100,
            height: 20,
            moveX: 150,
            speed: 0.8,
            color: '#4a4a8a'
        });

        this.movingPlatforms.push({
            x: 1100,
            y: 350,
            width: 120,
            height: 20,
            moveX: 180,
            speed: 1.2,
            color: '#4a4a8a'
        });

        this.movingPlatforms.push({
            x: 1500,
            y: 250,
            width: 150,
            height: 20,
            moveX: 200,
            speed: 1,
            color: '#5a5a9a'
        });

        // ============ 区域2: 上升挑战 (1750-3500px) ============
        // 螺旋上升平台
        this.movingPlatforms.push({
            x: 1900,
            y: 400,
            width: 100,
            height: 20,
            moveX: 100,
            moveY: 80,
            speed: 0.6,
            color: '#5a5a9a'
        });

        this.movingPlatforms.push({
            x: 2300,
            y: 300,
            width: 100,
            height: 20,
            moveX: 120,
            moveY: 100,
            speed: 0.7,
            color: '#5a5a9a'
        });

        this.movingPlatforms.push({
            x: 2700,
            y: 200,
            width: 100,
            height: 20,
            moveX: 150,
            moveY: 80,
            speed: 0.8,
            color: '#5a5a9a'
        });

        this.movingPlatforms.push({
            x: 3200,
            y: 280,
            width: 120,
            height: 20,
            moveX: 100,
            moveY: 60,
            speed: 0.6,
            color: '#5a5a9a'
        });

        // ============ 区域3: 机动平台 (3500-5250px) ============
        // 快速移动平台
        this.movingPlatforms.push({
            x: 3600,
            y: 350,
            width: 100,
            height: 20,
            moveX: 300,
            speed: 1.5,
            color: '#6a6aaa'
        });

        this.movingPlatforms.push({
            x: 4200,
            y: 250,
            width: 120,
            height: 20,
            moveX: 250,
            speed: 1.3,
            color: '#6a6aaa'
        });

        this.movingPlatforms.push({
            x: 4800,
            y: 300,
            width: 100,
            height: 20,
            moveX: 280,
            speed: 1.4,
            color: '#6a6aaa'
        });

        this.movingPlatforms.push({
            x: 5200,
            y: 200,
            width: 150,
            height: 20,
            moveX: 200,
            speed: 1.2,
            color: '#7a7aba'
        });

        // ============ 区域4: Boss竞技场 (5250-7000px) ============
        // 大型圆形移动平台
        this.movingPlatforms.push({
            x: 5600,
            y: 350,
            width: 200,
            height: 20,
            circular: true,
            centerX: 5600,
            centerY: 350,
            radius: 100,
            speed: 0.5,
            color: '#8a8aca'
        });

        this.movingPlatforms.push({
            x: 6000,
            y: 250,
            width: 180,
            height: 20,
            circular: true,
            centerX: 6000,
            centerY: 250,
            radius: 80,
            speed: 0.6,
            color: '#8a8aca'
        });

        this.movingPlatforms.push({
            x: 6400,
            y: 300,
            width: 250,
            height: 20,
            circular: true,
            centerX: 6400,
            centerY: 300,
            radius: 120,
            speed: 0.4,
            color: '#9a9ada'
        });
    }

    /**
     * 生成光柱陷阱
     */
    generateLightPillars() {
        // 区域2的光柱
        this.lightPillars.push({ x: 2100, width: 60, interval: 4, duration: 1 });
        this.lightPillars.push({ x: 2500, width: 60, interval: 5, duration: 1.2 });
        this.lightPillars.push({ x: 2900, width: 60, interval: 4.5, duration: 1 });

        // 区域3的密集光柱
        this.lightPillars.push({ x: 3800, width: 80, interval: 3, duration: 0.8 });
        this.lightPillars.push({ x: 4400, width: 80, interval: 3.5, duration: 1 });
        this.lightPillars.push({ x: 5000, width: 80, interval: 4, duration: 1.2 });

        // Boss区域不设光柱
    }

    /**
     * 生成敌人
     */
    generateEnemies() {
        // 区域1: 天空敌人引入
        this.enemies.push(EnemyTypes.createAngelOrb(400, 370));
        this.enemies.push(EnemyTypes.createLightOrb(700, 270));
        this.enemies.push(EnemyTypes.createAngelOrb(1200, 320));
        this.enemies.push(EnemyTypes.createKamikaze(1600, 220));

        // 区域2: 挑战敌人
        this.enemies.push(EnemyTypes.createVoidWalker(2000, 370));
        this.enemies.push(EnemyTypes.createAngelOrb(2400, 270));
        this.enemies.push(EnemyTypes.createLightOrb(2800, 170));
        this.enemies.push(EnemyTypes.createVoidWalker(3200, 250));
        this.enemies.push(EnemyTypes.createKamikaze(3400, 250));

        // 区域3: 机动区域敌人
        this.enemies.push(EnemyTypes.createAngelOrb(3700, 320));
        this.enemies.push(EnemyTypes.createVoidWalker(4100, 220));
        this.enemies.push(EnemyTypes.createLightOrb(4500, 270));
        this.enemies.push(EnemyTypes.createAngelOrb(4900, 270));
        this.enemies.push(EnemyTypes.createVoidWalker(5300, 170));

        // Boss区域不放置小怪
    }

    /**
     * 生成道具
     */
    generatePowerups() {
        // 区域1
        this.powerups.push(this.createPowerUp(300, 350, 'shield'));
        this.powerups.push(this.createPowerUp(700, 250, 'spread'));
        this.powerups.push(this.createPowerUp(1200, 300, 'rapid'));
        this.powerups.push(this.createPowerUp(1600, 200, 'star'));

        // 区域2
        this.powerups.push(this.createPowerUp(2100, 350, 'bamboo'));
        this.powerups.push(this.createPowerUp(2500, 250, 'shield'));
        this.powerups.push(this.createPowerUp(2900, 150, 'spread'));
        this.powerups.push(this.createPowerUp(3300, 230, 'rapid'));

        // 区域3
        this.powerups.push(this.createPowerUp(3800, 300, 'star'));
        this.powerups.push(this.createPowerUp(4200, 200, 'bamboo'));
        this.powerups.push(this.createPowerUp(4600, 250, 'shield'));
        this.powerups.push(this.createPowerUp(5000, 250, 'spread'));
        this.powerups.push(this.createPowerUp(5400, 150, 'star'));

        // Boss前补给
        this.powerups.push(this.createPowerUp(5700, 300, 'bamboo'));
        this.powerups.push(this.createPowerUp(6100, 200, 'shield'));
        this.powerups.push(this.createPowerUp(6500, 250, 'star'));
    }

    /**
     * 生成Boss
     */
    generateBoss() {
        this.boss = new SkyTyrant(6200, 200);
    }

    /**
     * 辅助方法
     */
    createPowerUp(x, y, type) {
        return new PowerUp(x, y, type);
    }

    /**
     * 绘制背景
     */
    drawBackground(ctx, cameraX, cameraY, canvas) {
        ctx.fillStyle = this.config.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.backgroundLayers.forEach(layer => {
            this.drawBackgroundLayer(ctx, cameraX, cameraY, canvas, layer);
        });

        // 绘制虚空线
        this.drawVoidLine(ctx, cameraX, cameraY, canvas);

        // 绘制提示
        this.drawHints(ctx, cameraX, canvas);
    }

    /**
     * 绘制背景层
     */
    drawBackgroundLayer(ctx, cameraX, cameraY, canvas, layer) {
        const parallaxX = cameraX * layer.parallax;
        const offsetX = parallaxX % canvas.width;

        ctx.save();
        ctx.fillStyle = layer.color;

        switch (layer.type) {
            case 'starfield':
                this.drawStarfield(ctx, canvas, offsetX);
                break;
            case 'clouds':
                this.drawClouds(ctx, canvas, offsetX);
                break;
            case 'temple_ruins':
                this.drawTempleRuins(ctx, canvas, offsetX);
                break;
        }

        ctx.restore();
    }

    /**
     * 绘制星空
     */
    drawStarfield(ctx, canvas, offsetX) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 100; i++) {
            const x = ((i * 67) % canvas.width - offsetX) % canvas.width;
            const y = (i * 43) % canvas.height;
            const size = (i % 3) + 1;
            ctx.fillRect(x, y, size, size);
        }
    }

    /**
     * 绘制云层
     */
    drawClouds(ctx, canvas, offsetX) {
        ctx.fillStyle = 'rgba(138, 138, 202, 0.2)';

        for (let i = 0; i < 10; i++) {
            const x = ((i * 234) - offsetX) % (canvas.width + 200) - 100;
            const y = 100 + (i * 57) % (canvas.height - 200);
            const w = 150 + (i % 5) * 30;
            const h = 60 + (i % 3) * 20;

            ctx.beginPath();
            ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 绘制圣殿遗迹
     */
    drawTempleRuins(ctx, canvas, offsetX) {
        ctx.fillStyle = 'rgba(58, 58, 110, 0.4)';

        for (let i = 0; i < 8; i++) {
            const x = ((i * 345) - offsetX) % (canvas.width + 300) - 150;
            const y = canvas.height - 100 - (i % 4) * 40;
            const w = 80 + (i % 3) * 20;
            const h = 150 + (i % 5) * 30;

            // 柱子
            ctx.fillRect(x, y, w, h);

            // 柱头
            ctx.fillRect(x - 10, y, w + 20, 20);
        }
    }

    /**
     * 绘制虚空线
     */
    drawVoidLine(ctx, cameraX, cameraY, canvas) {
        ctx.save();
        ctx.strokeStyle = 'rgba(138, 43, 226, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);

        const voidY = this.voidLine - cameraY;
        ctx.beginPath();
        ctx.moveTo(0, voidY);
        ctx.lineTo(canvas.width, voidY);
        ctx.stroke();

        // 虚空警告文字
        ctx.fillStyle = 'rgba(138, 43, 226, 0.7)';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VOID LINE - DO NOT FALL', canvas.width / 2, voidY - 10);

        ctx.restore();
    }

    /**
     * 绘制提示
     */
    drawHints(ctx, cameraX, canvas) {
        ctx.save();
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(138, 43, 226, 0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#9932cc';

        const playerX = cameraX + canvas.width / 2;

        if (playerX < 1000) {
            ctx.fillText('SKY TEMPLE - AVOID THE VOID', canvas.width / 2, 80);
        } else if (playerX > 2000 && playerX < 3500) {
            ctx.fillText('LIGHT PILLARS AHEAD!', canvas.width / 2, 80);
        } else if (playerX > 5000 && playerX < 6000) {
            ctx.fillStyle = 'rgba(255, 50, 255, 0.9)';
            ctx.font = '20px "Press Start 2P", monospace';
            ctx.fillText('FINAL BOSS AHEAD!', canvas.width / 2, 80);
        }

        ctx.restore();
    }

    /**
     * 更新关卡
     */
    update(dt, player, bullets) {
        // 更新移动平台
        this.updateMovingPlatforms(dt);

        // 更新光柱
        this.updateLightPillars(dt, player);

        // 检查虚空死亡
        this.checkVoidDeath(player);

        // 更新敌人
        this.enemies.forEach(e => e.update(dt, player, this.movingPlatforms, bullets));
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);

        // 更新道具
        this.powerups.forEach(p => p.update(dt, this.movingPlatforms));

        // 更新Boss
        if (this.boss && !this.boss.markedForDeletion) {
            this.boss.update(dt, player, this.movingPlatforms, bullets);
        } else if (this.boss && this.boss.markedForDeletion) {
            this.isCompleted = true;
            this.triggerVictoryEffects();
        }
    }

    /**
     * 更新移动平台
     */
    updateMovingPlatforms(dt) {
        this.movingPlatforms.forEach(mp => {
            if (mp.circular) {
                // 圆形移动
                const angle = Date.now() * 0.001 * mp.speed;
                mp.x = mp.centerX + Math.cos(angle) * mp.radius - mp.width / 2;
                mp.y = mp.centerY + Math.sin(angle) * mp.radius - mp.height / 2;
            } else {
                // 线性移动
                if (mp.moveX) {
                    mp.baseX = mp.baseX || mp.x;
                    mp.x = mp.baseX + Math.sin(Date.now() * 0.001 * mp.speed) * mp.moveX;
                }
                if (mp.moveY) {
                    mp.baseY = mp.baseY || mp.y;
                    mp.y = mp.baseY + Math.cos(Date.now() * 0.001 * mp.speed) * mp.moveY;
                }
            }
        });
    }

    /**
     * 更新光柱
     */
    updateLightPillars(dt, player) {
        this.lightPillars.forEach(lp => {
            if (!lp.currentTimer) lp.currentTimer = 0;
            if (!lp.active) lp.active = false;

            lp.currentTimer += dt;

            // 激活光柱
            if (lp.currentTimer >= lp.interval && !lp.active) {
                lp.active = true;
                lp.activeTimer = 0;
            }

            // 光柱持续中
            if (lp.active) {
                lp.activeTimer += dt;

                // 检查玩家是否在光柱内
                if (player.x < lp.x + lp.width && player.x + player.width > lp.x) {
                    player.takeDamage(2);
                }

                // 光柱结束
                if (lp.activeTimer >= lp.duration) {
                    lp.active = false;
                    lp.currentTimer = 0;
                }
            }
        });
    }

    /**
     * 检查虚空死亡
     */
    checkVoidDeath(player) {
        if (player.y > this.voidLine) {
            // 掉入虚空，直接死亡
            player.hp = 0;
            player.takeDamage(10); // 触发死亡逻辑
        }
    }

    /**
     * 绘制关卡
     */
    draw(ctx, cameraX, cameraY) {
        // 绘制光柱
        this.drawLightPillars(ctx, cameraX, cameraY);

        // 绘制移动平台
        this.drawMovingPlatforms(ctx, cameraX, cameraY);

        // 绘制道具、敌人、Boss
        this.powerups.forEach(p => p.draw(ctx, cameraX, cameraY));
        this.enemies.forEach(e => e.draw(ctx, cameraX, cameraY));
        if (this.boss && !this.boss.markedForDeletion) {
            this.boss.draw(ctx, cameraX, cameraY);
        }
    }

    /**
     * 绘制光柱
     */
    drawLightPillars(ctx, cameraX, cameraY) {
        this.lightPillars.forEach(lp => {
            if (lp.active) {
                ctx.save();

                // 警告渐变
                const gradient = ctx.createLinearGradient(
                    lp.x - cameraX,
                    0,
                    lp.x - cameraX,
                    this.voidLine - cameraY
                );
                gradient.addColorStop(0, 'rgba(138, 43, 226, 0)');
                gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.6)');
                gradient.addColorStop(1, 'rgba(138, 43, 226, 0.8)');

                ctx.fillStyle = gradient;
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#9932cc';
                ctx.fillRect(lp.x - cameraX, 0 - cameraY, lp.width, this.voidLine);

                // 闪烁效果
                if (Math.floor(Date.now() / 100) % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(lp.x - cameraX, 0 - cameraY, lp.width, this.voidLine);
                }

                ctx.restore();
            } else {
                // 警告标记
                const warningProgress = lp.currentTimer / lp.interval;
                if (warningProgress > 0.7) {
                    ctx.save();
                    ctx.fillStyle = `rgba(138, 43, 226, ${warningProgress * 0.5})`;
                    ctx.fillRect(lp.x - cameraX, this.voidLine - 50 - cameraY, lp.width, 50);
                    ctx.restore();
                }
            }
        });
    }

    /**
     * 绘制移动平台
     */
    drawMovingPlatforms(ctx, cameraX, cameraY) {
        this.movingPlatforms.forEach(mp => {
            ctx.save();

            // 平台主体
            ctx.fillStyle = mp.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#9932cc';
            ctx.fillRect(mp.x - cameraX, mp.y - cameraY, mp.width, mp.height);

            // 边框
            ctx.strokeStyle = '#bfaaff';
            ctx.lineWidth = 2;
            ctx.strokeRect(mp.x - cameraX, mp.y - cameraY, mp.width, mp.height);

            // 装饰图案
            ctx.fillStyle = 'rgba(191, 170, 255, 0.3)';
            const patternSize = 10;
            for (let px = 0; px < mp.width; px += patternSize * 2) {
                for (let py = 0; py < mp.height; py += patternSize * 2) {
                    ctx.fillRect(
                        mp.x - cameraX + px,
                        mp.y - cameraY + py,
                        patternSize,
                        patternSize
                    );
                }
            }

            ctx.restore();
        });
    }

    /**
     * 触发胜利特效
     */
    triggerVictoryEffects() {
        if (typeof ParticleSystem !== 'undefined') {
            const canvas = document.getElementById('gameCanvas');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // 终极烟花表演
            for (let wave = 0; wave < 10; wave++) {
                setTimeout(() => {
                    for (let i = 0; i < 5; i++) {
                        ParticleSystem.createFirework(
                            centerX + (Math.random() - 0.5) * 600,
                            centerY + (Math.random() - 0.5) * 400
                        );
                    }
                }, wave * 200);
            }
        }

        console.log('🎉🎉🎉 恭喜通关！天空暴君已被击败！游戏完成！');
    }

    /**
     * 清理关卡
     */
    cleanup() {
        super.cleanup();
        this.movingPlatforms = [];
        this.lightPillars = [];
        this.backgroundLayers = [];
        console.log('🧹 第三关已清理');
    }

    // 覆盖 width getter，因为平台是动态的
    get width() {
        return this.config.width || 7000;
    }

    get height() {
        return this.config.height || 600;
    }
}
