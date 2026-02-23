/**
 * 井字棋浏览器控制台演示
 * 在游戏页面的浏览器控制台中运行此代码
 */

console.clear();
console.log('=== 井字棋核心逻辑演示 ===\n');

// 1. 验证实例存在
console.log('1. 全局实例:', typeof TicTacToeInstance !== 'undefined' ? '✅' : '❌');
console.log('   初始状态:', TicTacToeInstance.getGameState());

// 2. 演示一局完整游戏
console.log('\n2. 开始新游戏...');
TicTacToeInstance.reset();

console.log('   玩家走中心 (位置4)');
TicTacToeInstance.makeMove(4);
console.log('   ', TicTacToeInstance.board);

console.log('   AI 响应...');
TicTacToeInstance.makeAIMove();
console.log('   ', TicTacToeInstance.board);

console.log('   玩家走左上 (位置0)');
TicTacToeInstance.makeMove(0);
console.log('   ', TicTacToeInstance.board);

console.log('   AI 响应...');
TicTacToeInstance.makeAIMove();
console.log('   ', TicTacToeInstance.board);

console.log('   玩家走右上 (位置2)');
TicTacToeInstance.makeMove(2);
console.log('   ', TicTacToeInstance.board);

console.log('   当前状态:', TicTacToeInstance.getGameState());
console.log('   结果文本:', TicTacToeInstance.getResultText());

if (TicTacToeInstance.getGameState() !== 'playing') {
    console.log('   获胜线:', TicTacToeInstance.getWinningLine());
}

// 3. 演示Minimax智能
console.log('\n3. 演示AI智能（阻挡玩家）');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['X', 'X', null, null, null, null, null, null, null];
TicTacToeInstance.currentPlayer = 'O';
TicTacToeInstance.gameState = 'playing';

console.log('   棋盘状态:');
console.log('   ' + TicTacToeInstance.board.slice(0, 3).join(' '));
console.log('   ' + TicTacToeInstance.board.slice(3, 6).join(' '));
console.log('   ' + TicTacToeInstance.board.slice(6, 9).join(' '));

const bestMove = TicTacToeInstance.getBestMove();
console.log('   AI最优走法:', bestMove);
console.log('   AI应该阻挡位置2:', bestMove === 2 ? '✅' : '❌');

// 4. 演示混合模式
console.log('\n4. 演示混合模式（70%智能 + 30%随机）');
const smartMoves = [];
const randomMoves = [];

for (let i = 0; i < 100; i++) {
    TicTacToeInstance.reset();
    TicTacToeInstance.board = ['X', null, null, null, null, null, null, null, null];
    TicTacToeInstance.currentPlayer = 'O';

    // 强制使用Minimax
    const minimaxMove = TicTacToeInstance.getBestMove();

    // 记录
    if (minimaxMove === 4) { // Minimax通常选择中心
        smartMoves.push(minimaxMove);
    } else {
        randomMoves.push(minimaxMove);
    }
}

console.log('   Minimax选择中心的比例:', smartMoves.length + '%');
console.log('   (单次测试仅供参考，实际混合模式在makeAIMove中实现)');

// 5. API总览
console.log('\n5. 可用的API:');
console.log('   - TicTacToeInstance.reset()');
console.log('   - TicTacToeInstance.makeMove(index)');
console.log('   - TicTacToeInstance.makeAIMove()');
console.log('   - TicTacToeInstance.getBestMove()');
console.log('   - TicTacToeInstance.checkWin(player)');
console.log('   - TicTacToeInstance.getWinningLine()');
console.log('   - TicTacToeInstance.getResultText()');
console.log('   - TicTacToeInstance.getGameState()');
console.log('   - TicTacToeInstance.getCurrentPlayer()');

console.log('\n=== 演示完成 ===');
console.log('提示：可以直接在控制台调用 API 进行测试！');
