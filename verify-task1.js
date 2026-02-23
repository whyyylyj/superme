/**
 * Task 1 验证脚本
 * 在浏览器控制台运行此脚本，验证状态机和事件系统的修改
 */

console.log('========== Task 1 验证开始 ==========\n');

// 验证 1: TIC_TAC_TOE 状态存在
const test1 = GameStateMachine.STATES.TIC_TAC_TOE === 'tic_tac_toe';
console.log(`✓ 验证 1: TIC_TAC_TOE 状态 = 'tic_tac_toe'`, test1);
if (!test1) console.error('  失败:', GameStateMachine.STATES.TIC_TAC_TOE);

// 验证 2: playing 可以转换到 tic_tac_toe
const test2 = GameStateMachine.transitions['playing'].includes('tic_tac_toe');
console.log(`✓ 验证 2: playing -> tic_tac_toe 转换允许`, test2);
if (!test2) console.error('  失败: transitions[playing] =', GameStateMachine.transitions['playing']);

// 验证 3: tic_tac_toe 可以转换到 playing
const test3 = GameStateMachine.transitions['tic_tac_toe'].includes('playing');
console.log(`✓ 验证 3: tic_tac_toe -> playing 转换允许`, test3);
if (!test3) console.error('  失败: transitions[tic_tac_toe] =', GameStateMachine.transitions['tic_tac_toe']);

// 验证 4: tic_tac_toe 可以转换到 game_over
const test4 = GameStateMachine.transitions['tic_tac_toe'].includes('game_over');
console.log(`✓ 验证 4: tic_tac_toe -> game_over 转换允许`, test4);
if (!test4) console.error('  失败: transitions[tic_tac_toe] =', GameStateMachine.transitions['tic_tac_toe']);

// 验证 5: 井字棋事件存在
const test5 = EventBus.EVENTS.TIC_TAC_TOE_TRIGGER === 'tic_tac_toe:trigger';
console.log(`✓ 验证 5: TIC_TAC_TOE_TRIGGER 事件存在`, test5);
if (!test5) console.error('  失败:', EventBus.EVENTS.TIC_TAC_TOE_TRIGGER);

// 验证 6: 其他井字棋事件
const test6 = (
    EventBus.EVENTS.TIC_TAC_TOE_WIN === 'tic_tac_toe:win' &&
    EventBus.EVENTS.TIC_TAC_TOE_LOSE === 'tic_tac_toe:lose' &&
    EventBus.EVENTS.TIC_TAC_TOE_DRAW === 'tic_tac_toe:draw'
);
console.log(`✓ 验证 6: 所有井字棋事件正确`, test6);
if (!test6) {
    console.error('  失败:');
    console.error('    TIC_TAC_TOE_WIN:', EventBus.EVENTS.TIC_TAC_TOE_WIN);
    console.error('    TIC_TAC_TOE_LOSE:', EventBus.EVENTS.TIC_TAC_TOE_LOSE);
    console.error('    TIC_TAC_TOE_DRAW:', EventBus.EVENTS.TIC_TAC_TOE_DRAW);
}

// 汇总结果
const allPassed = test1 && test2 && test3 && test4 && test5 && test6;
console.log('\n========== 验证结果 ==========');
console.log(allPassed ? '✅ 所有测试通过！' : '❌ 有测试失败');

// 打印调试信息
console.log('\n========== 调试信息 ==========');
console.log('STATES:', GameStateMachine.STATES);
console.log('transitions:', GameStateMachine.transitions);
console.log('EVENTS:', EventBus.EVENTS);

console.log('\n========== Task 1 验证结束 ==========');
