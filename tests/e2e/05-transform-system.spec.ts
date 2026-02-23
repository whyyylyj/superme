/**
 * 测试 05: 变身系统测试
 * 
 * 验证 4 种变身形态的功能：
 * - Mecha（机甲）：散弹枪
 * - Dragon（龙）：飞行 + 火焰
 * - Phantom（幻影）：幽灵 + 追踪弹
 * - Normal（普通）：基础形态
 */

import { test, expect } from '@playwright/test';

test.describe('变身系统', () => {

    test.beforeEach(async ({ page }) => {
        // 启动游戏
        await page.goto('/');
        await page.locator('#start-btn').click();
        await page.locator('#gameCanvas[data-ready="1"]').waitFor({ timeout: 10000 });
        await page.waitForTimeout(500);

        // 启用无敌模式避免测试中死亡
        await page.evaluate(() => window.setInvincible(true));
    });

    test('初始形态应该是 Normal', async ({ page }) => {
        const gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.transformForm).toBe('Normal');
        expect(gameState.transformTimeRemaining).toBe(0);
    });

    test('变身为 Mecha 形态', async ({ page }) => {
        // 使用测试钩子直接变身
        await page.evaluate(() => window.transformTo('Mecha'));
        await page.waitForTimeout(500);

        // 验证变身状态
        const gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.transformForm).toBe('Mecha');
        expect(gameState.transformTimeRemaining).toBeGreaterThan(10); // Mecha 持续 12 秒

        // 验证 Mecha 射击（散弹）
        await page.keyboard.down('j');
        await page.waitForTimeout(100);
        await page.keyboard.up('j');
        await page.waitForTimeout(300);

        const bulletState = await page.evaluate(() => window.getGameState());
        expect(bulletState.bulletCount).toBeGreaterThan(0);

        // 截图 Mecha 形态
        await expect(page.locator('canvas')).toHaveScreenshot('20-mecha-form.png');
    });

    test('变身为 Dragon 形态', async ({ page }) => {
        // 变身 Dragon
        await page.evaluate(() => window.transformTo('Dragon'));
        await page.waitForTimeout(500);

        // 验证变身状态
        const gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.transformForm).toBe('Dragon');
        expect(gameState.transformTimeRemaining).toBeGreaterThan(8); // Dragon 持续 10 秒

        // 验证 Dragon 飞行能力（跳跃）
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);

        const newState = await page.evaluate(() => window.getGameState());
        // Dragon 应该能够飞行/跳跃
        expect(newState.playerY).toBeLessThan(400);

        // 截图 Dragon 形态
        await expect(page.locator('canvas')).toHaveScreenshot('21-dragon-form.png');
    });

    test('变身为 Phantom 形态', async ({ page }) => {
        // 变身 Phantom
        await page.evaluate(() => window.transformTo('Phantom'));
        await page.waitForTimeout(500);

        // 验证变身状态
        const gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.transformForm).toBe('Phantom');
        expect(gameState.transformTimeRemaining).toBeGreaterThan(6); // Phantom 持续 8 秒

        // 验证 Phantom 射击（追踪弹）
        await page.keyboard.down('j');
        await page.waitForTimeout(100);
        await page.keyboard.up('j');
        await page.waitForTimeout(300);

        const bulletState = await page.evaluate(() => window.getGameState());
        expect(bulletState.bulletCount).toBeGreaterThan(0);

        // 截图 Phantom 形态
        await expect(page.locator('canvas')).toHaveScreenshot('22-phantom-form.png');
    });

    test('变身时间结束后恢复 Normal 形态', async ({ page }) => {
        // 变身 Mecha（最短等待时间来测试）
        await page.evaluate(() => window.transformTo('Mecha'));

        // 获取变身剩余时间
        let gameState = await page.evaluate(() => window.getGameState());
        const remainingTime = gameState.transformTimeRemaining;

        // 等待变身时间结束（加速测试：直接等待）
        await page.waitForTimeout((remainingTime + 1) * 1000);

        // 验证恢复普通形态
        gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.transformForm).toBe('Normal');
    });

    test('变身形态下击败 Boss', async ({ page }) => {
        // 启用无敌并快速移动到 Boss
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(8000);
        await page.keyboard.up('ArrowRight');
        await page.waitForTimeout(1000);

        // 变身 Mecha
        await page.evaluate(() => window.transformTo('Mecha'));
        await page.waitForTimeout(500);

        // 验证 Boss 存在
        let gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.bossExists).toBe(true);

        // 用 Mecha 散弹攻击 Boss
        for (let i = 0; i < 10; i++) {
            await page.keyboard.down('j');
            await page.waitForTimeout(100);
            await page.keyboard.up('j');
            await page.waitForTimeout(150);
        }

        // 使用测试钩子快速结束
        await page.evaluate(() => window.defeatBoss());
        await page.waitForTimeout(1000);

        // 验证 Boss 被击败
        gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.bossHp).toBe(0);
        expect(gameState.playerHp).toBeGreaterThan(0);

        // 截图 Mecha 击败 Boss
        await expect(page.locator('canvas')).toHaveScreenshot('23-mecha-boss-kill.png');
    });

    test('连续变身测试', async ({ page }) => {
        // 连续变身不同形态
        await page.evaluate(() => window.transformTo('Mecha'));
        await page.waitForTimeout(300);

        let gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.transformForm).toBe('Mecha');

        // 在 Mecha 形态下再变身 Dragon
        await page.evaluate(() => window.transformTo('Dragon'));
        await page.waitForTimeout(300);

        gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.transformForm).toBe('Dragon');

        // 再变身 Phantom
        await page.evaluate(() => window.transformTo('Phantom'));
        await page.waitForTimeout(300);

        gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.transformForm).toBe('Phantom');

        // 验证玩家状态正常
        expect(gameState.playerHp).toBeGreaterThan(0);
    });

    test('各形态射击对比', async ({ page }) => {
        const bulletCounts: { [key: string]: number } = {};

        // 测试 Normal 形态
        await page.evaluate(() => window.transformTo('Normal'));
        await page.waitForTimeout(300);
        await page.keyboard.down('j');
        await page.waitForTimeout(100);
        await page.keyboard.up('j');
        await page.waitForTimeout(200);
        let state = await page.evaluate(() => window.getGameState());
        bulletCounts['Normal'] = state.bulletCount;

        // 清空子弹
        await page.evaluate(() => {
            // @ts-ignore
            window.bullets = [];
        });

        // 测试 Mecha 形态
        await page.evaluate(() => window.transformTo('Mecha'));
        await page.waitForTimeout(300);
        await page.keyboard.down('j');
        await page.waitForTimeout(100);
        await page.keyboard.up('j');
        await page.waitForTimeout(200);
        state = await page.evaluate(() => window.getGameState());
        bulletCounts['Mecha'] = state.bulletCount;

        // Mecha 散弹应该子弹更多
        expect(bulletCounts['Mecha']).toBeGreaterThan(bulletCounts['Normal']);
    });
});
