// js/core/level-manager.js

/**
 * LevelManager - 关卡管理器
 * 负责关卡注册、加载、切换和过渡动画
 */
const LevelManager = {
    levels: [],             // 注册的关卡实例数组
    currentLevelIndex: -1,  // 当前关卡索引（-1 表示未开始）
    currentLevel: null,     // 当前关卡对象引用

    transitionTimer: 0,
    transitionDuration: CONFIG.LEVELS.TRANSITION_DURATION,

    checkpoint: null,       // 保存当前关卡的暂存点信息 {levelIndex, x, y}

    setCheckpoint(levelIndex, x, y) {
        this.checkpoint = { levelIndex, x, y };
        console.log(`Checkpoint saved: Level ${levelIndex}, X:${x}, Y:${y}`);
    },

    clearCheckpoint() {
        this.checkpoint = null;
        console.log('Checkpoint cleared');
    },

    /**
     * 注册关卡
     * @param {LevelBase} level - 关卡实例
     */
    registerLevel(level) {
        this.levels.push(level);
        console.log(`Level registered: ${level.name} (Index: ${this.levels.length - 1})`);
    },

    /**
     * 开始游戏（从第一关）
     */
    startGame() {
        this.currentLevelIndex = 0;
        this.loadCurrentLevel();
    },

    /**
     * 加载当前索引指向的关卡
     */
    loadCurrentLevel() {
        if (this.currentLevel) {
            this.currentLevel.cleanup();
        }

        this.currentLevel = this.levels[this.currentLevelIndex];
        this.currentLevel.init();

        EventBus.emit(EventBus.EVENTS.LEVEL_START, {
            levelNumber: this.currentLevelIndex + 1,
            levelName: this.currentLevel.name
        });

        console.log(`Level loaded: ${this.currentLevel.name}`);
    },

    /**
     * 进入下一关
     * @returns {boolean} 是否还有下一关
     */
    nextLevel() {
        console.log(`[LevelManager] nextLevel() called: currentLevelIndex=${this.currentLevelIndex}, levels.length=${this.levels.length}`);

        if (this.currentLevelIndex + 1 >= this.levels.length) {
            // 已经是最后一关，游戏通关
            EventBus.emit(EventBus.EVENTS.GAME_WIN, {});
            return false;
        }

        this.currentLevelIndex++;
        this.transitionTimer = this.transitionDuration;

        EventBus.emit(EventBus.EVENTS.LEVEL_TRANSITION, {
            // 🔧 P1修复：统一使用 1-based levelNumber（与 level:start 事件保持一致）
            from: this.currentLevelIndex,       // 自增后 currentLevelIndex 是新关卡，故原关卡 = currentLevelIndex
            to: this.currentLevelIndex + 1
        });

        return true;
    },

    /**
     * 更新关卡过渡
     * @param {number} dt - Delta time (秒)
     * @returns {boolean} 过渡是否完成
     */
    updateTransition(dt) {
        if (this.transitionTimer > 0) {
            this.transitionTimer -= dt;
            if (this.transitionTimer <= 0) {
                this.loadCurrentLevel();
                return true; // 过渡完成
            }
        }
        return false;
    },

    /**
     * 获取过渡进度 (0~1)
     * @returns {number}
     */
    getTransitionProgress() {
        return 1 - (this.transitionTimer / this.transitionDuration);
    },

    /**
     * 绘制关卡过渡效果
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLCanvasElement} canvas
     */
    drawTransition(ctx, canvas) {
        const progress = this.getTransitionProgress();

        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = progress < 0.5
            ? progress * 2      // 前半：渐入黑色
            : 2 - progress * 2; // 后半：渐出黑色
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        // 中间显示关卡名
        if (progress > 0.3 && progress < 0.7) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(
                `LEVEL ${this.currentLevelIndex + 1}`,
                CONFIG.CANVAS_WIDTH / 2,
                CONFIG.CANVAS_HEIGHT / 2 - 20
            );

            ctx.font = '14px "Press Start 2P"';
            ctx.fillText(
                this.currentLevel ? this.currentLevel.name : '',
                CONFIG.CANVAS_WIDTH / 2,
                CONFIG.CANVAS_HEIGHT / 2 + 20
            );
        }
        ctx.restore();
    },

    /**
     * 重置
     */
    reset() {
        if (this.currentLevel) this.currentLevel.cleanup();
        this.currentLevelIndex = -1;
        this.currentLevel = null;
        this.transitionTimer = 0;
        this.levels = []; // 清空关卡列表，确保 initGame 时重新注册全新实例
        console.log('LevelManager reset');
    }
};
