// player.js

class Player extends Entity {
    constructor(x, y) {
        // Player is a 30x40 character, distinct color
        super(x, y, CONFIG.PLAYER.WIDTH, CONFIG.PLAYER.HEIGHT, CONFIG.FORMS.NORMAL);

        this.speed = CONFIG.PLAYER.BASE_SPEED;
        this.jumpForce = CONFIG.PLAYER.JUMP_FORCE;
        this.gravity = CONFIG.PLAYER.GRAVITY;

        this.onGround = false;
        this.hp = CONFIG.PLAYER.MAX_HP;

        // Triple jump state
        this.jumpCount = 0;
        this.maxJumps = CONFIG.PLAYER.MAX_JUMPS;
        this.jumpBtnWasPressed = false;

        // Powerups state
        this.weapon = 'normal'; // 'normal' or 'spread'

        this.bambooMode = false;
        this.bambooTimer = 0;
        this.bambooMaxTime = CONFIG.POWERUPS.BAMBOO.DURATION;

        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleMaxTime = CONFIG.POWERUPS.STAR.DURATION;

        this.shieldMode = false; // single hit protection

        this.speedMode = false;
        this.speedTimer = 0;
        this.speedMaxTime = CONFIG.POWERUPS.SPEED.DURATION;

        this.shootCooldown = 0;

        // Direction for shooting: 1 for right, -1 for left
        this.facing = 1;

        // Damage effect
        this.damageCooldown = 0;
    }

    update(dt, platforms, levelWidth) {
        // Apply statuses
        if (this.bambooMode) {
            this.bambooTimer -= dt;
            if (this.bambooTimer <= 0) this.bambooMode = false;
        }

        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) this.invincible = false;
        }

        if (this.speedMode) {
            this.speedTimer -= dt;
            if (this.speedTimer <= 0) {
                this.speedMode = false;
                this.speed = CONFIG.PLAYER.BASE_SPEED;
            } else {
                this.speed = CONFIG.POWERUPS.SPEED.BOOSTED_SPEED;
            }
        } else {
            this.speed = CONFIG.PLAYER.BASE_SPEED;
        }

        if (this.damageCooldown > 0) {
            this.damageCooldown -= dt;
        }

        if (this.shootCooldown > 0) {
            this.shootCooldown -= dt;
        }

        // Horizontal Movement
        if (Input.left) {
            this.vx = -this.speed;
            this.facing = -1;
        } else if (Input.right) {
            this.vx = this.speed;
            this.facing = 1;
        } else {
            this.vx = 0; // stop instantly for tight controls
        }

        // Apply Gravity or Bamboo Copter Flight
        if (this.bambooMode) {
            // Bamboo copter: free flight capability
            if (Input.up) this.vy = -this.speed;
            else if (Input.down) this.vy = this.speed;
            else this.vy = 0; // Hover
        } else {
            // Normal gravity
            this.vy += this.gravity * dt;
            // Terminal velocity
            if (this.vy > 800) this.vy = 800;

            if (Input.jump) {
                if (!this.jumpBtnWasPressed && this.jumpCount < this.maxJumps) {
                    this.vy = this.jumpForce;
                    this.onGround = false;
                    this.jumpCount++;
                    ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height, '#aaaaaa', 5); // jump dust
                }
                this.jumpBtnWasPressed = true;
            } else {
                this.jumpBtnWasPressed = false;
            }
        }

        // Move X and Check Collision
        this.x += this.vx * dt;
        this.checkCollisions(platforms, 'x');

        // Constrain to level bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > levelWidth) this.x = levelWidth - this.width;

        // Move Y and Check Collision
        this.y += this.vy * dt;
        this.onGround = false; // Reset before checking
        this.checkCollisions(platforms, 'y');

        // Prevent falling out of the top bounds
        if (this.y < 0) this.y = 0;
    }

    checkCollisions(platforms, axis) {
        for (let plat of platforms) {
            if (Physics.checkCollision(this, plat)) {
                if (axis === 'x') {
                    if (this.vx > 0) { // Moving right
                        this.x = plat.x - this.width;
                    } else if (this.vx < 0) { // Moving left
                        this.x = plat.x + plat.width;
                    }
                    this.vx = 0;
                } else if (axis === 'y') {
                    if (this.vy > 0) { // Falling down
                        this.y = plat.y - this.height;
                        this.onGround = true;
                        this.jumpCount = 0; // Reset triple jump
                    } else if (this.vy < 0) { // Jumping up affecting ceiling
                        this.y = plat.y + plat.height;
                    }
                    this.vy = 0;
                }
            }
        }
    }

    shoot(bullets) {
        if (this.shootCooldown > 0) return;

        const bulletSpeed = CONFIG.PLAYER.BULLET_SPEED;
        const startX = this.facing === 1 ? this.x + this.width : this.x - 10;
        const startY = this.y + this.height / 2 - 5;

        if (this.weapon === 'normal') {
            bullets.push(new Bullet(startX, startY, this.facing, 0, bulletSpeed, '#00ffff'));
            this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_NORMAL;
        } else if (this.weapon === 'rapid') {
            bullets.push(new Bullet(startX, startY, this.facing, 0, bulletSpeed + 200, '#cc00ff'));
            this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_RAPID;
        } else if (this.weapon === 'spread') {
            // Scatter shot: 3 bullets
            bullets.push(new Bullet(startX, startY, this.facing, 0, bulletSpeed, '#ff00ff'));
            bullets.push(new Bullet(startX, startY, this.facing, -0.2, bulletSpeed, '#ff00ff'));
            bullets.push(new Bullet(startX, startY, this.facing, 0.2, bulletSpeed, '#ff00ff'));

            this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_SPREAD;
        }
    }

    takeDamage() {
        if (this.invincible || this.damageCooldown > 0) return;

        if (this.shieldMode) {
            this.shieldMode = false; // consume shield
            this.damageCooldown = CONFIG.PLAYER.DAMAGE_COOLDOWN;
            ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#0000ff', 20);
            return;
        }

        this.hp--;
        this.damageCooldown = CONFIG.PLAYER.DAMAGE_COOLDOWN;

        ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#ff0000', 15);
        if (this.hp <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx, cameraX, cameraY) {
        if (this.damageCooldown > 0) {
            // Blink when damaged
            if (Math.floor(Date.now() / 100) % 2 === 0) return;
        }

        ctx.save();

        if (this.invincible) {
            // Flash random bright colors when invincible
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
            ctx.fillStyle = colors[Math.floor(Date.now() / 50) % colors.length];
            ctx.shadowBlur = 20;
            ctx.shadowColor = ctx.fillStyle;
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }

        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);

        // Draw eyes depending on facing direction
        ctx.fillStyle = 'black';
        ctx.shadowBlur = 0;
        let eyeOffsetX = this.facing === 1 ? 20 : 5;
        ctx.fillRect(this.x - cameraX + eyeOffsetX, this.y - cameraY + 10, 5, 5);

        // Draw Bamboo Copter
        if (this.bambooMode) {
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(this.x - cameraX + 10, this.y - cameraY - 10, 10, 10); // stick

            // Spinning blade
            ctx.save();
            ctx.translate(this.x - cameraX + 15, this.y - cameraY - 10);
            ctx.rotate(Date.now() / 50);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(-15, -2, 30, 4);
            ctx.restore();
        }

        // Draw Shield Halo
        if (this.shieldMode) {
            ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#0000ff';
            ctx.strokeRect(this.x - cameraX - 4, this.y - cameraY - 4, this.width + 8, this.height + 8);
        }

        ctx.restore();
    }
}
