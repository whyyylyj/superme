/**
 * Responsive.js - 自适应缩放系统
 *
 * 智能适配 Web 端和移动端：
 * - Web 端：固定 800x600，居中显示，黑边填充
 * - 移动端：动态缩放，保持宽高比，全屏适配
 *
 * 功能：
 * - 监听 window.resize 事件
 * - 计算最佳缩放比例 (保持宽高比)
 * - 应用 transform: scale() 到 #game-container (仅移动端)
 * - 支持横屏/竖屏自动适配
 * - 防遮挡优化（避开浏览器 UI 栏）
 */

(function () {
    'use strict';

    // 游戏设计分辨率
    const DESIGN_WIDTH = 800;
    const DESIGN_HEIGHT = 600;

    // 缩放基准模式：'fit' | 'fill' | 'stretch'
    // fit: 保持宽高比，完整显示（可能有黑边）
    // fill: 保持宽高比，填满屏幕（可能裁剪）
    // stretch: 拉伸填满（不推荐，会变形）
    const SCALE_MODE = 'fit';

    // 安全边距（防止被浏览器 UI 遮挡，单位：像素）
    const SAFE_MARGIN_TOP = 0;
    const SAFE_MARGIN_BOTTOM = 0;
    const SAFE_MARGIN_LEFT = 0;
    const SAFE_MARGIN_RIGHT = 0;

    // 最小缩放比例（防止缩太小）
    const MIN_SCALE = 0.3;

    // 最大缩放比例（防止放大过度导致模糊）
    const MAX_SCALE = 2.0;

    // 设备类型判断
    let isMobileDevice = false;
    let isLandscapeOrientation = false;

    // 游戏容器
    let gameContainer = null;
    let canvas = null;

    // 当前缩放参数
    let currentScale = 1;
    let currentWidth = DESIGN_WIDTH;
    let currentHeight = DESIGN_HEIGHT;

    /**
     * 检测是否为移动设备
     */
    function detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (window.matchMedia && window.matchMedia('(max-width: 800px)').matches);
    }

    /**
     * 检测是否为横屏模式
     */
    function detectLandscape() {
        return window.innerWidth > window.innerHeight;
    }

    /**
     * 计算最佳缩放比例
     * @param {number} availableWidth - 可用宽度
     * @param {number} availableHeight - 可用高度
     * @returns {object} { scale, width, height }
     */
    function calculateScale(availableWidth, availableHeight) {
        let scale, width, height;

        if (SCALE_MODE === 'fit') {
            // 保持宽高比，完整显示
            const scaleX = availableWidth / DESIGN_WIDTH;
            const scaleY = availableHeight / DESIGN_HEIGHT;
            scale = Math.min(scaleX, scaleY);
            width = DESIGN_WIDTH * scale;
            height = DESIGN_HEIGHT * scale;
        } else if (SCALE_MODE === 'fill') {
            // 保持宽高比，填满屏幕（可能裁剪）
            const scaleX = availableWidth / DESIGN_WIDTH;
            const scaleY = availableHeight / DESIGN_HEIGHT;
            scale = Math.max(scaleX, scaleY);
            width = DESIGN_WIDTH * scale;
            height = DESIGN_HEIGHT * scale;
        } else {
            // stretch: 拉伸填满
            scale = 1;
            width = availableWidth;
            height = availableHeight;
        }

        // 限制缩放范围
        scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

        return { scale, width, height };
    }

    /**
     * 应用缩放变换到游戏容器
     * 所有设备（移动端和Web）统一使用相同的自适应缩放机制
     * 容器采用绝对定位并在中心点运算 scale
     */
    function applyScale() {
        if (!gameContainer || !canvas) return;

        // 获取可用窗口尺寸
        const availableWidth = window.innerWidth - SAFE_MARGIN_LEFT - SAFE_MARGIN_RIGHT;
        const availableHeight = window.innerHeight - SAFE_MARGIN_TOP - SAFE_MARGIN_BOTTOM;

        // 统一计算缩放比例
        const result = calculateScale(availableWidth, availableHeight);
        currentScale = result.scale;
        currentWidth = result.width;
        currentHeight = result.height;

        // 应用 CSS 变换，必须保留 translate(-50%, -50%) 结合绝对定位！这样放大缩小永远沿屏幕正中心展开，不会产生截断
        gameContainer.style.transformOrigin = 'center center';
        gameContainer.style.transform = `translate(-50%, -50%) scale(${currentScale})`;

        // 设置容器 DOM 虚拟尺寸
        gameContainer.style.width = `${DESIGN_WIDTH}px`;
        gameContainer.style.height = `${DESIGN_HEIGHT}px`;

        console.log(`[Responsive] Scale: ${currentScale.toFixed(3)}, Display: ${currentWidth.toFixed(0)}x${currentHeight.toFixed(0)}`);

        // 获取设备像素比，用于在 main.js 内部分配 DPR 映射，但在 responsive 中不再强制 override canvas 的实际 buffer。
        // responsive只处理 CSS 尺寸，canvas 自身的 buffer 交还给 main.js 的 resizeCanvas 处理。

        // 通知主循环更新
        if (typeof window.resizeCanvas === 'function') {
            window.resizeCanvas();
        }
    }     // 触发全局事件，通知其他模块（如 touch-input）
    window.dispatchEvent(new CustomEvent('game-resize', {
        detail: {
            scale: currentScale,
            width: currentWidth,
            height: currentHeight,
            isMobile: isMobileDevice
        }
    }));
}

    /**
     * 防抖函数（避免 resize 事件触发过于频繁）
     */
    function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 处理窗口大小变化
 */
const handleResize = debounce(() => {
    // 重新检测设备类型和方向
    const wasMobile = isMobileDevice;
    isMobileDevice = detectMobile();
    isLandscapeOrientation = detectLandscape();

    // 设备类型变化时，更新 CSS 类
    if (wasMobile !== isMobileDevice) {
        if (isMobileDevice) {
            document.body.classList.remove('desktop-device');
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
            document.body.classList.add('desktop-device');
        }
    }

    // 方向变化时，更新 CSS 类
    if (isLandscapeOrientation) {
        document.body.classList.add('landscape');
        document.body.classList.remove('portrait');
    } else {
        document.body.classList.add('portrait');
        document.body.classList.remove('landscape');
    }

    applyScale();
}, 100);

/**
 * 初始化响应式系统
 */
function init() {
    gameContainer = document.getElementById('game-container');
    canvas = document.getElementById('gameCanvas');

    if (!gameContainer || !canvas) {
        console.error('[Responsive] game-container or canvas not found!');
        return;
    }

    // 初始检测设备类型
    isMobileDevice = detectMobile();
    isLandscapeOrientation = detectLandscape();

    // 设置 CSS 类
    if (isMobileDevice) {
        document.body.classList.add('mobile-device');
        document.body.classList.remove('desktop-device');
        console.log('[Responsive] Mobile device detected');
    } else {
        document.body.classList.add('desktop-device');
        document.body.classList.remove('mobile-device');
        console.log('[Responsive] Desktop device detected');
    }

    if (isLandscapeOrientation) {
        document.body.classList.add('landscape');
        document.body.classList.remove('portrait');
    } else {
        document.body.classList.add('portrait');
        document.body.classList.remove('landscape');
    }

    // 初始应用缩放
    applyScale();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize, { passive: true });

    // 监听方向变化
    window.addEventListener('orientationchange', handleResize, { passive: true });

    // 监听全屏变化
    document.addEventListener('fullscreenchange', handleResize, { passive: true });
    document.addEventListener('webkitfullscreenchange', handleResize, { passive: true });

    console.log(`[Responsive] Initialized. Design: ${DESIGN_WIDTH}x${DESIGN_HEIGHT}, Scale mode: ${SCALE_MODE}, Mobile: ${isMobileDevice}`);
}

/**
 * 获取当前缩放比例
 */
function getScale() {
    return currentScale;
}

/**
 * 获取当前显示宽度
 */
function getWidth() {
    return currentWidth;
}

/**
 * 获取当前显示高度
 */
function getHeight() {
    return currentHeight;
}

/**
 * 判断是否为移动设备
 */
function isMobile() {
    return isMobileDevice;
}

/**
 * 判断是否为横屏
 */
function isLandscape() {
    return isLandscapeOrientation;
}

/**
 * 将屏幕坐标转换为游戏坐标
 * @param {number} screenX - 屏幕 X 坐标
 * @param {number} screenY - 屏幕 Y 坐标
 * @returns {object} { x, y } 游戏坐标系中的位置
 */
function screenToGame(screenX, screenY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = DESIGN_WIDTH / rect.width;
    const scaleY = DESIGN_HEIGHT / rect.height;

    return {
        x: (screenX - rect.left) * scaleX,
        y: (screenY - rect.top) * scaleY
    };
}

/**
 * 将游戏坐标转换为屏幕坐标
 * @param {number} gameX - 游戏 X 坐标
 * @param {number} gameY - 游戏 Y 坐标
 * @returns {object} { x, y } 屏幕坐标系中的位置
 */
function gameToScreen(gameX, gameY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / DESIGN_WIDTH;
    const scaleY = rect.height / DESIGN_HEIGHT;

    return {
        x: rect.left + gameX * scaleX,
        y: rect.top + gameY * scaleY
    };
}

// 暴露公共 API
window.Responsive = {
    init,
    getScale,
    getWidth,
    getHeight,
    isMobile,
    isLandscape,
    screenToGame,
    gameToScreen,
    DESIGN_WIDTH,
    DESIGN_HEIGHT
};

// DOM 加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
}) ();
