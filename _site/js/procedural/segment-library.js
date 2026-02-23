/**
 * 关卡片段库
 * 定义可重用的关卡片段，用于程序化生成
 *
 * 片段结构:
 * - width: 片段宽度（像素）
 * - platforms: 平台数组 [{x, y, width, height, type}]
 * - enemies: 敌人数组（可选）[{x, y, type}]
 * - powerup: 道具对象（可选）{x, y, type}
 * - description: 片段描述
 */

const SEGMENT_LIBRARY = {
    // 第一关：像素森林片段
    forest: {
        // 空地片段（用于战斗区域）
        empty: {
            width: 800,
            platforms: [],
            enemies: [],
            description: "空地片段，纯战斗区域"
        },

        // 基础地面
        basic_ground: {
            width: 800,
            platforms: [
                { x: 0, y: 500, width: 800, height: 40, type: 'ground' }
            ],
            powerup: { x: 400, y: 450, type: 'health_pack' },
            description: "基础地面片段"
        },

        // 补给点
        health_oasis: {
            width: 600,
            platforms: [
                { x: 0, y: 500, width: 600, height: 40, type: 'ground' },
                { x: 150, y: 380, width: 300, height: 40, type: 'platform' }
            ],
            powerups: [
                { x: 200, y: 330, type: 'health_pack' },
                { x: 300, y: 330, type: 'health_pack' },
                { x: 400, y: 330, type: 'health_pack' }
            ],
            description: "生命补给绿洲"
        },

        // 低跳平台（教学用）
        low_jump: {
            width: 600,
            platforms: [
                { x: 0, y: 500, width: 200, height: 40, type: 'ground' },
                { x: 250, y: 450, width: 150, height: 40, type: 'platform' },
                { x: 450, y: 500, width: 150, height: 40, type: 'ground' }
            ],
            description: "低跳训练片段"
        },

        // 树洞平台（隐藏道具）
        tree_hideout: {
            width: 800,
            platforms: [
                { x: 0, y: 500, width: 300, height: 40, type: 'ground' },
                { x: 350, y: 500, width: 100, height: 40, type: 'ground' }, // 树洞入口
                { x: 500, y: 450, width: 100, height: 40, type: 'platform', hasSecret: true },
                { x: 650, y: 500, width: 150, height: 40, type: 'ground' }
            ],
            powerup: { x: 550, y: 400, type: 'fire_flower' },
            description: "树洞隐藏道具片段"
        },

        // 敌人埋伏
        enemy_ambush: {
            width: 1000,
            platforms: [
                { x: 0, y: 500, width: 1000, height: 40, type: 'ground' },
                { x: 300, y: 400, width: 100, height: 40, type: 'platform' },
                { x: 600, y: 350, width: 100, height: 40, type: 'platform' }
            ],
            enemies: [
                { x: 400, y: 450, type: 'walking' },
                { x: 700, y: 300, type: 'flying' },
                { x: 900, y: 450, type: 'walking' }
            ],
            description: "敌人埋伏片段"
        },

        // 多层跳跃
        multi_layer: {
            width: 700,
            platforms: [
                { x: 0, y: 500, width: 150, height: 40, type: 'ground' },
                { x: 200, y: 420, width: 100, height: 40, type: 'platform' },
                { x: 350, y: 340, width: 100, height: 40, type: 'platform' },
                { x: 500, y: 260, width: 100, height: 40, type: 'platform' },
                { x: 600, y: 500, width: 100, height: 40, type: 'ground' }
            ],
            description: "多层跳跃挑战片段"
        },

        // 大 gap 跳跃
        big_gap: {
            width: 900,
            platforms: [
                { x: 0, y: 500, width: 200, height: 40, type: 'ground' },
                { x: 350, y: 500, width: 200, height: 40, type: 'ground' },
                { x: 700, y: 500, width: 200, height: 40, type: 'ground' }
            ],
            description: "大 gap 跳跃片段"
        },

        // 起始区域（教程区）
        tutorial_start: {
            width: 1200,
            platforms: [
                { x: 0, y: 500, width: 1200, height: 40, type: 'ground' },
                { x: 300, y: 400, width: 100, height: 40, type: 'platform' },
                { x: 600, y: 350, width: 100, height: 40, type: 'platform' }
            ],
            enemies: [
                { x: 500, y: 450, type: 'walking' }
            ],
            powerup: { x: 650, y: 300, type: 'giant_mushroom' },
            description: "起始教程区域"
        },

        // 小战斗区
        small_battle: {
            width: 800,
            platforms: [
                { x: 0, y: 500, width: 800, height: 40, type: 'ground' },
                { x: 200, y: 380, width: 80, height: 40, type: 'platform' },
                { x: 520, y: 380, width: 80, height: 40, type: 'platform' }
            ],
            enemies: [
                { x: 300, y: 450, type: 'walking' },
                { x: 600, y: 450, type: 'walking' }
            ],
            powerup: { x: 400, y: 330, type: 'health_pack' },
            description: "小型战斗区域"
        },

        // 高空平台（竹蜻蜓教学）
        high_platform: {
            width: 600,
            platforms: [
                { x: 0, y: 500, width: 100, height: 40, type: 'ground' },
                { x: 150, y: 350, width: 100, height: 40, type: 'platform' },
                { x: 350, y: 250, width: 100, height: 40, type: 'platform' },
                { x: 500, y: 500, width: 100, height: 40, type: 'ground' }
            ],
            powerups: [
                { x: 400, y: 200, type: 'bamboo' },
                { x: 50, y: 450, type: 'gold_bullet' }
            ],
            enemies: [
                { x: 200, y: 300, type: 'flying' }
            ],
            description: "高空平台竹蜻蜓教学"
        },

        // 连续跳跃挑战
        jump_challenge: {
            width: 800,
            platforms: [
                { x: 0, y: 500, width: 100, height: 40, type: 'ground' },
                { x: 150, y: 450, width: 60, height: 40, type: 'platform' },
                { x: 280, y: 400, width: 60, height: 40, type: 'platform' },
                { x: 410, y: 350, width: 60, height: 40, type: 'platform' },
                { x: 540, y: 400, width: 60, height: 40, type: 'platform' },
                { x: 670, y: 450, width: 60, height: 40, type: 'platform' },
                { x: 740, y: 500, width: 60, height: 40, type: 'ground' }
            ],
            description: "连续跳跃挑战片段"
        }
    },

    // 第二关：地狱熔岩片段（预留）
    nether: {
        lava_pool: {
            width: 800,
            platforms: [],
            description: "岩浆池片段（待实现）"
        }
    },

    // 第三关：天空圣殿片段（预留）
    sky: {
        aerial_platforms: {
            width: 800,
            platforms: [],
            description: "空中平台片段（待实现）"
        }
    }
};

// 导出片段库
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEGMENT_LIBRARY;
}
