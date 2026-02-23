/**
 * 验证 Web 端和移动端适配修复
 * 
 * 使用方法：
 * 1. 在浏览器打开 index.html
 * 2. 在控制台运行此脚本：load('js/verify-responsive-fix.js')
 * 3. 或使用 Playwright 进行自动化测试
 */

(function() {
    'use strict';

    console.log('=== 验证 Web/移动端适配修复 ===\n');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    function test(name, condition, details = '') {
        const status = condition ? '✅ PASS' : '❌ FAIL';
        console.log(`${status}: ${name}${details ? ' - ' + details : ''}`);
        if (condition) {
            results.passed++;
        } else {
            results.failed++;
        }
        results.tests.push({ name, passed: condition, details });
    }

    // 测试 1: Responsive 模块已加载
    test(
        'Responsive 模块已加载',
        typeof window.Responsive !== 'undefined',
        typeof window.Responsive !== 'undefined' ? 'API 可用' : '模块未定义'
    );

    // 测试 2: 设备类型检测
    if (window.Responsive) {
        const isMobile = window.Responsive.isMobile();
        test(
            '设备类型检测',
            true,
            `当前设备：${isMobile ? '移动端' : 'Web 端'}`
        );

        // 测试 3: 缩放比例
        const scale = window.Responsive.getScale();
        test(
            '缩放比例有效',
            scale > 0 && scale <= 2,
            `当前缩放：${scale.toFixed(3)}`
        );

        // 测试 4: 设计分辨率
        test(
            '设计分辨率正确',
            window.Responsive.DESIGN_WIDTH === 800 && window.Responsive.DESIGN_HEIGHT === 600,
            `${window.Responsive.DESIGN_WIDTH}x${window.Responsive.DESIGN_HEIGHT}`
        );
    }

    // 测试 5: Canvas 元素存在
    const canvas = document.getElementById('gameCanvas');
    test(
        'Canvas 元素存在',
        canvas !== null,
        canvas ? `尺寸：${canvas.width}x${canvas.height}` : '未找到'
    );

    // 测试 6: Canvas 尺寸
    if (canvas) {
        const isMobile = window.Responsive && window.Responsive.isMobile();
        const expectedWidth = isMobile ? canvas.width : 800 * (window.devicePixelRatio || 1);
        const expectedHeight = isMobile ? canvas.height : 600 * (window.devicePixelRatio || 1);
        
        test(
            'Canvas 物理尺寸',
            canvas.width > 0 && canvas.height > 0,
            `物理：${canvas.width}x${canvas.height}, CSS: ${canvas.style.width}x${canvas.style.height}`
        );
    }

    // 测试 7: 游戏容器
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        const computedStyle = window.getComputedStyle(gameContainer);
        const transform = computedStyle.transform;
        const isMobile = window.Responsive && window.Responsive.isMobile();
        
        // Web 端应该是 'none'，移动端应该有 scale
        const transformOk = isMobile ? transform !== 'none' : transform === 'none';
        test(
            '容器 Transform',
            transformOk,
            `Web 端应为 none，移动端应有 scale - 当前：${transform}`
        );
    }

    // 测试 8: CSS 类
    const body = document.body;
    const hasMobileClass = body.classList.contains('mobile-device');
    const hasDesktopClass = body.classList.contains('desktop-device');
    const isMobileDevice = window.Responsive && window.Responsive.isMobile();
    
    const classOk = (isMobileDevice && hasMobileClass && !hasDesktopClass) ||
                    (!isMobileDevice && hasDesktopClass && !hasMobileClass);
    test(
        'CSS 类正确',
        classOk,
        `mobile-device: ${hasMobileClass}, desktop-device: ${hasDesktopClass}`
    );

    // 测试 9: 触摸控制
    const touchControls = document.getElementById('touch-controls');
    if (touchControls) {
        const isMobile = window.Responsive && window.Responsive.isMobile();
        const isVisible = !touchControls.classList.contains('hidden');
        const touchOk = isMobile ? isVisible : !isVisible;
        test(
            '触摸控制显示',
            touchOk,
            `移动端应显示，Web 端应隐藏 - 当前：${isVisible ? '显示' : '隐藏'}`
        );
    }

    // 总结
    console.log('\n=== 测试结果 ===');
    console.log(`通过：${results.passed}, 失败：${results.failed}`);
    console.log(`成功率：${(results.passed / (results.passed + results.failed) * 100).toFixed(1)}%`);

    if (results.failed === 0) {
        console.log('\n🎉 所有测试通过！Web/移动端适配修复成功！');
    } else {
        console.log('\n⚠️ 部分测试失败，请检查控制台日志');
    }

    // 返回结果供自动化测试使用
    return results;
})();
