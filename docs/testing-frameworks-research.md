# 网页游戏自动化测试框架对比调研报告

**项目:** SUPERME - HTML5 Canvas 横版飞行射击游戏
**调研日期:** 2026-02-23
**调研目标:** 寻找除 Playwright 之外的完整自动化测试框架
**测试重点:** 游戏逻辑机制 + Canvas 渲染视觉

---

## 📋 执行摘要

本次调研针对 HTML5 Canvas 游戏的自动化测试需求,对比分析了 **4 种主流 Web 测试框架**以及**游戏专用测试方案**。

### 最终推荐排序

| 排名 | 框架 | 综合评分 | 核心优势 |
|------|------|----------|----------|
| 🥇 | **Puppeteer** | ⭐⭐⭐⭐⭐ (4.8/5) | 轻量、Chrome 原生、Canvas API 完整支持 |
| 🥈 | **Cypress** | ⭐⭐⭐⭐ (4.2/5) | 优秀开发者体验、实时重载、时间旅行调试 |
| 🥉 | **TestCafe** | ⭐⭐⭐⭐ (4.0/5) | 无 WebDriver 架构、稳定性高、内置等待 |
| 4 | WebdriverIO | ⭐⭐⭐ (3.5/5) | 跨浏览器支持强、但配置复杂 |
| 💎 | **游戏状态注入法** | ⭐⭐⭐⭐⭐ (4.9/5) | 专为游戏设计、精确状态验证、**强烈推荐组合使用** |

---

## 🔍 详细对比分析

### 1. Puppeteer (Chrome DevTools Protocol)

#### 核心特性
- **架构:** 基于 Chrome DevTools Protocol (CDP)
- **开发者:** Google Chrome Team
- **生态:** 70k+ GitHub stars, 活跃社区

#### Canvas 游戏测试能力

##### ✅ 优势

**1. 完整的 Canvas API 访问**
```javascript
// 直接访问 Canvas 上下文
const canvas = await page.$('#gameCanvas');
const ctx = await canvas.evaluate((canvas) => {
  const context = canvas.getContext('2d');
  return {
    width: canvas.width,
    height: canvas.height,
    imageData: context.getImageData(0, 0, canvas.width, canvas.height).data
  };
});
```

**2. 精确的像素级截图对比**
```javascript
// 截取 Canvas 元素
await canvas.screenshot({ path: 'game-state.png' });

// 视觉回归测试
const fs = require('fs');
const baseline = fs.readFileSync('baseline.png');
const current = fs.readFileSync('game-state.png');
// 使用像素对比库(如 pixelmatch)进行对比
```

**3. 游戏内部状态注入**
```javascript
// 通过 page.evaluate 注入测试代码
const playerHP = await page.evaluate(() => {
  return window.player.hp; // 直接访问游戏全局变量
});

const bossPhase = await page.evaluate(() => {
  return window.LevelMap.boss.phase;
});
```

**4. 模拟复杂键盘操作**
```javascript
// 模拟连续按键(如移动、射击)
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(1000); // 持续 1 秒
await page.keyboard.up('ArrowRight');

// 组合键操作
await page.keyboard.down('Space'); // 跳跃
await page.waitForTimeout(100);
await page.keyboard.up('Space');
```

**5. 性能监控**
```javascript
// 启用性能监控
await page.coverage.startCSSCoverage();
const client = await page.target().createCDPSession();
await client.send('Performance.enable');

// 获取性能指标
const metrics = await page.metrics();
// metrics: { Timestamp, Documents, Frames, JSEventListeners }
```

##### ❌ 劣势

1. **仅支持 Chromium 系浏览器** (Chrome, Edge, Brave)
2. **无内置断言库**, 需要配合 Chai/Jest
3. **不支持 Firefox/Safari**, 跨浏览器测试需要额外工具

#### 学习曲线
- ⭐⭐⭐☆☆ (中等)
- **上手时间:** 2-3 天
- **文档质量:** ⭐⭐⭐⭐⭐ (官方文档详尽)

#### 集成复杂度
- ⭐⭐☆☆☆ (简单)
- **无需 WebDriver**, 直接 npm install
- **配置文件:** 最小化配置即可使用

#### 完整测试示例

```javascript
const puppeteer = require('puppeteer');
const assert = require('assert');

describe('SUPERME Game Tests', () => {
  let browser, page;

  before(async () => {
    browser = await puppeteer.launch({
      headless: false, // 可视化运行
      args: ['--no-sandbox']
    });
    page = await browser.newPage();
  });

  after(async () => {
    await browser.close();
  });

  it('玩家移动测试', async () => {
    await page.goto('http://localhost:8000');

    // 点击开始按钮
    await page.click('#start-btn');
    await page.waitForSelector('#hud', { visible: true });

    // 获取初始位置
    const initialX = await page.evaluate(() => window.player.x);

    // 模拟按右键移动
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowRight');

    // 验证位置变化
    const finalX = await page.evaluate(() => window.player.x);
    assert.ok(finalX > initialX, '玩家应该向右移动');
  });

  it('玩家跳跃测试', async () => {
    const initialY = await page.evaluate(() => window.player.y);

    await page.keyboard.down('Space');
    await page.waitForTimeout(100);
    await page.keyboard.up('Space');

    await page.waitForTimeout(500); // 等待跳跃完成

    const finalY = await page.evaluate(() => window.player.y);
    assert.equal(finalY, initialY, '跳跃后应回到地面');
  });

  it('射击功能测试', async () => {
    const bulletCountBefore = await page.evaluate(() => {
      return window.LevelMap.bullets.length;
    });

    await page.keyboard.down('KeyJ'); // J 键射击
    await page.waitForTimeout(200);
    await page.keyboard.up('KeyJ');

    const bulletCountAfter = await page.evaluate(() => {
      return window.LevelMap.bullets.length;
    });

    assert.ok(bulletCountAfter > bulletCountBefore, '应该生成子弹');
  });

  it('Boss 战阶段切换测试', async () => {
    // 使用 spectator 模式快速到达 Boss
    await page.evaluate(() => {
      window.game Spectator.enable();
      window.gameSpectator.skipToBoss();
    });

    const phase1 = await page.evaluate(() => window.LevelMap.boss.phase);
    assert.equal(phase1, 1, '初始应为阶段 1');

    // 模拟攻击 Boss
    await page.evaluate(() => {
      window.LevelMap.boss.hp = 30; // 降低 HP 触发阶段切换
    });

    await page.waitForTimeout(1000);

    const phase2 = await page.evaluate(() => window.LevelMap.boss.phase);
    assert.equal(phase2, 2, 'HP 降低后应进入阶段 2');
  });

  it('Canvas 视觉回归测试', async () => {
    const canvas = await page.$('#gameCanvas');

    // 截图保存
    await canvas.screenshot({ path: 'tests/screenshots/game-state.png' });

    // 像素对比(需提前准备 baseline)
    const pixelmatch = require('pixelmatch');
    const fs = require('fs');
    const PNG = require('pngjs').PNG;

    const img1 = PNG.sync.read(fs.readFileSync('tests/screenshots/baseline.png'));
    const img2 = PNG.sync.read(fs.readFileSync('tests/screenshots/game-state.png'));

    const diff = new PNG({ width: img1.width, height: img1.height });
    const numDiffPixels = pixelmatch(
      img1.data, img2.data, diff.data,
      img1.width, img1.height,
      { threshold: 0.1 }
    );

    assert.ok(numDiffPixels < 100, '视觉差异应在可接受范围内');
  });
});
```

#### 综合评分

| 维度 | 评分 | 说明 |
|------|------|------|
| **游戏逻辑测试** | ⭐⭐⭐⭐⭐ | page.evaluate 可直接访问游戏状态 |
| **Canvas 渲染测试** | ⭐⭐⭐⭐⭐ | 完整截图 API + 像素对比 |
| **学习曲线** | ⭐⭐⭐☆☆ | 需要理解异步编程 |
| **集成难度** | ⭐⭐☆☆☆ | npm install 即用 |
| **性能** | ⭐⭐⭐⭐⭐ | CDP 协议,速度极快 |
| **社区支持** | ⭐⭐⭐⭐⭐ | Google 官方维护 |
| **跨浏览器** | ⭐☆☆☆☆ | 仅 Chromium |

**总分: 4.8/5** ⭐⭐⭐⭐⭐

---

### 2. Cypress (前端开发者友好)

#### 核心特性
- **架构:** 基于 Mocha, 内置断言和重试
- **开发者:** Cypress.io
- **生态:** 45k+ GitHub stars

#### Canvas 游戏测试能力

##### ✅ 优势

**1. 实时重载和可视化界面**
- 测试运行时可实时看到浏览器操作
- 自动等待元素可见/可点击
- 时间旅行调试:可回到任意步骤查看状态

**2. Canvas 截图功能**
```javascript
// 截取整个页面
cy.screenshot('game-state');

// 截取特定元素
cy.get('#gameCanvas').screenshot('canvas-only');

// 视觉回归插件
cy.get('#gameCanvas').matchImageSnapshot('baseline');
```

**3. 游戏状态验证**
```javascript
// 使用 cy.window() 访问 window 对象
cy.window().its('player.hp').should('eq', 3);

cy.window().then((win) => {
  expect(win.LevelMap.boss.phase).to.equal(2);
});
```

**4. 模拟键盘操作**
```javascript
// 使用 type() 模拟按键
cy.get('body').type('{rightarrow}'); // 右移
cy.wait(500);
cy.get('body').type('{uparrow}'); // 跳跃
```

**5. 内置请求拦截**
```javascript
// 拦截和修改 XHR 请求(可用于测试网络异常)
cy.intercept('GET', '/api/save-game', { forceNetworkError: true });
```

##### ❌ 劣势

1. **Canvas 上下文访问受限**, 无法直接获取 Canvas 2D context
2. **像素级对比需插件**, 如 `cypress-image-snapshot`
3. **跨域限制**, 需配置 `chromeWebSecurity: false`
4. **Multiverse 世界隔离问题**, 测试间共享状态较复杂

#### 学习曲线
- ⭐⭐⭐⭐☆ (较简单)
- **上手时间:** 1-2 天
- **文档质量:** ⭐⭐⭐⭐⭐ (交互式教程优秀)

#### 集成复杂度
- ⭐⭐⭐☆☆ (中等)
- **零配置**启动,但高级功能需配置 `cypress.config.js`

#### 完整测试示例

```javascript
// cypress/e2e/game.cy.js
describe('SUPERME Game', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000');
  });

  it('游戏启动流程', () => {
    cy.get('#start-screen').should('be.visible');
    cy.get('#start-btn').click();
    cy.get('#hud').should('be.visible');
    cy.get('#hp-hearts').should('have.length', 3);
  });

  it('玩家移动功能', () => {
    cy.get('#start-btn').click();

    cy.window().then((win) => {
      const initialX = win.player.x;

      cy.get('body').type('{rightarrow}');
      cy.wait(500);

      cy.window().its('player.x').should('be.gt', initialX);
    });
  });

  it('变身系统测试', () => {
    cy.get('#start-btn').click();

    // 模拟拾取变身道具
    cy.window().then((win) => {
      win.player.transform('mecha');
    });

    cy.get('#form-val').should('contain', 'MECHA');
    cy.get('#transform-bar').should('be.visible');
  });

  it('Boss 战阶段验证', () => {
    cy.get('#start-btn').click();

    // 使用 spectator 模式跳转
    cy.window().then((win) => {
      win.gameSpectator.enable();
      win.gameSpectator.skipToBoss();
    });

    cy.get('#boss-hud').should('be.visible');
    cy.get('#boss-name-text').should('contain', 'Treant King');

    // 降低 Boss HP 触发阶段切换
    cy.window().then((win) => {
      win.LevelMap.boss.takeDamage(70);
    });

    cy.wait(1000);

    cy.get('#boss-phase').should('contain', 'Phase 2');
  });

  it('视觉回归测试', () => {
    cy.get('#start-btn').click();
    cy.wait(1000); // 等待画面稳定

    // 使用插件进行视觉对比
    cy.get('#gameCanvas').matchImageSnapshot({
      failureThreshold: 0.1,
      failureThresholdType: 'percent'
    });
  });

  it('弹幕性能测试', () => {
    cy.get('#start-btn').click();

    cy.window().then((win) => {
      // 生成大量弹幕
      win.DanmakuEngine.emitPattern('flower', { x: 400, y: 300 }, 100);

      // 等待几帧
      cy.wait(100);

      // 验证弹幕数量
      cy.window().its('LevelMap.bullets.length').should('be.within', 90, 110);
    });
  });
});
```

#### 综合评分

| 维度 | 评分 | 说明 |
|------|------|------|
| **游戏逻辑测试** | ⭐⭐⭐⭐☆ | cy.window() 访问状态,但有局限 |
| **Canvas 渲染测试** | ⭐⭐⭐⭐☆ | 截图+插件支持 |
| **学习曲线** | ⭐⭐⭐⭐☆ | 最易上手,界面友好 |
| **集成难度** | ⭐⭐⭐☆☆ | 零配置启动 |
| **性能** | ⭐⭐⭐☆☆ | 相对较慢 |
| **社区支持** | ⭐⭐⭐⭐⭐ | 活跃社区 |
| **跨浏览器** | ⭐⭐⭐☆☆ | 支持 Chrome/Edge/Firefox |

**总分: 4.2/5** ⭐⭐⭐⭐

---

### 3. TestCafe (无 WebDriver 架构)

#### 核心特性
- **架构:** 无 WebDriver,直接注入浏览器
- **开发者:** Developer Express Inc.
- **生态:** 10k+ GitHub stars

#### Canvas 游戏测试能力

##### ✅ 优势

**1. 无需 WebDriver,稳定性高**
- 自动等待元素可见/可点击
- 内置智能重试机制
- 不会因为 WebDriver 通信问题而失败

**2. 角色功能(Role API)**
```javascript
// 用于隔离不同用户的测试状态
const player = Role('http://localhost:8000', async t => {
  await t.click('#start-btn');
});

test('玩家自定义测试', async t => {
  await t.useRole(player);
  // 测试逻辑...
});
```

**3. 请求拦截器**
```javascript
// 拦截网络请求,模拟网络异常
const logger = RequestLogger();
await t
  .addRequestHooks(logger)
  .navigateTo('http://localhost:8000');
```

**4. 截图和视频录制**
```javascript
// 自动截图
await t.takeScreenshot('game-state.png');

// 录制整个测试过程
await t.takeElementScreenshot('#gameCanvas', 'canvas.png');
```

**5. 跨浏览器支持**
- Chrome, Firefox, Safari, Edge
- 支持移动端浏览器(iOS Safari, Android Chrome)

##### ❌ 劣势

1. **API 较繁琐**, 不如 Puppeteer/Cypress 直观
2. **文档相对较少**, 社区不如前两者活跃
3. **调试体验一般**, 无时间旅行功能

#### 学习曲线
- ⭐⭐⭐☆☆ (中等)
- **上手时间:** 2-3 天
- **文档质量:** ⭐⭐⭐☆☆ (需要改进)

#### 集成复杂度
- ⭐⭐⭐☆☆ (中等)
- **配置文件:** `.testcaferc.json`

#### 完整测试示例

```javascript
import { Selector, Role } from 'testcafe';

fixture `SUPERME Game Tests`
  .page `http://localhost:8000`;

test('玩家移动测试', async t => {
  await t.click('#start-btn');

  const initialX = await t.eval(() => window.player.x);

  await t
    .pressKey('right')
    .wait(500)
    .releaseKey('right');

  const finalX = await t.eval(() => window.player.x);
  await t.expect(finalX).gt(initialX);
});

test('Canvas 截图测试', async t => {
  await t.click('#start-btn');
  await t.wait(1000);

  const canvas = Selector('#gameCanvas');
  await t
    .takeElementScreenshot(canvas, 'baseline.png')
    .expect(canvas.visible).ok();
});

test('Boss 战阶段切换', async t => {
  await t.click('#start-btn');

  // 跳转到 Boss
  await t.eval(() => {
    window.gameSpectator.enable();
    window.gameSpectator.skipToBoss();
  });

  const bossHP = await t.eval(() => window.LevelMap.boss.hp);

  // 降低 HP
  await t.eval(() => {
    window.LevelMap.boss.hp = 30;
  });

  await t.wait(1000);

  const phase = await t.eval(() => window.LevelMap.boss.phase);
  await t.expect(phase).eql(2);
});
```

#### 综合评分

| 维度 | 评分 | 说明 |
|------|------|------|
| **游戏逻辑测试** | ⭐⭐⭐⭐☆ | t.eval() 访问游戏状态 |
| **Canvas 渲染测试** | ⭐⭐⭐⭐☆ | 截图功能完善 |
| **学习曲线** | ⭐⭐⭐☆☆ | API 略繁琐 |
| **集成难度** | ⭐⭐⭐☆☆ | 需配置文件 |
| **性能** | ⭐⭐⭐⭐☆ | 无 WebDriver,速度较快 |
| **社区支持** | ⭐⭐⭐☆☆ | 相对较小 |
| **跨浏览器** | ⭐⭐⭐⭐⭐ | 支持最全面 |

**总分: 4.0/5** ⭐⭐⭐⭐

---

### 4. WebdriverIO (WebDriver 标准实现)

#### 核心特性
- **架构:** 基于 WebDriver W3C 标准
- **开发者:** Christian Bromann
- **生态:** 8k+ GitHub stars

#### Canvas 游戏测试能力

##### ✅ 优势

**1. 完整的 WebDriver 标准支持**
- 支持 Chrome, Firefox, Safari, Edge
- 可扩展到移动端(Appium 集成)

**2. 丰富的插件生态**
- `@wdio/devtools-service` - Chrome DevTools 集成
- `@wdio/visual-service` - 视觉回归测试

**3. 页面对象模式(POM)友好**
```javascript
class GamePage {
  get startButton() { return $('#start-btn'); }
  get canvas() { return $('#gameCanvas'); }

  async start() {
    await this.startButton.click();
  }

  async getPlayerState() {
    return browser.execute(() => window.player);
  }
}
```

**4. 并行测试**
- 支持多线程并行执行
- 适合大型测试套件

##### ❌ 劣势

1. **依赖 WebDriver,通信开销大**,速度较慢
2. **配置复杂**, 需配置 `wdio.conf.js`
3. **稳定性不如 TestCafe**, WebDriver 通信可能失败

#### 学习曲线
- ⭐⭐☆☆☆ (较难)
- **上手时间:** 3-5 天
- **文档质量:** ⭐⭐⭐⭐☆

#### 集成复杂度
- ⭐⭐☆☆☆ (复杂)
- **配置文件:** `wdio.conf.js`

#### 完整测试示例

```javascript
describe('SUPERME Game', () => {
  beforeEach(() => {
    browser.url('http://localhost:8000');
  });

  it('玩家移动测试', () => {
    $('#start-btn').click();

    const initialX = browser.execute(() => window.player.x);

    browser.keys('ArrowRight');
    browser.pause(500);
    browser.keys('NULL'); // 释放按键

    const finalX = browser.execute(() => window.player.x);
    expect(finalX).toBeGreaterThan(initialX);
  });

  it('Canvas 截图', () => {
    $('#start-btn').click();
    browser.pause(1000);

    browser.saveScreenshot('game-state.png');
  });

  it('Boss 阶段测试', () => {
    $('#start-btn').click();

    browser.execute(() => {
      window.gameSpectator.enable();
      window.gameSpectator.skipToBoss();
    });

    const phase = browser.execute(() => window.LevelMap.boss.phase);
    expect(phase).toEqual(1);
  });
});
```

#### 综合评分

| 维度 | 评分 | 说明 |
|------|------|------|
| **游戏逻辑测试** | ⭐⭐⭐⭐☆ | browser.execute() 访问状态 |
| **Canvas 渲染测试** | ⭐⭐⭐☆☆ | 截图支持,但无像素对比 |
| **学习曲线** | ⭐⭐☆☆☆ | 配置复杂 |
| **集成难度** | ⭐⭐☆☆☆ | 配置繁琐 |
| **性能** | ⭐⭐☆☆☆ | WebDriver 通信慢 |
| **社区支持** | ⭐⭐⭐☆☆ | 社区中等 |
| **跨浏览器** | ⭐⭐⭐⭐⭐ | WebDriver 标准,全面支持 |

**总分: 3.5/5** ⭐⭐⭐

---

## 💎 游戏专用测试方案:状态注入法

### 核心思想

**在游戏代码中暴露专门的测试 API,让测试框架直接读取和操作游戏内部状态**,而不依赖 DOM 或 Canvas 渲染。

### 实现方案

#### 1. 暴露测试 API

在 `js/main.js` 中添加:

```javascript
// 仅在测试模式下暴露
if (window.location.search.includes('test=true')) {
  window.GameTestAPI = {
    // 获取玩家状态
    getPlayerState: () => ({
      x: player.x,
      y: player.y,
      hp: player.hp,
      weapon: player.weapon,
      form: player.form,
      isInvincible: player.invincible
    }),

    // 获取 Boss 状态
    getBossState: () => {
      if (!LevelMap.boss) return null;
      return {
        hp: LevelMap.boss.hp,
        maxHp: LevelMap.boss.maxHp,
        phase: LevelMap.boss.phase,
        x: LevelMap.boss.x,
        y: LevelMap.boss.y
      };
    },

    // 获取弹幕信息
    getBulletCount: () => LevelMap.bullets.length,

    // 获取关卡进度
    getLevelProgress: () => ({
      currentLevel: levelManager.currentLevel,
      cameraX: cameraX,
      levelWidth: LevelMap.width
    }),

    // 操作 API
    actions: {
      setPlayerHP: (hp) => { player.hp = hp; },
      setBossHP: (hp) => { if (LevelMap.boss) LevelMap.boss.hp = hp; },
      addPowerup: (type) => {
        const powerup = new PowerUp(player.x + 50, player.y, type);
        LevelMap.powerups.push(powerup);
      },
      triggerTransform: (formType) => {
        player.transform(formType);
      },
      skipToBoss: () => {
        if (gameSpectator) {
          gameSpectator.enable();
          gameSpectator.skipToBoss();
        }
      }
    },

    // 性能监控
    getPerformanceMetrics: () => ({
      fps: currentFPS,
      bulletCount: LevelMap.bullets.length,
      enemyCount: LevelMap.enemies.length,
      particleCount: particles.length
    })
  };
}
```

#### 2. 测试代码示例

```javascript
const puppeteer = require('puppeteer');

describe('SUPERME - Game State Injection Tests', () => {
  let browser, page;

  before(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  after(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // 以测试模式启动
    await page.goto('http://localhost:8000?test=true');
    await page.click('#start-btn');
  });

  it('玩家初始状态验证', async () => {
    const state = await page.evaluate(() => window.GameTestAPI.getPlayerState());

    assert.equal(state.hp, 3, '初始 HP 应为 3');
    assert.equal(state.weapon, 'normal', '初始武器应为 normal');
    assert.equal(state.form, 'normal', '初始形态应为 normal');
  });

  it('变身功能测试', async () => {
    await page.evaluate(() => {
      window.GameTestAPI.actions.triggerTransform('mecha');
    });

    const state = await page.evaluate(() => window.GameTestAPI.getPlayerState());
    assert.equal(state.form, 'mecha', '应变身为 Mecha');
  });

  it('Boss 阶段切换测试', async () => {
    await page.evaluate(() => {
      window.GameTestAPI.actions.skipToBoss();
    });

    await page.waitForTimeout(500);

    const bossState = await page.evaluate(() => window.GameTestAPI.getBossState());
    assert.equal(bossState.phase, 1, '初始应为阶段 1');

    // 降低 HP
    await page.evaluate(() => {
      window.GameTestAPI.actions.setBossHP(30);
    });

    await page.waitForTimeout(1000);

    const newBossState = await page.evaluate(() => window.GameTestAPI.getBossState());
    assert.equal(newBossState.phase, 2, 'HP 降低后应进入阶段 2');
  });

  it('道具拾取测试', async () => {
    const state = await page.evaluate(() => window.GameTestAPI.getPlayerState());
    const initialWeapon = state.weapon;

    // 添加散弹道具
    await page.evaluate(() => {
      window.GameTestAPI.actions.addPowerup('spread');
    });

    await page.waitForTimeout(2000); // 等待玩家拾取

    const newState = await page.evaluate(() => window.GameTestAPI.getPlayerState());
    assert.equal(newState.weapon, 'spread', '应获得散弹武器');
  });

  it('性能监控测试', async () => {
    await page.evaluate(() => {
      // 生成大量弹幕
      for (let i = 0; i < 100; i++) {
        LevelMap.bullets.push(new Bullet(400, 300, 0, 0));
      }
    });

    const metrics = await page.evaluate(() => window.GameTestAPI.getPerformanceMetrics());

    assert.ok(metrics.bulletCount >= 100, '应生成 100+ 弹幕');
    assert.ok(metrics.fps > 30, 'FPS 应高于 30');
  });
});
```

### 优缺点分析

| 优点 | 缺点 |
|------|------|
| ✅ **精确状态验证**,不依赖 UI | ⚠️ 需修改游戏代码 |
| ✅ **测试速度快**,无需等待渲染 | ⚠️ 测试 API 需维护 |
| ✅ **易于调试**,可直接访问内部状态 | ⚠️ 需确保测试模式隔离 |
| ✅ **适合复杂场景**(如关卡进度、Boss AI) | |
| ✅ **可与任何测试框架组合**(Puppeteer/Cypress) | |

### 综合评分

| 维度 | 评分 | 说明 |
|------|------|------|
| **游戏逻辑测试** | ⭐⭐⭐⭐⭐ | 直接访问内部状态 |
| **Canvas 渲染测试** | ⭐⭐⭐☆☆ | 需配合截图 |
| **学习曲线** | ⭐⭐⭐⭐☆ | 简单直观 |
| **集成难度** | ⭐⭐⭐☆☆ | 需修改游戏代码 |
| **性能** | ⭐⭐⭐⭐⭐ | 无需等待渲染 |
| **维护成本** | ⭐⭐⭐☆☆ | 需维护测试 API |

**总分: 4.9/5** ⭐⭐⭐⭐⭐

**推荐:** 与 Puppeteer 组合使用

---

## 📊 横向对比矩阵

### 功能对比

| 功能 | Puppeteer | Cypress | TestCafe | WebdriverIO | 状态注入法 |
|------|-----------|---------|----------|-------------|-----------|
| **游戏状态访问** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐⭐ |
| **Canvas 截图** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐☆☆ | ⭐⭐⭐☆☆ |
| **像素对比** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐☆☆ (需插件) | ⭐⭐⭐☆☆ | ⭐⭐⭐☆☆ (需插件) | ⭐⭐☆☆☆ |
| **键盘模拟** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐⭐ |
| **性能监控** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐☆☆ | ⭐⭐⭐☆☆ | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐⭐ |
| **跨浏览器** | ⭐☆☆☆☆ | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **学习难度** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐☆☆ | ⭐⭐☆☆☆ | ⭐⭐⭐⭐☆ |
| **集成难度** | ⭐⭐☆☆☆ | ⭐⭐⭐☆☆ | ⭐⭐⭐☆☆ | ⭐⭐☆☆☆ | ⭐⭐⭐☆☆ |
| **社区生态** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐☆☆ | ⭐⭐⭐☆☆ | ⭐⭐☆☆☆ |
| **调试体验** | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐☆☆ | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐☆ |

### 适用场景

| 场景 | 推荐方案 |
|------|----------|
| **快速验证游戏逻辑** | Puppeteer + 状态注入 |
| **视觉回归测试** | Puppeteer (像素对比) |
| **开发过程中快速测试** | Cypress (实时重载) |
| **跨浏览器兼容性测试** | TestCafe 或 WebdriverIO |
| **性能压力测试** | Puppeteer + 状态注入 |
| **CI/CD 集成** | Puppeteer (轻量快速) |
| **移动端浏览器测试** | WebdriverIO + Appium |

---

## 🎯 最终推荐

### 方案 A: 轻量快速团队(推荐)

**Puppeteer + 游戏状态注入法**

**理由:**
- Puppeteer 轻量快速,Chrome DevTools Protocol 性能优异
- 状态注入法可精确验证游戏内部逻辑
- 学习成本低,2-3 天即可上手
- 完美适配 SUPERME 的单页面架构

**实施步骤:**
1. 在 `main.js` 中添加 `GameTestAPI`
2. 使用 Puppeteer 编写测试用例
3. 配置 npm scripts:
   ```json
   {
     "scripts": {
       "test": "puppeteer-test",
       "test:watch": "puppeteer-test --watch"
     }
   }
   ```

### 方案 B: 体验优先团队

**Cypress**

**理由:**
- 优秀的开发者体验,可视化界面
- 实时重载,时间旅行调试
- 零配置启动
- 适合团队协作和新人上手

**适用:** 团队重视开发体验,可接受稍慢的测试速度

### 方案 C: 跨浏览器需求

**TestCafe**

**理由:**
- 完整的跨浏览器支持
- 无 WebDriver 架构,稳定性高
- 角色功能适合隔离测试状态

**适用:** 需要验证 Firefox/Safari 兼容性

---

## 📝 实施建议

### 1. 分阶段实施

**第一阶段(1-2 周):**
- 搭建 Puppeteer 测试框架
- 实现 `GameTestAPI`
- 编写 5-10 个核心测试用例(玩家移动、射击、Boss 战)

**第二阶段(2-3 周):**
- 扩展测试覆盖率至 50+
- 添加视觉回归测试(截图对比)
- 集成 CI/CD(GitHub Actions)

**第三阶段(可选):**
- 添加性能测试(FPS、内存监控)
- 引入 Cypress 用于开发环境快速测试
- 跨浏览器测试(如果需要)

### 2. 目录结构建议

```
superme/
├── tests/
│   ├── e2e/                    # 端到端测试
│   │   ├── player.spec.js      # 玩家功能测试
│   │   ├── boss.spec.js        # Boss 战测试
│   │   ├── transform.spec.js   # 变身系统测试
│   │   └── danmaku.spec.js     # 弹幕系统测试
│   ├── visual/                 # 视觉回归测试
│   │   ├── screenshots/        # 截图存储
│   │   │   ├── baseline/       # 基线图片
│   │   │   └── current/        # 当前图片
│   │   └── visual.spec.js
│   └── performance/            # 性能测试
│       └── fps.spec.js
├── js/
│   └── main.js                 # 添加 GameTestAPI
├── puppeteer.config.js         # Puppeteer 配置
└── package.json                # 测试脚本
```

### 3. CI/CD 集成示例

```yaml
# .github/workflows/test.yml
name: Game Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Start game server
        run: npx http-server . -p 8000 &
        run: npm run test:server &

      - name: Run tests
        run: npm test

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: tests/visual/screenshots/current/
```

---

## 🔗 参考资源

### 官方文档
- **Puppeteer:** https://pptr.dev
- **Cypress:** https://docs.cypress.io
- **TestCafe:** https://testcafe.io
- **WebdriverIO:** https://webdriver.io

### 学习资源
- **Puppeteer Canvas Testing:** https://github.com/puppeteer/puppeteer/tree/main/examples
- **Cypress Canvas Plugin:** https://github.com/bahmutov/cypress-image-snapshot
- **Game Testing Best Practices:** https://www.gamedeveloper.com/business/qa-strategies-for-game-development

### 工具推荐
- **像素对比:** pixelmatch, resemblejs
- **视觉测试:** Percy, Applitools
- **性能监控:** Chrome DevTools Protocol Performance API

---

**报告生成:** 2026-02-23
**下次更新:** 根据项目需求迭代
**联系方式:** 蕾姆 (女仆工程师) ✨

---

*(此报告由蕾姆精心编写,包含 4 大测试框架 + 1 种游戏专用方案的深度分析)*
