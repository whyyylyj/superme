// enemy.js

class Enemy extends Entity {
    constructor(x, y, type = 'patrol') {
        super(x, y, 30, 30, '#ff3333');
        this.type = type;
        this.vx = 100; // Patrol speed
        this.facing = 1;
        this.hp = 2; // Takes 2 hits to kill
        this.gravity = 1500;
        this.patrolDist = 150;
        this.startX = x;
    }

    update(dt, platforms) {
        // Simple patrol AI
        if (this.x > this.startX + this.patrolDist) {
            this.vx = -100;
            this.facing = -1;
        } else if (this.x < this.startX - this.patrolDist) {
            this.vx = 100;
            this.facing = 1;
        }

        // Apply Gravity
        this.vy += this.gravity * dt;

        // Move X
        this.x += this.vx * dt;

        // Move Y
        this.y += this.vy * dt;

        // basic platform collision avoiding falling off
        let onGround = false;
        for (let plat of platforms) {
            if (Physics.checkCollision(this, plat)) {
                // simple y collision
                if (this.vy > 0 && this.y + this.height - this.vy * dt <= plat.y) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    onGround = true;
                }
            }
        }

        // simple edge detection (optional) turns enemy around if edge detected
        if (onGround) {
            let edge = true;
            for (let plat of platforms) {
                // check point slightly ahead and down
                let checkX = this.facing === 1 ? this.x + this.width + 5 : this.x - 5;
                if (checkX >= plat.x && checkX <= plat.x + plat.width &&
                    this.y + this.height + 5 >= plat.y && this.y + this.height + 5 <= plat.y + plat.height) {
                    edge = false;
                    break;
                }
            }
            if (edge) {
                this.vx *= -1;
                this.facing *= -1;
            }
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#ffffff', 5);
        if (this.hp <= 0) {
            this.markedForDeletion = true;
            ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, this.color, 20);
        }
    }

    draw(ctx, cameraX, cameraY) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);

        // Angry eyes
        ctx.fillStyle = 'black';
        ctx.shadowBlur = 0;
        let eyeOffsetX = this.facing === 1 ? 15 : 5;

        ctx.beginPath();
        // Slanted eyes
        if (this.facing === 1) {
            ctx.moveTo(this.x - cameraX + eyeOffsetX, this.y - cameraY + 5);
            ctx.lineTo(this.x - cameraX + eyeOffsetX + 10, this.y - cameraY + 10);
            ctx.lineTo(this.x - cameraX + eyeOffsetX, this.y - cameraY + 10);
        } else {
            ctx.moveTo(this.x - cameraX + eyeOffsetX + 10, this.y - cameraY + 5);
            ctx.lineTo(this.x - cameraX + eyeOffsetX + 10, this.y - cameraY + 10);
            ctx.lineTo(this.x - cameraX + eyeOffsetX, this.y - cameraY + 10);
        }
        ctx.fill();

        ctx.restore();
    }
}
