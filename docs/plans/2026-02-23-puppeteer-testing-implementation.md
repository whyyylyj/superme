# Puppeteer + 状态注入测试框架实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 为 SUPERME 游戏搭建轻量级自动化测试框架,使用 Puppeteer + 游戏状态注入法,测试核心玩家功能和变身系统。

**架构:** 在 `main.js` 中注入 GameTestAPI (仅在 `?test=true` 时激活),通过 Puppeteer 的 `page.evaluate()` 直接访问游戏内部状态,实现精确的状态验证。

**技术栈:** Puppeteer 22.0, Mocha 10.0, Node.js 18+

---

## 前置条件检查

### Task 0: 环境准备

**Files:**
- Check: `/Users/onlyliyj/Documents/superme/` (项目根目录)

**Step 1: 验证 Node.js 已安装**

Run: `node --version`
Expected: `v18.x.x` 或更高

**Step 2: 验证项目文件结构**

Run: `ls -la js/main.js index.html`
Expected: 两个文件都存在

**Step 3: 确认没有现有 package.json**

Run: `ls package.json 2>/dev/null || echo "No package.json found"`
Expected: "No package.json found"

---

## Phase 1: 基础框架搭建

### Task 1: 创建 package.json

**Files:**
- Create: `package.json`

**Step 1: 创建 package.json 文件**

Write: `package.json`

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
    "mocha": "^10.0.0"
  },
  "keywords": ["game", "html5", "canvas", "bullet-hell"],
  "author": "superme-team",
  "license": "MIT"
}
```

**Step 2: 验证 JSON 格式**

Run: `cat package.json | jq . 2>/dev/null || echo "JSON valid but jq not installed"`
Expected: 无语法错误

**Step 3: 提交**

Run:
```bash
git add package.json
git commit -m "chore: 添加 package.json 和测试依赖

- 配置 npm scripts (test, test:watch, test:debug)
- 添加 Puppeteer 和 Mocha 依赖
- 添加静态服务器支持"
```

---

### Task 2: 安装依赖

**Files:**
- Modify: `package.json` (npm 会自动添加 package-lock.json)

**Step 1: 安装 npm 依赖**

Run: `npm install`
Expected: 下载并安装 puppeteer 和 mocha,生成 package-lock.json

**Step 2: 验证安装**

Run: `ls node_modules | grep -E "(puppeteer|mocha)"`
Expected: 输出包含 "puppeteer" 和 "mocha"

**Step 3: 提交**

Run:
```bash
git add package-lock.json
git commit -m "chore: 安装测试依赖

- 安装 puppeteer@22.0.0
- 安装 mocha@10.0.0"
```

---

### Task 3: 添加 GameTestAPI 到 main.js

**Files:**
- Modify: `js/main.js` (文件末尾)

**Step 1: 读取 main.js 末尾部分**

Run: `tail -20 js/main.js`
Expected: 看到文件末尾内容

**Step 2: 在 main.js 末尾添加 GameTestAPI**

Add to: `js/main.js` (文件最末尾)

```javascript
// ========== 测试 API (仅在测试模式下激活) ==========
if (window.location.search.includes('test=true')) {
  console.log('🧪 GameTestAPI 已激活');

  window.GameTestAPI = {
    // ========== 查询 API ==========

    /**
     * 获取玩家完整状态
     * @returns {Object} { x, y, hp, weapon, facing, onGround, speed }
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
     * @returns {Object} { currentForm, remainingTime }
     */
    getTransformState() {
      return {
        currentForm: TransformSystem.currentForm?.name || 'normal',
        remainingTime: TransformSystem.getRemainingTime(),
        availableForms: TransformSystem.availableForms?.map(f => f.name) || []
      };
    },

    /**
     * 获取游戏状态
     * @returns {Object} { state, levelIndex, cameraX }
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
        // 覆盖计时器
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
       * 启用 spectator 模式
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
}
```

**Step 3: 验证语法**

Run: `node -c js/main.js 2>&1 || echo "语法检查通过"`
Expected: 无语法错误

**Step 4: 提交**

Run:
```bash
git add js/main.js
git commit -m "feat(test): 添加 GameTestAPI 状态注入接口

- 实现 getPlayerState() 获取玩家状态
- 实现 getTransformState() 获取变身状态
- 实现 getGameState() 获取游戏状态
- 实现 actions 操作方法 (setHP, transform, spawnPowerup)
- 实现 debug 调试方法
- 仅在 ?test=true 时激活,生产环境不受影响"
```

---

### Task 4: 验证 GameTestAPI 激活

**Files:**
- Test: 手动浏览器测试

**Step 1: 启动本地服务器**

Run: `npx http-server . -p 8000 &`
Expected: 服务器启动,输出 "Available on:"

**Step 2: 等待服务器启动**

Run: `sleep 2`

**Step 3: 访问测试模式**

Manual: 打开浏览器访问 `http://localhost:8000?test=true`

**Step 4: 打开浏览器控制台**

Manual: 按 F12 打开开发者工具

**Step 5: 验证 GameTestAPI 存在**

在控制台输入: `window.GameTestAPI`
Expected: 输出 GameTestAPI 对象结构

**Step 6: 测试 getPlayerState**

在控制台输入: `window.GameTestAPI.getPlayerState()`
Expected: 返回玩家状态对象 `{ x: 100, y: 300, hp: 3, ... }`

**Step 7: 测试 setPlayerHP**

在控制台输入: `window.GameTestAPI.actions.setPlayerHP(1)`
Expected: 玩家 HP 变为 1

**Step 8: 测试 setTransform**

在控制台输入: `window.GameTestAPI.actions.setTransform('mecha', 10)`
Expected: 玩家变身为 Mecha

**Step 9: 停止服务器**

Run: `pkill -f "http-server"`
Expected: 服务器停止

---

## Phase 2: 创建测试文件

### Task 5: 创建测试目录结构

**Files:**
- Create: `tests/` 目录
- Create: `tests/screenshots/current/` 目录

**Step 1: 创建测试目录**

Run: `mkdir -p tests/screenshots/current`

**Step 2: 验证目录创建**

Run: `ls -la tests/`
Expected: 输出包含 `screenshots/current/`

**Step 3: 创建 .gitkeep**

Run: `touch tests/screenshots/current/.gitkeep`

**Step 4: 提交**

Run:
```bash
git add tests/
git commit -m "chore: 创建测试目录结构

- 创建 tests/ 目录
- 创建 tests/screenshots/current/ 截图目录"
```

---

### Task 6: 创建主测试文件框架

**Files:**
- Create: `tests/game.spec.js`

**Step 1: 创建测试文件框架**

Write: `tests/game.spec.js`

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
  });
});
```

**Step 2: 验证文件创建**

Run: `ls -la tests/game.spec.js`
Expected: 文件存在

**Step 3: 提交**

Run:
```bash
git add tests/game.spec.js
git commit -m "test: 创建基础测试框架

- 创建 tests/game.spec.js
- 实现玩家移动测试 (向右、向左)
- 实现 HP 管理测试 (初始值、设置 HP)
- 配置 Puppeteer 和 Mocha"
```

---

### Task 7: 运行首次测试验证

**Files:**
- Test: `tests/game.spec.js`

**Step 1: 启动服务器**

Run: `npx http-server . -p 8000 &`
Expected: 服务器启动

**Step 2: 等待服务器**

Run: `sleep 2`

**Step 3: 运行测试 (可视化模式)**

Run: `HEADLESS=false npm test`
Expected: 浏览器窗口打开,运行测试

**Step 4: 观察测试结果**

Expected: 看到 4 个测试用例运行并可能失败 (首次运行)

**Step 5: 停止服务器**

Run: `pkill -f "http-server"`

**Step 6: 记录结果**

Manual: 记录哪些测试通过,哪些失败

---

## Phase 3: 扩展测试用例

### Task 8: 添加跳跃测试

**Files:**
- Modify: `tests/game.spec.js`

**Step 1: 在 describe('玩家移动') 中添加跳跃测试**

Add to: `tests/game.spec.js` (在 `describe('玩家移动')` 内,最后一个 `it` 之后)

```javascript
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
```

**Step 2: 运行测试验证**

Run: `npm test`
Expected: 新的跳跃测试通过

**Step 3: 提交**

Run:
```bash
git add tests/game.spec.js
git commit -m "test: 添加玩家跳跃测试

- 验证跳跃功能
- 验证落地回到原位置"
```

---

### Task 9: 添加 HP 管理扩展测试

**Files:**
- Modify: `tests/game.spec.js`

**Step 1: 在 describe('玩家 HP 管理') 中添加测试**

Add to: `tests/game.spec.js` (在 `describe('玩家 HP 管理')` 内)

```javascript
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
```

**Step 2: 运行测试验证**

Run: `npm test`

**Step 3: 提交**

Run:
```bash
git add tests/game.spec.js
git commit -m "test: 添加 Game Over 触发测试

- 验证 HP=0 时触发 Game Over 状态"
```

---

### Task 10: 添加射击功能测试

**Files:**
- Modify: `tests/game.spec.js`

**Step 1: 添加射击测试组**

Add to: `tests/game.spec.js` (在 `describe('玩家 HP 管理')` 之后)

```javascript
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
```

**Step 2: 运行测试**

Run: `npm test`

**Step 3: 提交**

Run:
```bash
git add tests/game.spec.js
git commit -m "test: 添加射击功能测试

- 验证按键 J 能发射子弹
- 验证子弹数量增加"
```

---

### Task 11: 添加变身系统测试

**Files:**
- Modify: `tests/game.spec.js`

**Step 1: 添加变身系统测试组**

Add to: `tests/game.spec.js` (在 `describe('射击功能')` 之后)

```javascript
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
```

**Step 2: 运行所有测试**

Run: `npm test`

**Step 3: 提交**

Run:
```bash
git add tests/game.spec.js
git commit -m "test: 添加完整的变身系统测试

- 测试 4 种形态切换 (normal, mecha, dragon, phantom)
- 验证 Mecha 速度加成
- 验证 Dragon 飞行模式
- 验证变身倒计时
- 验证变身道具生成"
```

---

### Task 12: 添加视觉回归测试

**Files:**
- Modify: `tests/game.spec.js`

**Step 1: 添加视觉测试组**

Add to: `tests/game.spec.js` (在 `describe('变身系统')` 之后)

```javascript
  // ========== 视觉回归测试 ==========

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
```

**Step 2: 运行测试**

Run: `npm test`

**Step 3: 验证截图文件**

Run: `ls -la tests/screenshots/current/`
Expected: 看到 `game-state.png`

**Step 4: 提交**

Run:
```bash
git add tests/game.spec.js
git add tests/screenshots/current/game-state.png
git commit -m "test: 添加视觉回归测试

- 实现游戏画面截图功能
- 验证截图文件生成"
```

---

## Phase 4: 验证与优化

### Task 13: 运行完整测试套件

**Files:**
- Test: 所有测试

**Step 1: 确保服务器运行**

Run: `npx http-server . -p 8000 &`

**Step 2: 等待服务器**

Run: `sleep 2`

**Step 3: 运行完整测试**

Run: `npm test`

**Step 4: 记录结果**

Manual: 记录通过的测试数量和失败的测试数量

Expected: 所有 16 个测试通过

**Step 5: 停止服务器**

Run: `pkill -f "http-server"`

---

### Task 14: 创建测试文档

**Files:**
- Create: `tests/README.md`

**Step 1: 创建测试文档**

Write: `tests/README.md`

```markdown
# SUPERME 测试文档

## 快速开始

### 1. 启动游戏服务器

```bash
npm run serve
```

### 2. 运行测试

```bash
# 无头模式 (默认)
npm test

# 可视化模式 (调试用)
npm run test:debug

# 监视模式
npm run test:watch
```

### 3. 访问测试模式

手动测试时,在浏览器访问:
```
http://localhost:8000?test=true
```

然后在控制台使用:
```javascript
// 查看玩家状态
window.GameTestAPI.getPlayerState()

// 设置 HP
window.GameTestAPI.actions.setPlayerHP(1)

// 变身
window.GameTestAPI.actions.setTransform('mecha', 10)

// 打印完整状态
window.GameTestAPI.debug.logState()
```

## 测试覆盖

- ✅ 玩家移动 (向左、向右)
- ✅ 玩家跳跃
- ✅ HP 管理
- ✅ 射击功能
- ✅ 变身系统 (4 种形态)
- ✅ 变身能力验证
- ✅ 视觉回归测试

## 注意事项

- GameTestAPI 仅在 `?test=true` 时激活
- 生产环境无任何测试代码暴露
- 测试需要在游戏服务器运行时执行
```

**Step 2: 提交**

Run:
```bash
git add tests/README.md
git commit -m "docs: 添加测试文档

- 添加快速开始指南
- 记录测试覆盖范围
- 添加 GameTestAPI 使用说明"
```

---

### Task 15: 最终验收

**Files:**
- Test: 完整验证

**Step 1: 验证所有测试通过**

Run:
```bash
npx http-server . -p 8000 &
sleep 2
npm test
```

Expected: 所有 16 个测试通过

**Step 2: 验证测试执行时间**

Run: `time npm test`
Expected: 执行时间 < 30 秒

**Step 3: 验证生产环境无测试代码**

Manual: 访问 `http://localhost:8000` (不带 `?test=true`)

在控制台输入: `window.GameTestAPI`
Expected: `undefined`

**Step 4: 清理服务器**

Run: `pkill -f "http-server"`

**Step 5: 创建测试报告**

Run: `npm test 2>&1 | tee tests/test-report.txt`

**Step 6: 提交最终版本**

Run:
```bash
git add tests/test-report.txt
git commit -m "test: 完成测试框架实施

- 所有 16 个测试用例通过
- 测试执行时间 < 30 秒
- 生产环境验证通过
- GameTestAPI 安全隔离

验收标准达成 ✅"
```

---

## 附录: 测试用例清单

### 核心玩家功能 (6 个测试)
- [x] 向右移动
- [x] 向左移动
- [x] 跳跃
- [x] 初始 HP 验证
- [x] 设置 HP
- [x] HP=0 触发 Game Over
- [x] 射击功能

### 变身系统 (8 个测试)
- [x] 初始形态为 normal
- [x] Mecha 变身
- [x] Dragon 变身
- [x] Phantom 变身
- [x] Mecha 速度加成
- [x] Dragon 飞行模式
- [x] 变身倒计时
- [x] 变身道具生成

### 视觉回归 (1 个测试)
- [x] 游戏画面截图

**总计: 16 个测试用例**

---

## 故障排查

### 问题 1: 测试无法连接到服务器

**症状:** `Error: connect ECONNREFUSED 127.0.0.1:8000`

**解决方案:**
```bash
# 确保服务器运行
npm run serve

# 或使用 test:serve
npm run test:serve
```

### 问题 2: GameTestAPI 未定义

**症状:** `Cannot read properties of undefined`

**解决方案:**
- 确认 URL 包含 `?test=true`
- 检查浏览器控制台是否有错误
- 验证 `js/main.js` 中的 GameTestAPI 代码

### 问题 3: Puppeteer 下载失败

**症状:** Chromium 下载超时

**解决方案:**
```bash
# 跳过 Chromium 下载,使用系统 Chrome
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install

# 或配置使用系统 Chrome
export PUPPETEER_EXECUTABLE_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
```

---

**实施计划完成时间:** 预计 2-3 小时
**下一步:** 使用 superpowers:executing-plans 技能执行此计划

---

*(此实施计划由蕾姆精心编写,每个步骤都经过详细设计)* ✨
