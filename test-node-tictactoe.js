/**
 * 井字棋核心逻辑 Node.js 测试脚本
 * 运行方式: node test-node-tictactoe.js
 */

// 引入井字棋逻辑
const fs = require('fs');
// 将代码加载到全局作用域
const code = fs.readFileSync('./js/minigame/tic-tac-toe.js', 'utf8');
eval(code);

// 确保全局实例可用
global.TicTacToeInstance = TicTacToeInstance;

console.log('=== 井字棋核心逻辑测试 ===\n');

// 测试1: 基础功能 - 重置游戏
console.log('测试1: 重置游戏');
TicTacToeInstance.reset();
const test1 = TicTacToeInstance.board.every(c => c === null) &&
              TicTacToeInstance.getCurrentPlayer() === 'X' &&
              TicTacToeInstance.getGameState() === 'playing';
console.log('棋盘:', TicTacToeInstance.board);
console.log('当前玩家:', TicTacToeInstance.getCurrentPlayer());
console.log('游戏状态:', TicTacToeInstance.getGameState());
console.log(test1 ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试2: 玩家下棋
console.log('测试2: 玩家下棋');
TicTacToeInstance.reset();
const result2 = TicTacToeInstance.makeMove(4);
const test2 = result2 === true &&
              TicTacToeInstance.board[4] === 'X' &&
              TicTacToeInstance.getCurrentPlayer() === 'O';
console.log('下棋结果:', result2);
console.log('中心位置:', TicTacToeInstance.board[4]);
console.log('当前玩家:', TicTacToeInstance.getCurrentPlayer());
console.log(test2 ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试3: AI下棋
console.log('测试3: AI下棋');
TicTacToeInstance.reset();
TicTacToeInstance.makeMove(0);
TicTacToeInstance.makeAIMove();
const oCount = TicTacToeInstance.board.filter(c => c === 'O').length;
const test3 = oCount === 1 && TicTacToeInstance.getCurrentPlayer() === 'X';
console.log('AI棋子数量:', oCount);
console.log('当前玩家:', TicTacToeInstance.getCurrentPlayer());
console.log(test3 ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试4: 玩家获胜（横向）
console.log('测试4: 玩家获胜（横向）');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['X', 'X', 'X', null, null, null, null, null, null];
const isXWin = TicTacToeInstance.checkWin('X');
const winLine = TicTacToeInstance.getWinningLine();
const test4 = isXWin === true && JSON.stringify(winLine) === JSON.stringify([0, 1, 2]);
console.log('X是否获胜:', isXWin);
console.log('获胜线:', winLine);
console.log(test4 ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试5: AI获胜（纵向）
console.log('测试5: AI获胜（纵向）');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['O', null, null, 'O', null, null, 'O', null, null];
const isOWin = TicTacToeInstance.checkWin('O');
const winLine2 = TicTacToeInstance.getWinningLine();
const test5 = isOWin === true && JSON.stringify(winLine2) === JSON.stringify([0, 3, 6]);
console.log('O是否获胜:', isOWin);
console.log('获胜线:', winLine2);
console.log(test5 ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试6: 斜向获胜
console.log('测试6: 斜向获胜');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['X', null, null, null, 'X', null, null, null, 'X'];
const isXWin2 = TicTacToeInstance.checkWin('X');
const winLine3 = TicTacToeInstance.getWinningLine();
const test6 = isXWin2 === true && JSON.stringify(winLine3) === JSON.stringify([0, 4, 8]);
console.log('X是否获胜:', isXWin2);
console.log('获胜线:', winLine3);
console.log(test6 ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试7: 平局检测
console.log('测试7: 平局检测');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
const isFull = TicTacToeInstance.isBoardFull();
const test7 = isFull === true;
console.log('棋盘已满:', isFull);
console.log(test7 ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试8: Minimax算法 - AI应该挡住玩家
console.log('测试8: Minimax算法');
TicTacToeInstance.reset();
// 场景：玩家即将获胜，AI必须阻挡
TicTacToeInstance.board = ['X', 'X', null, null, null, null, null, null, null];
TicTacToeInstance.currentPlayer = 'O';
TicTacToeInstance.gameState = 'playing';
const bestMove = TicTacToeInstance.getBestMove();
const test8 = bestMove === 2; // AI必须挡在位置2
console.log('棋盘状态:', TicTacToeInstance.board);
console.log('最优走法:', bestMove);
console.log('AI应该挡在位置2:', test8);
console.log(test8 ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试9: 随机走棋
console.log('测试9: 随机走棋');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['X', null, 'O', null, null, null, null, null, null];
const randomMove = TicTacToeInstance.getRandomMove();
const validMoves = [1, 3, 4, 5, 6, 7, 8];
const test9 = validMoves.includes(randomMove);
console.log('随机走法:', randomMove);
console.log('有效走法:', validMoves);
console.log(test9 ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试10: 完整对局
console.log('测试10: 完整对局');
TicTacToeInstance.reset();
TicTacToeInstance.makeMove(4);
TicTacToeInstance.makeAIMove();
TicTacToeInstance.makeMove(0);
TicTacToeInstance.makeAIMove();
TicTacToeInstance.makeMove(8);
const gameState = TicTacToeInstance.getGameState();
const test10 = ['won', 'lost', 'draw', 'playing'].includes(gameState);
console.log('游戏状态:', gameState);
console.log('结果文本:', TicTacToeInstance.getResultText());
console.log(test10 ? '✅ 通过' : '❌ 失败');
console.log('');

// 汇总结果
console.log('=== 测试汇总 ===');
const allTests = [test1, test2, test3, test4, test5, test6, test7, test8, test9, test10];
const passCount = allTests.filter(t => t).length;
console.log(`通过: ${passCount}/10`);
if (passCount === 10) {
    console.log('🎉 所有测试通过！');
    process.exit(0);
} else {
    console.log('❌ 存在失败的测试');
    process.exit(1);
}
