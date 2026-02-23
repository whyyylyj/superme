# Mobile Touch Optimization: Auto-Homing & Jump-Shoot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为手机端触控设备添加默认开启的子弹跟踪功能和跳跃自动射击功能，提升移动端游戏体验。

**Architecture:** 最小侵入式修改，仅在 TouchInput 模块内实现手机端专属逻辑，不修改核心 Player 类，确保桌面端不受影响。

**Tech Stack:**
- Vanilla JavaScript (ES6)
- Touch events API
- Virtual key system (Input.virtualKeys)

---

## Task 1: 触控设备检测时默认开启 homingMode

**Files:**
- Modify: `js/touch-input.js:41-92`

**Step 1: 修改 TouchInput.init() 方法，在触控设备初始化时自动开启追踪模式**

在 `TouchInput.init()` 方法的末尾（约第83行之后），添加以下代码：

```javascript
// Mobile optimization: Auto-enable homing mode on touch devices
if (typeof player !== 'undefined' && player) {
    player.homingMode = true;
    console.log('[TouchInput] Auto-enabled homing mode for mobile');

    // Visual feedback: create green particles to indicate homing mode
    if (typeof ParticleSystem !== 'undefined') {
        setTimeout(() => {
            const centerX = player.x + player.width / 2;
            const centerY = player.y + player.height / 2;
            ParticleSystem.createExplosion(centerX, centerY, '#00ff00', 10);
        }, 500);
    }
}
```

**说明：**
- 在 TouchInput 初始化完成后（已确认为触控设备）
- 检查全局 `player` 对象是否存在
- 自动设置 `player.homingMode = true`
- 添加控制台日志便于调试
- 使用粒子系统提供视觉反馈

**Step 2: 在浏览器中测试（手动验证）**

测试步骤：
1. 使用 Chrome DevTools 模拟移动设备（F12 -> Toggle device toolbar）
2. 刷新页面，开始游戏
3. 打开浏览器控制台，应该看到 `[TouchInput] Auto-enabled homing mode for mobile` 日志
4. 发射子弹，观察子弹是否自动追踪敌人
5. 验证右上角 🎯 按钮仍可正常工作（可切换追踪模式）

预期结果：
- ✅ 控制台显示自动开启追踪的日志
- ✅ 子弹自动追踪最近的敌人
- ✅ 🎯 按钮仍可手动切换追踪模式
- ✅ 粒子特效显示绿色爆炸（追踪开启）

**Step 3: 提交变更**

```bash
git add js/touch-input.js
git commit -m "feat(mobile): auto-enable homing mode on touch devices

- TouchInput.init() now automatically enables player.homingMode
- Added visual feedback via ParticleSystem
- Console logging for debugging
- Preserves manual toggle functionality via 🎯 button
```

---

## Task 2: 跳跃按钮按下时自动触发射击

**Files:**
- Modify: `js/touch-input.js:294-362`

**Step 1: 修改 setupButtons() 方法中跳跃按钮的 touchstart 事件处理**

在 `setupButtons()` 方法中找到跳跃按钮的事件监听器（约第300-333行），修改如下：

找到这段代码：
```javascript
btn.addEventListener('touchstart', (e) => {
    // 特殊处理连射按钮
    if (key === 'autofire') {
        this.startAutoFire();
        btn.classList.add('active');
        this.vibrate([10, 30, 10]);
        e.preventDefault();
        return;
    }

    // 正常按钮处理
    Input.virtualKeys[key] = true;
    btn.classList.add('active');
    // ... 其余代码
});
```

在"正常按钮处理"部分之后，添加跳跃按钮的自动射击逻辑：

```javascript
btn.addEventListener('touchstart', (e) => {
    // 特殊处理连射按钮
    if (key === 'autofire') {
        this.startAutoFire();
        btn.classList.add('active');
        this.vibrate([10, 30, 10]);
        e.preventDefault();
        return;
    }

    // 正常按钮处理
    Input.virtualKeys[key] = true;
    btn.classList.add('active');

    // Mobile optimization: Jump button triggers auto-shoot
    if (key === 'jump') {
        Input.virtualKeys.shoot = true;
        console.log('[TouchInput] Jump pressed - auto-shooting enabled');
    }

    // Haptic feedback
    if (key === 'shoot') {
        this.vibrate(10);
    } else if (key === 'jump') {
        this.vibrate(15);
    } else if (key === 'pause') {
        this.vibrate([10, 50, 10]);
        setTimeout(() => {
            Input.virtualKeys.pause = false;
            btn.classList.remove('active');
        }, 100);
    } else if (key === 'sit') {
        this.vibrate([5, 10, 5]);
    } else {
        this.vibrate(5);
    }

    e.preventDefault();
});
```

**Step 2: 修改跳跃按钮的 touchend 事件处理**

找到 touchend 事件监听器（约第335-351行），修改如下：

```javascript
btn.addEventListener('touchend', (e) => {
    // 如果是暂停按钮，忽略 touchend
    if (key === 'pause') return;

    // 特殊处理连射按钮
    if (key === 'autofire') {
        this.stopAutoFire();
        btn.classList.remove('active');
        e.preventDefault();
        return;
    }

    // 正常按钮处理
    Input.virtualKeys[key] = false;
    btn.classList.remove('active');

    // Mobile optimization: Stop auto-shoot when jump button released
    if (key === 'jump') {
        Input.virtualKeys.shoot = false;
        console.log('[TouchInput] Jump released - auto-shooting disabled');
    }

    e.preventDefault();
});
```

**Step 3: 同样修改 touchcancel 事件处理**

找到 touchcancel 事件监听器（约第353-361行），添加相同逻辑：

```javascript
btn.addEventListener('touchcancel', (e) => {
    if (key === 'autofire') {
        this.stopAutoFire();
        btn.classList.remove('active');
        return;
    }
    Input.virtualKeys[key] = false;
    btn.classList.remove('active');

    // Mobile optimization: Stop auto-shoot on touch cancel
    if (key === 'jump') {
        Input.virtualKeys.shoot = false;
        console.log('[TouchInput] Jump cancelled - auto-shooting disabled');
    }
});
```

**Step 4: 在浏览器中测试（手动验证）**

测试步骤：
1. 使用 Chrome DevTools 模拟移动设备
2. 开始游戏
3. 按下跳跃按钮（⬆️），观察：
   - ✅ 角色跳跃
   - ✅ 自动发射子弹
   - ✅ 控制台显示 `[TouchInput] Jump pressed - auto-shooting enabled`
4. 释放跳跃按钮，观察：
   - ✅ 停止射击
   - ✅ 控制台显示 `[TouchInput] Jump released - auto-shooting disabled`
5. 验证射击冷却时间仍然正常（不会因为自动射击而过快）
6. 验证手动点击 🔥 射击按钮仍然正常工作

预期结果：
- ✅ 按住跳跃按钮时持续跳跃+射击
- ✅ 释放跳跃按钮时停止射击
- ✅ 射击冷却时间正常（无过密问题）
- ✅ 手动射击按钮仍可用
- ✅ 触觉反馈正常

**Step 5: 提交变更**

```bash
git add js/touch-input.js
git commit -m "feat(mobile): jump button triggers auto-shoot on touch devices

- Pressing jump button now automatically enables shooting
- Releasing jump button stops shooting
- Respects existing shoot cooldown timing
- Manual fire button (🔥) remains functional
- Added console logging for debugging
- Applied to touchstart, touchend, and touchcancel events
```

---

## Task 3: 验证桌面端不受影响

**Files:**
- Test: `js/touch-input.js`

**Step 1: 在桌面浏览器中测试**

测试步骤：
1. 使用普通桌面浏览器（非移动设备模式）
2. 打开浏览器控制台
3. 开始游戏
4. 验证：
   - ✅ 控制台**没有** `[TouchInput] Auto-enabled homing mode` 日志（因为不是触控设备）
   - ✅ `player.homingMode` 默认为 `false`（输入 `player.homingMode` 查看）
   - ✅ 按 Space 键跳跃**不会**自动射击
   - ✅ 按 M 键仍可切换追踪模式
   - ✅ 按 J/Z 键射击正常

预期结果：
- ✅ 桌面端行为完全不变
- ✅ TouchInput.init() 跳过触控设备初始化（显示 "Not a touch device, skipping initialization"）

**Step 2: 提交验证结果（注释）**

在 `js/touch-input.js` 文件顶部添加注释说明：

```javascript
/**
 * touch-input.js
 * Handles virtual joystick and action buttons for mobile devices.
 *
 * Mobile-Only Optimizations:
 * - Auto-enable homing mode on touch devices (Task 1)
 * - Jump button triggers auto-shoot (Task 2)
 *
 * Desktop Behavior:
 * - TouchInput.init() skips all initialization
 * - No changes to desktop keyboard controls
 * - Homing mode remains opt-in via M key
 *
 * Features:
 * - Virtual joystick with deadzone
 * - Action buttons with haptic feedback
 * - Long-press joystick for SIT/rest mode
 * - Multi-touch support
 */
```

**Step 3: 提交文档更新**

```bash
git add js/touch-input.js
git commit -m "docs(mobile): document touch-only optimizations

- Added header documentation explaining mobile-only behavior
- Clarified that desktop is unaffected
- Documented auto-homing and jump-shoot features
```

---

## Task 4: 更新移动端文档

**Files:**
- Modify: `docs/10-MOBILE-ADAPTATION.md` or create new section

**Step 1: 在移动端文档中添加新功能说明**

在 `docs/10-MOBILE-ADAPTATION.md` 文件末尾添加：

```markdown
## Mobile-Exclusive Optimizations (Feb 23, 2026)

### Auto-Homing Mode

On touch devices, the homing mode (子弹跟踪) is **automatically enabled** at game start.

- **Behavior:** Bullets automatically track nearest enemy
- **Manual Control:** Tap 🎯 button to toggle homing on/off
- **Visual Feedback:** Green particle explosion when enabled
- **Desktop:** Remains opt-in via M key (no change)

### Jump-Shoot Combo

Pressing the jump button (⬆️) automatically triggers continuous shooting.

- **Behavior:** Hold jump to jump + shoot simultaneously
- **Cooldown:** Respects existing shoot timing (no bullet spam)
- **Manual Override:** Fire button (🔥) still works independently
- **Desktop:** No change - keyboard controls remain separate

### Implementation Details

See: `js/touch-input.js`

- Auto-homing enabled in `TouchInput.init()` at device detection
- Jump-shoot combo in `setupButtons()` event handlers
- Touch-only logic - zero impact on desktop gameplay
```

**Step 2: 提交文档更新**

```bash
git add docs/10-MOBILE-ADAPTATION.md
git commit -m "docs(mobile): document auto-homing and jump-shoot features

- Added mobile-exclusive optimizations section
- Explained auto-homing behavior and manual toggle
- Documented jump-shoot combo mechanic
- Clarified desktop remains unchanged
```

---

## Testing Checklist

### Mobile Testing (Required)

- [ ] **Auto-Homing**
  - [ ] Launch game on real mobile device or DevTools mobile emulation
  - [ ] Verify homing mode is ON at start (check console log)
  - [ ] Fire bullets and observe enemy tracking
  - [ ] Tap 🎯 button to toggle OFF
  - [ ] Fire bullets and observe NO tracking
  - [ ] Tap 🎯 button to toggle ON again
  - [ ] Verify green particle effect on enable

- [ ] **Jump-Shoot Combo**
  - [ ] Press and hold jump button (⬆️)
  - [ ] Verify character jumps AND shoots simultaneously
  - [ ] Release jump button
  - [ ] Verify shooting stops
  - [ ] Rapid tap jump button (test burst firing)
  - [ ] Verify shoot cooldown is respected (no spam)

- [ ] **Integration**
  - [ ] Test both features together (jump with homing on)
  - [ ] Verify manual fire button (🔥) still works
  - [ ] Verify pause button (⏸️) works during jump-shoot
  - [ ] Test touchcancel events (finger slips off button)

### Desktop Testing (Required)

- [ ] **No Regression**
  - [ ] Launch game in desktop browser
  - [ ] Verify NO auto-homing at start (check console)
  - [ ] Verify Space bar does NOT auto-shoot
  - [ ] Verify M key toggles homing mode
  - [ ] Verify J/Z key fires normally
  - [ ] Verify all keyboard controls unchanged

### Cross-Platform Testing (Recommended)

- [ ] Test on actual iOS device (Safari/Chrome)
- [ ] Test on actual Android device (Chrome)
- [ ] Test on iPad (tablet mode)
- [ ] Test various screen orientations (portrait/landscape)

---

## Rollback Plan

If issues arise, revert commits in reverse order:

```bash
# Rollback Task 4 (docs)
git revert HEAD

# Rollback Task 3 (desktop verification)
git revert HEAD

# Rollback Task 2 (jump-shoot)
git revert HEAD

# Rollback Task 1 (auto-homing)
git revert HEAD
```

Or complete rollback:

```bash
git reset --hard HEAD~4  # Removes all 4 commits
```

---

## Related Files

### Core Files Modified
- `js/touch-input.js` - All implementation logic

### Files Referenced (Read-Only)
- `js/input.js` - Virtual key system
- `js/player.js` - Player.homingMode property
- `js/transform/form-*.js` - Homing bullet creation
- `js/bullet.js` - Homing trajectory logic
- `index.html` - Touch control button layout

### Documentation
- `docs/10-MOBILE-ADAPTATION.md` - Mobile feature docs
- `docs/00-ARCHITECTURE.md` - Project architecture reference

---

## Success Criteria

✅ **Functional Requirements**
- Touch devices auto-enable homing mode at game start
- Jump button triggers continuous shooting while pressed
- Desktop gameplay completely unchanged
- Manual controls (🎯, 🔥) remain functional

✅ **Quality Requirements**
- No performance regression
- Shoot cooldown respected (no bullet spam)
- Proper touch event handling (including cancel)
- Clear console logging for debugging

✅ **User Experience**
- Seamless mobile gameplay enhancement
- Intuitive one-handed operation (jump + shoot)
- Visual feedback for homing mode state
- Haptic feedback on button presses

---

## Notes for Developer

- **Minimal Invasiveness:** All changes are in `TouchInput` module only
- **Zero Desktop Impact:** TouchInput.init() early-exits on non-touch devices
- **Backward Compatible:** Existing controls and gameplay mechanics unchanged
- **Debugging:** Console logs prefixed with `[TouchInput]` for easy filtering
- **Future Enhancements:** Consider settings menu for mobile preferences
