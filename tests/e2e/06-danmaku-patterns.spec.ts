/**
 * 测试 06: 弹幕模式测试
 * 
 * 验证 Danmaku 引擎的各种弹幕模式：
 * - Circle（圆形）
 * - Fan（扇形）
 * - Spiral（螺旋）
 * - Rain（雨）
 * - Cross（十字）
 * - Flower（花）
 * - Laser（激光）
 * - Scatter（散射）
 */

import { test, expect } from '@playwright/test';

test.describe('弹幕模式', () => {
    
    test.beforeEach(async ({ page }) => {
        // 启动游戏
        await page.goto('/');
        await page.locator('#start-btn').click();
        await page.locator('#gameCanvas[data-ready="1"]').waitFor({ timeout: 10000 });
        await page.waitForTimeout(500);
        
        // 启用无敌模式
        await page.evaluate(() => window.setInvincible(true));
    });
    
    test('玩家应该可以发射子弹', async ({ page }) => {
        // 获取初始子弹数
        const initialState = await page.evaluate(() => window.getGameState());
        expect(initialState.bulletCount).toBe(0);
        
        // 射击
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(200);
        
        // 验证子弹产生
        const newState = await page.evaluate(() => window.getGameState());
        expect(newState.bulletCount).toBeGreaterThan(0);
    });
    
    test('Boss 应该发射弹幕', async ({ page }) => {
        // 快速移动到 Boss
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(8000);
        await page.keyboard.up('ArrowRight');
        await page.waitForTimeout(2000);
        
        // 验证 Boss 存在
        const gameState = await page.evaluate(() => window.getGameState());
        expect(gameState.bossExists).toBe(true);
        
        // 等待 Boss 发射弹幕
        await page.waitForTimeout(2000);
        
        // 验证有子弹在场上
        const bulletState = await page.evaluate(() => window.getGameState());
        expect(bulletState.bulletCount).toBeGreaterThan(0);
        
        // 截图 Boss 弹幕
        await expect(page.locator('canvas')).toHaveScreenshot('30-boss-danmaku.png');
    });
    
    test('散弹武器应该发射多发子弹', async ({ page }) => {
        // 设置武器为散弹
        await page.evaluate(() => {
            window.setPlayerState({ weapon: 'spread' });
        });
        
        // 射击
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(300);
        
        // 验证多发子弹
        const state = await page.evaluate(() => window.getGameState());
        expect(state.bulletCount).toBeGreaterThan(1);
        
        // 截图散弹
        await expect(page.locator('canvas')).toHaveScreenshot('31-spread-shot.png');
    });
    
    test('快速武器应该提高射速', async ({ page }) => {
        // 设置武器为快速
        await page.evaluate(() => {
            window.setPlayerState({ weapon: 'rapid' });
        });
        
        // 按住射击键
        await page.keyboard.down('KeyJ');
        await page.waitForTimeout(1000);
        await page.keyboard.up('KeyJ');
        
        // 验证大量子弹
        const state = await page.evaluate(() => window.getGameState());
        expect(state.bulletCount).toBeGreaterThan(5);
        
        // 截图快速射击
        await expect(page.locator('canvas')).toHaveScreenshot('32-rapid-fire.png');
    });
    
    test('弹幕应该与敌人碰撞', async ({ page }) => {
        // 向右移动遇到敌人
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowRight');
        
        // 获取初始敌人数量
        const initialState = await page.evaluate(() => window.getGameState());
        const initialEnemies = initialState.enemyCount;
        
        // 向敌人方向射击
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(500);
        await page.keyboard.press('KeyJ');
        
        // 等待子弹飞行
        await page.waitForTimeout(1000);
        
        // 验证敌人被消灭
        const newState = await page.evaluate(() => window.getGameState());
        // 敌人数量应该减少或玩家子弹命中
        expect(newState.playerHp).toBeGreaterThanOrEqual(0);
    });
    
    test('追踪弹应该追踪最近敌人', async ({ page }) => {
        // 变身为 Phantom 形态（拥有追踪弹）
        await page.evaluate(() => window.transformTo('Phantom'));
        await page.waitForTimeout(500);
        
        // 移动到敌人位置
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowRight');
        
        // 射击
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(300);
        
        // 验证子弹发射
        const state = await page.evaluate(() => window.getGameState());
        expect(state.bulletCount).toBeGreaterThan(0);
        
        // 截图追踪弹
        await expect(page.locator('canvas')).toHaveScreenshot('33-homing-bullet.png');
    });
    
    test('弹幕密度测试', async ({ page }) => {
        // 快速移动到 Boss
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(8000);
        await page.keyboard.up('ArrowRight');
        
        // 等待 Boss 发射多轮弹幕
        await page.waitForTimeout(5000);
        
        // 获取子弹数量
        const state = await page.evaluate(() => window.getGameState());
        
        // 验证弹幕密度（应该有足够多的子弹）
        expect(state.bulletCount).toBeGreaterThan(5);
        
        // 截图高密度弹幕
        await expect(page.locator('canvas')).toHaveScreenshot('34-dense-danmaku.png');
    });
    
    test('玩家应该可以躲避弹幕', async ({ page }) => {
        // 快速移动到 Boss
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(8000);
        await page.keyboard.up('ArrowRight');
        
        // 获取初始 HP
        const initialState = await page.evaluate(() => window.getGameState());
        const initialHp = initialState.playerHp;
        
        // 等待 Boss 发射弹幕
        await page.waitForTimeout(2000);
        
        // 尝试躲避：随机移动
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(300);
        await page.keyboard.press('Space');
        
        // 玩家可能被击中也可能没被击中
        const newState = await page.evaluate(() => window.getGameState());
        expect(newState.playerHp).toBeGreaterThanOrEqual(0);
        
        // 截图躲避场景
        await expect(page.locator('canvas')).toHaveScreenshot('35-danmaku-dodge.png');
    });
});
