# 井字棋彩蛋游戏改造说明

## 改造目标
将隐藏的井字棋触发点改为**显眼的敌人角色**，像普通怪物一样在关卡中游荡，玩家接触后触发挑战。

---

## 主要改动

### 1. 新增文件：`js/enemies/enemy-tictactoe.js`

创建了新的敌人类型 `EnemyTicTacToe`，具有以下特性：

| 特性 | 描述 |
|------|------|
| **外观** | 金色方块（40×40px），带有旋转的 `#` 符号 |
| **动画** | 快速闪烁 + 旋转井字符号 |
| **行为** | 像普通敌人一样左右巡逻（100px 范围） |
| **触发方式** | **玩家接触** 或 **子弹击中** 均可触发 |
| **冷却时间** | 3 秒（触发后短暂冷却） |
| **粒子效果** | 触发时产生金色爆炸粒子 |

---

### 2. 三个关卡的敌人分布

每个关卡现在都有 **2 个井字棋精灵**：

| 关卡 | 位置 1 | 位置 2 |
|------|--------|--------|
| **Level 1 - 像素森林** | (500, 420) | (2000, 420) |
| **Level 2 - 地狱火域** | (800, 380) | (2500, 380) |
| **Level 3 - 天空神殿** | (1000, 350) | (3000, 350) |

---

### 3. 移除的代码

从 `js/levels/level-base.js` 删除了：

- `ticTacToeTriggers` 数组
- `possibleTriggerLocations` 数组
- `addPossibleTriggerLocation()` 方法
- `activateRandomTriggers()` 方法
- `drawTicTacToeTrigger()` 方法
- 所有触发点更新和渲染逻辑

---

### 4. 脚本加载顺序

在 `index.html` 中添加了新脚本引用：

```html
<!-- 4.2 特殊敌人 -->
<script src="js/enemies/enemy-tictactoe.js"></script>
```

位置：在 `js/boss.js` 之后，敌人系统之前。

---

## 游戏效果

### 改造前 ❌
- 井字棋触发点是**隐藏的地面符文**
- 玩家必须走到特定位置才能触发
- 没有明显的视觉提示
- 很多玩家不知道有彩蛋

### 改造后 ✅
- 井字棋精灵是**显眼的金色敌人**
- 像普通怪物一样在平台上巡逻
- 金色外观 + 旋转符号 + 闪烁效果
- **玩家接触或子弹击中都能触发挑战**
- **每个关卡 2 个，共 6 次挑战机会**

---

## 技术细节

### EnemyTicTacToe 类结构

```javascript
class EnemyTicTacToe extends Entity {
    // 属性
    this.vx = 60              // 移动速度
    this.patrolDist = 100     // 巡逻距离
    this.facing = 1/-1        // 面向方向
    this.active = true        // 是否激活
    this.cooldown = 0         // 冷却时间
    this.rotation = 0         // 旋转角度
    this.pulseIntensity = 0   // 闪烁强度
    
    // 方法
    update(dt, player, platforms)  // 更新状态
    triggerChallenge(levelNumber)  // 触发挑战
    draw(ctx, cameraX, cameraY)    // 绘制敌人
}
```

### 碰撞触发逻辑

```javascript
// 在 EnemyTicTacToe.update() 中

// 1. 玩家身体接触
if (this.active && Physics.checkCollision(this, player)) {
    this.triggerChallenge(this.levelNumber || 1);
}

// 2. 子弹击中
if (this.active && bullets) {
    for (let bullet of bullets) {
        if (!bullet.markedForDeletion && Physics.checkCollision(this, bullet)) {
            bullet.markedForDeletion = true;  // 销毁子弹
            this.triggerChallenge(this.levelNumber || 1);
            break;
        }
    }
}
```

### 事件触发

```javascript
// 发送 TIC_TAC_TOE_TRIGGER 事件
EventBus.emit('TIC_TAC_TOE_TRIGGER', {
    levelNumber: levelNumber,
    triggerX: this.x,
    triggerY: this.y
});
```

---

## 测试方法

1. 打开浏览器访问 `http://localhost:8000`
2. 开始游戏，进入任意关卡
3. 寻找**金色闪烁的方块敌人**（带有旋转的 `#` 符号）
4. 接触敌人后触发井字棋挑战对话框

---

## 视觉设计

### 外观特征
- **颜色**：金色 (`#ffd700`)
- **大小**：40×40px（比普通敌人稍大）
- **符号**：白色旋转的 `#` 井字符号
- **光晕**：金色闪烁光晕（20-40px 范围）
- **边框**：金色边框（3px 粗）

### 动画效果
- **旋转**：每秒 180 度
- **闪烁**：100ms 周期快速闪烁
- **粒子**：触发时 30 个金色粒子爆炸

---

## 兼容性

- ✅ 保留了原有的 `TicTacToeInstance` 游戏逻辑
- ✅ 保留了原有的 `reward-system.js` 奖励系统
- ✅ 事件系统完全兼容
- ✅ 不影响其他敌人和 Boss 行为

---

## 未来扩展建议

1. **增加难度**：可以让井字棋精灵移动更快或路径更复杂
2. **奖励差异化**：根据关卡难度设置不同的奖励池
3. **成就系统**：记录玩家赢得多少次井字棋挑战
4. **音效**：添加特殊的发现音效和触发音效

---

*文档创建时间：2026-02-23*
