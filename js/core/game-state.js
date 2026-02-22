// js/core/game-state.js

/**
 * GameStateMachine - 游戏流程状态机
 * 管理游戏状态转换，确保状态转换的合法性
 */
const GameStateMachine = {
    // 所有可能的状态
    STATES: {
        START: 'start',                    // 开始界面
        PLAYING: 'playing',                // 游戏中
        PAUSED: 'paused',                  // 暂停
        LEVEL_TRANSITION: 'level_transition',  // 关卡过渡动画
        BOSS_INTRO: 'boss_intro',          // Boss 登场演出
        GAME_OVER: 'game_over',            // 游戏失败
        GAME_WIN: 'game_win',              // 游戏通关
    },

    currentState: 'start',
    previousState: null,

    // 状态转换规则（白名单）
    transitions: {
        'start': ['playing'],
        'playing': ['paused', 'boss_intro', 'level_transition', 'game_over', 'game_win'],
        'paused': ['playing'],
        'boss_intro': ['playing'],
        'level_transition': ['playing'],
        'game_over': ['start'],
        'game_win': ['start'],
    },

    /**
     * 状态转换
     * @param {string} newState - 目标状态
     * @returns {boolean} 转换是否成功
     */
    changeState(newState) {
        // 验证转换合法性
        const allowed = this.transitions[this.currentState];
        if (!allowed || !allowed.includes(newState)) {
            console.warn(`Invalid state transition: ${this.currentState} -> ${newState}`);
            return false;
        }

        this.previousState = this.currentState;
        this.currentState = newState;

        // 触发状态变化事件
        EventBus.emit(EventBus.EVENTS.STATE_CHANGE, {
            from: this.previousState,
            to: this.currentState
        });

        console.log(`State changed: ${this.previousState} -> ${this.currentState}`);
        return true;
    },

    /**
     * 检查当前状态
     * @param {string} state - 要检查的状态
     * @returns {boolean}
     */
    is(state) {
        return this.currentState === state;
    },

    /**
     * 重置到起始状态（用于重新开始游戏）
     */
    reset() {
        this.currentState = 'start';
        this.previousState = null;
        console.log('StateMachine reset to start');
    }
};
