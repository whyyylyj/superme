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
┌─────────────────────────────────┐
│  HUD (自适应缩小)               │
│  SUPERME  HP  SCORE  LV    🎯💤🔄⏸ │
├─────────────────────────────────┤
│                                 │
│         游戏画面区域            │
│    (800x600 等比缩放)           │
│                                 │
│                                 │
│                                 │
│              🌟 变身            │
│  [摇杆]       ⬆️ 跳跃           │
│              🔥 射击            │
└─────────────────────────────────┘
```

### 按钮映射 (实际实现)

| 虚拟按钮 | 对应按键 (Input.virtualKeys) | 功能 | 位置 |
|---------|-----------------------------|------|------|
| 虚拟摇杆 | `up`, `down`, `left`, `right` | 移动 (上下左右) | 左下角 |
| 🔥 按钮 | `shoot` | 射击 (可被跳跃按钮联动) | 右下角 |
| ⬆️ 按钮 | `jump` | 跳跃 (移动端同时触发自动射击) | 右下角 |
| 🌟 按钮 | `transform` | 变身 | 右下角 |
| 🎯 按钮 | `homing` | 追踪模式切换 (移动端默认开启) | 右上角 (辅助) |
| 💤 按钮 | `sit` | 下蹲/休息 | 右上角 (辅助) |
| 🔄 按钮 | `autofire` | 自动连射开关 | 右上角 (辅助) |
| ⏸ 按钮 | `pause` | 暂停游戏 | 右上角 (辅助) |

---

## 🏗️ 技术架构

### 文件结构

```
superme/
├── js/
│   ├── input.js                    # 现有键盘输入
│   ├── touch-input.js              # 触摸输入模块 (实现虚拟摇杆和按钮逻辑)
│   └── responsive.js               # 响应式缩放系统
├── css/
│   └── style.css                   # 所有 UI 样式，包含触摸控制样式
├── index.html                      # 添加触摸控制 DOM, 引用 responsive.js 和 touch-input.js
└── docs/
    └── 10-MOBILE-TOUCH-DESIGN.md   # 本文档
```

### 模块职责

#### 1. `touch-input.js` — 触摸输入管理器 (已实现)

负责处理所有触摸事件，将触摸手势转换为 `Input.virtualKeys` 状态。
**主要功能点:**
- 虚拟摇杆 (Virtual Joystick) 逻辑，包括死区处理和移动映射。
- 动作按钮 (Action Buttons) 的触摸事件处理，包括按下、释放状态管理。
- 触觉反馈 (`navigator.vibrate`)。
- 移动端专属优化: **自动开启追踪模式** (`player.homingMode = true;` 在 `init` 时)。
- 移动端专属优化: **跳跃按钮联动自动射击** (按下跳跃时 `Input.virtualKeys.shoot` 自动为 `true`)。
- 连射按钮 (`autofire`) 的启停逻辑。
- `sit` 按钮 (而非摇杆长按) 触发下蹲/休息模式。

#### 2. `style.css` — 触摸控制器样式 (已实现)

所有虚拟控制器和响应式布局的样式都集成在 `style.css` 中。
**主要功能点:**
- `.virtual-joystick`, `.joystick-knob` 样式。
- `.action-buttons-container`, `.action-btn`, `.auxiliary-buttons`, `.aux-btn`, `.pause-btn` 样式。
- `@media (max-width: 800px)` 针对移动端通用适配。
- `@media (max-width: 900px) and (orientation: landscape)` 针对移动端横屏进一步优化控件布局和尺寸。
- `@supports (padding-bottom: env(safe-area-inset-bottom))` 实现 iPhone 刘海屏等安全区域适配。

#### 3. `index.html` — 添加触摸控制 DOM (已实现)

在 `id="game-container"` 内部添加了 `id="touch-controls"` 元素，包含所有虚拟摇杆和按钮。
**关键 Meta 标签:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="mobile-web-app-capable" content="yes">
<meta name="screen-orientation" content="landscape"> <!-- 建议横屏 -->
<meta name="x5-orientation" content="landscape">    <!-- 腾讯浏览器横屏 -->
```

---

## 📐 响应式画布适配 (已实现)

### 缩放策略 (`js/responsive.js`)

**`js/responsive.js` 是核心的自适应缩放系统。**
- 在 DOM 加载完成后自动初始化 (`Responsive.init()`)。
- 监听 `window.resize`, `orientationchange`, `fullscreenchange` 事件。
- `detectMobile()` 和 `detectLandscape()` 判断设备类型和方向，并向 `body` 添加 `.mobile-device`, `.desktop-device`, `.landscape`, `.portrait` 等 CSS 类。
- `calculateScale()` (SCALE_MODE: 'fit') 计算最佳缩放比例，并根据 `LANDSCAPE_MIN_HEIGHT_RATIO` (0.65) 在移动端横屏时调整最小高度。
- `applyScale()` 将 `transform: translate(-50%, -50%) scale(currentScale)` 应用到 `#game-container`，实现游戏区域的等比缩放和居中。
- `window.resizeCanvas()` 会在 `applyScale()` 后被调用，通知主循环更新 Canvas。

### Meta 标签优化 (已实现)

详见上方 `index.html` 中的 Meta 标签。通过设置 `user-scalable=no` 等防止浏览器默认缩放行为。

---

## ⚡ 性能优化 (已实现)

### 1. 触摸事件优化
- `touch-action: none` 应用于 `body` 和虚拟控制元素，防止浏览器默认手势 (如下拉刷新、双击缩放)。
- `e.preventDefault()` 在触摸控制元素上调用，阻止事件的默认行为。
- `passive: true` 用于 `window.addEventListener('resize', handleResize, { passive: true })` 等，优化滚动性能，但在需要 `preventDefault` 的触摸事件监听器上使用 `passive: false`。

### 2. 多点触控支持
- `touch-input.js` 通过 `e.changedTouches` 和 `touch.identifier` 独立追踪多个手指，支持多点触控。

### 3. 摇杆死区设置
- `touch-input.js` 在 `moveJoystick` 中实现了摇杆死区 (`joystick.deadzone: 10px`)。

---

## 🎨 视觉反馈设计 (已实现)

### 按钮状态
- CSS `active` 类 (`.action-btn.active`, `.aux-btn.active`, `.pause-btn.active`) 提供触摸时的视觉反馈 (背景色、阴影、缩放动画)。
- `transition: all 0.1s ease-out;` 用于平滑过渡。
- 触觉反馈 (`TouchInput.vibrate()`) 在按钮按下时触发。

---

## 🔧 实现步骤 (已完成)

**所有以下步骤均已完成并部署。**

1. **创建 `touch-input.js`**
   - 实现触摸区域检测
   - 映射到 `Input.virtualKeys` 状态
   - 摇杆逻辑 (包括死区)
   - 按钮逻辑 (包括触觉反馈)
   - 移动端独有优化: 自动开启追踪模式，跳跃联动射击

2. **样式集成到 `style.css`**
   - 虚拟摇杆样式
   - 动作按钮样式
   - 响应式断点
   - 安全区域适配

3. **修改 `index.html`**
   - 添加触摸控制 DOM
   - 添加/优化 viewport 和 orientation meta 标签
   - 引用 `responsive.js` 和 `touch-input.js`

4. **`input.js` 已统一输入接口**
   - 支持键盘 + 触摸同时工作 (`Input.keys` 和 `Input.virtualKeys`)

### Phase 2: 响应式适配 (已完成)

5. **画布缩放逻辑 (`js/responsive.js`)**
   - 根据屏幕尺寸动态缩放
   - 保持宽高比 (`SCALE_MODE: 'fit'`)
   - 自动处理横屏/竖屏样式类和提示

6. **触摸控制位置调整 (CSS `style.css`)**
   - 横屏/竖屏适配
   - 安全区域 (`env(safe-area-inset-*)`) 考虑

---

## 📱 设备适配参考 (已完成)

| 设备类型 | 推荐布局 | 控制器尺寸 (动态调整) |
|----------|----------|--------------------|
| 手机 (< 6") | 横屏 | 摇杆 90px, 主按钮 58px, 辅按钮 32px |
| 大屏手机 (6"+) | 横屏 | 摇杆 90px, 主按钮 58px, 辅按钮 32px |
| 平板 (7"-10") | 横屏 | 摇杆 110px, 主按钮 70px, 辅按钮 38px |
| 桌面 | 隐藏控制器 | 使用键盘 |

**注意:** 控制器尺寸通过 `style.css` 中的媒体查询动态调整，上述尺寸为横屏小尺寸移动设备的近似值。

---

## 🐛 潜在问题与解决方案 (已解决/缓解)

| 问题 | 解决方案 |
|------|---------|
| 浏览器下拉刷新 | `touch-action: none` + `preventDefault()` |
| 长按弹出菜单 | CSS `touch-callout: none` (通过 `body { touch-action: none; }` 间接实现) |
| 双击缩放 | Meta viewport `user-scalable=no` |
| iOS 安全区域 | `viewport-fit=cover` + CSS `env(safe-area-inset)` |
| 触摸延迟 | 使用 `touchstart` 而非 `click`, 优化事件处理 |
| 多指冲突 | 使用 `changedTouches` 独立追踪 |
| SIT 模式触发方式 | 已修改为独立按钮，而非摇杆长按 |

---

## ✅ 验收标准 (已完成)

- [x] 手机上可以完整游玩（移动、跳跃、射击、变身、追踪、连射、下蹲、暂停）
- [x] 虚拟摇杆支持 8 方向移动 (通过 `Input.virtualKeys.up/down/left/right` 映射)
- [x] 支持同时按下多个按钮（移动 + 射击 + 跳跃 等多点触控）
- [x] 横屏体验最佳（自动横屏提示，并优化控件布局）
- [x] 无触摸延迟感 (通过 `passive: false` 和 `preventDefault` 优化)
- [x] 按钮视觉反馈清晰 (通过 `active` 类和 `transition` 实现)
- [x] 不同尺寸屏幕正常显示 (通过 `responsive.js` 和 CSS 媒体查询适配)
- [x] 键盘操作仍然可用（桌面端）
- [x] 移动端专属优化 (自动开启追踪模式，跳跃联动射击) 已实现

---

## 📚 参考资料

- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [Mobile Game Controls Best Practices](https://developer.apple.com/design/human-interface-guidelines/game-controllers/)

---

*Updated: 2026-02-23*
