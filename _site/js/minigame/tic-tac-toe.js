/**
 * 井字棋彩蛋游戏 - 核心逻辑
 *
 * 功能：
 * - 完整的井字棋游戏状态管理
 * - 混合AI：70%最优Minimax + 30%随机
 * - 胜负判断和高亮支持
 * - 全局单例模式
 */

class TicTacToeGame {
    /**
     * 胜利线组合（索引）
     */
    static WIN_LINES = [
        [0, 1, 2], // 第一行
        [3, 4, 5], // 第二行
        [6, 7, 8], // 第三行
        [0, 3, 6], // 第一列
        [1, 4, 7], // 第二列
        [2, 5, 8], // 第三列
        [0, 4, 8], // 左上到右下
        [2, 4, 6]  // 右上到左下
    ];

    constructor() {
        /**
         * 棋盘状态：9元素数组，null=空，'X'=玩家，'O'=AI
         * @type {(null|string)[]}
         */
        this.board = Array(9).fill(null);

        /**
         * 当前回合：'X'=玩家，'O'=AI
         * @type {string}
         */
        this.currentPlayer = 'X';

        /**
         * 游戏状态：'playing', 'won', 'lost', 'draw'
         * @type {string}
         */
        this.gameState = 'playing';

        /**
         * 获胜线索引（用于UI高亮）
         * @type {number[]|null}
         */
        this.winningLine = null;

        /**
         * 获胜者：'X' 或 'O'
         * @type {string|null}
         */
        this.winner = null;

        /**
         * AI混合模式：70%使用Minimax，30%随机
         * @type {number}
         */
        this.aiSmartProbability = 0.7;
    }

    /**
     * 重置游戏
     */
    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameState = 'playing';
        this.winningLine = null;
        this.winner = null;
    }

    /**
     * 玩家下棋
     * @param {number} index - 棋盘位置索引（0-8）
     * @returns {boolean} 是否成功下棋
     */
    makeMove(index) {
        // 检查游戏是否已结束
        if (this.gameState !== 'playing') {
            return false;
        }

        // 检查位置是否已被占用
        if (this.board[index] !== null) {
            return false;
        }

        // 检查是否是玩家回合
        if (this.currentPlayer !== 'X') {
            return false;
        }

        // 玩家下棋
        this.board[index] = 'X';

        // 检查玩家是否获胜
        if (this.checkWin('X')) {
            this.gameState = 'won';
            this.winner = 'X';
            this.currentPlayer = null;
            return true;
        }

        // 检查平局
        if (this.isBoardFull()) {
            this.gameState = 'draw';
            this.currentPlayer = null;
            return true;
        }

        // 切换到AI回合
        this.currentPlayer = 'O';
        return true;
    }

    /**
     * AI下棋（混合模式）
     * @returns {boolean} 是否成功下棋
     */
    makeAIMove() {
        // 检查游戏是否已结束
        if (this.gameState !== 'playing') {
            return false;
        }

        // 检查是否是AI回合
        if (this.currentPlayer !== 'O') {
            return false;
        }

        let moveIndex;

        // 混合模式：70%概率使用最优步，30%概率随机
        if (Math.random() < this.aiSmartProbability) {
            moveIndex = this.getBestMove();
        } else {
            moveIndex = this.getRandomMove();
        }

        // AI下棋
        this.board[moveIndex] = 'O';

        // 检查AI是否获胜
        if (this.checkWin('O')) {
            this.gameState = 'lost';
            this.winner = 'O';
            this.currentPlayer = null;
            return true;
        }

        // 检查平局
        if (this.isBoardFull()) {
            this.gameState = 'draw';
            this.currentPlayer = null;
            return true;
        }

        // 切换到玩家回合
        this.currentPlayer = 'X';
        return true;
    }

    /**
     * 使用Minimax算法找到最优步
     * @returns {number} 最优位置索引
     */
    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = 4; // 默认中心位置

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    }

    /**
     * Minimax算法递归实现
     * @param {(null|string)[]} board - 棋盘状态
     * @param {number} depth - 当前深度
     * @param {boolean} isMaximizing - 是否最大化玩家
     * @returns {number} 分数（10=AI胜，-10=玩家胜，0=平局）
     */
    minimax(board, depth, isMaximizing) {
        // 检查终止条件
        if (this.checkWinForBoard(board, 'O')) {
            return 10 - depth; // AI越快获胜越好
        }
        if (this.checkWinForBoard(board, 'X')) {
            return depth - 10; // 玩家越慢获胜越好
        }
        if (this.isBoardFullForBoard(board)) {
            return 0; // 平局
        }

        if (isMaximizing) {
            // AI回合（最大化）
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            // 玩家回合（最小化）
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    /**
     * 随机走一步
     * @returns {number} 随机位置索引
     */
    getRandomMove() {
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                availableMoves.push(i);
            }
        }
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    /**
     * 检查指定玩家是否获胜（使用当前棋盘）
     * @param {string} player - 玩家标识（'X' 或 'O'）
     * @returns {boolean} 是否获胜
     */
    checkWin(player) {
        return this.checkWinForBoard(this.board, player);
    }

    /**
     * 检查指定棋盘状态下某玩家是否获胜
     * @param {(null|string)[]} board - 棋盘状态
     * @param {string} player - 玩家标识（'X' 或 'O'）
     * @returns {boolean} 是否获胜
     */
    checkWinForBoard(board, player) {
        for (const line of TicTacToeGame.WIN_LINES) {
            const [a, b, c] = line;
            if (board[a] === player && board[b] === player && board[c] === player) {
                // 如果是当前棋盘，记录获胜线
                if (board === this.board) {
                    this.winningLine = line;
                }
                return true;
            }
        }
        return false;
    }

    /**
     * 获取获胜线（用于UI高亮）
     * @returns {number[]|null} 获胜的3个索引
     */
    getWinningLine() {
        return this.winningLine;
    }

    /**
     * 检查棋盘是否已满
     * @returns {boolean} 是否已满
     */
    isBoardFull() {
        return this.isBoardFullForBoard(this.board);
    }

    /**
     * 检查指定棋盘是否已满
     * @param {(null|string)[]} board - 棋盘状态
     * @returns {boolean} 是否已满
     */
    isBoardFullForBoard(board) {
        return board.every(cell => cell !== null);
    }

    /**
     * 获取游戏结果文本
     * @returns {string} 结果文本
     */
    getResultText() {
        switch (this.gameState) {
            case 'won':
                return '你赢了！🎉';
            case 'lost':
                return 'AI赢了 🤖';
            case 'draw':
                return '平局 🤝';
            case 'playing':
                return this.currentPlayer === 'X' ? '你的回合' : 'AI思考中...';
            default:
                return '';
        }
    }

    /**
     * 获取游戏状态
     * @returns {string} 游戏状态
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * 获取当前玩家
     * @returns {string|null} 当前玩家标识
     */
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    /**
     * 检查是否是玩家回合
     * @returns {boolean}
     */
    isPlayerTurn() {
        return this.currentPlayer === 'X';
    }

    /**
     * 检查是否是AI回合
     * @returns {boolean}
     */
    isAITurn() {
        return this.currentPlayer === 'O';
    }
}

// 创建全局单例（浏览器环境）
if (typeof window !== 'undefined') {
    window.TicTacToeInstance = new TicTacToeGame();
} else if (typeof global !== 'undefined') {
    // Node.js 环境用于测试
    global.TicTacToeInstance = new TicTacToeGame();
}
