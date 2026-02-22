/**
 * level2-nether.js
 *
 * Level2Nether - 第二关：地狱熔岩
 *
 * 特性:
 * - 6000px 宽度
 * - 熔岩机制（接触造成伤害）
 * - 喷泉陷阱（定时喷发）
 * - 飞行平台
 * - 地狱主题敌人
 * - Boss: InfernoDragon (烈焰魔龙)
 *
 * 机制:
 * - 熔岩地面：除非是Dragon形态，否则接触造成伤害
 * - 火山喷泉：警告3秒后喷发，造成大范围伤害
 * - 传送门：某些区域需要传送
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

class Level2Nether extends LevelBase {
    constructor() {
        super(2, 'Inferno Nether', {
            width: 6000,
            height: 600,
            bgColor: '#1a0a0a', // 深红色背景
            themeColor: '#ff4500'
        });

        // 特殊机制
        this.lavaAreas = []; // 熔岩区域
        this.geysers = []; // 喷泉
        this.flyingPlatforms = []; // 飞行平台
        this.backgroundLayers = [];
    }

    /**
     * 初始化关卡
     */
    init() {
        console.log('🔥 初始化第二关：地狱熔岩');

        this.generateBackgroundLayers();
        this.generatePlatforms();
        this.generateLavaAreas();
        this.generateGeysers();
        this.generateFlyingPlatforms();
        this.generateEnemies();
        this.generatePowerups();
        this.generateBoss();

        console.log(`✅ 第二关初始化完成: ${this.platforms.length} 平台, ${this.enemies.length} 敌人, ${this.geysers.length} 喷泉`);
    }

    /**
     * 生成背景层
     */
    generateBackgroundLayers() {
        // 远景：岩浆之光
        this.backgroundLayers.push({
            type: 'lava_glow',
            parallax: 0.1,
            color: '#331100'
        });

        // 中景：地狱岩石
        this.backgroundLayers.push({
            type: 'rock_formations',
            parallax: 0.3,
            color: '#442200'
        });

        // 近景：火焰粒子
        this.backgroundLayers.push({
            type: 'fire_particles',
            parallax: 0.6,
            color: '#ff4500'
        });
    }

    /**
     * 生成平台布局
     */
    generatePlatforms() {
        // ============ 区域1: 熔岩入口 (0-1500px) ============
        this.addPlatform(0, 500, 600, 100, '#332211');
        this.addPlatform(800, 500, 400, 100, '#332211');

        // 熔岩间的安全跳板
        this.addPlatform(350, 400, 80, 20, '#443322');
        this.addPlatform(550, 320, 80, 20, '#443322');

        // ============ 区域2: 火焰峡谷 (1500-3000px) ============
        this.addPlatform(1400, 500, 500, 100, '#332211');

        // 上升平台序列
        this.addPlatform(1600, 380, 120, 20, '#443322');
        this.addPlatform(1850, 280, 100, 20, '#443322');
        this.addPlatform(2100, 180, 100, 20, '#443322');
        this.addPlatform(2350, 280, 100, 20, '#443322');

        this.addPlatform(2600, 500, 400, 100, '#332211');

        // ============ 区域3: 喷泉地带 (3000-4500px) ============
        this.addPlatform(3100, 500, 1400, 100, '#332211');

        // 高空平台躲避喷泉
        this.addPlatform(3300, 350, 150, 20, '#443322');
        this.addPlatform(3650, 250, 150, 20, '#443322');
        this.addPlatform(4000, 350, 150, 20, '#443322');
        this.addPlatform(4350, 250, 150, 20, '#443322');

        // ============ 区域4: Boss竞技场 (4500-6000px) ============
        this.addPlatform(4600, 500, 1400, 100, '#331111');

        // 上层战术平台
        this.addPlatform(4800, 350, 200, 20, '#443322');
        this.addPlatform(5200, 350, 200, 20, '#443322');
        this.addPlatform(5500, 200, 300, 20, '#443322');
    }

    /**
     * 生成熔岩区域
     */
    generateLavaAreas() {
        // 平台之间的熔岩间隙
        this.lavaAreas.push({ x: 600, y: 500, width: 200, height: 100, damage: 2 });
        this.lavaAreas.push({ x: 1200, y: 500, width: 200, height: 100, damage: 2 });
        this.lavaAreas.push({ x: 1900, y: 500, width: 700, height: 100, damage: 2 });
        this.lavaAreas.push({ x: 3000, y: 500, width: 100, height: 100, damage: 2 });
        this.lavaAreas.push({ x: 4500, y: 500, width: 100, height: 100, damage: 2 });
    }

    /**
     * 生成喷泉
     */
    generateGeysers() {
        // 区域2的喷泉
        this.geysers.push({ x: 2000, y: 500, width: 80, timer: 3, warningTime: 2 });
        this.geysers.push({ x: 2700, y: 500, width: 80, timer: 4, warningTime: 2 });

        // 区域3的密集喷泉
        this.geysers.push({ x: 3400, y: 500, width: 100, timer: 3, warningTime: 2 });
        this.geysers.push({ x: 3800, y: 500, width: 100, timer: 3.5, warningTime: 2 });
        this.geysers.push({ x: 4200, y: 500, width: 100, timer: 4, warningTime: 2 });
    }

    /**
     * 生成飞行平台
     */
    generateFlyingPlatforms() {
        // 区域1的飞行平台
        this.flyingPlatforms.push({
            x: 700,
            y: 350,
            width: 100,
            height: 20,
            moveX: 100,
            speed: 0.5,
            color: '#554433'
        });

        // 区域3的飞行平台
        this.flyingPlatforms.push({
            x: 3200,
            y: 400,
            width: 120,
            height: 20,
            moveY: 100,
            speed: 0.3,
            color: '#554433'
        });
    }

    /**
     * 生成敌人
     */
    generateEnemies() {
        // 区域1: 地狱敌人引入
        this.enemies.push(EnemyTypes.createFireElement(400, 470));
        this.enemies.push(EnemyTypes.createDemonBat(700, 320));

        // 区域2: 成组敌人
        this.enemies.push(EnemyTypes.createSkeleton(1500, 470));
        this.enemies.push(EnemyTypes.createFireElement(1800, 470));
        this.enemies.push(EnemyTypes.createDemonBat(2100, 150));
        this.enemies.push(EnemyTypes.createHellfire(2400, 250));
        this.enemies.push(EnemyTypes.createSkeleton(2700, 470));

        // 区域3: 喷泉地带敌人
        this.enemies.push(EnemyTypes.createFireElement(3200, 470));
        this.enemies.push(EnemyTypes.createDemonBat(3500, 320));
        this.enemies.push(EnemyTypes.createSkeleton(3900, 470));
        this.enemies.push(EnemyTypes.createHellfire(4200, 220));

        // 区域4: Boss前敌人
        this.enemies.push(EnemyTypes.createFireElement(4800, 470));
        this.enemies.push(EnemyTypes.createDemonBat(5100, 320));
        this.enemies.push(EnemyTypes.createSkeleton(5400, 470));
        this.enemies.push(EnemyTypes.createHellfire(5700, 170));

        // Boss区域不放置小怪
    }

    /**
     * 生成道具
     */
    generatePowerups() {
        // 区域1
        this.powerups.push(this.createPowerUp(400, 350, 'star'));
        this.powerups.push(this.createPowerUp(600, 250, 'spread'));

        // 区域2
        this.powerups.push(this.createPowerUp(1600, 320, 'shield'));
        this.powerups.push(this.createPowerUp(2000, 100, 'rapid'));
        this.powerups.push(this.createPowerUp(2500, 200, 'bamboo'));

        // 区域3
        this.powerups.push(this.createPowerUp(3300, 280, 'star'));
        this.powerups.push(this.createPowerUp(3700, 180, 'spread'));
        this.powerups.push(this.createPowerUp(4100, 280, 'shield'));

        // 区域4
        this.powerups.push(this.createPowerUp(4900, 280, 'rapid'));
        this.powerups.push(this.createPowerUp(5300, 280, 'star'));
        this.powerups.push(this.createPowerUp(5600, 130, 'bamboo'));
    }

    /**
     * 生成Boss
     */
    generateBoss() {
        this.boss = new InfernoDragon(5200, 300);
    }

    /**
     * 辅助方法
     */
    addPlatform(x, y, w, h, color) {
        this.platforms.push(new Platform(x, y, w, h, color));
    }

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

        // 绘制警告提示
        this.drawWarningHints(ctx, cameraX, canvas);
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
            case 'lava_glow':
                this.drawLavaGlow(ctx, canvas, offsetX);
                break;
            case 'rock_formations':
                this.drawRockFormations(ctx, canvas, offsetX);
                break;
            case 'fire_particles':
                this.drawFireParticles(ctx, canvas, offsetX);
                break;
        }

        ctx.restore();
    }

    /**
     * 绘制熔岩光晕
     */
    drawLavaGlow(ctx, canvas, offsetX) {
        ctx.fillStyle = 'rgba(255, 69, 0, 0.1)';
        for (let i = 0; i < 20; i++) {
            const x = ((i * 157) % canvas.width - offsetX) % canvas.width;
            const y = canvas.height - 50 - (i % 3) * 30;
            const radius = 100 + (i % 5) * 20;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 绘制岩石构造
     */
    drawRockFormations(ctx, canvas, offsetX) {
        ctx.fillStyle = 'rgba(68, 34, 34, 0.5)';

        for (let i = 0; i < 15; i++) {
            const x = ((i * 213) - offsetX) % (canvas.width + 200) - 100;
            const height = 80 + (i % 4) * 30;
            const width = 60 + (i % 3) * 20;

            ctx.beginPath();
            ctx.moveTo(x, canvas.height);
            ctx.lineTo(x + width / 2, canvas.height - height);
            ctx.lineTo(x + width, canvas.height);
            ctx.fill();
        }
    }

    /**
     * 绘制火焰粒子
     */
    drawFireParticles(ctx, canvas, offsetX) {
        ctx.fillStyle = 'rgba(255, 69, 0, 0.4)';

        for (let i = 0; i < 40; i++) {
            const x = ((i * 91) - offsetX) % (canvas.width + 50) - 25;
            const y = canvas.height - (i * 17) % canvas.height;
            const size = 3 + (i % 4) * 2;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 绘制警告提示
     */
    drawWarningHints(ctx, cameraX, canvas) {
        ctx.save();
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 100, 100, 0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0000';

        const playerX = cameraX + canvas.width / 2;

        if (playerX > 500 && playerX < 1500) {
            ctx.fillText('WARNING: Lava Ahead!', canvas.width / 2, 80);
        } else if (playerX > 3000 && playerX < 4500) {
            ctx.fillText('GEYSER ZONE!', canvas.width / 2, 80);
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText('Watch for warning signs', canvas.width / 2, 100);
        } else if (playerX > 4500) {
            ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
            ctx.font = '20px "Press Start 2P", monospace';
            ctx.fillText('INFERNO DRAGON AHEAD!', canvas.width / 2, 80);
        }

        ctx.restore();
    }

    /**
     * 更新关卡
     */
    update(dt, player, bullets) {
        // 更新飞行平台
        this.updateFlyingPlatforms(dt);

        // 更新喷泉
        this.updateGeysers(dt, player);

        // 检查熔岩伤害
        this.checkLavaDamage(player);

        // 更新敌人
        this.enemies.forEach(e => e.update(dt, player, this.platforms, bullets));
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);

        // 更新道具
        this.powerups.forEach(p => p.update(dt, this.platforms));

        // 更新Boss
        if (this.boss && !this.boss.markedForDeletion) {
            this.boss.update(dt, player, this.platforms, bullets);
        } else if (this.boss && this.boss.markedForDeletion) {
            this.isCompleted = true;
            this.triggerVictoryEffects();
        }
    }

    /**
     * 更新飞行平台
     */
    updateFlyingPlatforms(dt) {
        this.flyingPlatforms.forEach(fp => {
            if (fp.moveX) {
                fp.x += fp.speed * Math.sin(Date.now() * 0.001);
            }
            if (fp.moveY) {
                fp.y += fp.speed * Math.cos(Date.now() * 0.001);
            }
        });
    }

    /**
     * 更新喷泉
     */
    updateGeysers(dt, player) {
        this.geysers.forEach(g => {
            if (!g.currentTimer) g.currentTimer = g.timer;

            g.currentTimer -= dt;

            // 警告阶段
            if (g.currentTimer <= g.warningTime && g.currentTimer > 0) {
                g.warning = true;
            }
            // 喷发阶段
            else if (g.currentTimer <= 0) {
                g.erupting = true;
                if (g.currentTimer <= -1) { // 喷发持续1秒
                    g.currentTimer = g.timer;
                    g.warning = false;
                    g.erupting = false;
                }

                // 检查玩家是否在喷泉范围内
                if (player.x < g.x + g.width && player.x + player.width > g.x) {
                    player.takeDamage(g.damage || 2);
                }
            } else {
                g.warning = false;
                g.erupting = false;
            }
        });
    }

    /**
     * 检查熔岩伤害
     */
    checkLavaDamage(player) {
        // 如果玩家是Dragon形态，免疫熔岩伤害
        if (player.transformMode === 'dragon') return;

        this.lavaAreas.forEach(lava => {
            if (Physics.checkCollision(player, lava)) {
                player.takeDamage(lava.damage);
            }
        });
    }

    /**
     * 绘制关卡
     */
    draw(ctx, cameraX, cameraY) {
        // 绘制熔岩
        this.drawLavaAreas(ctx, cameraX, cameraY);

        // 绘制喷泉
        this.drawGeysers(ctx, cameraX, cameraY);

        // 绘制飞行平台
        this.drawFlyingPlatforms(ctx, cameraX, cameraY);

        // 绘制普通平台
        this.platforms.forEach(p => p.draw(ctx, cameraX, cameraY));

        // 绘制道具、敌人、Boss
        this.powerups.forEach(p => p.draw(ctx, cameraX, cameraY));
        this.enemies.forEach(e => e.draw(ctx, cameraX, cameraY));
        if (this.boss && !this.boss.markedForDeletion) {
            this.boss.draw(ctx, cameraX, cameraY);
        }
    }

    /**
     * 绘制熔岩区域
     */
    drawLavaAreas(ctx, cameraX, cameraY) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff4500';

        this.lavaAreas.forEach(lava => {
            // 熔岩基础
            const gradient = ctx.createLinearGradient(
                lava.x - cameraX,
                lava.y - cameraY,
                lava.x - cameraX,
                lava.y + lava.height - cameraY
            );
            gradient.addColorStop(0, '#ff6600');
            gradient.addColorStop(0.5, '#ff4500');
            gradient.addColorStop(1, '#cc3300');

            ctx.fillStyle = gradient;
            ctx.fillRect(lava.x - cameraX, lava.y - cameraY, lava.width, lava.height);

            // 熔岩波动效果
            ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
            const waveOffset = Math.sin(Date.now() * 0.003) * 5;
            ctx.fillRect(
                lava.x - cameraX,
                lava.y - cameraY + waveOffset,
                lava.width,
                10
            );
        });

        ctx.restore();
    }

    /**
     * 绘制喷泉
     */
    drawGeysers(ctx, cameraX, cameraY) {
        this.geysers.forEach(g => {
            ctx.save();

            if (g.warning) {
                // 警告阶段
                ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ffff00';
                ctx.fillRect(g.x - cameraX, g.y - cameraY - 100, g.width, 100);
            }

            if (g.erupting) {
                // 喷发阶段
                ctx.fillStyle = 'rgba(255, 69, 0, 0.8)';
                ctx.shadowBlur = 40;
                ctx.shadowColor = '#ff4500';

                // 绘制喷发柱
                const gradient = ctx.createLinearGradient(
                    g.x - cameraX,
                    g.y - cameraY - 150,
                    g.x - cameraX + g.width,
                    g.y - cameraY
                );
                gradient.addColorStop(0, 'rgba(255, 100, 0, 0)');
                gradient.addColorStop(0.5, 'rgba(255, 69, 0, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 69, 0, 0.9)');

                ctx.fillStyle = gradient;
                ctx.fillRect(g.x - cameraX, g.y - cameraY - 150, g.width, 150);

                // 火花粒子
                ctx.fillStyle = '#ffff00';
                for (let i = 0; i < 10; i++) {
                    const px = g.x - cameraX + Math.random() * g.width;
                    const py = g.y - cameraY - 150 - Math.random() * 50;
                    ctx.fillRect(px, py, 3, 3);
                }
            }

            ctx.restore();
        });
    }

    /**
     * 绘制飞行平台
     */
    drawFlyingPlatforms(ctx, cameraX, cameraY) {
        this.flyingPlatforms.forEach(fp => {
            ctx.save();
            ctx.fillStyle = fp.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff6600';
            ctx.fillRect(fp.x - cameraX, fp.y - cameraY, fp.width, fp.height);

            // 边框
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 2;
            ctx.strokeRect(fp.x - cameraX, fp.y - cameraY, fp.width, fp.height);
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

            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    ParticleSystem.createFirework(
                        centerX + (Math.random() - 0.5) * 500,
                        centerY + (Math.random() - 0.5) * 300
                    );
                }, i * 250);
            }
        }

        console.log('🎉 第二关完成！烈焰魔龙已被击败！');
    }

    /**
     * 清理关卡
     */
    cleanup() {
        super.cleanup();
        this.lavaAreas = [];
        this.geysers = [];
        this.flyingPlatforms = [];
        this.backgroundLayers = [];
        console.log('🧹 第二关已清理');
    }
}
