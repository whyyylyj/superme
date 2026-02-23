# 弹幕组合生成器 - Pattern Weaver

## 快速开始

### 启动游戏
```bash
# 在 worktree 目录中
open index.html

# 或使用本地服务器
python -m http.server 8000
# 访问 http://localhost:8000
```

### 运行测试
```bash
# 打开单元测试页面
open test-pattern-weaver.html
```

## 功能概览

### 1. 弹幕基因系统
- 定义弹幕的可变参数（速度、角度、大小、颜色等）
- 支持参数变异和递进变异
- 分关卡配色方案

### 2. 弹幕编织器
- 将多个基础弹幕模式组合成复杂弹幕
- 6种混合模式（并行、顺序、交替、螺旋融合等）
- 8种预设组合库

### 3. Boss集成
- 第一关Boss（树精王）已集成新系统
- 变异等级和强度系统
- 新增2种编织弹幕攻击

## 文件结构

```
js/danmaku/
├── bullet-genes.js       # 弹幕基因系统
├── pattern-weaver.js     # 弹幕编织器
├── danmaku-engine.js     # 弹幕引擎（现有）
├── patterns.js           # 弹幕模式（现有）
└── bullet-pool.js        # 弹幕池（现有）

js/enemies/
└── boss-level1.js        # 第一关Boss（已改进）

docs/
├── PATTERN_WEAVER_TEST.md    # 测试文档
└── PATTERN_WEAVER_REPORT.md  # 完整报告

test-pattern-weaver.html  # 单元测试页面
```

## 使用示例

### 创建自定义编织弹幕

```javascript
// 在Boss中使用
const weave = this.weaver.combine(
    'circle', { count: 16, speed: 200, color: '#00ff00' },
    'spiral', { arms: 4, speed: 250, color: '#32cd32' },
    'parallel',
    5 // 持续5秒
);

this.weaver.startWeave('myWeave', weave);
```

### 应用基因变异

```javascript
const params = { speed: 250, size: 8 };

// 基础变异
const mutated = BulletMutator.mutatePattern(params, 0);

// 强度变异（基于HP）
const intense = BulletMutator.progressiveMutate(params, 0, 0.7);
```

### 使用预设组合

```javascript
const weave = createPresetWeave('spiralRain', this.weaver);
if (weave) {
    this.weaver.startWeave('spiralRain', weave);
}
```

## 测试清单

- [x] 语法检查通过
- [x] 单元测试通过
- [x] 游戏内测试通过
- [x] Boss战斗正常
- [x] 弹幕效果有变化
- [x] 性能表现良好

## Git Worktree 信息

- **路径**: `/Users/onlyliyj/Documents/superme-pattern-weaver`
- **分支**: `feature-pattern-weaver`
- **基础提交**: `be2a5b2 feat(Track C): 实现第三关天空圣殿和最终Boss`

## 相关文档

- [完整实现报告](docs/PATTERN_WEAVER_REPORT.md)
- [测试文档](docs/PATTERN_WEAVER_TEST.md)
- [单元测试](test-pattern-weaver.html)

## 下一步

1. 在主仓库中 review 代码
2. 合并 `feature-pattern-weaver` 分支到主分支
3. 扩展到其他Boss（第二关、第三关）
4. 添加更多混合模式和预设组合

---

**开发者**: SuperMe Development Team
**版本**: 1.0
**日期**: 2026-02-23
