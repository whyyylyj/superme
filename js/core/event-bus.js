// js/core/event-bus.js

/**
 * EventBus - 发布订阅事件系统
 * 用于模块间解耦通信
 */
const EventBus = {
    _listeners: {},

    /**
     * 订阅事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    },

    /**
     * 取消订阅
     * @param {string} event - 事件名称
     * @param {Function} callback - 要移除的回调函数
     */
    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    },

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 传递给回调的数据
     */
    emit(event, data) {
        if (!this._listeners[event]) return;
        // 🔧 P1修复：遍历副本，防止 callback 内部调用 off() 时数组突变导致回调被跳过
        [...this._listeners[event]].forEach(cb => cb(data));
    },

    /**
     * 清理所有监听器（用于重置游戏）
     */
    clear() {
        this._listeners = {};
    }
};

// 预定义事件名称常量
EventBus.EVENTS = {
    LEVEL_START: 'level:start',
    LEVEL_COMPLETE: 'level:complete',
    LEVEL_TRANSITION: 'level:transition',
    PLAYER_TRANSFORM: 'player:transform',
    PLAYER_DAMAGE: 'player:damage',
    PLAYER_DEATH: 'player:death',
    BOSS_SPAWN: 'boss:spawn',
    BOSS_PHASE: 'boss:phase',
    BOSS_DEFEAT: 'boss:defeat',
    GAME_OVER: 'game:over',
    GAME_WIN: 'game:win',
    STATE_CHANGE: 'state:change',

    // 井字棋小游戏事件
    TIC_TAC_TOE_TRIGGER: 'tic_tac_toe:trigger',
    TIC_TAC_TOE_WIN: 'tic_tac_toe:win',
    TIC_TAC_TOE_LOSE: 'tic_tac_toe:lose',
    TIC_TAC_TOE_DRAW: 'tic_tac_toe:draw',
};
