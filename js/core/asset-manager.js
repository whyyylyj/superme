// js/core/asset-manager.js

/**
 * CONFIG - 全局配置和常量
 * 集中管理游戏参数，便于平衡性调整
 */
const CONFIG = {
    // 画布尺寸
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // 玩家配置
    PLAYER: {
        BASE_SPEED: 300,
        JUMP_FORCE: -600,
        GRAVITY: 1500,
        MAX_HP: 5,               // 从 3 提升到 5
        MAX_JUMPS: 3,
        DAMAGE_COOLDOWN: 1.0,
        SHOOT_COOLDOWN_NORMAL: 0.2,
        SHOOT_COOLDOWN_RAPID: 0.08,
        SHOOT_COOLDOWN_SPREAD: 0.3,
        BULLET_SPEED: 800,
        WIDTH: 30,
        HEIGHT: 40,
    },

    // 弹幕配置
    DANMAKU: {
        MAX_BULLETS: 500,
        BULLET_POOL_SIZE: 600,
        DEFAULT_BULLET_LIFE: 120,
    },

    // 关卡配置
    LEVELS: {
        TOTAL: 3,
        TRANSITION_DURATION: 2.0,
    },

    // 颜色主题
    COLORS: {
        LEVEL1: {
            primary: '#00ff88',
            secondary: '#88ff00',
            bg: '#0a1a0a',
            platform: '#2a4a2a',
            accent: '#44cc44',
        },
        LEVEL2: {
            primary: '#ff4400',
            secondary: '#ffaa00',
            bg: '#1a0a00',
            platform: '#4a2a1a',
            accent: '#ff6600',
        },
        LEVEL3: {
            primary: '#aaaaff',
            secondary: '#ffffff',
            bg: '#0a0a2a',
            platform: '#2a2a4a',
            accent: '#8888ff',
        },
    },

    // 变身形态颜色
    FORMS: {
        NORMAL: '#00ffcc',
        MECHA: '#cccccc',
        DRAGON: '#ff6600',
        PHANTOM: '#aa00ff',
    },

    // 道具配置
    POWERUPS: {
        BAMBOO: {
            DURATION: 15,
        },
        STAR: {
            DURATION: 10,
        },
        SHIELD: {
            DURATION: 0, // Until hit
        },
        SPEED: {
            DURATION: 8,
            BOOSTED_SPEED: 500,
        },
    }
};
