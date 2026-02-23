const { chromium, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyMobileAdaptation() {
    console.log('--- Starting Mobile Adaptation Verification ---');
    const browser = await chromium.launch();
    
    // 1. 模拟 iPhone 12 环境 (移动端验证)
    console.log('[Phase 1] Testing Mobile Environment (iPhone 12)');
    const mobileContext = await browser.newContext({
        ...devices['iPhone 12'],
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    const filePath = 'file://' + path.resolve('index.html');
    await mobilePage.goto(filePath);

    // 检查 Meta 标签
    const viewportMeta = await mobilePage.getAttribute('meta[name="viewport"]', 'content');
    console.log('Viewport Meta:', viewportMeta);
    if (viewportMeta.includes('user-scalable=no')) {
        console.log('✅ Viewport Meta is correct (preventing zoom).');
    } else {
        console.error('❌ Viewport Meta is missing zoom restrictions.');
    }

    // 检查触控层可见性
    await mobilePage.waitForTimeout(500);
    const touchControlsDisplay = await mobilePage.evaluate(() => {
        const el = document.getElementById('touch-controls');
        return window.getComputedStyle(el).display;
    });
    console.log('Touch Controls CSS display:', touchControlsDisplay);
    if (touchControlsDisplay !== 'none') {
        console.log('✅ Touch controls are active in mobile mode.');
    } else {
        console.error('❌ Touch controls are hidden in mobile mode.');
    }

    // 检查缩放比例
    const scale = await mobilePage.evaluate(() => {
        const container = document.getElementById('game-container');
        return container.style.transform;
    });
    console.log('Game Container Scale:', scale);
    if (scale.includes('scale')) {
        console.log('✅ Scaling is applied to the game container.');
    } else {
        console.error('❌ Scaling is NOT applied.');
    }

    // 模拟摇杆操作并检查虚拟按键状态
    console.log('[Phase 2] Simulating Joystick Interaction');
    const joystickSelector = '#virtual-joystick';
    const joystickBox = await mobilePage.locator(joystickSelector).boundingBox();
    
    if (joystickBox) {
        const centerX = joystickBox.x + joystickBox.width / 2;
        const centerY = joystickBox.y + joystickBox.height / 2;
        
        // 模拟向右移动摇杆
        await mobilePage.evaluate((coords) => {
            const el = document.getElementById('virtual-joystick');
            const touch = new Touch({
                identifier: Date.now(),
                target: el,
                clientX: coords.x,
                clientY: coords.y,
            });
            const touchStart = new TouchEvent('touchstart', {
                cancelable: true,
                bubbles: true,
                touches: [touch],
                targetTouches: [touch],
                changedTouches: [touch]
            });
            el.dispatchEvent(touchStart);
            
            // Move right
            const touchMove = new Touch({
                identifier: touch.identifier,
                target: el,
                clientX: coords.x + 40,
                clientY: coords.y,
            });
            const moveEvent = new TouchEvent('touchmove', {
                cancelable: true,
                bubbles: true,
                touches: [touchMove],
                targetTouches: [touchMove],
                changedTouches: [touchMove]
            });
            window.dispatchEvent(moveEvent);
        }, { x: centerX, y: centerY });
        
        await mobilePage.waitForTimeout(200);
        
        const isRightPressed = await mobilePage.evaluate(() => Input.virtualKeys.right);
        console.log('Joystick Right Pressed:', isRightPressed);
        if (isRightPressed) {
            console.log('✅ Joystick input correctly mapped to Input.virtualKeys.');
        } else {
            console.error('❌ Joystick input NOT mapping to virtualKeys.');
        }
    }

    // 模拟按钮操作
    console.log('[Phase 3] Simulating Button Interaction');
    const shootBtnSelector = '.action-btn.btn-shoot';
    const shootBtnVisible = await mobilePage.locator(shootBtnSelector).isVisible();
    if (shootBtnVisible) {
        await mobilePage.evaluate((selector) => {
            const el = document.querySelector(selector);
            const touch = new Touch({ identifier: 1, target: el, clientX: 0, clientY: 0 });
            el.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], changedTouches: [touch] }));
        }, shootBtnSelector);
        
        const isShootPressed = await mobilePage.evaluate(() => Input.virtualKeys.shoot);
        console.log('Shoot Button Pressed:', isShootPressed);
        if (isShootPressed) {
            console.log('✅ Shoot button correctly mapped to Input.virtualKeys.');
        } else {
            console.error('❌ Shoot button NOT mapping to virtualKeys.');
        }
    }

    // 3. PC 模式验证
    console.log('[Phase 4] Testing Desktop Environment (PC)');
    const desktopPage = await browser.newPage();
    await desktopPage.goto(filePath);
    await desktopPage.waitForTimeout(500);
    
    const touchControlsDisplayOnDesktop = await desktopPage.evaluate(() => {
        const el = document.getElementById('touch-controls');
        return el ? window.getComputedStyle(el).display : 'element-not-found';
    });
    console.log('Touch Controls CSS display on Desktop:', touchControlsDisplayOnDesktop);
    if (touchControlsDisplayOnDesktop === 'none') {
        console.log('✅ Touch controls are hidden on desktop.');
    } else {
        console.error('❌ Touch controls should be hidden on desktop.');
    }

    await browser.close();
    console.log('--- Verification Completed ---');
}

verifyMobileAdaptation().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
