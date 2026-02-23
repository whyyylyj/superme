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
     * 生成平台布局（使用片段系统）
     */
    generatePlatforms() {
        // 使用片段构建器程序化生成关卡
        const builder = new SegmentBuilder();

        // 起始区域（教程）
        builder.addSegment(SEGMENT_LIBRARY.forest.tutorial_start);

        // 平台跳跃教学区
        builder.addSegment(SEGMENT_LIBRARY.forest.low_jump)
               .addSegment(SEGMENT_LIBRARY.forest.basic_ground);

        // 第一个战斗区域
        builder.addSegment(SEGMENT_LIBRARY.forest.small_battle);

        // 多层跳跃挑战
        builder.addSegment(SEGMENT_LIBRARY.forest.multi_layer)
               .addSegment(SEGMENT_LIBRARY.forest.big_gap);

        // 空中战斗区
        builder.addSegment(SEGMENT_LIBRARY.forest.high_platform)
               .addSegment(SEGMENT_LIBRARY.forest.enemy_ambush);

        // 连续跳跃挑战
        builder.addSegment(SEGMENT_LIBRARY.forest.jump_challenge);

        // 隐藏道具区域
        builder.addSegment(SEGMENT_LIBRARY.forest.tree_hideout);

        // Boss 前连续战斗
        builder.addSegment(SEGMENT_LIBRARY.forest.enemy_ambush)
               .addSegment(SEGMENT_LIBRARY.forest.small_battle)
               .addSegment(SEGMENT_LIBRARY.forest.empty)
               .addSegment(SEGMENT_LIBRARY.forest.enemy_ambush);

        // 构建关卡数据
        const levelData = builder.build();

        // 创建平台对象
        levelData.platforms.forEach(p => {
            this.platforms.push(new Platform(p.x, p.y, p.width, p.height, p.color));
        });

        // 更新关卡宽度
        this.config.width = levelData.width;

        console.log(`📐 片段系统构建完成: 宽度=${levelData.width}px, 平台=${levelData.platforms.length}个`);
    }

    /**
     * 生成敌人（使用片段系统）
     */
    generateEnemies() {
        // 使用片段构建器获取敌人数据
        const builder = new SegmentBuilder();

        // 重复使用相同的片段序列（与generatePlatforms保持一致）
        builder.addSegment(SEGMENT_LIBRARY.forest.tutorial_start);
        builder.addSegment(SEGMENT_LIBRARY.forest.low_jump);
        builder.addSegment(SEGMENT_LIBRARY.forest.basic_ground);
        builder.addSegment(SEGMENT_LIBRARY.forest.small_battle);
        builder.addSegment(SEGMENT_LIBRARY.forest.multi_layer);
        builder.addSegment(SEGMENT_LIBRARY.forest.big_gap);
        builder.addSegment(SEGMENT_LIBRARY.forest.high_platform);
        builder.addSegment(SEGMENT_LIBRARY.forest.enemy_ambush);
        builder.addSegment(SEGMENT_LIBRARY.forest.jump_challenge);
        builder.addSegment(SEGMENT_LIBRARY.forest.tree_hideout);
        builder.addSegment(SEGMENT_LIBRARY.forest.enemy_ambush);
        builder.addSegment(SEGMENT_LIBRARY.forest.small_battle);
        builder.addSegment(SEGMENT_LIBRARY.forest.empty);
        builder.addSegment(SEGMENT_LIBRARY.forest.enemy_ambush);

        const levelData = builder.build();

        // 根据片段数据创建敌人
        levelData.enemies.forEach(e => {
            this.spawnEnemyFromData(e.x, e.y, e.type);
        });

        console.log(`👾 片段系统生成敌人: ${levelData.enemies.length}个`);
    }

    /**
     * 从片段数据生成敌人
     */
    spawnEnemyFromData(x, y, type) {
        // 根据类型创建敌人（兼容现有的EnemyTypes系统）
        switch(type) {
            case 'walking':
                this.enemies.push(EnemyTypes.createSlime(x, y));
                break;
            case 'flying':
                this.enemies.push(EnemyTypes.createBat(x, y));
                break;
            case 'goblin':
                this.enemies.push(EnemyTypes.createGoblin(x, y));
                break;
            case 'seedling':
                this.enemies.push(EnemyTypes.createSeedling(x, y));
                break;
            default:
                console.warn(`未知敌人类型: ${type}`);
        }
    }

    /**
     * 生成道具（使用片段系统）
     */
    generatePowerups() {
        // 使用片段构建器获取道具数据
        const builder = new SegmentBuilder();

        // 重复使用相同的片段序列
        builder.addSegment(SEGMENT_LIBRARY.forest.tutorial_start);
        builder.addSegment(SEGMENT_LIBRARY.forest.low_jump);
        builder.addSegment(SEGMENT_LIBRARY.forest.basic_ground);
        builder.addSegment(SEGMENT_LIBRARY.forest.small_battle);
        builder.addSegment(SEGMENT_LIBRARY.forest.multi_layer);
        builder.addSegment(SEGMENT_LIBRARY.forest.big_gap);
        builder.addSegment(SEGMENT_LIBRARY.forest.high_platform);
        builder.addSegment(SEGMENT_LIBRARY.forest.enemy_ambush);
        builder.addSegment(SEGMENT_LIBRARY.forest.jump_challenge);
        builder.addSegment(SEGMENT_LIBRARY.forest.tree_hideout);
        builder.addSegment(SEGMENT_LIBRARY.forest.enemy_ambush);
        builder.addSegment(SEGMENT_LIBRARY.forest.small_battle);
        builder.addSegment(SEGMENT_LIBRARY.forest.empty);
        builder.addSegment(SEGMENT_LIBRARY.forest.enemy_ambush);

        const levelData = builder.build();

        // 根据片段数据创建道具
        levelData.powerups.forEach(p => {
            this.powerups.push(new PowerUp(p.x, p.y, p.type));
        });

        console.log(`🎁 片段系统生成道具: ${levelData.powerups.length}个`);
    }

    /**
     * 生成Boss
     */
    generateBoss() {
        // Boss位于关卡末端（动态计算）
        const bossX = this.config.width - 500;
        this.boss = new TreantKing(bossX, 350);
        console.log(`🌳 Boss位置: ${bossX}`);
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
    update(dt, player, bullets, level) {
        // 更新敌人（传入player和bullets以支持高级AI）
        this.enemies.forEach(e => e.update(dt, player, this.platforms, bullets, level));
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);

        // 更新道具
        this.powerups.forEach(p => p.update(dt, this.platforms));

        // 更新Boss
        if (this.boss && !this.boss.markedForDeletion) {
            this.boss.update(dt, player, this.platforms, bullets, level);
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
