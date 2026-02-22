// powerup.js

class PowerUp extends Entity {
    // Types: 'spread', 'bamboo', 'star', 'shield', 'speed', 'rapid',
    //        'transform_mecha', 'transform_dragon', 'transform_phantom'
    constructor(x, y, type) {
        let color = '#ffff00';
        if (type === 'spread') color = '#00ffcc';
        if (type === 'bamboo') color = '#00ff00';
        if (type === 'shield') color = '#0000ff';
        if (type === 'speed') color = '#ff8800';
        if (type === 'rapid') color = '#cc00ff';
        if (type === 'transform_mecha') color = '#cccccc';
        if (type === 'transform_dragon') color = '#ff6600';
        if (type === 'transform_phantom') color = '#aa00ff';

        super(x, y, 20, 20, color);
        this.type = type;
        this.originalY = y;
        this.bobTimer = 0;
        this.vy = 200;
        this.vx = 0;
    }

    update(dt, platforms) {
        // Simple gravity and collision for powerups
        this.vy += 600 * dt; // gravity
        if (this.vy > 400) this.vy = 400; // block fall speed

        this.y += this.vy * dt;

        // Platform collision
        let onGround = false;
        if (platforms) {
            for (let plat of platforms) {
                if (Physics.checkCollision(this, plat)) {
                    if (this.vy > 0 && this.y + this.height - this.vy * dt <= plat.y) {
                        this.y = plat.y - this.height;
                        this.vy = 0;
                        onGround = true;
                    }
                }
            }
        }

        // Bob up and down when on ground
        if (onGround) {
            this.bobTimer += dt * 5;
            this.y += Math.sin(this.bobTimer) * 0.5;
        }
    }

    draw(ctx, cameraX, cameraY) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        // Pulsing scale effect
        let scale = 1 + Math.sin(Date.now() / 200) * 0.1;

        ctx.translate(this.x - cameraX + this.width / 2, this.y - cameraY + this.height / 2);
        ctx.scale(scale, scale);

        ctx.fillStyle = this.color;
        // diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(-this.width / 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
