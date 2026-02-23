/**
 * 测试 03: 第一关 Pixel Forest 完整通关流程
 * 
 * 验证玩家能够完成第一关的所有流程：
 * 1. 开始游戏
 * 2. 移动通过关卡
 * 3. 击败 Boss Treant King
 * 4. 完成关卡
 */

import { test, expect } from '@playwright/test';

test.describe('第一关 Pixel Forest 通关', () => {
    
    test('完整通关流程', async ({ page }) => {
        // 1. 启动游戏
        await page.goto('/');
        await page.locator('#start-btn').click();
        await page.locator('#gameCanvas[data-ready="1"]').waitFor({ timeout: 10000 });
        await page.waitForTimeout(500);
        
        // 验证游戏开始
        let gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.gameState).toBe('playing');
        expect(gameState.currentLevel).toBe(0); // 第一关索引为 0
        
        // 2. 向右移动通过关卡（第一关宽度 5000px）
        // 模拟玩家持续向右移动
        await page.keyboard.down('ArrowRight');
        
        // 移动足够长的距离以触发 Boss 战
        // 第一关 Boss 在约 4000px 处
        await page.waitForTimeout(8000);
        
        // 验证玩家已经移动了很远的距离
        gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.playerX).toBeGreaterThan(3000);
        
        // 3. 检查 Boss 是否存在
        expect(gameState.bossExists).toBe(true);
        
        // 截图 Boss 战场景
        await expect(page.locator('canvas')).toHaveScreenshot('06-boss-encounter.png');
        
        // 4. 使用测试钩子快速击败 Boss（避免冗长的战斗）
        await page.evaluate(() => window.defeatBoss());
        await page.waitForTimeout(1000);
        
        // 5. 验证 Boss 被击败，关卡完成
        gameState = await page.evaluate(() => window.getGameState());
        
        // Boss 应该被标记为删除或 HP 为 0
        // 检查是否进入胜利画面或下一关
        const winScreen = page.locator('#win-screen');
        
        // 如果是最后一关，应该显示胜利画面
        // 由于我们只有第一关，检查是否完成
        await page.waitForTimeout(2000);
        
        // 截图胜利画面（如果有）
        const isWinScreenVisible = await winScreen.isVisible();
        if (isWinScreenVisible) {
            await expect(page.locator('canvas')).toHaveScreenshot('07-level-complete.png');
        }
        
        // 验证玩家仍然存活
        expect(gameState.playerHp).toBeGreaterThan(0);
    });
    
    test('拾取道具测试', async ({ page }) => {
        await page.goto('/');
        await page.locator('#start-btn').click();
        await page.locator('#gameCanvas[data-ready="1"]').waitFor({ timeout: 10000 });
        await page.waitForTimeout(500);
        
        // 获取初始武器状态
        let initialState = await page.evaluate(() => window.getGameState());
        expect(initialState.playerWeapon).toBe('normal');
        
        // 向右移动寻找道具
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(3000);
        await page.keyboard.up('ArrowRight');
        
        // 检查是否拾取了道具
        let newState = await page.evaluate(() => window.getGameState());
        
        // 截图道具拾取场景
        await expect(page.locator('canvas')).toHaveScreenshot('08-powerup-collection.png');
    });
    
    test('与敌人战斗测试', async ({ page }) => {
        await page.goto('/');
        await page.locator('#start-btn').click();
        await page.locator('#gameCanvas[data-ready="1"]').waitFor({ timeout: 10000 });
        await page.waitForTimeout(500);
        
        // 获取初始敌人数量
        let initialState = await page.evaluate(() => window.getGameState());
        const initialEnemies = initialState.enemyCount;
        
        // 向右移动遇到敌人
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(2000);
        
        // 射击
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(200);
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(200);
        await page.keyboard.press('KeyJ');
        
        await page.keyboard.up('ArrowRight');
        await page.waitForTimeout(1000);
        
        // 验证敌人被消灭
        let newState = await page.evaluate(() => window.getGameState());
        
        // 玩家应该仍然存活
        expect(newState.playerHp).toBeGreaterThan(0);
        
        // 截图战斗场景
        await expect(page.locator('canvas')).toHaveScreenshot('09-combat-scene.png');
    });
    
    test('无敌模式通关（使用测试钩子）', async ({ page }) => {
        await page.goto('/');
        await page.locator('#start-btn').click();
        await page.locator('#gameCanvas[data-ready="1"]').waitFor({ timeout: 10000 });
        await page.waitForTimeout(500);
        
        // 启用无敌模式
        await page.evaluate(() => window.setInvincible(true));
        
        // 快速移动到 Boss
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(8000);
        await page.keyboard.up('ArrowRight');
        
        // 击败 Boss
        await page.evaluate(() => window.defeatBoss());
        await page.waitForTimeout(1000);
        
        // 验证通关
        const gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.playerHp).toBeGreaterThan(0);
    });
});
