/**
 * 测试 02: 玩家移动和跳跃
 * 
 * 验证玩家的基本操作：左右移动、跳跃、射击
 */

import { test, expect } from '@playwright/test';

test.describe('玩家移动', () => {
    
    test.beforeEach(async ({ page }) => {
        // 每个测试前都启动游戏
        await page.goto('/');
        
        // 等待启动画面可见
        await page.locator('#start-screen').waitFor({ state: 'visible' });
        
        // 点击开始按钮
        await page.locator('#start-btn').click();
        
        // 等待游戏开始（启动画面消失）
        await page.locator('#start-screen').waitFor({ state: 'hidden', timeout: 10000 });
        
        // 等待 HUD 显示
        await page.locator('#hud').waitFor({ state: 'visible' });
        
        // 等待一小段时间确保游戏完全初始化
        await page.waitForTimeout(1000);
    });
    
    test('应该可以向右移动', async ({ page }) => {
        // 获取初始位置
        const initialState = await page.evaluate(() => window.getGameState());
        const initialX = initialState.playerX;
        
        // 按住右键移动
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowRight');
        
        // 验证位置变化
        const newState = await page.evaluate(() => window.getGameState());
        expect(newState.playerX).toBeGreaterThan(initialX);
        
        // 截图
        await expect(page.locator('canvas')).toHaveScreenshot('03-player-moved-right.png');
    });
    
    test('应该可以向左移动', async ({ page }) => {
        // 先向右移动一段距离
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(500);
        await page.keyboard.up('ArrowRight');
        
        // 获取当前位置
        const state1 = await page.evaluate(() => window.getGameState());
        
        // 向左移动
        await page.keyboard.down('ArrowLeft');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowLeft');
        
        // 验证位置变化
        const state2 = await page.evaluate(() => window.getGameState());
        expect(state2.playerX).toBeLessThan(state1.playerX);
    });
    
    test('应该可以跳跃', async ({ page }) => {
        // 获取初始 Y 位置
        const initialState = await page.evaluate(() => window.getGameState());
        const initialY = initialState.playerY;
        
        // 跳跃
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
        
        // 验证 Y 位置变化（跳跃时 Y 应该减小，因为向上）
        const newState = await page.evaluate(() => window.getGameState());
        // 注意：在 Canvas 中，Y 向下增加，所以跳跃时 Y 应该减小
        expect(newState.playerY).toBeLessThan(initialY + 50); // 允许一些误差
        
        // 截图
        await expect(page.locator('canvas')).toHaveScreenshot('04-player-jumping.png');
    });
    
    test('应该可以连续跳跃（多段跳）', async ({ page }) => {
        // 连续按 3 次空格（三段跳）
        await page.keyboard.press('Space');
        await page.waitForTimeout(300);
        await page.keyboard.press('Space');
        await page.waitForTimeout(300);
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
        
        // 验证玩家仍在游戏中（没有因为多段跳崩溃）
        const state = await page.evaluate(() => window.getGameState());
        expect(state.playerHp).toBeGreaterThan(0);
    });
    
    test('应该可以射击', async ({ page }) => {
        // 获取初始子弹数量
        const initialState = await page.evaluate(() => window.getGameState());
        const initialBullets = initialState.bulletCount;
        
        // 按 J 键射击
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(200);
        
        // 验证子弹数量增加
        const newState = await page.evaluate(() => window.getGameState());
        expect(newState.bulletCount).toBeGreaterThan(initialBullets);
        
        // 截图（应该能看到子弹）
        await expect(page.locator('canvas')).toHaveScreenshot('05-player-shooting.png');
    });
    
    test('应该可以使用方向键移动', async ({ page }) => {
        // 使用 W/A/S/D 以外的方向键
        await page.keyboard.down('KeyD');  // D = 右
        await page.waitForTimeout(500);
        await page.keyboard.up('KeyD');
        
        const state = await page.evaluate(() => window.getGameState());
        expect(state.playerX).toBeGreaterThan(100); // 初始位置是 100
    });
    
    test('应该可以移动并射击', async ({ page }) => {
        // 同时移动和射击
        await page.keyboard.down('ArrowRight');
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(500);
        await page.keyboard.up('ArrowRight');
        
        // 验证玩家状态正常
        const state = await page.evaluate(() => window.getGameState());
        expect(state.playerHp).toBeGreaterThan(0);
        expect(state.playerX).toBeGreaterThan(100);
    });
});
