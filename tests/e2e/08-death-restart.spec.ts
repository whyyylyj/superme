/**
 * 测试 08: 死亡后重新开始游戏
 *
 * 验证玩家死亡后点击 "TRY AGAIN" 能从死亡时的关卡重新开始：
 * 1. 开始游戏
 * 2. 故意死亡（跳入深渊或让 HP 归零）
 * 3. 点击 "TRY AGAIN"
 * 4. 验证从当前关卡重新开始
 */

import { test, expect } from '@playwright/test';

test.describe('死亡后重新开始', () => {

    test('死亡后从第一关重新开始', async ({ page }) => {
        // 1. 启动游戏
        await page.goto('/');
        await page.locator('#start-btn').click();
        await page.locator('#gameCanvas[data-ready="1"]').waitFor({ timeout: 10000 });
        await page.waitForTimeout(500);

        // 验证游戏开始，在第一关
        let gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.gameState).toBe('playing');
        expect(gameState.currentLevel).toBe(0); // 第一关索引为 0
        const initialHp = gameState.playerHp;
        console.log(`初始 HP: ${initialHp}, 关卡索引：${gameState.currentLevel}`);

        // 2. 故意死亡：设置 HP 为 0
        await page.evaluate(() => {
            window.setPlayerState({ hp: 0 });
        });
        await page.waitForTimeout(1000);

        // 验证 Game Over 屏幕显示
        const gameOverScreen = page.locator('#game-over-screen');
        await expect(gameOverScreen).toBeVisible({ timeout: 5000 });
        console.log('Game Over 屏幕已显示');

        // 3. 点击 "TRY AGAIN" 按钮
        await page.locator('#restart-btn').click();
        await page.waitForTimeout(1000);

        // 4. 验证从第一关重新开始
        gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.gameState).toBe('playing');
        expect(gameState.currentLevel).toBe(0); // 应该仍然是第一关（索引 0）
        expect(gameState.playerHp).toBeGreaterThan(0); // HP 应该已恢复
        console.log(`重新开始后 HP: ${gameState.playerHp}, 关卡索引：${gameState.currentLevel}`);

        // 验证玩家位置重置到起始点
        expect(gameState.playerX).toBeLessThan(500); // 应该在起始位置附近
        console.log(`重新开始后玩家 X 位置：${gameState.playerX}`);
    });

    test('死亡后返回主菜单', async ({ page }) => {
        // 1. 启动游戏
        await page.goto('/');
        await page.locator('#start-btn').click();
        await page.locator('#gameCanvas[data-ready="1"]').waitFor({ timeout: 10000 });
        await page.waitForTimeout(500);

        // 验证游戏开始
        let gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.gameState).toBe('playing');

        // 2. 故意死亡
        await page.evaluate(() => {
            window.setPlayerState({ hp: 0 });
        });
        await page.waitForTimeout(1000);

        // 验证 Game Over 屏幕显示
        const gameOverScreen = page.locator('#game-over-screen');
        await expect(gameOverScreen).toBeVisible({ timeout: 5000 });

        // 3. 点击 "MAIN MENU" 按钮
        await page.locator('#menu-btn').click();
        await page.waitForTimeout(500);

        // 4. 验证返回主菜单
        const startScreen = page.locator('#start-screen');
        await expect(startScreen).toBeVisible();

        // HUD 应该隐藏
        const hud = page.locator('#hud');
        await expect(hud).not.toBeVisible();

        console.log('已成功返回主菜单');
    });

    test('第二关死亡后从当前关卡重新开始', async ({ page }) => {
        // 1. 从第二关开始游戏
        await page.goto('/');

        // 点击关卡选择按钮，选择第二关
        await page.locator('#level-select-btn').click();
        await page.waitForTimeout(300);
        await page.locator('#level-card-2').click();  // 选择第二关
        await page.waitForTimeout(1000);

        // 验证在第二关
        let gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.currentLevel).toBe(1); // 第二关索引为 1
        console.log(`当前关卡索引：${gameState.currentLevel}`);

        // 2. 故意死亡
        await page.evaluate(() => {
            window.setPlayerState({ hp: 0 });
        });
        await page.waitForTimeout(1000);

        // 验证 Game Over 屏幕显示
        const gameOverScreen = page.locator('#game-over-screen');
        await expect(gameOverScreen).toBeVisible({ timeout: 5000 });

        // 3. 点击 "TRY AGAIN" 按钮
        await page.locator('#restart-btn').click();
        await page.waitForTimeout(1000);

        // 4. 验证从当前关卡重新开始
        gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.gameState).toBe('playing');
        expect(gameState.currentLevel).toBe(1); // 应该是第二关（索引 1）
        expect(gameState.playerHp).toBeGreaterThan(0);
        console.log(`重新开始后关卡索引：${gameState.currentLevel}（应该是 1）`);

        // 断言：必须从当前关卡开始
        if (gameState.currentLevel !== 1) {
            throw new Error(`❌ 失败：应该从当前关卡（索引 1）重新开始，但实际是第 ${gameState.currentLevel + 1} 关`);
        }
    });
});
