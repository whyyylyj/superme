// ============================================
// 测试钩子 (Test Hooks for Playwright E2E)
// 在全局作用域暴露函数
// ============================================

// 标记 Canvas 就绪
const canvas = document.getElementById('gameCanvas');
if (canvas) {
    canvas.dataset.ready = "0";  // 初始未就绪
}

// 主程序
document.addEventListener('DOMContentLoaded', () => {
    // main.js

    // canvas 已在全局作用域声明
    const ctx = canvas.getContext('2d');

    // UI Elements
    const uiHUD = document.getElementById('hud');
    const uiHp = document.getElementById('hp-val');
    const uiWpn = document.getElementById('wpn-val');
    const uiPowerup = document.getElementById('powerup-val');

    const uiStartScreen = document.getElementById('start-screen');
    const uiGameOverScreen = document.getElementById('game-over-screen');
    const uiWinScreen = document.getElementById('win-screen');

    const uiBossHud = document.getElementById('boss-hud');
    const uiBossHpBar = document.getElementById('boss-hp-bar');

    const btnStart = document.getElementById('start-btn');
    const btnRestart = document.getElementById('restart-btn');
    const btnPlayAgain = document.getElementById('play-again-btn');

    const uiPauseScreen = document.getElementById('pause-screen');
    const btnResume = document.getElementById('resume-btn');
    const btnMute = document.getElementById('mute-btn');
    const btnQuit = document.getElementById('quit-btn');

    // New UI: Help Modal & Level Select
    const uiHelpModal = document.getElementById('help-modal');
    const btnHelp = document.getElementById('help-btn');
    const btnHelpClose = document.getElementById('help-close-btn');

    const uiLevelSelectScreen = document.getElementById('level-select-screen');
    const btnLevelSelect = document.getElementById('level-select-btn');
    const btnLevelSelectBack = document.getElementById('level-select-back-btn');
    const levelCards = document.querySelectorAll('.level-card');

    // UI Message Helper
    function showLevelMessage(text, subtitle = 'PREPARE TO FIGHT', duration = 2500) {
        const msgOverlay = document.getElementById('level-message');
        const msgText = document.getElementById('level-message-text');
        const msgSub = document.getElementById('level-subtitle-text');

        if (!msgOverlay || !msgText || !msgSub) return;

        msgText.innerText = text;
        msgSub.innerText = subtitle;
        msgOverlay.classList.remove('hidden');
        msgOverlay.classList.add('active');

        // Force restart animation by cloning and replacing or just re-adding classes
        msgText.style.animation = 'none';
        msgSub.style.animation = 'none';
        msgText.offsetHeight; // trigger reflow
        msgText.style.animation = '';
        msgSub.style.animation = '';

        setTimeout(() => {
            msgOverlay.classList.add('hidden');
            msgOverlay.classList.remove('active');
        }, duration);
    }

    function pauseGame() {
        if (GameStateMachine.currentState === 'playing') {
            GameStateMachine.changeState('paused');
            uiPauseScreen.classList.remove('hidden');
            uiPauseScreen.classList.add('active');
        }
    }

    function resumeGame() {
        if (GameStateMachine.currentState === 'paused') {
            GameStateMachine.changeState('playing');
            uiPauseScreen.classList.add('hidden');
            uiPauseScreen.classList.remove('active');
        }
    }

    function quitToMenu() {
        GameStateMachine.changeState('start');
        uiPauseScreen.classList.add('hidden');
        uiPauseScreen.classList.remove('active');
        uiHUD.classList.add('hidden');
        uiStartScreen.classList.remove('hidden');
        uiStartScreen.classList.add('active');
    }

    // Game State
    let gameState = 'start'; // start, play, gameover, win
    let lastTime = 0;
    let animationId;

    // Game Entities
    let player;
    let bullets = [];
    let cameraX = 0;
    let cameraY = 0;

    function initGame(startLevelIndex = 0, isRetry = false) {
        if (!isRetry) {
            LevelManager.clearCheckpoint();
        }

        // 重置系统
        GameStateMachine.reset();
        LevelManager.reset();
        TransformSystem.init();   // 🔧 P1修复：统一在此处初始化/重置变身系统
        DanmakuEngine.init();

        // 创建游戏实体
        player = new Player(100, 300);
        window.player = player; // Expose to window for testing
        bullets = [];
        ParticleSystem.particles = [];
        cameraX = 0;
        cameraY = 0;

        // 注册关卡（仅首次）
        if (LevelManager.levels.length === 0) {
            LevelManager.registerLevel(new Level1Forest());
            LevelManager.registerLevel(new Level2Nether());
            LevelManager.registerLevel(new Level3Sky());
        }

        // 开始游戏（支持从指定关卡开始）
        const clampedIndex = Math.max(0, Math.min(startLevelIndex, LevelManager.levels.length - 1));
        LevelManager.currentLevelIndex = clampedIndex;
        LevelManager.loadCurrentLevel();
        GameStateMachine.changeState('playing');

        // ==== Checkpoint Logic ====
        if (isRetry && LevelManager.checkpoint && LevelManager.checkpoint.levelIndex === clampedIndex) {
            player.x = LevelManager.checkpoint.x;
            player.y = LevelManager.checkpoint.y;
            // Center the camera on the player
            const targetCamX = player.x - canvas.width / 2 + player.width / 2;
            cameraX = Math.max(0, Math.min(targetCamX, LevelManager.currentLevel.width - canvas.width));
        }

        // UI 更新
        uiStartScreen.classList.add('hidden');
        uiGameOverScreen.classList.add('hidden');
        uiWinScreen.classList.add('hidden');
        uiStartScreen.classList.remove('active');
        uiGameOverScreen.classList.remove('active');
        uiWinScreen.classList.remove('active');
        uiPauseScreen.classList.add('hidden');
        uiPauseScreen.classList.remove('active');
        uiLevelSelectScreen.classList.add('hidden');
        uiLevelSelectScreen.classList.remove('active');
        uiHelpModal.classList.add('hidden');
        uiHelpModal.classList.remove('active');

        uiHUD.classList.remove('hidden');
        uiBossHud.classList.add('hidden');

        // Show Level Start Message
        showLevelMessage(`STAGE ${LevelManager.currentLevelIndex + 1}`, 'PREPARE TO FIGHT');

        lastTime = performance.now();
        cancelAnimationFrame(animationId);
        gameLoop(lastTime);
    }

    function updateHUD() {
        try {
            // 更新关卡号
            const levelVal = document.getElementById('level-val');
            if (levelVal) {
                const levelNum = (LevelManager && LevelManager.currentLevelIndex !== undefined) ? LevelManager.currentLevelIndex + 1 : 1;
                levelVal.innerText = levelNum;
            }

            // 获取并检查所有 UI 元素
            const hpVal = document.getElementById('hp-val');
            const hpFill = document.getElementById('hp-bar-fill');
            const scoreVal = document.getElementById('score-val');
            const wpnVal = document.getElementById('wpn-val');
            const pwrVal = document.getElementById('powerup-val');

            if (!player) return;

            // 🔧 防御性编程：确保 hp 和 maxHp 都是有效数字
            const currentHp = Number(player.hp) || 0;
            const maxHp = Number(player.maxHp) || CONFIG.PLAYER.MAX_HP;

            if (hpVal) hpVal.innerText = Math.ceil(Math.max(0, currentHp));
            if (hpFill) {
                const hpPercent = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;
                hpFill.style.width = Math.max(0, hpPercent) + '%';

                // 低血量红闪
                if (hpPercent < 30) {
                    hpFill.style.animation = 'pulse 0.5s infinite';
                } else {
                    hpFill.style.animation = 'none';
                }
            }

            if (scoreVal) {
                scoreVal.innerText = player.score.toString().padStart(6, '0');
            }

            if (wpnVal) {
                let wpnStr = 'Normal';
                if (player.weapon === 'spread') wpnStr = 'Scatter';
                if (player.weapon === 'rapid') wpnStr = 'Rapid';
                if (player.weapon === 'fireball') wpnStr = 'Fire Ball';
                if (player.weapon === 'power_spread') wpnStr = 'Omega Spread';
                if (player.weapon === 'gold') wpnStr = 'Gold Bullet';
                wpnVal.innerText = wpnStr;
            }

            if (pwrVal) {
                let pwText = '';
                if (player.bambooMode) pwText += 'BAMBOO ';
                if (player.invincible) pwText += 'INVINCIBLE ';
                if (player.shieldMode) pwText += 'SHIELD ';
                if (player.speedMode) pwText += 'SPEED ';
                if (player.homingMode) pwText += 'HOMING ';
                if (player.isGiant) pwText += `GIANT (${Math.ceil(player.giantTimer)}s) `;

                // Add current transform form
                if (typeof TransformSystem !== 'undefined') {
                    const formName = TransformSystem.currentForm ? TransformSystem.currentForm.name : 'Normal';
                    const remainingTime = TransformSystem.getRemainingTime ? TransformSystem.getRemainingTime() : 0;
                    if (remainingTime > 0) {
                        pwText += `${formName} (${Math.ceil(remainingTime)}s)`;
                    } else if (formName !== 'Normal') {
                        pwText += formName;
                    }
                }
                pwrVal.innerText = pwText;
            }

            // Update Boss HUD if boss is active
            const uiBossHud = document.getElementById('boss-hud');
            const uiBossHpBar = document.getElementById('boss-hp-bar');
            const level = (LevelManager && LevelManager.currentLevel) ? LevelManager.currentLevel : null;

            if (uiBossHud && uiBossHpBar && level && level.boss && !level.boss.markedForDeletion && player.x > level.boss.x - 800) {
                uiBossHud.classList.remove('hidden');
                const hpPercent = (level.boss.hp / level.boss.maxHp) * 100;
                uiBossHpBar.style.width = Math.max(0, hpPercent) + '%';
                if (hpPercent < 50) {
                    uiBossHpBar.style.background = 'linear-gradient(90deg, #ffaa00, #ffff00)';
                    uiBossHpBar.style.boxShadow = '0 0 10px #ffaa00';
                }
            } else if (uiBossHud) {
                uiBossHud.classList.add('hidden');
            }
        } catch (e) {
            console.error('HUD Update Error:', e);
        }
    }

    function checkPowerupCollisions() {
        const level = LevelManager.currentLevel;
        if (!level) return;

        level.powerups.forEach((pu, index) => {
            if (!pu.markedForDeletion && Physics.checkCollision(player, pu)) {
                // Apply effect
                switch (pu.type) {
                    case 'spread':
                        player.weapon = 'spread';
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#00ffcc', 30);
                        break;
                    case 'rapid':
                        player.weapon = 'rapid';
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#cc00ff', 30);
                        break;
                    case 'bamboo':
                        player.bambooMode = true;
                        player.bambooTimer = player.bambooMaxTime;
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#00ff00', 30);
                        break;
                    case 'star':
                        player.invincible = true;
                        player.invincibleTimer = player.invincibleMaxTime;
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#ffff00', 50);
                        break;
                    case 'shield':
                        player.shieldMode = true;
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#0000ff', 50);
                        break;
                    case 'speed':
                        player.speedMode = true;
                        player.speedTimer = player.speedMaxTime;
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#ff8800', 50);
                        break;
                    case 'transform_mecha':
                        showLevelMessage('MECHA FORM', 'SHOTGUN UNLEASHED!', 2000);
                        TransformSystem.transform('Mecha', player);
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#cccccc', 40);
                        break;
                    case 'transform_dragon':
                        showLevelMessage('DRAGON FORM', 'FLIGHT & FIRE BREATH!', 2000);
                        TransformSystem.transform('Dragon', player);
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#ff6600', 50);
                        break;
                    case 'transform_phantom':
                        showLevelMessage('PHANTOM FORM', 'GHOST MODE ACTIVATED!', 2000);
                        TransformSystem.transform('Phantom', player);
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#aa00ff', 60);
                        break;
                    case 'heart_plus':
                        // 🔧 防御性编程：确保 hp 和 maxHp 都是有效数字
                        const currentMaxHp = Number(player.maxHp) || CONFIG.PLAYER.MAX_HP;
                        const currentHp = Number(player.hp) || 0;
                        const increment = Number(CONFIG.POWERUPS.HP_MAX_UP.INCREMENT) || 2;
                        const healAmount = Number(CONFIG.POWERUPS.HP_MAX_UP.HEAL) || 2;

                        player.maxHp = currentMaxHp + increment;
                        player.hp = Math.min(player.maxHp, currentHp + healAmount);
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#ff3333', 40);
                        break;
                    case 'health_pack':
                        // 仅回复 HP，不增加上限
                        const healAmt = Number(CONFIG.POWERUPS.HEALTH_PACK.HEAL) || 2;
                        const mHp = Number(player.maxHp) || CONFIG.PLAYER.MAX_HP;
                        const cHp = Number(player.hp) || 0;
                        player.hp = Math.min(mHp, cHp + healAmt);
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#ff0000', 40);
                        break;
                    case 'fire_flower':
                        player.weapon = 'fireball';
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#ff4400', 40);
                        break;
                    case 'power_spread':
                        player.weapon = 'power_spread';
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#ff00ff', 40);
                        break;
                    case 'gold_bullet':
                        player.weapon = 'gold';
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#ffd700', 40);
                        break;
                    case 'giant_mushroom':
                        player.isGiant = true;
                        player.giantTimer = player.giantMaxTime;
                        ParticleSystem.createExplosion(pu.x + pu.width / 2, pu.y + pu.height / 2, '#ffffff', 60);
                        break;
                }
                pu.markedForDeletion = true;
            }
        });

        // Cleanup powerups
        level.powerups = level.powerups.filter(pu => !pu.markedForDeletion);
    }

    function spawnDrop(x, y) {
        const level = LevelManager.currentLevel;
        if (!level) return;

        // 30% 掉落率
        if (Math.random() < 0.3) {
            let type;
            // 50% 掉落血包，50% 掉落其他道具
            if (Math.random() < 0.5) {
                type = 'health_pack';
            } else {
                const types = ['spread', 'rapid', 'star', 'shield', 'speed', 'bamboo', 'heart_plus'];
                type = types[Math.floor(Math.random() * types.length)];
            }

            const pu = new PowerUp(x, y, type);
            level.powerups.push(pu);
        }
    }

    function checkEnemyCollisions() {
        const level = LevelManager.currentLevel;
        if (!level) return;

        // Enemies touching player
        level.enemies.forEach(enemy => {
            if (!enemy.markedForDeletion && Physics.checkCollision(player, enemy)) {
                player.takeDamage(enemy.damage || 1);
            }
        });

        // Boss touching player
        if (level.boss && !level.boss.markedForDeletion && Physics.checkCollision(player, level.boss)) {
            player.takeDamage(level.boss.damage || 1);
        }

        // Player falling into abyss (generic fallback, individual levels may have their own check)
        if (player.y > 1200) {
            player.hp = 0;
            player.markedForDeletion = true;
        }

        // Bullets vs enemies/player
        bullets.forEach(b => {
            if (b.markedForDeletion) return;

            if (b.friendly) {
                // Check enemies
                level.enemies.forEach(enemy => {
                    if (!enemy.markedForDeletion && Physics.checkCollision(b, enemy)) {
                        enemy.takeDamage(b.damage);
                        if (enemy.markedForDeletion) {
                            player.addScore(enemy.score || 100);
                            spawnDrop(enemy.x, enemy.y);
                        }
                        b.markedForDeletion = true;
                    }
                });

                // Check boss
                if (level.boss && !level.boss.markedForDeletion && Physics.checkCollision(b, level.boss)) {
                    level.boss.takeDamage(b.damage);
                    if (level.boss.markedForDeletion) {
                        player.addScore(level.boss.score || 1000);
                        spawnDrop(level.boss.x, level.boss.y);
                    }
                    b.markedForDeletion = true;
                }
            } else {
                // Boss bullets hitting player
                if (Physics.checkCollision(b, player)) {
                    player.takeDamage(b.damage || 1);
                    b.markedForDeletion = true;
                }
            }

            // Check platform collisions for bullets
            level.platforms.forEach(plat => {
                if (Physics.checkCollision(b, plat)) {
                    b.markedForDeletion = true;
                    ParticleSystem.createExplosion(b.x, b.y, b.color, 3);
                }
            });
        });
    }

    /**
     * 原有的游戏玩法逻辑
     * 提取为独立函数，便于状态机调用
     */
    function updateGameplay(dt) {
        // Transform with K/X key - cycle through forms
        if (Input.transform && !player.transformBtnWasPressed) {
            player.transformBtnWasPressed = true;
            // Cycle: Normal -> Mecha -> Dragon -> Phantom -> Normal
            const formOrder = ['Normal', 'Mecha', 'Dragon', 'Phantom'];
            const currentForm = TransformSystem.currentForm?.name || 'Normal';
            const currentIndex = formOrder.indexOf(currentForm);
            const nextIndex = (currentIndex + 1) % formOrder.length;
            const nextForm = formOrder[nextIndex];

            TransformSystem.transform(nextForm, player);

            // Visual feedback
            ParticleSystem.createExplosion(
                player.x + player.width / 2,
                player.y + player.height / 2,
                '#ffffff',
                20
            );

            // Show transform message
            showLevelMessage(`${nextForm.toUpperCase()} FORM`, 'TRANSFORM!', 1500);
        }
        if (!Input.transform) {
            player.transformBtnWasPressed = false;
        }

        // Toggle homing mode with M key
        if (Input.homing && !player.homingBtnWasPressed) {
            player.homingMode = !player.homingMode;
            player.homingBtnWasPressed = true;
            // Visual feedback for homing mode toggle
            ParticleSystem.createExplosion(
                player.x + player.width / 2,
                player.y + player.height / 2,
                player.homingMode ? '#00ff00' : '#ff0000',
                10
            );
        }
        if (!Input.homing) {
            player.homingBtnWasPressed = false;
        }

        if (Input.shoot) {
            player.shoot(bullets);
        }

        player.update(dt, LevelManager.currentLevel.platforms, LevelManager.currentLevel.width);

        // Smooth Camera Follow
        const targetCamX = player.x - canvas.width / 2 + player.width / 2;
        cameraX += (Math.max(0, Math.min(targetCamX, LevelManager.currentLevel.width - canvas.width)) - cameraX) * 5 * dt;

        // 更新关卡
        LevelManager.currentLevel.update(dt, player, bullets);

        // Assign homing targets for friendly homing bullets
        bullets.forEach(b => {
            if (b.homing && b.friendly && !b.homingTarget) {
                let nearest = null;
                let nearestDist = Infinity;

                const level = LevelManager.currentLevel;
                const enemies = level ? level.enemies : [];

                enemies.forEach(e => {
                    if (e.markedForDeletion) return;
                    const dist = Math.hypot(e.x - b.x, e.y - b.y);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearest = e;
                    }
                });

                if (level && level.boss && !level.boss.markedForDeletion) {
                    const dist = Math.hypot(level.boss.x - b.x, level.boss.y - b.y);
                    if (dist < nearestDist) {
                        nearest = level.boss;
                    }
                }

                b.homingTarget = nearest;
            }
        });

        // Update danmaku emitters
        DanmakuEngine.update(dt, bullets);

        // 更新子弹
        bullets.forEach(b => b.update(dt));
        bullets = bullets.filter(b => !b.markedForDeletion);

        // 更新粒子
        ParticleSystem.update(dt);

        // 碰撞检测
        checkPowerupCollisions();
        checkEnemyCollisions();

        updateHUD();
    }

    function update(dt) {
        const state = GameStateMachine.currentState;

        // Toggle Pause with Esc key
        if (Input.pause && !window.pauseBtnWasPressed) {
            if (state === 'playing') {
                pauseGame();
            } else if (state === 'paused') {
                resumeGame();
            }
            window.pauseBtnWasPressed = true;
        }
        if (!Input.pause) {
            window.pauseBtnWasPressed = false;
        }

        // Update Screen Effects
        ScreenEffects.update(dt);
        const scaledDt = ScreenEffects.getScaledDt(dt);

        switch (state) {
            case 'playing':
                updateGameplay(scaledDt);

                // 检查关卡完成
                if (LevelManager.currentLevel && LevelManager.currentLevel.isCompleted) {
                    const hasNext = LevelManager.nextLevel();
                    if (hasNext) {
                        showLevelMessage('MISSION CLEAR', 'STAGE COMPLETE!', 3000);
                        GameStateMachine.changeState('level_transition');
                    } else {
                        GameStateMachine.changeState('game_win');
                        uiWinScreen.classList.remove('hidden');
                        uiWinScreen.classList.add('active');
                        uiHUD.classList.add('hidden');
                    }
                }

                // 检查玩家死亡
                if (player.hp <= 0) {
                    GameStateMachine.changeState('game_over');
                    uiGameOverScreen.classList.remove('hidden');
                    uiGameOverScreen.classList.add('active');
                    uiHUD.classList.add('hidden');
                }
                break;

            case 'level_transition': {
                // 🔧 P1修复：加 {} 块作用域，避免 const 声明泄漏到 switch 作用域
                ParticleSystem.update(dt);
                const done = LevelManager.updateTransition(dt);
                if (done) {
                    // 重置玩家位置到新关卡起始点
                    // 🔧 防御性编程：确保 hp 和 maxHp 都是有效数字
                    const maxHp = Number(player.maxHp) || CONFIG.PLAYER.MAX_HP;
                    player.x = 100;
                    player.y = 300;
                    player.hp = maxHp;
                    bullets = [];

                    // 🔧 FIX: Reset camera position when starting a new level to prevent player disappearing off-screen
                    cameraX = 0;
                    cameraY = 0;

                    GameStateMachine.changeState('playing');

                    // Show Level Start Message for next level
                    showLevelMessage(`STAGE ${LevelManager.currentLevelIndex + 1}`, 'KEEP GOING!');
                }
                break;
            }

            case 'boss_intro':
                // Boss 登场演出（可选，暂时跳过）
                break;

            case 'game_over':
                // Game Over 界面（静态，无需更新）
                break;

            case 'game_win':
                // 胜利烟花
                if (Math.random() < 0.1) {
                    ParticleSystem.createFirework(
                        cameraX + Math.random() * canvas.width,
                        cameraY + Math.random() * canvas.height * 0.5
                    );
                }
                ParticleSystem.update(dt);
                updateHUD();
                break;

            case 'start':
            case 'paused':
                // 静态状态，无需更新
                break;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply Screen Shake
        ScreenEffects.applyPreDraw(ctx);

        const level = LevelManager.currentLevel;
        if (!level) return;

        level.drawBackground(ctx, cameraX, cameraY, canvas);
        level.platforms.forEach(p => p.draw(ctx, cameraX, cameraY));
        level.powerups.forEach(p => p.draw(ctx, cameraX, cameraY));

        if (GameStateMachine.is('playing') || GameStateMachine.is('game_win')) {
            if (!player.markedForDeletion) player.draw(ctx, cameraX, cameraY);
        }

        level.enemies.forEach(e => e.draw(ctx, cameraX, cameraY));
        if (level.boss && !level.boss.markedForDeletion) {
            level.boss.draw(ctx, cameraX, cameraY);
        }

        bullets.forEach(b => b.draw(ctx, cameraX, cameraY));
        ParticleSystem.draw(ctx, cameraX, cameraY);

        // 过渡动画叠加
        if (GameStateMachine.is('level_transition')) {
            LevelManager.drawTransition(ctx, canvas);
        }

        // Apply Screen Flash and Restore Shake
        ScreenEffects.applyPostDraw(ctx, canvas);
    }

    function gameLoop(timestamp) {
        // Calculate delta time
        let dt = (timestamp - lastTime) / 1000;
        if (dt > 0.1) dt = 0.1; // Cap delta time to prevent spiraling after long pauses
        lastTime = timestamp;

        update(dt);
        draw();

        animationId = requestAnimationFrame(gameLoop);
    }

    // Initial draw for background (fallback if no level loaded)
    const level = LevelManager.currentLevel;
    if (level) {
        level.drawBackground(ctx, 0, 0, canvas);
    } else {
        // 默认深色背景
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Event Listeners
    btnStart.addEventListener('click', () => initGame(0, false));
    btnRestart.addEventListener('click', () => {
        const currentLevel = LevelManager.currentLevelIndex;
        // 如果是从当前关卡重新开始，则判定为 Retry
        initGame(currentLevel >= 0 ? currentLevel : 0, true);
    });
    btnPlayAgain.addEventListener('click', () => initGame(0, false));

    // menu-btn: Main Menu from Game Over (no init, just reset state)
    const btnMenu = document.getElementById('menu-btn');
    if (btnMenu) {
        btnMenu.addEventListener('click', () => {
            GameStateMachine.changeState('start');
            uiGameOverScreen.classList.add('hidden');
            uiGameOverScreen.classList.remove('active');
            uiHUD.classList.add('hidden');
            uiStartScreen.classList.remove('hidden');
            uiStartScreen.classList.add('active');
        });
    }

    // Pause Menu Listeners
    btnResume.addEventListener('click', resumeGame);
    btnQuit.addEventListener('click', quitToMenu);
    btnMute.addEventListener('click', () => {
        const isMuted = AudioManager.toggleMute();
        btnMute.innerText = isMuted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON';
    });

    // Help Modal Listeners
    if (btnHelp) {
        btnHelp.addEventListener('click', () => {
            uiHelpModal.classList.remove('hidden');
            uiHelpModal.classList.add('active');
        });
    }
    if (btnHelpClose) {
        btnHelpClose.addEventListener('click', () => {
            uiHelpModal.classList.add('hidden');
            uiHelpModal.classList.remove('active');
        });
    }
    // Click backdrop to close help modal
    if (uiHelpModal) {
        uiHelpModal.addEventListener('click', (e) => {
            if (e.target === uiHelpModal) {
                uiHelpModal.classList.add('hidden');
                uiHelpModal.classList.remove('active');
            }
        });
    }

    // Level Select Listeners
    if (btnLevelSelect) {
        btnLevelSelect.addEventListener('click', () => {
            uiStartScreen.classList.add('hidden');
            uiStartScreen.classList.remove('active');
            uiLevelSelectScreen.classList.remove('hidden');
            uiLevelSelectScreen.classList.add('active');
        });
    }
    if (btnLevelSelectBack) {
        btnLevelSelectBack.addEventListener('click', () => {
            uiLevelSelectScreen.classList.add('hidden');
            uiLevelSelectScreen.classList.remove('active');
            uiStartScreen.classList.remove('hidden');
            uiStartScreen.classList.add('active');
        });
    }
    levelCards.forEach(card => {
        card.addEventListener('click', () => {
            const levelIndex = parseInt(card.dataset.level, 10);
            initGame(levelIndex, false);
        });
    });

    // ============================================
    // 测试钩子 (Test Hooks for Playwright E2E)
    // ============================================

    // 标记 Canvas 就绪
    canvas.dataset.ready = "0";  // 初始未就绪

    // 暴露游戏状态到 window 对象供测试使用
    window.player = null; // Placeholder
    window.getGameState = () => {
        window.player = player; // Update global reference
        return {
            gameState: GameStateMachine.currentState,  // 使用状态机的状态
            playerHp: player ? player.hp : 0,
            playerX: player ? player.x : 0,
            playerY: player ? player.y : 0,
            playerWeapon: player ? player.weapon : 'none',
            currentLevel: LevelManager ? LevelManager.currentLevelIndex : -1,
            bossExists: LevelManager && LevelManager.currentLevel && LevelManager.currentLevel.boss ? true : false,
            bossHp: (LevelManager && LevelManager.currentLevel && LevelManager.currentLevel.boss) ? LevelManager.currentLevel.boss.hp : 0,
            enemyCount: LevelManager && LevelManager.currentLevel ? LevelManager.currentLevel.enemies.length : 0,
            bulletCount: bullets ? bullets.length : 0,
            transformForm: typeof TransformSystem !== 'undefined' ? TransformSystem.currentForm?.name || 'Normal' : 'Normal',
            transformTimeRemaining: typeof TransformSystem !== 'undefined' ? (TransformSystem.getRemainingTime ? TransformSystem.getRemainingTime() : 0) : 0
        };
    };

    // 测试辅助函数：设置玩家状态
    window.setPlayerState = (state) => {
        if (!player) return;
        // 🔧 防御性编程：确保设置的值都是有效类型
        if (state.hp !== undefined) player.hp = Number(state.hp) || 0;
        if (state.x !== undefined) player.x = Number(state.x) || 0;
        if (state.y !== undefined) player.y = Number(state.y) || 0;
        if (state.weapon !== undefined) player.weapon = String(state.weapon);
    };

    // 测试辅助函数：跳过当前关卡
    window.skipLevel = () => {
        if (LevelManager && LevelManager.currentLevel) {
            LevelManager.currentLevel.isCompleted = true;
        }
    };

    // 测试辅助函数：直接击败 Boss
    window.defeatBoss = () => {
        if (LevelManager && LevelManager.currentLevel && LevelManager.currentLevel.boss) {
            LevelManager.currentLevel.boss.hp = 0;
        }
    };

    // 测试辅助函数：设置无敌模式
    window.setInvincible = (enabled) => {
        if (player) {
            player.invincible = enabled;
            player.invincibleMaxTime = enabled ? 9999 : 0;
        }
    };

    // 测试辅助函数：直接变身
    window.transformTo = (formName) => {
        if (typeof TransformSystem !== 'undefined') {
            TransformSystem.transform(formName, player);
        }
    };

    // 替换原始 initGame 为带钩子的版本
    const oldInitGame = initGame;
    initGame = function (startLevelIndex = 0) {
        oldInitGame(startLevelIndex);
        // 游戏开始运行后标记为就绪（给一点延迟确保渲染完成）
        setTimeout(() => {
            canvas.dataset.ready = "1";
            console.log('[Test Hook] Game ready, canvas.dataset.ready = "1"');
        }, 500);
    };
});
