// main.js

const canvas = document.getElementById('gameCanvas');
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

// Game State
let gameState = 'start'; // start, play, gameover, win
let lastTime = 0;
let animationId;

// Game Entities
let player;
let bullets = [];
let cameraX = 0;
let cameraY = 0;

function initGame() {
    // 重置系统
    GameStateMachine.reset();
    LevelManager.reset();

    // 创建游戏实体
    player = new Player(100, 300);
    bullets = [];
    ParticleSystem.particles = [];
    cameraX = 0;
    cameraY = 0;

    // 注册关卡（仅首次）
    if (LevelManager.levels.length === 0) {
        LevelManager.registerLevel(new Level1Forest());
        // 后续任务会添加更多关卡
        // LevelManager.registerLevel(new Level2Nether());
        // LevelManager.registerLevel(new Level3Sky());
    }

    // 开始游戏
    LevelManager.startGame();
    GameStateMachine.changeState('playing');

    // UI 更新
    uiStartScreen.classList.add('hidden');
    uiGameOverScreen.classList.add('hidden');
    uiWinScreen.classList.add('hidden');
    uiStartScreen.classList.remove('active');
    uiGameOverScreen.classList.remove('active');
    uiWinScreen.classList.remove('active');

    uiHUD.classList.remove('hidden');
    uiBossHud.classList.add('hidden');

    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    gameLoop(lastTime);
}

function updateHUD() {
    uiHp.innerText = Math.max(0, player.hp);
    let wpnStr = 'Normal';
    if (player.weapon === 'spread') wpnStr = 'Scatter';
    if (player.weapon === 'rapid') wpnStr = 'Rapid';
    uiWpn.innerText = wpnStr;

    let pwText = '';
    if (player.bambooMode) pwText += 'BAMBOO ';
    if (player.invincible) pwText += 'INVINCIBLE ';
    if (player.shieldMode) pwText += 'SHIELD ';
    if (player.speedMode) pwText += 'SPEED ';
    uiPowerup.innerText = pwText;

    // Update Boss HUD if boss is active
    if (LevelMap.boss && !LevelMap.boss.markedForDeletion && player.x > LevelMap.boss.x - 800) {
        uiBossHud.classList.remove('hidden');
        const hpPercent = (LevelMap.boss.hp / LevelMap.boss.maxHp) * 100;
        uiBossHpBar.style.width = Math.max(0, hpPercent) + '%';
        if (hpPercent < 50) {
            uiBossHpBar.style.background = 'linear-gradient(90deg, #ffaa00, #ffff00)';
            uiBossHpBar.style.boxShadow = '0 0 10px #ffaa00';
        }
    } else {
        uiBossHud.classList.add('hidden');
    }
}

function checkPowerupCollisions() {
    LevelMap.powerups.forEach((pu, index) => {
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
            }
            pu.markedForDeletion = true;
        }
    });

    // Cleanup powerups
    LevelMap.powerups = LevelMap.powerups.filter(pu => !pu.markedForDeletion);
}

function checkEnemyCollisions() {
    // Enemies touching player
    LevelMap.enemies.forEach(enemy => {
        if (!enemy.markedForDeletion && Physics.checkCollision(player, enemy)) {
            player.takeDamage();
        }
    });

    // Boss touching player
    if (LevelMap.boss && !LevelMap.boss.markedForDeletion && Physics.checkCollision(player, LevelMap.boss)) {
        player.takeDamage();
    }

    // Player falling into abyss
    if (player.y > canvas.height + 200) {
        player.hp = 0;
        player.markedForDeletion = true;
    }

    // Bullets vs enemies/player
    bullets.forEach(b => {
        if (b.markedForDeletion) return;

        if (b.friendly) {
            // Check enemies
            LevelMap.enemies.forEach(enemy => {
                if (!enemy.markedForDeletion && Physics.checkCollision(b, enemy)) {
                    enemy.takeDamage(b.damage);
                    b.markedForDeletion = true;
                }
            });

            // Check boss
            if (LevelMap.boss && !LevelMap.boss.markedForDeletion && Physics.checkCollision(b, LevelMap.boss)) {
                LevelMap.boss.takeDamage(b.damage);
                b.markedForDeletion = true;
            }
        } else {
            // Boss bullets hitting player
            if (Physics.checkCollision(b, player)) {
                player.takeDamage();
                b.markedForDeletion = true;
            }
        }

        // Check platform collisions for bullets
        LevelMap.platforms.forEach(plat => {
            if (Physics.checkCollision(b, plat)) {
                b.markedForDeletion = true;
                ParticleSystem.createExplosion(b.x, b.y, b.color, 3);
            }
        });
    });
}

function update(dt) {
    if (gameState !== 'play' && gameState !== 'win') return;

    if (Input.shoot && gameState === 'play') {
        player.shoot(bullets);
    }

    if (gameState === 'play') {
        player.update(dt, LevelMap.platforms, LevelMap.width);

        if (player.hp <= 0) {
            gameState = 'gameover';
            uiGameOverScreen.classList.remove('hidden');
            uiGameOverScreen.classList.add('active');
            uiHUD.classList.add('hidden');
        }
    }

    // Smooth Camera Follow
    const targetCamX = player.x - canvas.width / 2 + player.width / 2;
    // Don't scroll past left/right edges
    cameraX += (Math.max(0, Math.min(targetCamX, LevelMap.width - canvas.width)) - cameraX) * 5 * dt;

    // Entities
    LevelMap.enemies.forEach(e => e.update(dt, LevelMap.platforms));
    LevelMap.enemies = LevelMap.enemies.filter(e => !e.markedForDeletion);

    LevelMap.powerups.forEach(p => p.update(dt, LevelMap.platforms));

    if (LevelMap.boss && !LevelMap.boss.markedForDeletion) {
        LevelMap.boss.update(dt, player, bullets, LevelMap.platforms);
    } else if (LevelMap.boss && LevelMap.boss.markedForDeletion && gameState === 'play') {
        // Boss killed -> Win condition
        gameState = 'win';
        uiWinScreen.classList.remove('hidden');
        uiWinScreen.classList.add('active');
        uiHUD.classList.add('hidden');
        uiBossHud.classList.add('hidden');
    }

    bullets.forEach(b => b.update(dt));
    bullets = bullets.filter(b => !b.markedForDeletion);

    ParticleSystem.update(dt);

    if (gameState === 'play') {
        checkPowerupCollisions();
        checkEnemyCollisions();
    }

    updateHUD();

    // Spawn win fireworks
    if (gameState === 'win' && Math.random() < 0.1) {
        ParticleSystem.createFirework(
            cameraX + Math.random() * canvas.width,
            cameraY + Math.random() * canvas.height * 0.5
        );
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    LevelMap.drawBackground(ctx, cameraX, cameraY, canvas);

    LevelMap.platforms.forEach(p => p.draw(ctx, cameraX, cameraY));
    LevelMap.powerups.forEach(p => p.draw(ctx, cameraX, cameraY));

    if (gameState === 'play' || gameState === 'win') {
        if (!player.markedForDeletion) player.draw(ctx, cameraX, cameraY);
    }

    LevelMap.enemies.forEach(e => e.draw(ctx, cameraX, cameraY));
    if (LevelMap.boss && !LevelMap.boss.markedForDeletion) {
        LevelMap.boss.draw(ctx, cameraX, cameraY);
    }

    bullets.forEach(b => b.draw(ctx, cameraX, cameraY));
    ParticleSystem.draw(ctx, cameraX, cameraY);
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

// Initial draw for background
LevelMap.drawBackground(ctx, 0, 0, canvas);

// Event Listeners
btnStart.addEventListener('click', initGame);
btnRestart.addEventListener('click', initGame);
btnPlayAgain.addEventListener('click', initGame);
