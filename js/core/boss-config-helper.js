/**
 * boss-config-helper.js
 *
 * BossConfigHelper - Boss 配置辅助工具
 * 
 * 提供便捷方法访问 Boss 配置，支持动态调整和配置验证
 *
 * 使用方法:
 *   const config = BossConfigHelper.getBossConfig(1);  // 获取第一关 Boss 配置
 *   BossConfigHelper.setDifficulty('easy');            // 设置简单难度
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

const BossConfigHelper = {
    /**
     * 当前难度级别
     * 'easy', 'normal', 'hard'
     */
    currentDifficulty: 'normal',

    /**
     * 难度乘数
     */
    difficultyMultipliers: {
        easy: { hp: 0.7, damage: 0.7, speed: 0.9, bulletCount: 0.7 },
        normal: { hp: 1.0, damage: 1.0, speed: 1.0, bulletCount: 1.0 },
        hard: { hp: 1.5, damage: 1.3, speed: 1.2, bulletCount: 1.3 },
    },

    /**
     * 获取 Boss 配置
     * @param {number} level - 关卡编号 (1-3)
     * @returns {Object} Boss 配置对象
     */
    getBossConfig(level) {
        switch (level) {
            case 1:
                return BossConfig.LEVEL1.TREANT_KING;
            case 2:
                return BossConfig.LEVEL2.INFERNO_DRAGON;
            case 3:
                return BossConfig.LEVEL3.SKY_TYRANT;
            default:
                console.warn(`Unknown level: ${level}`);
                return null;
        }
    },

    /**
     * 获取 Boss 基础属性（用于构造函数）
     * @param {number} level - 关卡编号
     * @returns {Object} 基础属性对象
     */
    getBossBaseStats(level) {
        const config = this.getBossConfig(level);
        if (!config) return null;

        return {
            name: config.name,
            maxHp: config.maxHp,
            hp: config.maxHp,
            phaseCount: config.phaseCount,
            width: config.width,
            height: config.height,
            color: config.color,
            themeColor: config.themeColor,
            canFly: config.canFly,
            speed: config.speed,
            damage: config.damage,
        };
    },

    /**
     * 设置难度级别
     * @param {string} difficulty - 'easy', 'normal', 'hard'
     */
    setDifficulty(difficulty) {
        if (!this.difficultyMultipliers[difficulty]) {
            console.warn(`Unknown difficulty: ${difficulty}`);
            return;
        }
        
        this.currentDifficulty = difficulty;
        console.log(`Difficulty set to: ${difficulty}`);
    },

    /**
     * 应用难度乘数到 Boss 配置
     * @param {Object} config - Boss 配置对象
     * @returns {Object} 调整后的配置
     */
    applyDifficulty(config) {
        const mult = this.difficultyMultipliers[this.currentDifficulty];
        
        return {
            ...config,
            maxHp: Math.floor(config.maxHp * mult.hp),
            damage: Math.floor(config.damage * mult.damage),
            speed: config.speed * mult.speed,
        };
    },

    /**
     * 获取弹幕配置
     * @param {number} level - 关卡编号
     * @param {string} bulletType - 弹幕类型 (如 'leafCircle', 'fireballCircle')
     * @returns {Object} 弹幕配置对象
     */
    getBulletConfig(level, bulletType) {
        const config = this.getBossConfig(level);
        if (!config || !config.bullets[bulletType]) {
            console.warn(`Bullet config not found: ${bulletType}`);
            return null;
        }
        return config.bullets[bulletType];
    },

    /**
     * 获取阶段转换阈值
     * @param {number} level - 关卡编号
     * @returns {Array<number>} 阶段阈值数组
     */
    getPhaseThresholds(level) {
        const config = this.getBossConfig(level);
        if (!config) return [0.5];

        if (config.phaseThresholds) {
            return config.phaseThresholds;
        }

        // 兼容旧格式
        const thresholds = [];
        if (config.phase2Threshold) thresholds.push(config.phase2Threshold);
        if (config.phase3Threshold) thresholds.push(config.phase3Threshold);
        return thresholds;
    },

    /**
     * 获取攻击冷却时间
     * @param {number} level - 关卡编号
     * @param {number} phase - 当前阶段
     * @returns {number} 冷却时间（秒）
     */
    getAttackCooldown(level, phase) {
        const config = this.getBossConfig(level);
        if (!config || !config.attackCooldown) return 1.0;

        const key = `phase${phase}`;
        return config.attackCooldown[key] || 1.0;
    },

    /**
     * 获取召唤配置
     * @param {number} level - 关卡编号
     * @returns {Object} 召唤配置对象
     */
    getSummonConfig(level) {
        const config = this.getBossConfig(level);
        if (!config || !config.summon) return null;
        return config.summon;
    },

    /**
     * 验证配置值是否在合理范围内
     * @param {string} key - 配置键
     * @param {any} value - 配置值
     * @returns {boolean} 是否有效
     */
    validateConfigValue(key, value) {
        const ranges = {
            maxHp: { min: 50, max: 2000 },
            damage: { min: 1, max: 10 },
            speed: { min: 20, max: 300 },
            width: { min: 50, max: 300 },
            height: { min: 50, max: 300 },
            bulletCount: { min: 1, max: 100 },
            bulletSpeed: { min: 100, max: 1000 },
            cooldown: { min: 0.1, max: 10 },
        };

        const range = ranges[key];
        if (!range) return true;  // 未知键，默认有效

        return value >= range.min && value <= range.max;
    },

    /**
     * 批量验证 Boss 配置
     * @param {number} level - 关卡编号
     * @returns {Array<string>} 警告信息数组
     */
    validateBossConfig(level) {
        const config = this.getBossConfig(level);
        if (!config) return ['Config not found'];

        const warnings = [];

        // 验证基础属性
        if (!this.validateConfigValue('maxHp', config.maxHp)) {
            warnings.push(`maxHp ${config.maxHp} out of range`);
        }
        if (!this.validateConfigValue('damage', config.damage)) {
            warnings.push(`damage ${config.damage} out of range`);
        }
        if (!this.validateConfigValue('speed', config.speed)) {
            warnings.push(`speed ${config.speed} out of range`);
        }

        // 验证弹幕配置
        if (config.bullets) {
            for (const [bulletType, bulletConfig] of Object.entries(config.bullets)) {
                if (bulletConfig.baseSpeed && 
                    !this.validateConfigValue('bulletSpeed', bulletConfig.baseSpeed)) {
                    warnings.push(`${bulletType} baseSpeed out of range`);
                }
            }
        }

        return warnings;
    },

    /**
     * 打印配置信息到控制台
     * @param {number} level - 关卡编号
     */
    logConfig(level) {
        const config = this.getBossConfig(level);
        console.group(`Boss Config - Level ${level}`);
        console.log('Base Stats:', {
            name: config.name,
            hp: config.maxHp,
            size: `${config.width}x${config.height}`,
            speed: config.speed,
            damage: config.damage,
        });
        console.log('Phases:', config.phaseCount);
        console.log('Attack Cooldowns:', config.attackCooldown);
        if (config.bullets) {
            console.log('Bullet Types:', Object.keys(config.bullets));
        }
        if (config.summon) {
            console.log('Summon:', config.summon);
        }
        console.groupEnd();
    },

    /**
     * 导出配置为 JSON
     * @param {number} level - 关卡编号
     * @returns {string} JSON 字符串
     */
    exportConfig(level) {
        const config = this.getBossConfig(level);
        return JSON.stringify(config, null, 2);
    },

    /**
     * 从 JSON 导入配置（用于运行时调整）
     * @param {number} level - 关卡编号
     * @param {string} json - JSON 字符串
     */
    importConfig(level, json) {
        try {
            const newConfig = JSON.parse(json);
            
            switch (level) {
                case 1:
                    BossConfig.LEVEL1.TREANT_KING = { 
                        ...BossConfig.LEVEL1.TREANT_KING, 
                        ...newConfig 
                    };
                    break;
                case 2:
                    BossConfig.LEVEL2.INFERNO_DRAGON = { 
                        ...BossConfig.LEVEL2.INFERNO_DRAGON, 
                        ...newConfig 
                    };
                    break;
                case 3:
                    BossConfig.LEVEL3.SKY_TYRANT = { 
                        ...BossConfig.LEVEL3.SKY_TYRANT, 
                        ...newConfig 
                    };
                    break;
            }
            
            console.log(`Config imported for level ${level}`);
            const warnings = this.validateBossConfig(level);
            if (warnings.length > 0) {
                console.warn('Validation warnings:', warnings);
            }
        } catch (e) {
            console.error('Failed to import config:', e);
        }
    },
};
