/**
 * 测试 01: 启动画面验证
 * 
 * 验证游戏启动画面正确显示，包括标题、控制说明和开始按钮
 */

import { test, expect } from '@playwright/test';

test.describe('启动画面', () => {
    
    test('应该正确显示启动画面', async ({ page }) => {
        // 访问游戏页面
        await page.goto('/');
        
        // 等待 Canvas 加载
        const canvas = page.locator('#gameCanvas');
        await canvas.waitFor({ state: 'visible' });
        
        // 验证启动画面可见
        const startScreen = page.locator('#start-screen');
        await expect(startScreen).toBeVisible();
        
        // 验证标题
        const logo = startScreen.locator('.logo');
        await expect(logo).toContainText('SUPERME');
        
        // 验证开始按钮可见
        const startBtn = page.locator('#start-btn');
        await expect(startBtn).toBeVisible();
        await expect(startBtn).toContainText('START GAME');
        
        // 验证控制说明
        const controlsInfo = startScreen.locator('.controls-info');
        await expect(controlsInfo).toBeVisible();
        
        // 截图保存启动画面（生成基准）
        await expect(page.locator('canvas')).toHaveScreenshot('01-start-screen.png');
    });
    
    test('点击开始按钮应该开始游戏', async ({ page }) => {
        await page.goto('/');

        // 等待启动画面
        const startScreen = page.locator('#start-screen');
        await expect(startScreen).toBeVisible();

        // 点击开始按钮
        const startBtn = page.locator('#start-btn');
        await startBtn.click();

        // 等待游戏开始（Canvas 标记为就绪）
        // 等待更长时间确保游戏完全启动
        await page.waitForTimeout(3000);

        // 验证启动画面消失
        await expect(startScreen).not.toBeVisible();

        // 验证 HUD 显示
        const hud = page.locator('#hud');
        await expect(hud).toBeVisible();

        // 验证游戏状态为 playing
        const gameState = await page.evaluate(() => window.getGameState());
        console.log('Game state after click:', gameState);
        expect(gameState.gameState).toBe('playing');
        expect(gameState.playerHp).toBeGreaterThan(0);

        // 截图保存游戏开始画面（生成基准）
        await expect(page.locator('canvas')).toHaveScreenshot('02-game-started.png');
    });
    
    test('应该显示正确的版本信息', async ({ page }) => {
        await page.goto('/');
        
        // 验证版本信息
        const versionInfo = page.locator('#start-screen').locator('div').last();
        await expect(versionInfo).toContainText('v1.0');
        await expect(versionInfo).toContainText('2026');
    });
});
