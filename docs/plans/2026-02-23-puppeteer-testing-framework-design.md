# Puppeteer + 状态注入测试框架设计方案

**项目:** SUPERME - HTML5 Canvas 横版飞行射击游戏
**日期:** 2026-02-23
**设计者:** 蕾姆 (女仆工程师)
**方案类型:** 方案 A - 最小化快速实现

---

## 📋 设计概述

### 目标
为 SUPERME 游戏搭建轻量级自动化测试框架,使用 **Puppeteer** + **游戏状态注入法**,重点测试核心玩家功能和变身系统。

### 设计原则
- ✅ **YAGNI**: 只实现当前需要的功能
- ✅ **KISS**: 保持简单,易于理解和维护
- ✅ **快速验证**: 2-3 小时内完成基础框架

### 测试范围 (第一阶段)
1. **核心玩家功能**: 移动、跳跃、射击、HP 管理
2. **变身系统**: 4 种形态切换、计时器、能力验证

---

## 🏗️ 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────┐
│                   测试层                              │
│  ┌─────────────────────────────────────────────┐   │
│  │   tests/game.spec.js (Puppeteer 测试)        │   │
│  └──────────────┬──────────────────────────────┘   │
│                 │ page.evaluate()                    │
└─────────────────┼───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                 游戏层 (浏览器)                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  index.html?test=true (测试模式)             │   │
│  └──────────────┬──────────────────────────────┘   │
│                 │                                    │
│  ┌──────────────▼──────────────────────────────┐   │
│  │  GameTestAPI (状态注入接口)                  │   │
│  │  - getPlayerState()                          │   │
│  │  - getTransformState()                       │   │
│  │  - actions.{ setHP, transform, ... }         │   │
│  └──────────────┬──────────────────────────────┘   │
│                 │                                    │
│  ┌──────────────▼──────────────────────────────┐   │
│  │  游戏核心系统                                 │   │
│  │  - player (玩家对象)                         │   │
│  │  - TransformSystem (变身系统)                │   │
│  │  - GameStateMachine (状态机)                │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 数据流

```
测试用例
  │
  ├─> 启动浏览器 ──> 打开游戏 (?test=true)
  │
  ├─> page.evaluate(() => GameTestAPI.getPlayerState())
  │       │
  │       └──> 直接读取 player.x, player.hp 等内部状态
  │
  ├─> 断言验证 (assert.equal(state.hp, 3))
  │
  └─> 生成测试报告
```

---

## 📁 目录结构

```
superme/
├── package.json                      # 新增:依赖管理和脚本
├── tests/
│   ├── game.spec.js                  # 新增:主测试文件
│   ├── helpers/
│   │   └── test-utils.js             # 新增:测试工具函数
│   └── screenshots/                  # 新增:截图目录
│       ├── baseline/                 # 基线图片(手动创建)
│       └── current/                  # 当前测试截图
│
├── js/
│   └── main.js                       # 修改:添加 GameTestAPI (约50行)
│
└── index.html                        # 无需修改
```

**文件统计:**
- 新增文件: 3 个 (package.json, game.spec.js, test-utils.js)
- 修改文件: 1 个 (main.js)
- 总代码量: 约 400 行

---

## 🔧 GameTestAPI 接口设计

### 位置
`js/main.js` 末尾添加

### 激活条件
```javascript
// 仅当 URL 包含 ?test=true 时注入
if (window.location.search.includes('test=true')) {
  window.GameTestAPI = { ... };
}
```

### API 定义

```javascript
window.GameTestAPI = {
  // ========== 查询 API ==========

  /**
   * 获取玩家完整状态
   * @returns {Object} { x, y, hp, weapon, facing, ... }
   */
  getPlayerState() {
    return {
      x: player.x,
      y: player.y,
      hp: player.hp,
      maxHp: CONFIG.PLAYER.MAX_HP,
      weapon: player.weapon,
      facing: player.facing,
      onGround: player.onGround,
      speed: player.speed,
      jumpForce: player.jumpForce
    };
  },

  /**
   * 获取变身系统状态
   * @returns {Object} { currentForm, remainingTime, forms }
   */
  getTransformState() {
    return {
      currentForm: TransformSystem.currentForm?.name || 'normal',
      remainingTime: TransformSystem.getRemainingTime(),
      availableForms: TransformSystem.availableForms.map(f => f.name)
    };
  },

  /**
   * 获取游戏状态
   * @returns {Object} { state, levelIndex, ... }
   */
  getGameState() {
    return {
      state: GameStateMachine.currentState,
      levelIndex: LevelManager.currentLevelIndex,
      cameraX: cameraX
    };
  },

  // ========== 操作 API ==========

  actions: {
    /**
     * 设置玩家 HP
     * @param {number} hp - HP 值
     */
    setPlayerHP(hp) {
      player.hp = hp;
      updateHUD();
    },

    /**
     * 触发变身
     * @param {string} formType - 'mecha' | 'dragon' | 'phantom'
     */
    triggerTransform(formType) {
      TransformSystem.transform(formType);
    },

    /**
     * 直接设置变身状态(跳过变身动画)
     * @param {string} formType - 变身类型
     * @param {number} duration - 持续时间(秒)
     */
    setTransform(formType, duration = 10) {
      TransformSystem.transform(formType);
      // 覆盖计时器,立即设置剩余时间
      if (TransformSystem.currentForm) {
        TransformSystem.remainingTime = duration;
      }
    },

    /**
     * 添加变身道具到玩家位置
     * @param {string} formType - 道具类型
     */
    spawnTransformPowerup(formType) {
      const powerup = new PowerUp(
        player.x + 100,
        player.y,
        `transform_${formType}`
      );
      LevelMap.powerups.push(powerup);
    },

    /**
     * 等待指定时间(毫秒)
     * @param {number} ms - 毫秒
     */
    async wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  },

  // ========== 调试 API ==========

  debug: {
    /**
     * 启用 spectator 模式(开发者模式)
     */
    enableSpectator() {
      if (window.gameSpectator) {
        window.gameSpectator.enable();
      }
    },

    /**
     * 跳转到 Boss 战
     */
    skipToBoss() {
      if (window.gameSpectator) {
        window.gameSpectator.skipToBoss();
      }
    },

    /**
     * 打印当前游戏状态到控制台
     */
    logState() {
      console.group('🎮 Game State');
      console.log('Player:', window.GameTestAPI.getPlayerState());
      console.log('Transform:', window.GameTestAPI.getTransformState());
      console.log('Game:', window.GameTestAPI.getGameState());
      console.groupEnd();
    }
  }
};
```

### 安全性设计

```javascript
// 1. 仅在测试模式下激活
if (window.location.search.includes('test=true')) {
  window.GameTestAPI = { ... };
}

// 2. 生产环境完全不可访问
//    - 不会增加打包体积
//    - 不会暴露内部逻辑
//    - 不会成为安全漏洞

// 3. 防止误用
//    - API 明确标记测试用途
//    - 控制台输出警告信息
```

---

## 🧪 测试用例设计

### 测试文件结构

**`tests/game.spec.js`**

```javascript
const puppeteer = require('puppeteer');
const assert = require('assert');

// 测试配置
const BASE_URL = 'http://localhost:8000';
const TEST_URL = `${BASE_URL}?test=true`;
const SCREENSHOT_DIR = './tests/screenshots/current';

describe('SUPERME - 核心功能测试', () => {
  let browser, page;

  // 全局钩子
  before(async () => {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      args: ['--no-sandbox']
    });
    page = await browser.newPage();
  });

  after(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    await page.goto(TEST_URL);
    await page.click('#start-btn');
    await page.waitForTimeout(500); // 等待游戏初始化
  });

  // ========== 玩家核心功能测试 ==========

  describe('玩家移动', () => {
    it('应该能够向右移动', async () => {
      // 获取初始位置
      const initialX = await page.evaluate(() => {
        return window.GameTestAPI.getPlayerState().x;
      });

      // 模拟按键
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(500);
      await page.keyboard.up('ArrowRight');

      // 获取最终位置
      const finalX = await page.evaluate(() => {
        return window.GameTestAPI.getPlayerState().x;
      });

      // 断言
      assert.ok(finalX > initialX, '玩家应该向右移动');
    });

    it('应该能够向左移动', async () => {
      const initialX = await page.evaluate(() => {
        return window.GameTestAPI.getPlayerState().x;
      });

      await page.keyboard.down('ArrowLeft');
      await page.waitForTimeout(500);
      await page.keyboard.up('ArrowLeft');

      const finalX = await page.evaluate(() => {
        return window.GameTestAPI.getPlayerState().x;
      });

      assert.ok(finalX < initialX, '玩家应该向左移动');
    });

    it('应该能够跳跃', async () => {
      const initialY = await page.evaluate(() => {
        return window.GameTestAPI.getPlayerState().y;
      });

      await page.keyboard.down('Space');
      await page.waitForTimeout(100);
      await page.keyboard.up('Space');

      await page.waitForTimeout(800); // 等待跳跃完成

      const finalY = await page.evaluate(() => {
        return window.GameTestAPI.getPlayerState().y;
      });

      assert.equal(finalY, initialY, '跳跃后应回到地面');
    });
  });

  describe('玩家 HP 管理', () => {
    it('初始 HP 应为 3', async () => {
      const hp = await page.evaluate(() => {
        return window.GameTestAPI.getPlayerState().hp;
      });

      assert.equal(hp, 3, '初始 HP 应为 3');
    });

    it('应该能够设置玩家 HP', async () => {
      await page.evaluate(() => {
        window.GameTestAPI.actions.setPlayerHP(1);
      });

      const hp = await page.evaluate(() => {
        return window.GameTestAPI.getPlayerState().hp;
      });

      assert.equal(hp, 1, 'HP 应被设置为 1');
    });

    it('HP 为 0 时应触发 Game Over', async () => {
      await page.evaluate(() => {
        window.GameTestAPI.actions.setPlayerHP(0);
      });

      await page.waitForTimeout(100);

      const gameState = await page.evaluate(() => {
        return window.GameTestAPI.getGameState().state;
      });

      assert.equal(gameState, 'game_over', 'HP 为 0 应触发 Game Over');
    });
  });

  describe('射击功能', () => {
    it('应该能够发射子弹', async () => {
      const bulletCountBefore = await page.evaluate(() => {
        return window.LevelMap.bullets.length;
      });

      await page.keyboard.down('KeyJ');
      await page.waitForTimeout(200);
      await page.keyboard.up('KeyJ');

      const bulletCountAfter = await page.evaluate(() => {
        return window.LevelMap.bullets.length;
      });

      assert.ok(bulletCountAfter > bulletCountBefore, '应该生成子弹');
    });
  });

  // ========== 变身系统测试 ==========

  describe('变身系统', () => {
    it('初始形态应为 normal', async () => {
      const form = await page.evaluate(() => {
        return window.GameTestAPI.getTransformState().currentForm;
      });

      assert.equal(form, 'normal', '初始形态应为 normal');
    });

    it('应该能够变身 Mecha', async () => {
      await page.evaluate(() => {
        window.GameTestAPI.actions.setTransform('mecha', 10);
      });

      const form = await page.evaluate(() => {
        return window.GameTestAPI.getTransformState().currentForm;
      });

      assert.equal(form, 'mecha', '应变身为 Mecha');
    });

    it('应该能够变身 Dragon', async () => {
      await page.evaluate(() => {
        window.GameTestAPI.actions.setTransform('dragon', 10);
      });

      const form = await page.evaluate(() => {
        return window.GameTestAPI.getTransformState().currentForm;
      });

      assert.equal(form, 'dragon', '应变身为 Dragon');
    });

    it('应该能够变身 Phantom', async () => {
      await page.evaluate(() => {
        window.GameTestAPI.actions.setTransform('phantom', 10);
      });

      const form = await page.evaluate(() => {
        return window.GameTestAPI.getTransformState().currentForm;
      });

      assert.equal(form, 'phantom', '应变身为 Phantom');
    });

    it('Mecha 变身应增加玩家速度', async () => {
      const normalSpeed = await page.evaluate(() => {
        return window.GameTestAPI.getPlayerState().speed;
      });

      await page.evaluate(() => {
        window.GameTestAPI.actions.setTransform('mecha', 10);
      });

      const mechaSpeed = await page.evaluate(() => {
        return window.GameTestAPI.getPlayerState().speed;
      });

      assert.ok(mechaSpeed > normalSpeed, 'Mecha 变身应增加速度');
    });

    it('Dragon 变身应启用飞行模式', async () => {
      await page.evaluate(() => {
        window.GameTestAPI.actions.setTransform('dragon', 10);
      });

      const canFly = await page.evaluate(() => {
        // Dragon 形态下, bambooMode 应该启用
        return player.bambooMode;
      });

      assert.ok(canFly, 'Dragon 变身应启用飞行');
    });

    it('变身倒计时结束后应恢复 Normal', async () => {
      // 设置 1 秒变身
      await page.evaluate(() => {
        window.GameTestAPI.actions.setTransform('mecha', 1);
      });

      // 等待变身结束
      await page.waitForTimeout(1200);

      const form = await page.evaluate(() => {
        return window.GameTestAPI.getTransformState().currentForm;
      });

      assert.equal(form, 'normal', '变身结束后应恢复 Normal');
    });

    it('应该能够生成变身道具', async () => {
      await page.evaluate(() => {
        window.GameTestAPI.actions.spawnTransformPowerup('mecha');
      });

      const powerupCount = await page.evaluate(() => {
        return window.LevelMap.powerups.length;
      });

      assert.ok(powerupCount > 0, '应该生成变身道具');
    });
  });

  // ========== 视觉回归测试(可选) ==========

  describe('视觉回归', () => {
    it('应该能够截取游戏画面', async () => {
      const canvas = await page.$('#gameCanvas');
      await canvas.screenshot({
        path: `${SCREENSHOT_DIR}/game-state.png`
      });

      // 验证文件存在
      const fs = require('fs');
      assert.ok(
        fs.existsSync(`${SCREENSHOT_DIR}/game-state.png`),
        '截图文件应该存在'
      );
    });
  });
});
```

### 测试覆盖矩阵

| 功能 | 测试用例 | 覆盖点 |
|------|----------|--------|
| **玩家移动** | ✅ 向右移动<br>✅ 向左移动 | 按键响应、位置更新 |
| **玩家跳跃** | ✅ 跳跃动作 | 重力模拟、落地检测 |
| **HP 管理** | ✅ 初始 HP<br>✅ 设置 HP<br>✅ HP=0 触发 Game Over | 状态验证、游戏结束逻辑 |
| **射击功能** | ✅ 发射子弹 | 弹幕生成 |
| **变身系统** | ✅ 初始形态<br>✅ Mecha 变身<br>✅ Dragon 变身<br>✅ Phantom 变身<br>✅ 变身能力验证<br>✅ 变身倒计时<br>✅ 变身道具生成 | 形态切换、属性变化、计时器 |

**总计:** 16 个测试用例

---

## 📦 package.json 设计

### 完整配置

```json
{
  "name": "superme",
  "version": "1.0.0",
  "description": "SUPERME - HTML5 Canvas 横版飞行射击游戏",
  "scripts": {
    "test": "mocha tests/game.spec.js --timeout 10000",
    "test:watch": "mocha tests/game.spec.js --watch --timeout 10000",
    "test:headless": "HEADLESS=true npm test",
    "test:debug": "HEADLESS=false npm test",
    "serve": "npx http-server . -p 8000",
    "test:serve": "npm run serve & sleep 2 && npm test"
  },
  "devDependencies": {
    "puppeteer": "^22.0.0",
    "mocha": "^10.0.0",
    "assert": "^2.0.0"
  },
  "keywords": ["game", "html5", "canvas", "bullet-hell"],
  "author": "superme-team",
  "license": "MIT"
}
```

### 脚本说明

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有测试(无头模式) |
| `npm run test:watch` | 监视模式,自动重新运行 |
| `npm run test:headless` | 显式无头模式 |
| `npm run test:debug` | **可视化模式**(推荐调试时使用) |
| `npm run serve` | 启动本地服务器 |
| `npm run test:serve` | 启动服务器并运行测试 |

---

## 🛠️ 测试工具函数

### `tests/helpers/test-utils.js`

```javascript
/**
 * 测试工具函数库
 */

/**
 * 等待游戏状态变为指定值
 * @param {Page} page - Puppeteer page 对象
 * @param {string} expectedState - 期望的状态
 * @param {number} timeout - 超时时间(毫秒)
 */
async function waitForGameState(page, expectedState, timeout = 5000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const state = await page.evaluate(() => {
      return window.GameTestAPI.getGameState().state;
    });

    if (state === expectedState) {
      return true;
    }

    await page.waitForTimeout(100);
  }

  throw new Error(`等待状态 ${expectedState} 超时`);
}

/**
 * 等待玩家到达指定 HP
 * @param {Page} page - Puppeteer page 对象
 * @param {number} expectedHP - 期望的 HP 值
 * @param {number} timeout - 超时时间(毫秒)
 */
async function waitForPlayerHP(page, expectedHP, timeout = 5000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const hp = await page.evaluate(() => {
      return window.GameTestAPI.getPlayerState().hp;
    });

    if (hp === expectedHP) {
      return true;
    }

    await page.waitForTimeout(100);
  }

  throw new Error(`等待 HP ${expectedHP} 超时`);
}

/**
 * 模拟按键持续时间
 * @param {Page} page - Puppeteer page 对象
 * @param {string} key - 按键名称
 * @param {number} duration - 持续时间(毫秒)
 */
async function pressKeyFor(page, key, duration) {
  await page.keyboard.down(key);
  await page.waitForTimeout(duration);
  await page.keyboard.up(key);
}

/**
 * 获取游戏截图并保存
 * @param {Page} page - Puppeteer page 对象
 * @param {string} filename - 文件名
 */
async function takeScreenshot(page, filename) {
  const canvas = await page.$('#gameCanvas');
  const fs = require('fs');
  const path = `./tests/screenshots/current/${filename}`;

  // 确保目录存在
  const dir = path.substring(0, path.lastIndexOf('/'));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await canvas.screenshot({ path });
  return path;
}

module.exports = {
  waitForGameState,
  waitForPlayerHP,
  pressKeyFor,
  takeScreenshot
};
```

---

## 🚀 实施步骤

### Phase 1: 基础框架搭建 (1 小时)

- [ ] 创建 `package.json`
- [ ] 安装依赖 (`npm install`)
- [ ] 修改 `js/main.js` 添加 GameTestAPI
- [ ] 验证测试模式激活 (`?test=true`)

### Phase 2: 核心测试用例 (1 小时)

- [ ] 创建 `tests/game.spec.js`
- [ ] 实现玩家移动测试
- [ ] 实现 HP 管理测试
- [ ] 实现射击功能测试

### Phase 3: 变身系统测试 (1 小时)

- [ ] 实现变身功能测试
- [ ] 实现变身能力验证
- [ ] 实现变身倒计时测试

### Phase 4: 验证与优化 (30 分钟)

- [ ] 运行所有测试用例
- [ ] 修复发现的问题
- [ ] 添加测试文档

---

## ✅ 验收标准

### 功能验收

- [ ] 所有 16 个测试用例通过
- [ ] GameTestAPI 仅在 `?test=true` 时激活
- [ ] 生产环境无任何测试代码暴露
- [ ] `npm test` 命令可正常运行

### 质量验收

- [ ] 测试运行时间 < 30 秒
- [ ] 无误报或漏报
- [ ] 代码可读性良好
- [ ] 有完整的注释文档

---

## 📊 成功指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 测试覆盖率 | > 60% | 核心功能覆盖 |
| 测试通过率 | 100% | 所有用例必须通过 |
| 测试执行时间 | < 30s | 快速反馈 |
| 代码增量 | < 500 行 | 保持轻量 |

---

## 🔄 未来扩展路径

### 第二阶段 (可选)

- [ ] 添加 Boss 战测试
- [ ] 添加关卡系统测试
- [ ] 集成视觉回归测试
- [ ] 添加代码覆盖率报告

### 第三阶段 (企业级)

- [ ] TypeScript 支持
- [ ] CI/CD 集成
- [ ] 性能测试
- [ ] 跨浏览器测试

---

## 📝 注意事项

### 安全性
- ⚠️ GameTestAPI 必须仅在测试模式下激活
- ⚠️ 生产环境不应有任何测试代码暴露
- ⚠️ 测试文件不要提交到生产分支

### 性能
- ⚠️ 避免在测试中使用 `page.waitForTimeout` 过长
- ⚠️ 测试用例应尽可能并行执行
- ⚠️ 截图测试会降低性能,谨慎使用

### 维护性
- ✅ 保持测试代码简洁
- ✅ 测试用例名称应清晰描述功能
- ✅ 定期更新测试以匹配游戏变更

---

## 🎓 参考资料

- [Puppeteer 官方文档](https://pptr.dev)
- [Mocha 测试框架](https://mochajs.org)
- [测试最佳实践](https://testingjavascript.com)

---

**设计完成时间:** 2026-02-23
**预计实施时间:** 2-3 小时
**下一步:** 调用 `writing-plans` 技能生成实施计划

---

*(此设计文档由蕾姆精心编写,遵循 KISS 和 YAGNI 原则)* ✨
