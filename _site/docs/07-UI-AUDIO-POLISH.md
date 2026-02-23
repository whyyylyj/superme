# Task 07 — UI / 音效 / 打磨 (UI, Audio & Polish)

> **前置阅读：** `00-ARCHITECTURE.md`  
> **负责文件：** `index.html` 改造, `css/style.css` 改造, 新增 `js/core/audio-manager.js`, `js/core/screen-effects.js`  
> **可并行：** ✅ 与 Task 01/02/03 并行开发

---

## 1. 任务目标

提升游戏的**整体体验质感**——包括 UI 界面改造、屏幕特效、音效系统、过渡动画。让游戏从"能玩"变成"好玩 + 好看 + 有感觉"。

---

## 2. UI 界面改造

### 2.1 开始界面

**现在的问题：** 简单的文字 + 按钮，缺乏吸引力。

**改造方案：**

```
┌────────────────────────────────────┐
│  ╔══════════════════════════════╗  │
│  ║     S U P E R M E           ║  │  ← 大号 logo，发光动画
│  ╚══════════════════════════════╝  │
│                                    │
│  ━━ An Epic Bullet Hell Journey ━━ │  ← 副标题
│                                    │
│  ◇ 3 LEVELS  ◇ 4 FORMS  ◇ DANMAKU │  ← 特色标签
│                                    │
│  ┌──────────────────────────┐      │
│  │     ▶  START GAME        │      │  ← 主按钮，脉冲发光
│  └──────────────────────────┘      │
│                                    │
│  [WASD/Arrows] Move  [Space] Jump  │  ← 操作提示
│  [J/Z] Shoot  [K/X] Transform     │
│                                    │
│  v1.0  |  2026                     │  ← 版本号
└────────────────────────────────────┘
```

**CSS 效果：**
- Logo 文字使用 `text-shadow` 多层发光
- Logo 周围有粒子漂浮动画（用 CSS `@keyframes`）
- 按钮有脉冲发光边框动画
- 背景使用 `linear-gradient` 动画（慢慢变色）

### 2.2 HUD 改造

**现在的 HUD：** `HP: 3 | WPN: Normal | BAMBOO`（纯文字）

**改造方案：**

```
┌──────────────────────────────────────────────────────────┐
│  SUPERME   ♥♥♥♥♥   [■■■■■■░░░░]   🔫 NORMAL   LV1      │
│            HP 条     变身倒计时条    武器类型    关卡号    │
└──────────────────────────────────────────────────────────┘
```

- **HP 显示**：用心形图标代替数字（满血亮色，空血暗色）
- **变身条**：当有变身时显示倒计时进度条，颜色对应形态
- **武器图标**：小型图标 + 名称
- **关卡号**：当前关卡标识

```css
/* HP 心形 */
.hp-hearts {
    display: flex;
    gap: 4px;
}

.hp-heart {
    width: 16px;
    height: 16px;
    position: relative;
}

.hp-heart.full::before {
    content: '♥';
    color: #ff3333;
    text-shadow: 0 0 5px #ff3333;
    font-size: 14px;
}

.hp-heart.empty::before {
    content: '♥';
    color: #333333;
    font-size: 14px;
}

/* 变身进度条 */
.transform-bar {
    width: 120px;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.transform-bar-fill {
    height: 100%;
    transition: width 0.1s linear;
    border-radius: 4px;
}
```

### 2.3 Boss 血条改造

```
┌──────────────────────────────────────┐
│   ★ TREANT KING ★                    │
│   [████████████████████░░░░░░░░░░]   │  ← 渐变色血条
│   Phase 1 / 2                        │  ← 阶段指示器
└──────────────────────────────────────┘
```

- 血条使用三层渐变（绿 > 黄 > 红，根据 HP 百分比）
- Boss 名称有装饰符号
- 阶段指示器用小圆点

### 2.4 关卡过渡动画

```
┌────────────────────────────────────┐
│                                    │
│          LEVEL 1 CLEAR!            │  ← 文字从中心放大出现
│                                    │
│    ═══════════════════════════     │  ← 分隔线淡入
│                                    │
│        ENTERING LEVEL 2            │  ← 新关卡名淡入
│      ~ NETHER INFERNO ~           │
│                                    │
└────────────────────────────────────┘
```

**动画序列（2 秒）：**
1. 0.0s — 画面渐暗
2. 0.3s — "LEVEL X CLEAR!" 文字弹入（scale 从 2 到 1）
3. 1.0s — 分隔线展开
4. 1.3s — 新关卡名淡入
5. 1.8s — 画面渐亮进入新关卡

### 2.5 Game Over 界面

```
┌────────────────────────────────────┐
│                                    │
│        G A M E   O V E R          │  ← 文字抖动 + 红色发光
│                                    │
│   "The darkness consumed you..."   │  ← 随机选择一句话
│                                    │
│       ┌──────────────────┐        │
│       │   ▶  TRY AGAIN   │        │
│       └──────────────────┘        │
│                                    │
│       ┌──────────────────┐        │
│       │   ◀  MAIN MENU   │        │
│       └──────────────────┘        │
└────────────────────────────────────┘
```

**Game Over 名言库（随机显示一句）：**
```javascript
const DEATH_QUOTES = [
    "The darkness consumed you...",
    "But the hero refused to give up!",
    "Every defeat makes you stronger.",
    "The journey is not over yet.",
    "Rise again, warrior!",
    "You were so close...",
    "The enemy grows stronger. So must you.",
];
```

### 2.6 最终胜利界面

```
┌────────────────────────────────────┐
│  🎆            🎇           🎆     │  ← 持续烟花动画
│                                    │
│       ★ C O N G R A T S ★        │  ← 彩虹渐变文字
│                                    │
│     You defeated the Sky Tyrant    │
│    and saved the world! ✨         │
│                                    │
│  🎆     🎇        🎆     🎇       │
│                                    │
│       ┌──────────────────┐        │
│       │  ▶  PLAY AGAIN    │        │
│       └──────────────────┘        │
└────────────────────────────────────┘
```

- 文字使用彩虹色动画（hue-rotate）
- 背景持续产生五彩烟花
- 有落下的金色粒子（类似纸片飘落）

---

## 3. 屏幕特效系统

### 3.1 `js/core/screen-effects.js`

```javascript
// screen-effects.js

const ScreenEffects = {
    // 屏幕震动
    shakeIntensity: 0,
    shakeTimer: 0,
    shakeOffsetX: 0,
    shakeOffsetY: 0,

    // 全屏闪光
    flashColor: null,
    flashAlpha: 0,

    // 慢动作
    timeScale: 1,
    slowMotionTimer: 0,

    /**
     * 触发屏幕震动
     * @param {number} intensity - 震动强度（像素）
     * @param {number} duration - 持续时间（秒）
     */
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    },

    /**
     * 触发全屏闪光
     * @param {string} color - 闪光颜色
     * @param {number} duration - 持续时间（秒）
     */
    flash(color, duration = 0.2) {
        this.flashColor = color;
        this.flashAlpha = 1;
        this.flashDuration = duration;
    },

    /**
     * 触发慢动作
     * @param {number} scale - 时间缩放（0.1 = 10 倍慢）
     * @param {number} duration - 持续时间（秒）
     */
    slowMotion(scale, duration) {
        this.timeScale = scale;
        this.slowMotionTimer = duration;
    },

    /**
     * 每帧更新
     */
    update(dt) {
        // 屏幕震动
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeIntensity *= 0.95; // 衰减
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }

        // 全屏闪光
        if (this.flashAlpha > 0) {
            this.flashAlpha -= dt / this.flashDuration;
            if (this.flashAlpha < 0) this.flashAlpha = 0;
        }

        // 慢动作
        if (this.slowMotionTimer > 0) {
            this.slowMotionTimer -= dt;
            if (this.slowMotionTimer <= 0) {
                this.timeScale = 1;
            }
        }
    },

    /**
     * 在 draw 开始前调用 — 应用震动偏移
     */
    applyPreDraw(ctx) {
        if (this.shakeOffsetX !== 0 || this.shakeOffsetY !== 0) {
            ctx.save();
            ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
        }
    },

    /**
     * 在 draw 结束后调用 — 绘制全屏闪光效果
     */
    applyPostDraw(ctx, canvas) {
        // 恢复震动偏移
        if (this.shakeOffsetX !== 0 || this.shakeOffsetY !== 0) {
            ctx.restore();
        }

        // 全屏闪光
        if (this.flashAlpha > 0 && this.flashColor) {
            ctx.save();
            ctx.globalAlpha = this.flashAlpha;
            ctx.fillStyle = this.flashColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    },

    /**
     * 获取调整后的 dt
     */
    getScaledDt(dt) {
        return dt * this.timeScale;
    }
};
```

### 3.2 使用场景

| 效果 | 触发事件 | 参数 |
|------|---------|------|
| 震动 | 玩家受伤 | `shake(5, 0.3)` |
| 震动 | Boss 阶段变化 | `shake(10, 0.5)` |
| 震动 | Boss 死亡 | `shake(15, 1.0)` |
| 闪光 | 变身 | `flash('#ffffff', 0.3)` |
| 闪光 | Boss 死亡 | `flash('#ffffff', 0.5)` |
| 慢动作 | Boss 死亡 | `slowMotion(0.3, 2.0)` |
| 慢动作 | 玩家死亡 | `slowMotion(0.5, 1.0)` |

### 3.3 在 `main.js` 中集成

```javascript
function gameLoop(timestamp) {
    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = timestamp;

    // 应用慢动作
    dt = ScreenEffects.getScaledDt(dt);

    ScreenEffects.update(dt);
    update(dt);

    // 震动 + 绘制 + 闪光
    ScreenEffects.applyPreDraw(ctx);
    draw();
    ScreenEffects.applyPostDraw(ctx, canvas);

    animationId = requestAnimationFrame(gameLoop);
}
```

---

## 4. 音效系统

### 4.1 `js/core/audio-manager.js`

使用 Web Audio API 生成简单的 8-bit 风格音效（不需要外部音频文件）：

```javascript
// audio-manager.js

const AudioManager = {
    audioCtx: null,
    muted: false,
    volume: 0.3,

    init() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    },

    /**
     * 播放简单音调
     */
    playTone(frequency, duration, type = 'square', volume = null) {
        if (this.muted || !this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
        osc.frequency.value = frequency;
        gain.gain.value = volume || this.volume;

        // 渐弱
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    },

    // 预定义音效
    sfx: {
        shoot() {
            AudioManager.playTone(800, 0.05, 'square', 0.15);
        },

        hit() {
            AudioManager.playTone(200, 0.1, 'sawtooth', 0.2);
        },

        explosion() {
            AudioManager.playTone(100, 0.3, 'sawtooth', 0.3);
            setTimeout(() => AudioManager.playTone(60, 0.2, 'sawtooth', 0.2), 100);
        },

        powerup() {
            AudioManager.playTone(523, 0.1, 'sine', 0.2); // C5
            setTimeout(() => AudioManager.playTone(659, 0.1, 'sine', 0.2), 100); // E5
            setTimeout(() => AudioManager.playTone(784, 0.15, 'sine', 0.2), 200); // G5
        },

        transform() {
            AudioManager.playTone(261, 0.1, 'square', 0.2);
            setTimeout(() => AudioManager.playTone(329, 0.1, 'square', 0.2), 80);
            setTimeout(() => AudioManager.playTone(392, 0.1, 'square', 0.2), 160);
            setTimeout(() => AudioManager.playTone(523, 0.2, 'square', 0.25), 240);
        },

        jump() {
            AudioManager.playTone(400, 0.08, 'sine', 0.1);
            setTimeout(() => AudioManager.playTone(600, 0.08, 'sine', 0.1), 50);
        },

        damage() {
            AudioManager.playTone(150, 0.15, 'square', 0.25);
            AudioManager.playTone(100, 0.15, 'sawtooth', 0.2);
        },

        bossAppear() {
            AudioManager.playTone(100, 0.3, 'square', 0.3);
            setTimeout(() => AudioManager.playTone(80, 0.3, 'square', 0.3), 300);
            setTimeout(() => AudioManager.playTone(60, 0.5, 'square', 0.35), 600);
        },

        bossDefeat() {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    AudioManager.playTone(200 + i * 100, 0.15, 'square', 0.2);
                }, i * 100);
            }
        },

        levelClear() {
            const notes = [523, 587, 659, 784, 880, 988, 1047];
            notes.forEach((freq, i) => {
                setTimeout(() => AudioManager.playTone(freq, 0.15, 'sine', 0.2), i * 120);
            });
        },

        menuSelect() {
            AudioManager.playTone(600, 0.05, 'sine', 0.15);
        },

        gameOver() {
            const notes = [392, 349, 330, 262];
            notes.forEach((freq, i) => {
                setTimeout(() => AudioManager.playTone(freq, 0.3, 'sine', 0.2), i * 300);
            });
        }
    },

    toggleMute() {
        this.muted = !this.muted;
    }
};
```

### 4.2 音效触发点

通过 EventBus 订阅事件来播放音效：

```javascript
// 在 main.js 的初始化中注册
EventBus.on('player:damage', () => AudioManager.sfx.damage());
EventBus.on('player:death', () => AudioManager.sfx.gameOver());
EventBus.on('player:transform', () => AudioManager.sfx.transform());
EventBus.on('boss:spawn', () => AudioManager.sfx.bossAppear());
EventBus.on('boss:defeat', () => AudioManager.sfx.bossDefeat());
EventBus.on('boss:phase', () => ScreenEffects.shake(10, 0.5));
EventBus.on('level:complete', () => AudioManager.sfx.levelClear());
EventBus.on('game:over', () => AudioManager.sfx.gameOver());
```

直接调用的音效：

```javascript
// 在 player.shoot() 中
AudioManager.sfx.shoot();

// 在 player 跳跃时
AudioManager.sfx.jump();

// 在拾取道具时
AudioManager.sfx.powerup();
```

---

## 5. CSS 动画增强

### 5.1 Logo 发光脉冲

```css
.logo {
    animation: logoGlow 2s ease-in-out infinite alternate,
               logoPulse 3s ease-in-out infinite;
}

@keyframes logoGlow {
    0% {
        text-shadow:
            0 0 10px var(--primary-color),
            0 0 20px var(--primary-color),
            0 0 30px var(--secondary-color);
    }
    100% {
        text-shadow:
            0 0 20px var(--primary-color),
            0 0 40px var(--primary-color),
            0 0 60px var(--secondary-color),
            0 0 80px var(--secondary-color);
    }
}

@keyframes logoPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
}
```

### 5.2 按钮呼吸效果

```css
.btn {
    animation: btnBreathe 2s ease-in-out infinite;
}

@keyframes btnBreathe {
    0%, 100% {
        box-shadow: inset 0 0 10px rgba(0, 255, 204, 0.2),
                    0 0 5px rgba(0, 255, 204, 0.1);
    }
    50% {
        box-shadow: inset 0 0 10px rgba(0, 255, 204, 0.4),
                    0 0 15px rgba(0, 255, 204, 0.3);
    }
}
```

### 5.3 游戏结束文字抖动

```css
.game-over-text {
    animation: textShake 0.5s ease-in-out infinite;
}

@keyframes textShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px) rotate(-0.5deg); }
    75% { transform: translateX(3px) rotate(0.5deg); }
}
```

### 5.4 胜利彩虹文字

```css
.victory-text {
    background: linear-gradient(
        90deg,
        #ff0000, #ff8800, #ffff00,
        #00ff00, #0088ff, #aa00ff
    );
    background-size: 400% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rainbowMove 2s linear infinite;
}

@keyframes rainbowMove {
    0% { background-position: 0% 50%; }
    100% { background-position: 400% 50%; }
}
```

---

## 6. 新增操作：暂停

### 6.1 暂停功能

按 `Escape` 键暂停游戏：

```javascript
// 在 input.js 中添加
keys: {
    // ... 现有按键 ...
    Escape: false
}

get pause() { return this.keys.Escape; }
```

### 6.2 暂停界面

```html
<div id="pause-screen" class="overlay hidden">
    <h1>PAUSED</h1>
    <p>Take a breather, hero.</p>
    <button id="resume-btn" class="btn">RESUME</button>
    <button id="mute-btn" class="btn btn-small">SOUND: ON</button>
    <button id="quit-btn" class="btn btn-danger">QUIT TO MENU</button>
</div>
```

---

## 7. 其他打磨

### 7.1 弹幕数量指示器（调试/炫技用）

在屏幕右下角显示当前弹幕数量：

```javascript
// 在 HUD 中添加
ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
ctx.font = '8px monospace';
ctx.fillText(`Bullets: ${bullets.length}`, canvas.width - 100, canvas.height - 10);
```

### 7.2 击杀计数器

```javascript
let killCount = 0;

EventBus.on('enemy:kill', () => {
    killCount++;
});
```

### 7.3 按键提示动画

在游戏开始时显示操作键位 overlay，3 秒后自动消失。

---

## 8. 改造 `index.html`

需要更新的 HTML 元素：

```html
<!-- 更新 HUD -->
<div id="hud" class="hidden">
    <div class="hud-item title">SUPERME</div>
    <div class="hud-item">
        <div class="hp-hearts" id="hp-hearts">
            <!-- JS 动态生成 -->
        </div>
    </div>
    <div class="hud-item">
        <span id="wpn-val" class="weapon-indicator">Normal</span>
    </div>
    <div class="hud-item">
        <div class="transform-bar" id="transform-bar" style="display:none">
            <div class="transform-bar-fill" id="transform-bar-fill"></div>
        </div>
        <span id="form-val" class="form-indicator"></span>
    </div>
    <div class="hud-item">LV<span id="level-val">1</span></div>
</div>

<!-- 暂停界面 -->
<div id="pause-screen" class="overlay hidden">
    <h1 class="glow">PAUSED</h1>
    <p>Take a breather, hero.</p>
    <button id="resume-btn" class="btn">RESUME</button>
    <button id="mute-btn" class="btn">🔊 SOUND: ON</button>
</div>

<!-- 更新 Boss HUD -->
<div id="boss-hud" class="hidden">
    <div class="boss-name">
        <span class="boss-star">★</span>
        <span id="boss-name-text">BOSS</span>
        <span class="boss-star">★</span>
    </div>
    <div class="boss-hp-bar-container">
        <div id="boss-hp-bar" class="boss-hp-fill"></div>
    </div>
    <div class="boss-phase" id="boss-phase">Phase 1</div>
</div>
```

---

## 9. 验收标准

- [ ] 开始界面 Logo 有呼吸发光动画
- [ ] 按钮有脉冲发光效果
- [ ] HUD 显示心形 HP 图标
- [ ] HUD 显示变身倒计时进度条
- [ ] HUD 显示当前关卡号
- [ ] Boss 血条有渐变色和阶段指示
- [ ] 关卡过渡有完整的淡入淡出 + 文字动画
- [ ] Game Over 界面有抖动效果和随机名言
- [ ] 胜利界面有彩虹文字和烟花
- [ ] 屏幕震动在受伤/Boss 阶段变化时触发
- [ ] 全屏闪光在变身/Boss 死亡时触发
- [ ] 慢动作效果正常工作
- [ ] 8-bit 音效在射击/跳跃/受伤/拾取时播放
- [ ] 暂停功能正常（Escape 键）
- [ ] 静音按钮可以关闭和开启音效
- [ ] 整体视觉体验**显著提升**

---

## 10. 不要做的事

- ❌ 不要修改关卡内容（Task 04-06 负责）
- ❌ 不要修改变身系统逻辑（Task 02 负责）
- ❌ 不要修改弹幕引擎逻辑（Task 03 负责）
- ❌ 不要引入外部音频文件（使用 Web Audio API 合成）
- ❌ 不要引入任何 JavaScript 库

---

*完成后，与其他 Agent 进行集成测试，确保所有特效和音效在游戏流程中正确触发。*
