/**
 * bullet-genes.js
 *
 * 弹幕基因系统
 * 定义弹幕的可变参数和变异规则
 *
 * 特性:
 * - 速度基因：控制弹幕飞行速度
 * - 角度基因：控制弹幕发射角度
 * - 大小基因：控制弹幕尺寸
 * - 颜色基因：分关卡配色方案
 * - 发射频率基因：控制弹幕发射间隔
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

const BULLET_GENES = {
    // 速度基因
    speed: {
        base: 200,          // 基础速度（像素/秒）
        min: 100,           // 最小速度
        max: 500,           // 最大速度
        variance: 0.2,      // 变异幅度（±20%）
        mutationRate: 0.05  // 每代变异率
    },

    // 角度基因
    angle: {
        base: 0,            // 基础角度（弧度）
        variance: Math.PI / 18,  // 变异幅度（±10°）
        mutationRate: 0.1
    },

    // 大小基因
    size: {
        base: 8,            // 基础大小（像素）
        min: 4,
        max: 16,
        variance: 0.25,
        mutationRate: 0.05
    },

    // 颜色基因
    color: {
        // 第一关配色方案（绿色系 - 森林主题）
        level1: ['#00ff00', '#32cd32', '#90ee90', '#98fb98', '#00ff7f', '#4a7c43'],
        // 第二关配色方案（红色系 - 地狱熔岩）
        level2: ['#ff0000', '#ff4500', '#ff6347', '#ff7f50', '#ffa500', '#dc143c'],
        // 第三关配色方案（蓝色系 - 天空圣殿）
        level3: ['#00bfff', '#1e90ff', '#4169e1', '#6495ed', '#87ceeb', '#00ffff']
    },

    // 发射频率基因
    fireRate: {
        base: 0.3,          // 基础发射间隔（秒）
        min: 0.1,
        max: 1.0,
        variance: 0.3,
        mutationRate: 0.05
    },

    // 弹幕密度基因
    density: {
        base: 1.0,          // 基础密度倍率
        min: 0.5,
        max: 2.0,
        variance: 0.2,
        mutationRate: 0.1
    }
};

/**
 * 弹幕基因变异器
 * 负责对弹幕参数进行随机变异
 */
class BulletMutator {
    /**
     * 对单个值进行变异
     * @param {number} value - 原始值
     * @param {Object} geneConfig - 基因配置
     * @returns {number} 变异后的值
     */
    static mutate(value, geneConfig) {
        const variance = value * geneConfig.variance;
        const mutation = (Math.random() - 0.5) * 2 * variance;
        const mutated = value + mutation;

        // 限制在最小/最大值之间
        if (geneConfig.min !== undefined && geneConfig.max !== undefined) {
            return Math.max(geneConfig.min, Math.min(geneConfig.max, mutated));
        }

        return mutated;
    }

    /**
     * 从配色方案中随机选择颜色
     * @param {number} levelIndex - 关卡索引（0, 1, 2）
     * @returns {string} 颜色值
     */
    static mutateColor(levelIndex) {
        const palettes = [
            BULLET_GENES.color.level1,
            BULLET_GENES.color.level2,
            BULLET_GENES.color.level3
        ];
        const palette = palettes[levelIndex] || palettes[0];
        return palette[Math.floor(Math.random() * palette.length)];
    }

    /**
     * 批量变异弹幕参数
     * @param {Object} params - 原始参数
     * @param {number} levelIndex - 关卡索引
     * @returns {Object} 变异后的参数
     */
    static mutatePattern(params, levelIndex = 0) {
        const result = {};

        // 变异速度
        if (params.speed !== undefined) {
            result.speed = this.mutate(params.speed, BULLET_GENES.speed);
        } else {
            result.speed = BULLET_GENES.speed.base;
        }

        // 变异角度偏移
        result.angleOffset = params.angleOffset || 0;
        result.angleOffset += this.mutate(0, BULLET_GENES.angle);

        // 变异大小
        if (params.size !== undefined) {
            result.size = this.mutate(params.size, BULLET_GENES.size);
        } else {
            result.size = BULLET_GENES.size.base;
        }

        // 变异颜色
        result.color = params.color || this.mutateColor(levelIndex);

        // 变异发射频率
        if (params.fireRate !== undefined) {
            result.fireRate = this.mutate(params.fireRate, BULLET_GENES.fireRate);
        } else {
            result.fireRate = BULLET_GENES.fireRate.base;
        }

        // 变异密度
        if (params.density !== undefined) {
            result.density = this.mutate(params.density, BULLET_GENES.density);
        } else {
            result.density = BULLET_GENES.density.base;
        }

        return result;
    }

    /**
     * 应用密度倍率到弹幕数量
     * @param {number} baseCount - 基础数量
     * @param {number} density - 密度倍率
     * @returns {number} 调整后的数量
     */
    static applyDensity(baseCount, density) {
        return Math.max(1, Math.floor(baseCount * density));
    }

    /**
     * 递进变异 - 随时间增加变异强度
     * @param {Object} params - 基础参数
     * @param {number} levelIndex - 关卡索引
     * @param {number} intensity - 变异强度（0-1）
     * @returns {Object} 变异后的参数
     */
    static progressiveMutate(params, levelIndex, intensity = 0) {
        const mutated = this.mutatePattern(params, levelIndex);

        // 根据强度调整变异幅度
        const speedMultiplier = 1 + intensity * 0.5;
        mutated.speed *= speedMultiplier;

        const fireRateMultiplier = 1 - intensity * 0.3; // 发射更快
        mutated.fireRate = Math.max(BULLET_GENES.fireRate.min, mutated.fireRate * fireRateMultiplier);

        return mutated;
    }

    /**
     * 克隆并变异参数（用于生成一组略有不同的弹幕）
     * @param {Object} params - 原始参数
     * @param {number} count - 克隆数量
     * @param {number} levelIndex - 关卡索引
     * @returns {Array} 变异后的参数数组
     */
    static cloneAndMutate(params, count, levelIndex = 0) {
        const clones = [];
        for (let i = 0; i < count; i++) {
            clones.push(this.mutatePattern(params, levelIndex));
        }
        return clones;
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.BULLET_GENES = BULLET_GENES;
    window.BulletMutator = BulletMutator;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BULLET_GENES, BulletMutator };
}
