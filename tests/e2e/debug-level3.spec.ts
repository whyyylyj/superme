
import { test, expect } from '@playwright/test';

test('Level 3 playable test', async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:8000'); // Use port 8000 as per playwright.config.ts
    // If not running on a server, we can use:
    // const filePath = 'file://' + process.cwd() + '/index.html';
    // await page.goto(filePath);

    // Wait for the game to be ready
    await page.waitForSelector('#gameCanvas');

    // Click Level Select
    await page.click('#level-select-btn');

    // Select Level 3
    await page.click('.level-card[data-level="2"]');

    // Wait for stage message
    await page.waitForTimeout(1000);

    // Check game state via exposed window hook
    const gameState = await page.evaluate(() => {
        if (window.getGameState) {
            return window.getGameState();
        }
        return null;
    });

    console.log('Game State:', JSON.stringify(gameState, null, 2));

    // Check for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`PAGE ERROR: ${msg.text()}`);
        }
    });

    // Check if player exists and is at expected position
    if (gameState) {
        expect(gameState.gameState).toBe('playing');
        expect(gameState.currentLevel).toBe(2); // Level 3 is index 2
        expect(gameState.playerHp).toBeGreaterThan(0);
    } else {
        throw new Error('Could not get game state');
    }

    // Capture screenshot
    await page.screenshot({ path: 'level3-debug.png' });
});
