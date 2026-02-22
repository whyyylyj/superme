// js/transform/form-dragon.js

class FormDragon {
    constructor() {
        this.name = 'Dragon';
        this.color = CONFIG.FORMS.DRAGON;
        this.speed = 350;
        this.canFly = true;
        this.maxJumps = Infinity;
        this.damageMultiplier = 1;
        this.attackMultiplier = 1.5;
        this.duration = 10;
        this.passThrough = false;
        this.wingAngle = 0;
        this.trailTimer = 0;
    }

    onEnter(player) {
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#ff6600', 50
        );
        player.width = 35;
        player.height = 35;
    }

    onExit(player) {
        player.width = 30;
        player.height = 40;
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#ff6600', 30
        );
    }

    update(dt, player) {
        this.wingAngle += dt * 8;
        this.trailTimer += dt;

        if (this.trailTimer > 0.05) {
            this.trailTimer = 0;
            const tailX = player.facing === 1 ? player.x - 5 : player.x + player.width + 5;
            const tailY = player.y + player.height / 2;
            ParticleSystem.createExplosion(tailX, tailY, '#ff4400', 2);
        }
    }

    shoot(player, bullets) {
        const startX = player.facing === 1 ? player.x + player.width : player.x - 10;
        const startY = player.y + player.height / 2;

        for (let i = 0; i < 3; i++) {
            const angle = (Math.random() - 0.5) * 0.5;
            const speed = 500 + Math.random() * 200;
            const b = new Bullet(startX, startY, player.facing, angle, speed, '#ff4400');
            b.life = 60;
            b.damage = 1.5;
            bullets.push(b);
        }

        player.shootCooldown = 0.1;
    }

    draw(ctx, player, cameraX, cameraY) {
        const px = player.x - cameraX;
        const py = player.y - cameraY;
        const cx = px + player.width / 2;
        const cy = py + player.height / 2;

        ctx.save();

        const grad = ctx.createLinearGradient(px, py, px + player.width, py + player.height);
        grad.addColorStop(0, '#ff6600');
        grad.addColorStop(1, '#ff2200');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff4400';
        ctx.fillRect(px, py, player.width, player.height);

        const wingFlap = Math.sin(this.wingAngle) * 12;
        ctx.fillStyle = '#ff8800';

        ctx.beginPath();
        ctx.moveTo(px, cy);
        ctx.lineTo(px - 15, cy - 10 + wingFlap);
        ctx.lineTo(px - 5, cy + 5);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px + player.width, cy);
        ctx.lineTo(px + player.width + 15, cy - 10 + wingFlap);
        ctx.lineTo(px + player.width + 5, cy + 5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(px + 8, py);
        ctx.lineTo(px + 5, py - 10);
        ctx.lineTo(px + 12, py);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px + player.width - 8, py);
        ctx.lineTo(px + player.width - 5, py - 10);
        ctx.lineTo(px + player.width - 12, py);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffff00';
        const eyeX = player.facing === 1 ? px + 22 : px + 5;
        ctx.fillRect(eyeX, py + 10, 6, 4);

        ctx.restore();
    }
}
