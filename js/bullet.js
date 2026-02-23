// bullet.js

class Bullet extends Entity {
    constructor(x, y, dx, dy, speed, color = '#ff00ff', friendly = true, shape = 'circle', damage = 1) {
        super(x, y, 10, 10, color);
        this.vx = dx * speed;
        this.vy = dy * speed;
        this.friendly = friendly;
        this.damage = damage;
        this.shape = shape;
        this.life = 120;

        this.active = true;
        this.homing = false;
        this.homingStrength = 0;
        this.homingTarget = null;
    }

    update(dt) {
        if (this.homing && this.homingTarget && !this.homingTarget.markedForDeletion) {
            const tx = this.homingTarget.x + this.homingTarget.width / 2;
            const ty = this.homingTarget.y + this.homingTarget.height / 2;
            const bx = this.x + this.width / 2;
            const by = this.y + this.height / 2;

            const angle = Math.atan2(ty - by, tx - bx);
            const currentAngle = Math.atan2(this.vy, this.vx);
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

            let diff = angle - currentAngle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            const turnRate = this.homingStrength * dt;
            const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnRate);

            this.vx = Math.cos(newAngle) * speed;
            this.vy = Math.sin(newAngle) * speed;
        }

        super.update(dt);
        this.life -= dt * 60;

        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        if (screenX < -50 || screenX > CONFIG.CANVAS_WIDTH + 50 ||
            screenY < -50 || screenY > CONFIG.CANVAS_HEIGHT + 50) {
            return;
        }

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        const centerX = this.x - cameraX + this.width / 2;
        const centerY = this.y - cameraY + this.height / 2;
        const radius = this.width / 2;

        if (this.shape === 'star') {
            const spikes = 5;
            const outerRadius = radius * 1.5;
            const innerRadius = radius * 0.7;
            let rot = Math.PI / 2 * 3;
            let x = centerX;
            let y = centerY;
            const step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = centerX + Math.cos(rot) * outerRadius;
                y = centerY + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = centerX + Math.cos(rot) * innerRadius;
                y = centerY + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(centerX, centerY - outerRadius);
            ctx.closePath();
            ctx.fill();
        } else if (this.shape === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - radius * 1.5);
            ctx.lineTo(centerX + radius * 1.5, centerY);
            ctx.lineTo(centerX, centerY + radius * 1.5);
            ctx.lineTo(centerX - radius * 1.5, centerY);
            ctx.closePath();
            ctx.fill();
        } else {
            // Default circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.homing) {
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(
                this.x - cameraX + this.width / 2 - this.vx * 0.02,
                this.y - cameraY + this.height / 2 - this.vy * 0.02,
                this.width / 2 * 0.7, 0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }
}
