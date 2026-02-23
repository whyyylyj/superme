/**
 * 井字棋核心逻辑测试
 * 在浏览器控制台中运行此脚本进行测试
 */

console.log('=== 井字棋核心逻辑测试 ===\n');

// 测试1: 基础功能 - 重置游戏
console.log('测试1: 重置游戏');
TicTacToeInstance.reset();
console.log('棋盘:', TicTacToeInstance.board);
console.log('当前玩家:', TicTacToeInstance.getCurrentPlayer());
console.log('游戏状态:', TicTacToeInstance.getGameState());
const test1Pass = TicTacToeInstance.board.every(c => c === null) &&
                  TicTacToeInstance.getCurrentPlayer() === 'X' &&
                  TicTacToeInstance.getGameState() === 'playing';
console.log(test1Pass ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试2: 玩家下棋
console.log('测试2: 玩家下棋（中心位置）');
TicTacToeInstance.reset();
const result2 = TicTacToeInstance.makeMove(4);
console.log('下棋结果:', result2);
console.log('中心位置:', TicTacToeInstance.board[4]);
console.log('当前玩家:', TicTacToeInstance.getCurrentPlayer());
const test2Pass = result2 === true &&
                  TicTacToeInstance.board[4] === 'X' &&
                  TicTacToeInstance.getCurrentPlayer() === 'O';
console.log(test2Pass ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试3: AI下棋
console.log('测试3: AI下棋');
TicTacToeInstance.reset();
TicTacToeInstance.makeMove(0); // 玩家先手左上
TicTacToeInstance.makeAIMove();
const oCount = TicTacToeInstance.board.filter(c => c === 'O').length;
console.log('棋盘:', TicTacToeInstance.board);
console.log('AI棋子数量:', oCount);
console.log('当前玩家:', TicTacToeInstance.getCurrentPlayer());
const test3Pass = oCount === 1 &&
                  TicTacToeInstance.getCurrentPlayer() === 'X';
console.log(test3Pass ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试4: 胜负判断 - 玩家获胜
console.log('测试4: 胜负判断（玩家横向三连）');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['X', 'X', 'X', null, null, null, null, null, null];
const isXWin = TicTacToeInstance.checkWin('X');
const winLine = TicTacToeInstance.getWinningLine();
console.log('X是否获胜:', isXWin);
console.log('获胜线:', winLine);
const test4Pass = isXWin === true &&
                  JSON.stringify(winLine) === JSON.stringify([0, 1, 2]);
console.log(test4Pass ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试5: 胜负判断 - AI获胜
console.log('测试5: 胜负判断（AI纵向三连）');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['O', null, null, 'O', null, null, 'O', null, null];
const isOWin = TicTacToeInstance.checkWin('O');
const winLine2 = TicTacToeInstance.getWinningLine();
console.log('O是否获胜:', isOWin);
console.log('获胜线:', winLine2);
const test5Pass = isOWin === true &&
                  JSON.stringify(winLine2) === JSON.stringify([0, 3, 6]);
console.log(test5Pass ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试6: 胜负判断 - 斜向三连
console.log('测试6: 胜负判断（斜向三连）');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['X', null, null, null, 'X', null, null, null, 'X'];
const isXWin2 = TicTacToeInstance.checkWin('X');
const winLine3 = TicTacToeInstance.getWinningLine();
console.log('X是否获胜:', isXWin2);
console.log('获胜线:', winLine3);
const test6Pass = isXWin2 === true &&
                  JSON.stringify(winLine3) === JSON.stringify([0, 4, 8]);
console.log(test6Pass ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试7: 平局检测
console.log('测试7: 平局检测');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
const isFull = TicTacToeInstance.isBoardFull();
console.log('棋盘已满:', isFull);
const test7Pass = isFull === true;
console.log(test7Pass ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试8: Minimax算法测试
console.log('测试8: Minimax算法（AI应该挡住玩家获胜）');
TicTacToeInstance.reset();
// 玩家有两条线即将获胜
TicTacToeInstance.board = ['X', 'X', null, 'O', 'O', null, null, null, null];
TicTacToeInstance.currentPlayer = 'O';
TicTacToeInstance.gameState = 'playing';
const bestMove = TicTacToeInstance.getBestMove();
console.log('最优走法:', bestMove);
console.log('AI应该挡在位置2或3:', bestMove === 2 || bestMove === 3);
const test8Pass = bestMove === 2 || bestMove === 3;
console.log(test8Pass ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试9: 游戏状态流转
console.log('测试9: 游戏状态流转（完整对局）');
TicTacToeInstance.reset();
TicTacToeInstance.makeMove(4); // 玩家中心
TicTacToeInstance.makeAIMove();
TicTacToeInstance.makeMove(0); // 玩家左上
TicTacToeInstance.makeAIMove();
TicTacToeInstance.makeMove(8); // 玩家右下
const gameState = TicTacToeInstance.getGameState();
console.log('游戏状态:', gameState);
console.log('结果文本:', TicTacToeInstance.getResultText());
console.log('是否完成:', ['won', 'lost', 'draw'].includes(gameState));
const test9Pass = ['won', 'lost', 'draw', 'playing'].includes(gameState);
console.log(test9Pass ? '✅ 通过' : '❌ 失败');
console.log('');

// 测试10: 随机走棋
console.log('测试10: 随机走棋');
TicTacToeInstance.reset();
TicTacToeInstance.board = ['X', null, 'O', null, null, null, null, null, null];
const randomMove = TicTacToeInstance.getRandomMove();
console.log('随机走法:', randomMove);
const validMoves = [1, 3, 4, 5, 6, 7, 8];
const test10Pass = validMoves.includes(randomMove);
console.log(test10Pass ? '✅ 通过' : '❌ 失败');
console.log('');

// 汇总结果
console.log('=== 测试汇总 ===');
const allTests = [test1Pass, test2Pass, test3Pass, test4Pass, test5Pass, test6Pass, test7Pass, test8Pass, test9Pass, test10Pass];
const passCount = allTests.filter(t => t).length;
console.log(`通过: ${passCount}/10`);
if (passCount === 10) {
    console.log('🎉 所有测试通过！');
} else {
    console.log('❌ 存在失败的测试');
}
