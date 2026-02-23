/**
 * 井字棋奖励系统
 *
 * 功能：
 * - 5种随机奖励类型
 * - 概率分布：无敌(30%), 满HP(25%), 散射(20%), 速射(15%), 无限子弹(10%)
 * - 自动应用到玩家实例
 */

class RewardSystem {
    /**
     * 奖励类型配置
     */
    static REWARD_TYPES = {
        INVINCIBLE: {
            id: 'invincible',
            name: '20秒无敌',
            probability: 0.30,
            duration: 20,
            apply: (player) => {
                player.invincible = true;
                player.invincibleTimer = 20;
            }
        },
        FULL_HP: {
            id: 'full_hp',
            name: '满HP恢复',
            probability: 0.25,
            duration: 0,
            apply: (player) => {
                player.hp = CONFIG.PLAYER.MAX_HP;
            }
        },
        SPREAD: {
            id: 'spread',
            name: '散射武器',
            probability: 0.20,
            duration: 15,
            apply: (player) => {
                player.weapon = 'spread';
                player.shootCooldown = 0;
            }
        },
        RAPID: {
            id: 'rapid',
            name: '速射武器',
            probability: 0.15,
            duration: 15,
            apply: (player) => {
                player.weapon = 'rapid';
                player.shootCooldown = 0;
            }
        },
        INFINITE_AMMO: {
            id: 'infinite_ammo',
            name: '无限子弹',
            probability: 0.10,
            duration: 5,
            apply: (player) => {
                player.infiniteAmmo = true;
                player.infiniteAmmoTimer = 5;
            }
        }
    };

    constructor() {
        // 按照概率分布构建累积概率数组
        this.rewardList = [];
        this.cumulativeProbability = 0;

        for (const typeKey in RewardSystem.REWARD_TYPES) {
            const type = RewardSystem.REWARD_TYPES[typeKey];
            this.cumulativeProbability += type.probability;
            this.rewardList.push({
                ...type,
                cumulativeProbability: this.cumulativeProbability
            });
        }
    }

    /**
     * 随机选择一个奖励
     * @returns {Object} 奖励对象
     */
    getRandomReward() {
        const rand = Math.random();

        for (const reward of this.rewardList) {
            if (rand <= reward.cumulativeProbability) {
                return reward;
            }
        }

        // 默认返回第一个奖励（保护性代码）
        return this.rewardList[0];
    }

    /**
     * 应用奖励到玩家
     * @param {Player} player - 玩家实例
     * @param {Object} reward - 奖励对象（可选，如果不提供则随机选择）
     * @returns {Object} 应用的奖励对象
     */
    applyReward(player, reward = null) {
        if (!reward) {
            reward = this.getRandomReward();
        }

        reward.apply(player);

        return reward;
    }

    /**
     * 测试概率分布（运行指定次数的模拟）
     * @param {number} iterations - 测试次数
     * @returns {Object} 统计结果
     */
    static testProbabilityDistribution(iterations = 1000) {
        const system = new RewardSystem();
        const stats = {};

        // 初始化统计
        for (const typeKey in RewardSystem.REWARD_TYPES) {
            const type = RewardSystem.REWARD_TYPES[typeKey];
            stats[type.id] = {
                name: type.name,
                expected: type.probability,
                count: 0,
                actual: 0
            };
        }

        // 运行模拟
        for (let i = 0; i < iterations; i++) {
            const reward = system.getRandomReward();
            stats[reward.id].count++;
        }

        // 计算实际概率
        for (const id in stats) {
            stats[id].actual = stats[id].count / iterations;
        }

        return stats;
    }
}

// 创建全局单例
if (typeof window !== 'undefined') {
    window.RewardSystemInstance = new RewardSystem();
    window.RewardSystem = RewardSystem; // 同时导出类本身
} else if (typeof global !== 'undefined') {
    global.RewardSystemInstance = new RewardSystem();
    global.RewardSystem = RewardSystem; // Node.js环境导出类本身
}

// 测试代码（仅在浏览器控制台手动调用时执行）
if (typeof window !== 'undefined') {
    window.testRewardDistribution = (iterations = 1000) => {
        const stats = RewardSystem.testProbabilityDistribution(iterations);
        console.log(`\n=== 井字棋奖励概率分布测试 (${iterations}次) ===\n`);

        for (const id in stats) {
            const s = stats[id];
            const expectedPct = (s.expected * 100).toFixed(1);
            const actualPct = (s.actual * 100).toFixed(1);
            const diff = ((s.actual - s.expected) * 100).toFixed(2);

            console.log(`${s.name}:`);
            console.log(`  期望: ${expectedPct}% | 实际: ${actualPct}% | 差异: ${diff}%`);
        }

        console.log('\n测试完成！');
        return stats;
    };
}

// Node.js环境导出（用于测试）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RewardSystem };
}
