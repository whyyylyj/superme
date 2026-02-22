// js/levels/level1-forest.js

/**
 * Level1Forest - 第一关：像素森林（临时包装器）
 * 将现有的 LevelMap.generate() 包装成 LevelBase 接口
 */
class Level1Forest extends LevelBase {
    constructor() {
        super(1, 'Pixel Forest', {
            width: 4000,
            height: 600,
            bgColor: CONFIG.COLORS.LEVEL1.bg,
        });
    }

    init() {
        // 调用原有的 LevelMap.generate()
        LevelMap.generate();

        // 将生成的数据复制到本关卡
        this.platforms = LevelMap.platforms;
        this.enemies = LevelMap.enemies;
        this.powerups = LevelMap.powerups;
        this.boss = LevelMap.boss;

        console.log('Level1Forest initialized');
    }

    drawBackground(ctx, cameraX, cameraY, canvas) {
        LevelMap.drawBackground(ctx, cameraX, cameraY, canvas);
    }
}
