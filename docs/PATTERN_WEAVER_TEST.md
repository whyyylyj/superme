# 弹幕组合生成器 - 测试文档

## 功能概述

为 SUPERME 的第一关Boss（树精王）实现了**程序化弹幕生成器**，支持弹幕模式的动态组合和参数化调整。

## 实现内容

### 1. 弹幕基因系统 (`js/danmaku/bullet-genes.js`)

定义了弹幕的可变参数和变异规则：

- **速度基因**：控制弹幕飞行速度（100-500 px/s）
- **角度基因**：控制弹幕发射角度（±10° 变异）
- **大小基因**：控制弹幕尺寸（4-16 px）
- **颜色基因**：分关卡配色方案（第一关绿色系）
- **发射频率基因**：控制弹幕发射间隔（0.1-1.0s）
- **密度基因**：控制弹幕数量倍率（0.5-2.0x）

**核心类**：
- `BulletMutator`：弹幕基因变异器
  - `mutate(value, geneConfig)` - 对单个值进行变异
  - `mutateColor(levelIndex)` - 从配色方案随机选择颜色
  - `mutatePattern(params, levelIndex)` - 批量变异弹幕参数
  - `progressiveMutate(params, levelIndex, intensity)` - 递进变异

### 2. 弹幕编织器 (`js/danmaku/pattern-weaver.js`)

将多个基础弹幕模式组合成复杂弹幕：

**混合模式**：
- `parallel` - 并行：同时发射所有弹幕
- `sequential` - 顺序：按时间顺序切换弹幕
- `interleave` - 交替：交替发射不同弹幕（每0.5秒）
- `spiral_merge` - 螺旋融合：弹幕以不同速度旋转融合
- `cascade` - 级联：弹幕依次激活并保持活跃
- `random` - 随机：每帧随机选择一种弹幕发射

**核心类**：
- `PatternWeaver`：弹幕编织器
  - `combine(pattern1, params1, pattern2, params2, blendMode, duration)` - 组合两种弹幕
  - `combineTriple(...)` - 组合三种弹幕
  - `execute(combinedPattern, dt)` - 执行组合弹幕
  - `startWeave(name, combinedPattern)` - 启动编织弹幕
  - `update(dt)` - 更新所有活跃的编织弹幕

**预设组合库**（`PRESET_WEAVES`）：
1. `spiralRain` - 螺旋雨（spiral + rain）
2. `circleCross` - 十字圆环（circle + cross）
3. `fanStorm` - 扇形风暴（交替扇形）
4. `gardenBloom` - 花园绽放（circle + flower，顺序）
5. `spiralGarden` - 螺旋花园（spiral + flower，螺旋融合）
6. `chaosStorm` - 混乱风暴（circle + scatter + rain）
7. `crossSpiral` - 十字螺旋（cross + spiral，交替）
8. `flowerRain` - 满天花语（flower + circle + rain）

### 3. 第一关Boss改进 (`js/enemies/boss-level1.js`)

集成弹幕基因和编织系统：

**新增特性**：
- 弹幕基因变异器（`BulletMutator`）
- 弹幕编织器（`PatternWeaver`）
- 变异等级系统（`mutationLevel`）
- 变异强度系统（`mutationIntensity`，0-1）
- 变异强度指示器（UI显示）

**攻击模式**（阶段1：4种，阶段2：6种）：
1. 树叶弹幕（圆形 + 变异）
2. 藤蔓鞭挞（扇形 + 变异）
3. 种子散布（散射 + 变异）
4. 根须攻击（地面追踪）
5. **螺旋雨编织弹幕**（仅阶段2）
6. **花园绽放编织弹幕**（仅阶段2）

**变异机制**：
- 每次受伤增加变异等级
- HP越低，变异强度越高
- 变异影响：弹幕速度、发射频率、颜色、密度

## 测试要点

### 功能测试

1. **基因变异系统**
   - [ ] Boss受伤后变异等级增加
   - [ ] 弹幕速度、颜色有随机变化
   - [ ] 变异强度指示器正确显示

2. **弹幕编织系统**
   - [ ] 阶段2可以发射螺旋雨编织弹幕
   - [ ] 阶段2可以发射花园绽放编织弹幕
   - [ ] 编织弹幕持续指定时间后自动结束

3. **性能测试**
   - [ ] 弹幕数量过多时不卡顿
   - [ ] 编织弹幕正常更新和清理
   - [ ] 对象池正常回收弹幕

4. **平衡性测试**
   - [ ] 变异不会让弹幕过于困难
   - [ ] 编织弹幕有视觉冲击力但可躲避
   - [ ] 阶段2比阶段1有明显的难度提升

### 视觉测试

1. **颜色变化**
   - [ ] 弹幕颜色在第一关配色范围内
   - [ ] 不同攻击模式有颜色区分

2. **UI显示**
   - [ ] 变异强度条正确显示
   - [ ] 颜色从绿到红渐变（强度增加）

## 使用示例

### 创建自定义编织弹幕

```javascript
// 在Boss中创建自定义组合
const weave = this.weaver.combine(
    'circle', { count: 16, speed: 200, color: '#00ff00' },
    'spiral', { arms: 4, speed: 250, color: '#32cd32' },
    'parallel',
    5 // 持续5秒
);

this.weaver.startWeave('myCustomWeave', weave);
```

### 使用预设组合

```javascript
// 直接使用预设
const weave = createPresetWeave('spiralRain', this.weaver);
if (weave) {
    this.weaver.startWeave('spiralRain', weave);
}
```

### 应用基因变异

```javascript
// 基础参数
const params = { speed: 250, size: 8 };

// 轻度变异
const mutated = BulletMutator.mutatePattern(params, 0);

// 强度变异（基于HP）
const intense = BulletMutator.progressiveMutate(params, 0, 0.7);
```

## 已知限制

1. **性能考虑**
   - 编织弹幕同时发射多种模式，弹幕数量可能较多
   - 建议持续时间不超过10秒
   - 复杂组合（3种模式）谨慎使用

2. **平衡性**
   - 变异强度需要根据实际游戏体验调整
   - 当前变异率：±20%（速度）、±10°（角度）
   - 可通过 `BULLET_GENES` 调整

3. **兼容性**
   - 需要现有弹幕系统支持（`DanmakuPatterns`）
   - Boss需要继承 `BossBase` 并实现标准接口

## 后续优化方向

1. **更多混合模式**
   - `sync` - 同步模式（所有弹幕同时发射）
   - `echo` - 回声模式（弹幕延迟重复）
   - `mirror` - 镜像模式（对称弹幕）

2. **更智能的变异**
   - 基于玩家表现调整变异
   - 学习玩家躲避模式
   - 自适应难度系统

3. **视觉增强**
   - 编织弹幕特效（粒子、光效）
   - 变异过渡动画
   - 弹幕轨迹显示

4. **编辑器工具**
   - 可视化弹幕组合编辑器
   - 实时预览和调试
   - 导出/导入弹幕配置

## 总结

弹幕组合生成器成功为第一关Boss添加了程序化弹幕系统，实现了：
- ✅ 弹幕基因变异系统
- ✅ 弹幕编织组合系统
- ✅ 8种预设弹幕组合
- ✅ 6种混合模式
- ✅ Boss集成和UI反馈
- ✅ 独立git worktree开发

系统具有良好的扩展性，可以轻松应用到其他Boss和关卡。

---

**开发者**: SuperMe Development Team
**版本**: 1.0
**日期**: 2026-02-23
