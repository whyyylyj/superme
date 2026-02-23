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
    flashDuration: 0,

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
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
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
