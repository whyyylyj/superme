# 移动端触摸支持设计方案

> 为 SUPERME 横版飞行射击游戏添加手机触摸屏支持

---

## 📱 设计目标

1. **保持原有键盘操作体验** — 桌面端功能完全保留
2. **虚拟控制器布局** — 符合人体工学的触摸控制
3. **响应式画布** — 适配不同屏幕尺寸
4. **低延迟触摸响应** — 射击游戏需要快速反应
5. **视觉反馈** — 触摸时提供清晰的视觉提示

---

## 🎮 控制方案设计

### 虚拟控制器布局

```
┌─────────────────────────────────────────────────────┐
│  [CRT 效果层]                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │  [游戏画布 - 自适应缩放]                      │   │
│  │                                              │   │
│  │   ┌─────┐                           ┌───┐   │   │
│  │   │  ↑  │                           │ K │   │   │
│  │   │← ● →│  ← 游戏画面区域 →           │ J │   │   │
│  │   │  ↓  │                           │ S │   │   │
│  │   └─────┘                           └───┘   │   │
│  │   方向摇杆                                   │   │
│  │   (移动 + 跳跃)                              │   │
│  │                                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  [HUD 状态栏]                                   │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 按钮映射

| 虚拟按钮 | 键盘映射 | 功能 | 位置 |
|---------|---------|------|------|
| 方向摇杆 ↑ | W/↑ | 向上移动 | 左侧 |
| 方向摇杆 ↓ | S/↓ | 向下移动/蹲下 | 左侧 |
| 方向摇杆 ← | A/← | 向左移动 | 左侧 |
| 方向摇杆 → | D/→ | 向右移动 | 左侧 |
| 摇杆中心点击 | Space | 跳跃 | 左侧 |
| J 按钮 | J/Z | 射击 | 右侧 |
| K 按钮 | K/X | 变身 | 右侧 |
| S 按钮 | M | 追踪模式切换 | 右侧（可选） |
| Pause 按钮 | Esc | 暂停 | 右上角 |

---

## 🏗️ 技术架构

### 文件结构

```
superme/
├── js/
│   ├── input.js                    # 现有键盘输入 (修改)
│   └── touch-input.js              # 新增：触摸输入模块
├── css/
│   ├── style.css                   # 现有样式 (修改)
│   └── touch-controls.css          # 新增：虚拟控制器样式
├── index.html                      # 修改：添加触摸控制 DOM
└── docs/
    └── 10-MOBILE-TOUCH-DESIGN.md   # 本文档
```

### 模块职责

#### 1. `touch-input.js` — 触摸输入管理器

```javascript
// 核心功能
const TouchInput = {
    // 虚拟按钮状态 (与 Input.keys 保持一致的接口)
    keys: {
        w: false, a: false, s: false, d: false,
        ' ': false, j: false, k: false, m: false
    },
    
    // 触摸区域定义
    zones: {
        joystick: { x: 0, y: 0, width: 150, height: 150 },
        buttons: { 
            j: { x: 0, y: 0, radius: 40 },
            k: { x: 0, y: 0, radius: 40 },
            s: { x: 0, y: 0, radius: 30 }
        }
    },
    
    // 初始化
    init(canvas, uiContainer),
    
    // 触摸事件处理
    handleTouchStart(e),
    handleTouchMove(e),
    handleTouchEnd(e),
    
    // 虚拟摇杆逻辑
    updateJoystick(touchId, position),
    
    // 按钮点击反馈
    triggerHapticFeedback(button)
};
```

#### 2. `touch-controls.css` — 虚拟控制器样式

```css
/* 虚拟摇杆 */
.virtual-joystick {
    position: absolute;
    width: 150px;
    height: 150px;
    bottom: 120px;
    left: 30px;
    border-radius: 50%;
    background: rgba(0, 255, 204, 0.1);
    border: 2px solid rgba(0, 255, 204, 0.3);
    touch-action: none;  /* 防止浏览器默认手势 */
}

.joystick-knob {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(0, 255, 204, 0.3);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: transform 0.1s;
}

/* 动作按钮 */
.action-buttons {
    position: absolute;
    bottom: 100px;
    right: 30px;
    display: flex;
    gap: 15px;
}

.action-btn {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: rgba(255, 0, 255, 0.15);
    border: 2px solid rgba(255, 0, 255, 0.4);
    color: var(--primary-color);
    font-family: 'Press Start 2P';
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
}

.action-btn.active {
    background: rgba(0, 255, 204, 0.4);
    transform: scale(0.95);
}

/* 响应式布局 */
@media (max-width: 768px) {
    .virtual-joystick {
        width: 120px;
        height: 120px;
        bottom: 100px;
        left: 20px;
    }
    
    .action-buttons {
        bottom: 80px;
        right: 20px;
    }
    
    .action-btn {
        width: 60px;
        height: 60px;
    }
}
```

#### 3. `index.html` — 添加触摸控制 DOM

```html
<body>
    <div id="game-container">
        <!-- 现有内容... -->
        
        <!-- 触摸控制器 (仅移动端显示) -->
        <div id="touch-controls" class="hidden">
            <!-- 虚拟摇杆 -->
            <div class="virtual-joystick" id="virtual-joystick">
                <div class="joystick-knob" id="joystick-knob"></div>
            </div>
            
            <!-- 动作按钮 -->
            <div class="action-buttons">
                <button class="action-btn" id="btn-j" data-key="j">J</button>
                <button class="action-btn" id="btn-k" data-key="k">K</button>
                <button class="action-btn btn-small" id="btn-s" data-key="m">S</button>
            </div>
            
            <!-- 暂停按钮 -->
            <button class="pause-btn" id="btn-pause">⏸</button>
        </div>
    </div>
</body>
```

---

## 📐 响应式画布适配

### 缩放策略

```javascript
// 在 main.js 或新增的 responsive.js 中
function setupResponsiveCanvas() {
    const canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('game-container');
    
    // 原始分辨率
    const BASE_WIDTH = 800;
    const BASE_HEIGHT = 600;
    
    function resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 计算缩放比例 (保持宽高比)
        const scaleX = windowWidth / BASE_WIDTH;
        const scaleY = windowHeight / BASE_HEIGHT;
        const scale = Math.min(scaleX, scaleY, 1.5); // 最大放大 1.5 倍
        
        // 应用缩放
        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = 'center center';
        
        // 显示/隐藏触摸控制
        const isMobile = window.innerWidth <= 1024;
        document.getElementById('touch-controls').classList.toggle('hidden', !isMobile);
    }
    
    window.addEventListener('resize', resize);
    resize();
}
```

### Meta 标签优化

```html
<head>
    <!-- 禁止用户缩放，防止误触 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, 
           maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    
    <!-- 禁止 iOS 长按菜单 -->
    <meta name="touch-callout" content="none">
    
    <!-- 禁止选中文本 -->
    <meta name="webkit-touch-callout" content="none">
</head>
```

---

## ⚡ 性能优化

### 1. 触摸事件优化

```javascript
// 使用 passive: false 以支持 preventDefault
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

// 防止默认行为
e.preventDefault();
```

### 2. 多点触控支持

```javascript
// 支持同时按下多个按钮
const activeTouches = new Map();

function handleTouchStart(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        activeTouches.set(touch.identifier, {
            id: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            zone: detectZone(touch.clientX, touch.clientY)
        });
    }
}
```

### 3. 摇杆死区设置

```javascript
const JOYSTICK_DEADZONE = 0.15; // 15% 死区
const JOYSTICK_MAX_RADIUS = 45;

function calculateJoystickInput(deltaX, deltaY) {
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 死区处理
    if (distance < JOYSTICK_DEADZONE * JOYSTICK_MAX_RADIUS) {
        return { x: 0, y: 0 };
    }
    
    // 归一化
    const normalizedDistance = Math.min(distance / JOYSTICK_MAX_RADIUS, 1);
    return {
        x: (deltaX / distance) * normalizedDistance,
        y: (deltaY / distance) * normalizedDistance
    };
}
```

---

## 🎨 视觉反馈设计

### 按钮状态

| 状态 | 样式 |
|------|------|
| 默认 | 半透明边框 + 微弱发光 |
| 触摸中 | 填充颜色 + 放大发光 + 缩小动画 |
| 释放 | 快速淡出效果 |

### CSS 动画示例

```css
.action-btn {
    transition: all 0.1s ease-out;
}

.action-btn.active {
    background: rgba(0, 255, 204, 0.4);
    box-shadow: 0 0 30px rgba(0, 255, 204, 0.6);
    transform: scale(0.92);
}

/* 涟漪效果 */
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(2.5);
        opacity: 0;
    }
}
```

---

## 🔧 实现步骤

### Phase 1: 基础框架 (优先级：高)

1. **创建 `touch-input.js`**
   - 实现触摸区域检测
   - 映射到 `Input.keys` 状态
   - 基础摇杆逻辑

2. **创建 `touch-controls.css`**
   - 虚拟摇杆样式
   - 动作按钮样式
   - 响应式断点

3. **修改 `index.html`**
   - 添加触摸控制 DOM
   - 添加 viewport meta 标签

4. **修改 `input.js`**
   - 统一输入接口
   - 支持键盘 + 触摸同时工作

### Phase 2: 响应式适配 (优先级：中)

5. **画布缩放逻辑**
   - 根据屏幕尺寸动态缩放
   - 保持 4:3 宽高比

6. **触摸控制位置调整**
   - 横屏/竖屏适配
   - 左手/右手模式切换（可选）

### Phase 3: 优化与 polish (优先级：低)

7. **视觉反馈增强**
   - 按钮按压动画
   - 涟漪效果
   - 摇杆轨迹显示

8. **性能优化**
   - 触摸事件节流
   - 减少 DOM 操作

9. **设备测试**
   - iOS Safari
   - Android Chrome
   - 平板设备

---

## 📱 设备适配参考

| 设备类型 | 推荐布局 | 控制器尺寸 |
|---------|---------|-----------|
| 手机 (< 6") | 横屏 | 摇杆 120px, 按钮 60px |
| 大屏手机 (6"+) | 横屏 | 摇杆 140px, 按钮 70px |
| 平板 (7"-10") | 横屏 | 摇杆 160px, 按钮 80px |
| 桌面 | 隐藏控制器 | 使用键盘 |

---

## 🐛 潜在问题与解决方案

| 问题 | 解决方案 |
|------|---------|
| 浏览器下拉刷新 | `touch-action: none` + `preventDefault()` |
| 长按弹出菜单 | CSS `touch-callout: none` |
| 双击缩放 | Meta viewport `user-scalable=no` |
| iOS 安全区域 | `viewport-fit=cover` + CSS `env(safe-area-inset)` |
| 触摸延迟 | 使用 `touchstart` 而非 `click` |
| 多指冲突 | 使用 `changedTouches` 独立追踪 |

---

## ✅ 验收标准

- [ ] 手机上可以完整游玩（移动、跳跃、射击、变身）
- [ ] 虚拟摇杆支持 8 方向移动
- [ ] 支持同时按下多个按钮（移动 + 射击 + 跳跃）
- [ ] 横屏体验最佳（可考虑强制横屏提示）
- [ ] 无触摸延迟感
- [ ] 按钮视觉反馈清晰
- [ ] 不同尺寸屏幕正常显示
- [ ] 键盘操作仍然可用（桌面端）

---

## 📚 参考资料

- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [Mobile Game Controls Best Practices](https://developer.apple.com/design/human-interface-guidelines/game-controllers/)

---

*Created: 2026-02-23*
