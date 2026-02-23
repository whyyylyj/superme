# SUPERME 手机触摸屏支持方案

## 1. 概述
当前游戏主要针对 PC 端键盘操作设计。为了提升移动端用户的体验，需要引入一套基于 HTML/CSS 的虚拟摇杆和功能按键系统，模拟键盘输入。

## 2. 操作映射设计
将触摸操作映射到现有的 `Input` 对象中，确保最小化对核心逻辑的改动。

| 触摸区域/按钮 | 对应键盘按键 | 功能说明 |
| :--- | :--- | :--- |
| **左侧虚拟摇杆** | W, A, S, D / 方向键 | 控制角色移动（上下左右） |
| **右侧大按钮 (Shoot)** | J / Z | 射击（主攻） |
| **右侧中按钮 (Jump)** | Space | 跳跃 |
| **右侧小按钮 (Trans)** | K / X | 变换形态 |
| **右侧小按钮 (Home)** | M | 锁定/追踪模式切换 |
| **左下角小按钮 (Sit)** | S | 休息/回血触发 |
| **右上角按钮 (Pause)** | Escape | 暂停游戏 |

## 3. 界面布局方案 (Mobile UI Overlay)

### 3.1 布局草图
```text
+-----------------------------------------------------------+
| [HP Bar] [Score]                           [Stage] [Pause]|
|                                                           |
|                                                           |
|                                                           |
|                                                           |
|      (Up)                                    (Trans)      |
|  (L) Joystick (R)             (Home)                      |
|     (Down)                      (Jump)     [ SHOOT ]      |
|          [ Sit ]                                          |
+-----------------------------------------------------------+
```

### 3.2 响应式设计
- **自动检测**: 通过 `window.ontouchstart` 或 `navigator.maxTouchPoints` 检测是否为触摸设备。
- **动态显示**: 仅在移动设备或触摸屏上显示控制层。
- **样式细节**:
    - **透明度**: 默认 0.5 左右，触摸时 0.8，避免遮挡视线。
    - **动效**: 按钮按下时有缩放或阴影反馈。
    - **防止缩放**: meta 标签需确保 `user-scalable=no`。

## 4. 技术实现思路

### 4.1 输入层改造 (`js/input.js`)
- 扩展 `Input` 对象，增加 `virtualKeys` 状态。
- `get` 访问器（如 `get up()`）改为同时检查物理按键和虚拟按键：
  ```javascript
  get up() { return this.keys.w || this.keys.ArrowUp || this.virtualKeys.up; }
  ```

### 4.2 虚拟摇杆 (Joystick)
- 使用 DOM 监听 `touchstart`, `touchmove`, `touchend`。
- 计算触摸点相对于中心点的偏移量，根据角度判定 8 个方向（或简单的 4 方向）。

### 4.3 按钮系统
- 每一个虚拟按钮对应一个 `div`。
- 监听 `touchstart` 设置对应虚拟键为 `true`，`touchend` 设置为 `false`。

### 4.4 CSS 样式建议
- 使用 `position: fixed` 或 `absolute` 覆盖在游戏容器上。
- 使用 `border-radius: 50%` 制作圆形按钮。
- `pointer-events: auto` 用于按键，容器背景设为 `pointer-events: none`。

## 5. 后续计划
1.  **阶段一**: 编写控制层的 HTML 结构和基础 CSS 样式。
2.  **阶段二**: 修改 `js/input.js` 支持虚拟键状态。
3.  **阶段三**: 实现摇杆逻辑和按钮事件绑定。
4.  **阶段四**: 真机调试及布局微调。
