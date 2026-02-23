// boss.js

class Boss extends Entity {
    constructor(x, y) {
        super(x, y, 100, 100, '#ff0000');
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.state = 'idle'; // idle, moving, attacking
        this.stateTimer = 0;
        this.gravity = 1500;
        this.vx = 0;
        this.vy = 0;

        // Attack pattern
        this.attackCooldown = 0;
        this.phase = 1;

        // Visual
        this.glowPower = 0;
    }

    update(dt, player, bullets, platforms) {
        // Phase transition
        if (this.hp < this.maxHp * 0.5 && this.phase === 1) {
            this.phase = 2;
            this.color = '#ffaa00';
            ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, this.color, 30);
        }

        this.stateTimer -= dt;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        // Simple AI Logic
        if (this.stateTimer <= 0) {
            this.chooseNextState();
        }

        switch (this.state) {
            case 'idle':
                this.vx = 0;
                this.glowPower = Math.sin(Date.now() / 200) * 10;
                break;
            case 'moving':
                // Move towards player slowly
                if (player.x < this.x) {
                    this.vx = -100 - (this.phase === 2 ? 50 : 0);
                } else {
                    this.vx = 100 + (this.phase === 2 ? 50 : 0);
                }
                this.glowPower = 5;
                break;
            case 'attacking':
                this.vx = 0;
                this.glowPower = 20;
                if (this.attackCooldown <= 0) {
                    this.shootPattern(player, bullets);
                    this.attackCooldown = this.phase === 2 ? 0.8 : 1.5;
                }
                break;
        }

        // Apply Gravity
        this.vy += this.gravity * dt;

        // Move and Collide
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Basic platform collision
        for (let plat of platforms) {
            if (Physics.checkCollision(this, plat)) {
                if (this.vy > 0 && this.y + this.height - this.vy * dt <= plat.y) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                }
            }
        }
    }

    chooseNextState() {
        const r = Math.random();
        if (r < 0.3) {
            this.state = 'idle';
            this.stateTimer = 1;
        } else if (r < 0.6) {
            this.state = 'moving';
            this.stateTimer = 2;
        } else {
            this.state = 'attacking';
            this.stateTimer = 3;
        }
    }

    shootPattern(player, bullets) {
        // Calculate angle to player
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;

        const angle = Math.atan2(py - cy, px - cx);

        if (this.phase === 1) {
            // Shoot single big fireball
            bullets.push(new Bullet(cx, cy, Math.cos(angle), Math.sin(angle), 400, '#ff5500', false));
        } else {
            // Shoot 3 spread fireballs
            bullets.push(new Bullet(cx, cy, Math.cos(angle - 0.2), Math.sin(angle - 0.2), 450, '#ffaa00', false));
            bullets.push(new Bullet(cx, cy, Math.cos(angle), Math.sin(angle), 450, '#ffaa00', false));
            bullets.push(new Bullet(cx, cy, Math.cos(angle + 0.2), Math.sin(angle + 0.2), 450, '#ffaa00', false));
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        ParticleSystem.createExplosion(this.x + Math.random() * this.width, this.y + Math.random() * this.height, '#ffffff', 5);
        if (this.hp <= 0 && !this.markedForDeletion) {
            this.hp = 0;
            this.markedForDeletion = true;
            // Massive death explosion
            ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#ff0000', 100);
            ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#ffaa00', 80);
        }
    }

    draw(ctx, cameraX, cameraY) {
        ctx.save();
        ctx.fillStyle = this.color;

        ctx.shadowBlur = 20 + this.glowPower;
        ctx.shadowColor = this.color;

        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);

        // Face
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;

        // Evil eyes
        ctx.beginPath();
        const ex1 = this.x - cameraX + 20;
        const ey1 = this.y - cameraY + 30;
        ctx.moveTo(ex1, ey1);
        ctx.lineTo(ex1 + 20, ey1 + 10);
        ctx.lineTo(ex1, ey1 + 10);

        const ex2 = this.x - cameraX + 60;
        ctx.moveTo(ex2 + 20, ey1);
        ctx.lineTo(ex2 + 20, ey1 + 10);
        ctx.lineTo(ex2, ey1 + 10);
        ctx.fill();

        // Mouth (teeth)
        const mx = this.x - cameraX + 30;
        const my = this.y - cameraY + 70;
        ctx.fillRect(mx, my, 40, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mx + 5, my, 5, 10);
        ctx.fillRect(mx + 15, my, 5, 10);
        ctx.fillRect(mx + 25, my, 5, 10);

        ctx.restore();
    }
}
