# Boss 配置参数化指南

## 概述

已将 Boss 的所有硬编码参数提取到 `js/core/boss-config.js` 文件中。

## 配置结构

```
BossConfig
├── LEVEL1.TREANT_KING      # 第一关 Boss：树精王
├── LEVEL2.INFERNO_DRAGON   # 第二关 Boss：烈焰魔龙
├── LEVEL3.SKY_TYRANT       # 第三关 Boss：天空暴君
└── GENERAL                  # 通用配置
```

## 参数分类

### 1. 基础属性 (Base Stats)

```javascript
{
    name: 'Treant King',
    maxHp: 150,              // 生命值
    width: 120,              // 宽度（像素）
    height: 140,             // 高度（像素）
    color: '#2d5a27',        // 主体颜色
    themeColor: '#4a7c43',   // 主题色（用于特效）
    canFly: false,           // 是否飞行
    speed: 60,               // 移动速度
    damage: 2,               // 接触伤害
}
```

### 2. 阶段配置 (Phase Config)

```javascript
{
    phaseCount: 2,                    // 阶段数量
    phase2Threshold: 0.5,             // 50% HP 进入阶段 2
    phase3Threshold: 0.33,            // 33% HP 进入阶段 3
    phaseThresholds: [0.75, 0.50, 0.25],  // 多阶段阈值数组
}
```

### 3. 攻击配置 (Attack Config)

```javascript
{
    attackCooldown: {
        phase1: 1.2,      // 阶段 1 攻击间隔（秒）
        phase2: 0.9,      // 阶段 2 攻击间隔
        phase3: 0.6,      // 阶段 3 攻击间隔
    },
    bullets: {
        leafCircle: {
            phase1Count: 8,
            phase2Count: 12,
            baseSpeed: 250,
            color: '#4a7c43',
        },
        // ... 其他弹幕类型
    }
}
```

### 4. 召唤配置 (Summon Config)

```javascript
{
    summon: {
        initialCooldown: 5,     // 初始召唤冷却（秒）
        type: 'seedling',       // 召唤类型
        maxMinions: 6,          // 场上最大随从数量
        phase2Chance: 0.02,     // 阶段 2 召唤概率（每帧）
    }
}
```

### 5. 特效配置 (Effects Config)

```javascript
{
    effects: {
        mutationIntensityMax: 1.0,
        leafRotationSpeed: Math.PI / 8,
        fragmentCount: 8,
        trailParticleLife: 1,
    }
}
```

## 使用方法

### 方法 1: 在构造函数中使用配置

```javascript
class TreantKing extends BossBase {
    constructor(x, y) {
        const config = BossConfig.LEVEL1.TREANT_KING;
        
        super(x, y, {
            name: config.name,
            maxHp: config.maxHp,
            hp: config.maxHp,  // 当前 HP 等于最大 HP
            phaseCount: config.phaseCount,
            width: config.width,
            height: config.height,
            color: config.color,
            themeColor: config.themeColor,
            canFly: config.canFly,
            speed: config.speed,
            damage: config.damage,
        });

        // 使用配置初始化其他属性
        this.rootAttackCooldown = 0;
        this.summonCooldown = config.summon.initialCooldown;
        this.leafAngle = 0;
        this.weaver = new PatternWeaver(this);
        this.mutationLevel = 0;
        this.mutationIntensity = 0;
    }
}
```

### 方法 2: 在方法中使用配置

```javascript
fireLeafCircle(x, y, mutatedParams) {
    const config = BossConfig.LEVEL1.TREANT_KING.bullets.leafCircle;
    
    const baseCount = this.currentPhase === 1 ? config.phase1Count : config.phase2Count;
    const count = BulletMutator.applyDensity(baseCount, mutatedParams.density || 1);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + this.leafAngle;
        const speed = config.baseSpeed * (0.8 + Math.random() * 0.4);
        
        this.fireBullet(
            x, y,
            Math.cos(angle), Math.sin(angle),
            speed,
            config.color
        );
    }
    
    this.leafAngle += config.rotationSpeed || (Math.PI / 8);
}
```

### 方法 3: 动态调整难度

```javascript
// 在配置加载后动态调整
function adjustBossDifficulty(level, difficultyMultiplier) {
    let config;
    switch(level) {
        case 1: config = BossConfig.LEVEL1.TREANT_KING; break;
        case 2: config = BossConfig.LEVEL2.INFERNO_DRAGON; break;
        case 3: config = BossConfig.LEVEL3.SKY_TYRANT; break;
    }
    
    if (config) {
        config.maxHp = Math.floor(config.maxHp * difficultyMultiplier);
        // 其他属性也可以调整...
    }
}
```

## 快速调整示例

### 降低 Boss 血量（全局）

```javascript
// 在游戏开始前调用
BossConfig.LEVEL1.TREANT_KING.maxHp = 100;
BossConfig.LEVEL2.INFERNO_DRAGON.maxHp = 200;
BossConfig.LEVEL3.SKY_TYRANT.maxHp = 400;
```

### 调整弹幕密度

```javascript
// 简单模式：减少弹幕数量
BossConfig.LEVEL3.SKY_TYRANT.bullets.lightCircle.phase1Count = 6;   // 原 10
BossConfig.LEVEL3.SKY_TYRANT.bullets.lightCircle.phase4Count = 16;  // 原 24
```

### 调整攻击频率

```javascript
// 让 Boss 攻击更频繁
BossConfig.LEVEL1.TREANT_KING.attackCooldown.phase1 = 0.8;  // 原 1.2
BossConfig.LEVEL1.TREANT_KING.attackCooldown.phase2 = 0.6;  // 原 0.9
```

### 调整召唤频率

```javascript
// 增加召唤频率
BossConfig.LEVEL2.INFERNO_DRAGON.summon.phase2Chance = 0.05;  // 原 0.02
BossConfig.LEVEL2.INFERNO_DRAGON.summon.maxMinions = 12;      // 原 8
```

## 配置文件优势

1. **集中管理**: 所有参数在一个文件中，易于查找和修改
2. **无需改代码**: 调整平衡性不需要修改 Boss 类代码
3. **版本控制**: 可以轻松创建不同的配置版本（简单/普通/困难）
4. **热重载**: 在浏览器控制台可以直接修改配置测试效果
5. **文档化**: 配置本身就是文档，清晰说明每个参数的作用

## 控制台调试

在游戏运行时，可以在浏览器控制台直接修改配置：

```javascript
// 查看当前配置
console.log(BossConfig.LEVEL1.TREANT_KING);

// 修改血量
BossConfig.LEVEL1.TREANT_KING.maxHp = 50;

// 修改弹幕速度
BossConfig.LEVEL3.SKY_TYRANT.bullets.lightCircle.baseSpeed = 200;

// 修改召唤概率
BossConfig.LEVEL2.INFERNO_DRAGON.summon.phase3Chance = 0.1;
```

## 待迁移的参数

以下参数已识别但尚未完全迁移到配置文件：

### boss-level1.js (树精王)
- [x] maxHp, width, height, color, themeColor, speed, damage
- [x] phaseCount, phase2Threshold
- [x] attackCooldown (phase1, phase2)
- [x] bullet counts and speeds
- [ ] mutationIntensity 相关参数
- [ ] PatternWeaver 相关参数

### boss-level2.js (烈焰魔龙)
- [x] maxHp, width, height, color, themeColor, speed, damage
- [x] phaseCount, phase thresholds
- [x] attackCooldown (phase1-3)
- [x] bullet counts and speeds
- [ ] meteorCooldown
- [ ] fireBreathDuration
- [ ] flightHeight

### boss-level3.js (天空暴君)
- [x] maxHp, width, height, color, themeColor, speed, damage
- [x] phaseCount, phase thresholds
- [x] attackCooldown (phase1-4)
- [x] bullet counts and speeds
- [x] laserCooldown, summonCooldown
- [ ] teleportInterval
- [ ] appearance 相关参数（眼睛、嘴巴位置等）

## 下一步

1. 逐步将 Boss 类中的硬编码值替换为 `BossConfig.*` 引用
2. 在 Boss 构造函数中添加 `this.config = BossConfig.LEVELx.BOSS_NAME`
3. 更新所有方法使用 `this.config.*` 访问参数
4. 添加配置验证（确保值在合理范围内）
5. 创建配置预设（简单/普通/困难模式）
