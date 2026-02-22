/**
 * level1-forest.js
 *
 * Level1Forest - 第一关：像素森林
 *
 * 特性:
 * - 5000px 宽度
 * - 教程关卡，适合新手
 * - 3层视差滚动背景
 * - 森林主题平台和敌人
 * - Boss: TreantKing (树精王)
 *
 * 教程元素:
 * - 移动提示
 * - 射击提示
 * - 跳跃提示
 * - 道具拾取提示
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

class Level1Forest extends LevelBase {
    constructor() {
        super(1, 'Pixel Forest', {
            width: 5000,
            height: 600,
            bgColor: '#0a1a0a', // 深绿色背景
            themeColor: '#4a7c43'
        });

        // 视差背景层
        this.backgroundLayers = [];
    }

    /**
     * 初始化关卡
     */
    init() {
        console.log('🌲 初始化第一关：像素森林');

        // 生成背景层
        this.generateBackgroundLayers();

        // 生成平台
        this.generatePlatforms();

        // 生成敌人
        this.generateEnemies();

        // 生成道具
        this.generatePowerups();

        // 生成Boss
        this.generateBoss();

        console.log(`✅ 第一关初始化完成: ${this.platforms.length} 平台, ${this.enemies.length} 敌人, ${this.powerups.length} 道具`);
    }

    /**
     * 生成视差背景层
     */
    generateBackgroundLayers() {
        // 远景：星空和远山（移动最慢）
        this.backgroundLayers.push({
            type: 'stars',
            parallax: 0.1,
            color: '#1a2a1a'
        });

        // 中景：森林轮廓
        this.backgroundLayers.push({
            type: 'forest_silhouette',
            parallax: 0.3,
            color: '#2a3a2a'
        });

        // 近景：树叶和树枝
        this.backgroundLayers.push({
            type: 'leaves',
            parallax: 0.6,
            color: '#3a4a3a'
        });
    }

    /**
     * 生成平台布局
     */
    generatePlatforms() {
        // ============ 区域1: 起始区域 (0-1000px) ============
        // 地面平台
        this.addPlatform(0, 500, 800, 100, '#223344');
        this.addPlatform(900, 500, 400, 100, '#223344');

        // 教程浮动平台（引导跳跃）
        this.addPlatform(300, 350, 150, 20, '#2a4a2a');
        this.addPlatform(600, 250, 120, 20, '#2a4a2a');

        // ============ 区域2: 学习区域 (1000-2000px) ============
        this.addPlatform(1400, 500, 600, 100, '#223344');

        // 多层跳跃训练
        this.addPlatform(1100, 350, 100, 20, '#2a4a2a');
        this.addPlatform(1300, 280, 100, 20, '#2a4a2a');
        this.addPlatform(1500, 200, 150, 20, '#2a4a2a');
        this.addPlatform(1800, 300, 150, 20, '#2a4a2a');

        // ============ 区域3: 挑战区域 (2000-3000px) ============
        this.addPlatform(2100, 500, 900, 100, '#223344');

        // 上升平台序列
        this.addPlatform(2200, 380, 120, 20, '#2a4a2a');
        this.addPlatform(2400, 280, 120, 20, '#2a4a2a');
        this.addPlatform(2600, 180, 120, 20, '#2a4a2a');
        this.addPlatform(2800, 280, 120, 20, '#2a4a2a');

        // ============ 区域4: Boss前准备 (3000-4000px) ============
        this.addPlatform(3100, 500, 900, 100, '#223344');

        // 战术平台
        this.addPlatform(3300, 350, 200, 20, '#2a4a2a');
        this.addPlatform(3700, 250, 150, 20, '#2a4a2a');

        // ============ 区域5: Boss竞技场 (4000-5000px) ============
        // 大型Boss战平台
        this.addPlatform(4000, 500, 1000, 100, '#2a3a2a');

        // 上层平台（战术移动用）
        this.addPlatform(4200, 350, 150, 20, '#2a4a2a');
        this.addPlatform(4550, 350, 150, 20, '#2a4a2a');
        this.addPlatform(4300, 200, 400, 20, '#2a4a2a');
    }

    /**
     * 生成敌人
     */
    generateEnemies() {
        // 区域1: 简单敌人（教程）
        this.enemies.push(EnemyTypes.createSlime(400, 320));
        this.enemies.push(EnemyTypes.createSlime(700, 220));

        // 区域2: 引入追踪敌人
        this.enemies.push(EnemyTypes.createGoblin(1200, 470));
        this.enemies.push(EnemyTypes.createBat(1500, 270));
        this.enemies.push(EnemyTypes.createSeedling(1700, 470));
        this.enemies.push(EnemyTypes.createBat(1900, 170));

        // 区域3: 成组敌人
        this.enemies.push(EnemyTypes.createSlime(2200, 350));
        this.enemies.push(EnemyTypes.createGoblin(2300, 470));
        this.enemies.push(EnemyTypes.createSeedling(2500, 250));
        this.enemies.push(EnemyTypes.createBat(2700, 250));

        // 区域4: Boss前小怪
        this.enemies.push(EnemyTypes.createGoblin(3200, 470));
        this.enemies.push(EnemyTypes.createBat(3400, 320));
        this.enemies.push(EnemyTypes.createSlime(3600, 470));
        this.enemies.push(EnemyTypes.createSeedling(3800, 220));

        // Boss区域不放置小怪
    }

    /**
     * 生成道具
     */
    generatePowerups() {
        // 区域1: 基础道具
        this.powerups.push(this.createPowerUp(350, 200, 'speed'));
        this.powerups.push(this.createPowerUp(650, 150, 'spread'));

        // 区域2: 进阶道具
        this.powerups.push(this.createPowerUp(1400, 400, 'shield'));
        this.powerups.push(this.createPowerUp(1550, 100, 'rapid'));

        // 区域3: 强化道具
        this.powerups.push(this.createPowerUp(2400, 200, 'star'));
        this.powerups.push(this.createPowerUp(2700, 200, 'bamboo'));

        // 区域4: Boss前准备
        this.powerups.push(this.createPowerUp(3350, 250, 'spread'));
        this.powerups.push(this.createPowerUp(3750, 150, 'shield'));
    }

    /**
     * 生成Boss
     */
    generateBoss() {
        // Boss位于关卡末端
        this.boss = new TreantKing(4500, 350);
    }

    /**
     * 辅助方法：添加平台
     */
    addPlatform(x, y, w, h, color = '#223344') {
        this.platforms.push(new Platform(x, y, w, h, color));
    }

    /**
     * 辅助方法：创建道具
     */
    createPowerUp(x, y, type) {
        return new PowerUp(x, y, type);
    }

    /**
     * 绘制背景（视差滚动）
     */
    drawBackground(ctx, cameraX, cameraY, canvas) {
        // 基础背景色
        ctx.fillStyle = this.config.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制每一层视差背景
        this.backgroundLayers.forEach(layer => {
            this.drawBackgroundLayer(ctx, cameraX, cameraY, canvas, layer);
        });

        // 绘制教程提示文字
        this.drawTutorialHints(ctx, cameraX, canvas);
    }

    /**
     * 绘制单个背景层
     */
    drawBackgroundLayer(ctx, cameraX, cameraY, canvas, layer) {
        const parallaxX = cameraX * layer.parallax;
        const offsetX = parallaxX % canvas.width;

        ctx.save();
        ctx.fillStyle = layer.color;

        switch (layer.type) {
            case 'stars':
                this.drawStars(ctx, canvas, offsetX);
                break;
            case 'forest_silhouette':
                this.drawForestSilhouette(ctx, canvas, offsetX);
                break;
            case 'leaves':
                this.drawLeaves(ctx, canvas, offsetX);
                break;
        }

        ctx.restore();
    }

    /**
     * 绘制星空
     */
    drawStars(ctx, canvas, offsetX) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = ((i * 73) % canvas.width - offsetX) % canvas.width;
            const y = (i * 37) % (canvas.height * 0.6);
            const size = (i % 3) + 1;
            ctx.fillRect(x, y, size, size);
        }
    }

    /**
     * 绘制森林轮廓
     */
    drawForestSilhouette(ctx, canvas, offsetX) {
        ctx.fillStyle = 'rgba(42, 74, 42, 0.4)';

        // 简化的树木形状
        for (let i = 0; i < 20; i++) {
            const x = ((i * 150) - offsetX) % (canvas.width + 200) - 100;
            const height = 100 + (i % 5) * 30;
            const width = 60 + (i % 3) * 20;

            // 树干
            ctx.fillRect(x + width / 2 - 5, canvas.height - height, 10, height);

            // 树冠（三角形）
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - height + 20);
            ctx.lineTo(x + width / 2, canvas.height - height - 40);
            ctx.lineTo(x + width, canvas.height - height + 20);
            ctx.fill();
        }
    }

    /**
     * 绘制前景树叶
     */
    drawLeaves(ctx, canvas, offsetX) {
        ctx.fillStyle = 'rgba(58, 90, 58, 0.3)';

        // 漂浮的树叶
        for (let i = 0; i < 30; i++) {
            const x = ((i * 101) - offsetX) % (canvas.width + 100) - 50;
            const y = 50 + (i * 23) % canvas.height;
            const size = 8 + (i % 5) * 3;

            ctx.beginPath();
            ctx.ellipse(x, y, size, size / 2, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 绘制教程提示
     */
    drawTutorialHints(ctx, cameraX, canvas) {
        ctx.save();
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ff00';

        // 根据玩家位置显示不同提示
        const playerX = cameraX + canvas.width / 2;

        if (playerX < 500) {
            ctx.fillText('WASD / Arrows to Move', canvas.width / 2, 100);
        } else if (playerX < 1000) {
            ctx.fillText('Space to Jump', canvas.width / 2, 100);
        } else if (playerX < 1500) {
            ctx.fillText('J / Z to Shoot', canvas.width / 2, 100);
        } else if (playerX < 2000) {
            ctx.fillText('Collect Power-ups!', canvas.width / 2, 100);
        } else if (playerX > 4000) {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
            ctx.shadowColor = '#ff0000';
            ctx.fillText('BOSS AHEAD!', canvas.width / 2, 100);
        }

        ctx.restore();
    }

    /**
     * 更新关卡
     */
    update(dt, player, bullets) {
        // 更新敌人（传入player和bullets以支持高级AI）
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
     * 触发胜利特效
     */
    triggerVictoryEffects() {
        // 播放烟花效果（如果存在ParticleSystem）
        if (typeof ParticleSystem !== 'undefined') {
            const canvas = document.getElementById('gameCanvas');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    ParticleSystem.createFirework(
                        centerX + (Math.random() - 0.5) * 400,
                        centerY + (Math.random() - 0.5) * 200
                    );
                }, i * 300);
            }
        }

        console.log('🎉 第一关完成！树精王已被击败！');
    }

    /**
     * 清理关卡
     */
    cleanup() {
        super.cleanup();
        this.backgroundLayers = [];
        console.log('🧹 第一关已清理');
    }
}
