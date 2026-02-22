// player.js

class Player extends Entity {
    constructor(x, y) {
        super(x, y, CONFIG.PLAYER.WIDTH, CONFIG.PLAYER.HEIGHT, CONFIG.FORMS.NORMAL);

        // 🔧 P1修复：TransformSystem.init() 由 initGame() 统一调用，此处不重复初始化
        // 确保 TransformSystem 已经就绪
        if (!TransformSystem.currentForm) {
            TransformSystem.init();
        }

        this.speed = CONFIG.PLAYER.BASE_SPEED;
        this.jumpForce = CONFIG.PLAYER.JUMP_FORCE;
        this.gravity = CONFIG.PLAYER.GRAVITY;

        this.onGround = false;
        this.hp = CONFIG.PLAYER.MAX_HP;

        this.jumpCount = 0;
        this.maxJumps = CONFIG.PLAYER.MAX_JUMPS;
        this.jumpBtnWasPressed = false;

        this.weapon = 'normal';

        this.bambooMode = false;
        this.bambooTimer = 0;
        this.bambooMaxTime = CONFIG.POWERUPS.BAMBOO.DURATION;

        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleMaxTime = CONFIG.POWERUPS.STAR.DURATION;

        this.shieldMode = false;

        this.speedMode = false;
        this.speedTimer = 0;
        this.speedMaxTime = CONFIG.POWERUPS.SPEED.DURATION;

        this.shootCooldown = 0;

        this.facing = 1;

        this.damageCooldown = 0;
    }

    update(dt, platforms, levelWidth) {
        TransformSystem.update(dt, this);

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
            this.speed = TransformSystem.getSpeed();
        }

        if (this.damageCooldown > 0) {
            this.damageCooldown -= dt;
        }

        if (this.shootCooldown > 0) {
            this.shootCooldown -= dt;
        }

        if (Input.left) {
            this.vx = -this.speed;
            this.facing = -1;
        } else if (Input.right) {
            this.vx = this.speed;
            this.facing = 1;
        } else {
            this.vx = 0;
        }

        if (TransformSystem.canFly()) {
            if (Input.up) this.vy = -this.speed;
            else if (Input.down) this.vy = this.speed;
            else this.vy = 0;
        } else if (this.bambooMode) {
            if (Input.up) this.vy = -this.speed;
            else if (Input.down) this.vy = this.speed;
            else this.vy = 0;
        } else {
            this.vy += this.gravity * dt;
            if (this.vy > 800) this.vy = 800;

            if (Input.jump) {
                // 🔧 P2修复：此 else 分支已保证非飞行态，无需再判断 canFly()
                const maxJumps = this.bambooMode
                    ? this.maxJumps
                    : (TransformSystem.currentForm?.maxJumps || this.maxJumps);
                if (!this.jumpBtnWasPressed && this.jumpCount < maxJumps) {
                    this.vy = this.jumpForce;
                    this.onGround = false;
                    this.jumpCount++;
                    ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height, '#aaaaaa', 5);
                }
                this.jumpBtnWasPressed = true;
            } else {
                this.jumpBtnWasPressed = false;
            }
        }

        this.x += this.vx * dt;
        if (!TransformSystem.canPassThrough()) {
            this.checkCollisions(platforms, 'x');
        }

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > levelWidth) this.x = levelWidth - this.width;

        this.y += this.vy * dt;
        this.onGround = false;
        if (!TransformSystem.canPassThrough()) {
            this.checkCollisions(platforms, 'y');
        }

        if (this.y < 0) this.y = 0;
    }

    checkCollisions(platforms, axis) {
        for (let plat of platforms) {
            if (Physics.checkCollision(this, plat)) {
                if (axis === 'x') {
                    if (this.vx > 0) {
                        this.x = plat.x - this.width;
                    } else if (this.vx < 0) {
                        this.x = plat.x + plat.width;
                    }
                    this.vx = 0;
                } else if (axis === 'y') {
                    if (this.vy > 0) {
                        this.y = plat.y - this.height;
                        this.onGround = true;
                        this.jumpCount = 0;
                    } else if (this.vy < 0) {
                        this.y = plat.y + plat.height;
                    }
                    this.vy = 0;
                }
            }
        }
    }

    shoot(bullets) {
        if (this.shootCooldown > 0) return;
        TransformSystem.shoot(this, bullets);
    }

    takeDamage() {
        const dmgMult = TransformSystem.getDamageMultiplier();
        if (dmgMult === 0) return;

        if (this.invincible || this.damageCooldown > 0) return;

        if (this.shieldMode) {
            this.shieldMode = false;
            this.damageCooldown = CONFIG.PLAYER.DAMAGE_COOLDOWN;
            ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#0000ff', 20);
            return;
        }

        const damage = Math.ceil(1 * dmgMult);
        this.hp -= damage;
        this.damageCooldown = CONFIG.PLAYER.DAMAGE_COOLDOWN;

        ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#ff0000', 15);
        if (this.hp <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx, cameraX, cameraY) {
        if (this.damageCooldown > 0) {
            if (Math.floor(Date.now() / 100) % 2 === 0) return;
        }

        ctx.save();

        if (this.invincible) {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
            ctx.fillStyle = colors[Math.floor(Date.now() / 50) % colors.length];
            ctx.shadowBlur = 20;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
        } else {
            TransformSystem.draw(ctx, this, cameraX, cameraY);
        }

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
