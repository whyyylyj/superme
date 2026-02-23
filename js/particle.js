// particle.js

class Particle extends Entity {
    constructor(x, y, dx, dy, size, color, lifeSpan) {
        super(x, y, size, size, color);
        this.vx = dx;
        this.vy = dy;
        this.life = lifeSpan;
        this.maxLife = lifeSpan;
        this.friction = 0.98;
        this.gravity = 0; // standard particles float slightly or fall, determined per effect
    }

    update(dt) {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;

        super.update(dt);
        this.life -= dt * 60; // 60fps base rate

        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx, cameraX, cameraY) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        // glowing effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - cameraX + this.width / 2, this.y - cameraY + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Particle system manager
const ParticleSystem = {
    particles: [],

    createExplosion: function (x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const size = Math.random() * 4 + 2;
            const life = Math.random() * 30 + 20;
            const p = new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, size, color, life);
            p.gravity = 0.1;
            this.particles.push(p);
        }
    },

    createFirework: function (x, y) {
        const colors = ['#ff00ff', '#00ffcc', '#ffff00', '#ff3333', '#ffffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.createExplosion(x, y, color, 50);
    },

    update: function (dt) {
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => !p.markedForDeletion);
    },

    draw: function (ctx, cameraX, cameraY) {
        this.particles.forEach(p => p.draw(ctx, cameraX, cameraY));
    }
};
