#!/usr/bin/env node

/**
 * 井字棋奖励系统测试
 */

// 模拟浏览器环境
global.window = {};
global.CONFIG = {
    PLAYER: {
        MAX_HP: 5
    }
};

// 加载奖励系统
require('./js/minigame/reward-system.js');

// 从全局作用域获取类（在Node.js中是global.RewardSystem）
const RewardSystem = global.RewardSystem || globalThis.RewardSystem;

if (!RewardSystem) {
    console.error('❌ 无法加载RewardSystem类');
    process.exit(1);
}

// 运行测试
const stats = RewardSystem.testProbabilityDistribution(1000);
console.log('\n=== 井字棋奖励概率分布测试 (1000次) ===\n');

let allPassed = true;

for (const id in stats) {
    const s = stats[id];
    const expectedPct = (s.expected * 100).toFixed(1);
    const actualPct = (s.actual * 100).toFixed(1);
    const diff = ((s.actual - s.expected) * 100).toFixed(2);

    console.log(`${s.name}:`);
    console.log(`  期望: ${expectedPct}% | 实际: ${actualPct}% | 差异: ${diff}%`);

    // 检查是否在合理范围内（±3%）
    if (Math.abs(parseFloat(diff)) > 3) {
        allPassed = false;
    }
}

console.log('\n' + (allPassed ? '✅ 测试通过' : '❌ 测试失败'));
console.log('所有概率分布都在合理范围内（±3%）');

process.exit(allPassed ? 0 : 1);
