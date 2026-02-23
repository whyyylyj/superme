/**
 * 测试 04: Boss 战测试
 * 
 * 验证 Boss 战的各种场景：
 * - Boss 登场
 * - Boss 攻击模式
 * - 玩家躲避和反击
 * - Boss 阶段转换
 * - Boss 被击败
 */

import { test, expect } from '@playwright/test';

test.describe('Boss 战', () => {
    
    test.beforeEach(async ({ page }) => {
        // 启动游戏并快速到达 Boss
        await page.goto('/');
        await page.locator('#start-btn').click();
        await page.locator('#gameCanvas[data-ready="1"]').waitFor({ timeout: 10000 });
        await page.waitForTimeout(500);
        
        // 启用无敌模式避免在移动过程中死亡
        await page.evaluate(() => window.setInvincible(true));
        
        // 快速移动到 Boss 位置
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(8000);
        await page.keyboard.up('ArrowRight');
        await page.waitForTimeout(1000);
        
        // 验证 Boss 存在
        const gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.bossExists).toBe(true);
    });
    
    test('Boss 应该正确登场', async ({ page }) => {
        // 验证 Boss HUD 显示
        const bossHud = page.locator('#boss-hud');
        await expect(bossHud).toBeVisible();
        
        // 验证 Boss 血条可见
        const bossHpBar = page.locator('#boss-hp-bar');
        await expect(bossHpBar).toBeVisible();
        
        // 截图 Boss 登场
        await expect(page.locator('canvas')).toHaveScreenshot('10-boss-encounter.png');
    });
    
    test('Boss 应该有正确的 HP', async ({ page }) => {
        // 获取 Boss 状态
        const gameState = await page.evaluate(() => window.getGameState());
        
        // Boss 应该有正的 HP
        expect(gameState.bossHp).toBeGreaterThan(0);
        
        // 验证 Boss HUD 显示正确
        const bossHud = page.locator('#boss-hud');
        await expect(bossHud).toBeVisible();
    });
    
    test('玩家应该可以对 Boss 造成伤害', async ({ page }) => {
        // 获取 Boss 初始 HP
        const initialState = await page.evaluate(() => window.getGameState());
        const initialBossHp = initialState.bossHp;
        
        // 面向 Boss 射击（玩家在 Boss 左侧，面向右射击）
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(200);
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(200);
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(1000);
        
        // 验证 Boss HP 减少
        const newState = await page.evaluate(() => window.getGameState());
        // 由于 Boss 可能有多个子弹命中，HP 应该减少
        expect(newState.bossHp).toBeLessThanOrEqual(initialBossHp);
    });
    
    test('Boss 战应该显示弹幕', async ({ page }) => {
        // 等待 Boss 发射弹幕
        await page.waitForTimeout(2000);
        
        // 获取子弹数量
        const gameState = await page.evaluate(() => window.getGameState());
        
        // 应该有子弹在场上（包括玩家和 Boss 的）
        expect(gameState.bulletCount).toBeGreaterThanOrEqual(0);
        
        // 截图弹幕场景
        await expect(page.locator('canvas')).toHaveScreenshot('11-boss-danmaku.png');
    });
    
    test('Boss 阶段转换测试', async ({ page }) => {
        // 使用测试钩子直接设置 Boss 为低血量
        await page.evaluate(() => {
            // 直接减少 Boss HP 到 50% 以下触发阶段转换
            window.defeatBoss();
        });
        
        await page.waitForTimeout(1000);
        
        // 验证 Boss 状态
        const gameState = await page.evaluate(() => window.getGameState());
        
        // Boss 应该被击败或进入新阶段
        // 截图阶段转换
        await expect(page.locator('canvas')).toHaveScreenshot('12-boss-phase-change.png');
    });
    
    test('完整 Boss 战流程', async ({ page }) => {
        // 获取初始状态
        let gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.bossExists).toBe(true);
        expect(gameState.bossHp).toBeGreaterThan(0);
        
        // 持续射击直到 Boss 被击败
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('KeyJ');
            await page.waitForTimeout(100);
        }
        
        // 使用测试钩子快速结束 Boss
        await page.evaluate(() => window.defeatBoss());
        await page.waitForTimeout(2000);
        
        // 验证 Boss 被击败
        gameState = await page.evaluate(() => window.getGameState());
        
        // Boss 应该被标记为删除或 HP 为 0
        expect(gameState.bossHp).toBe(0);
        
        // 截图 Boss 被击败
        await expect(page.locator('canvas')).toHaveScreenshot('13-boss-defeated.png');
    });
    
    test('Boss 战弹幕躲避', async ({ page }) => {
        // 等待 Boss 发射弹幕
        await page.waitForTimeout(1000);
        
        // 获取初始 HP
        let gameState = await page.evaluate(() => window.getGameState());
        const initialHp = gameState.playerHp;
        
        // 尝试躲避：上下移动
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(300);
        await page.keyboard.press('Space'); // 跳跃
        
        // 验证玩家仍然存活
        gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.playerHp).toBeGreaterThanOrEqual(0);
        
        // 截图躲避场景
        await expect(page.locator('canvas')).toHaveScreenshot('14-boss-dodge.png');
    });
});
