# SUPERME 跨平台自适应移动端与 Web 端操作方案

综合了原有的触摸屏支持计划和移动端控制设计，本方案旨在打造**一套高鲁棒、自适应且兼顾操作手感**的统一控制方案。通过合理抽象输入层和提供自适应缩放画布结构，在不破坏任何已有逻辑的情况下，确保 PC 端、移动端设备都能获得极致体验。

---

## 1. 核心设计理念 (取长补短)

1. **统一输入层与低耦合**（源自文件2）：利用状态机（ Getter 访问器），将 `Input` 改造为“物理按键”与“虚拟按键”的集合体。游戏主逻辑不需要感知用户是通过键盘还是触摸屏操作。
2. **多点触控追踪与人体工学摇杆**（源自文件1）：不采用简单地点击事件，而是使用 `Map` 追踪 `Touch.identifier`，确保移动（摇杆）、射击、变身等操作能够独立、无阻碍地并行发生（例如支持三指并发：边走、边跳、边开枪）。
3. **鲁棒的响应式与防缩放设计**（结合）：不仅解决手机横竖屏问题，而且为 PC Web 缩小窗口提供画面按比例等比缩放能力 (`transform: scale`)；通过严谨的 Meta 标签彻底断绝浏览器默认收拾（下拉刷新、长按文字菜单、双指放大）。

---

## 2. 统一化 UI 控制层布局映射

采用悬浮的 DOM 控制层（Touch Overlay），与 Canvas 渲染分离，避免频繁重绘制导致的性能下降。

### 按钮映射与布局结构：

| 虚拟按键区域 | 绑定功能 | 对应键盘 | 内部虚拟状态 `virtualKeys` | 所在屏幕位置 |
| :--- | :--- | :--- | :--- | :--- |
| **8 向虚拟摇杆** | 移动、蹲下 | W,A,S,D / 方向键 | `.up`, `.down`, `.left`, `.right` | 左下角区域 |
| **Shoot (J)** | 射击（主武器） | J / Z | `.shoot` | 右下角最大按钮 |
| **Jump (Space)** | 跳跃 | Space | `.jump` | 右下角偏内侧按钮 |
| **Transform (K)** | 形变/必杀 | K / X | `.transform` | 右下角偏上方 |
| **Mode (M)** | 追踪模式切换 | M | `.mode` | 右侧上边缘小按钮 |
| **Pause** | 暂停游戏 | Esc / P | `.pause` | 右上角悬浮小按钮 |

*(由于引入了虚拟摇杆向下的控制，因此可直接通过摇杆下拉触发原来的 S(休息/坐下) 指令，保持 UI 简洁)*

---

## 3. 技术架构与防坑设计 (鲁棒性保证)

### 3.1 核心触控屏蔽与 Meta 约束（Web/App 统一适配）

在 `<head>` 区域必须加入以下设置，它是一切触摸控制能够“跟手”不飘移的前提：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
```
同时控制层 CSS：
```css
#touch-overlay {
    pointer-events: none; /* 外层禁止，防止阻碍下面点击 */
    touch-action: none;   /* CSS 级别屏蔽浏览器手势操作 */
    user-select: none;
    -webkit-touch-callout: none;
}
.action-btn, .virtual-joystick {
    pointer-events: auto; /* 仅按钮可触摸 */
}
```

### 3.2 自适应缩放画布机制 (`responsive.js` 构想)

无论是在手机，还是在 PC 端改变浏览器窗口大小，画面都应该保持 4:3 或 16:9（看游戏基础分辨率）等比显示：
- **方案**：使用 JS 计算窗口 `window.innerWidth/Height` 并与 Base 分辨率进行比较，得出最小缩放值 `Math.min(scaleX, scaleY)`。
- 然后对 `#game-container` 使用 `transform: scale(...)` 居中显示。
- **设备探测显示隐藏**：通过 `('ontouchstart' in window) || (navigator.maxTouchPoints > 0)` 动态判断是否为触控设备，若是再把 `#touch-overlay` 透明度还原，否则隐藏。

### 3.3 游戏侧零侵入输入聚合方案 (`js/input.js`)

在之前的结构上增加 `virtualKeys`：
```javascript
class InputSystem {
    constructor() {
        this.keys = {};
        this.virtualKeys = {}; // 由 TouchManager 修改
        // ...键盘事件监听
    }
    
    // 逻辑层获取输入的统一拦截口，将按键和触摸合并
    get up() { return this.keys['w'] || this.keys['ArrowUp'] || this.virtualKeys.up; }
    get down() { return this.keys['s'] || this.keys['ArrowDown'] || this.virtualKeys.down; }
    get left() { return this.keys['a'] || this.keys['ArrowLeft'] || this.virtualKeys.left; }
    get right() { return this.keys['d'] || this.keys['ArrowRight'] || this.virtualKeys.right; }
    
    get shoot() { return this.keys['j'] || this.keys['z'] || this.virtualKeys.shoot; }
    get jump() { return this.keys[' '] || this.virtualKeys.jump; }
    get transform() { return this.keys['k'] || this.keys['x'] || this.virtualKeys.transform; }
}
const Input = new InputSystem();
```

### 3.4 摇杆死区与多指解析 (`touch-input.js` 核心逻辑)

游戏中最容易出 bug 的就是多根手指同时按压或者滑动出界。
```javascript
const TouchInputManager = {
    activeTouches: new Map(), // O(1) 多指管理
    
    init() {
        const overlay = document.getElementById('touch-overlay');
        overlay.addEventListener('touchstart', this.handleEvent.bind(this), { passive: false });
        overlay.addEventListener('touchmove', this.handleEvent.bind(this), { passive: false });
        // touchend, touchcancel 同理...
    },

    handleEvent(e) {
        e.preventDefault(); // 彻底阻止由于触控带来的页面默认滑动
        // 遍历 e.changedTouches，根据 touch.identifier 存入或移出 activeTouches 
        // 并且通过 touch.clientX / Y 检测命中的虚拟按键（如按钮、摇杆区域）
        // 遇到摇杆时计算向量：
        // 设定 DeadZone = 15% 半径，只有推移向量大于此值时，才触发相关的 up/down/left/right
    }
}
```

---

## 4. 实施里程碑 (Roadmap)

此方案通过循序渐进的阶段实施以保证稳定性：

**第一周：基础支撑接入 (Web端与移动端并行不崩)**
- [x] 完成 HTML Meta Header 优化与 CSS Reset。
- [x] 添加 `responsive.js`，实现 `transform: scale` 的游戏视窗等比自适应。所有主流分辨率屏幕在 PC 调试无白边、无变形。
- [x] 改造 `input.js`，加入 `virtualKeys` 数据结构和属性拦截器，运行后不破坏原生键盘手感。

**第二周：触摸模块功能与 UI 开发**
- [x] 开发虚拟控制器的 HTML 和 CSS，悬浮在自适应画布上方。
- [x] 开发 `touch-input.js` 系统，挂载 `touchstart/move/end` 监听。
- [x] 实现并测试右侧 Action Buttons 的点按（多指支持）。

**第三周：摇杆算法与体验打磨 (Polish Phase)**
- [x] 引入摇杆向量运算，实现死区计算及八方向分解（转换为 `virtualKeys.up` 等）。
- [x] 真机联调各种坑：iOS 橡皮筋回弹屏蔽、触摸按钮按下/抬起微小动画反馈、透明度防视线遮挡。
