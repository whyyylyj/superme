// js/transform/form-phantom.js

class FormPhantom {
    constructor() {
        this.name = 'Phantom';
        this.color = CONFIG.FORMS.PHANTOM;
        this.speed = 400;
        this.canFly = true;
        this.maxJumps = Infinity;
        this.damageMultiplier = 0;
        this.attackMultiplier = 1;
        this.duration = 8;
        this.passThrough = true;
        this.ghostTimer = 0;
        this.pulseValue = 0;
    }

    onEnter(player) {
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#aa00ff', 60
        );
    }

    onExit(player) {
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#aa00ff', 30
        );
    }

    update(dt, player) {
        this.ghostTimer += dt;
        this.pulseValue = Math.sin(this.ghostTimer * 5) * 0.3 + 0.5;

        // 🔧 P2修复：使用 ParticleSystem 公开接口而非直接操作内部数组
        if (Math.random() < 0.3) {
            ParticleSystem.createExplosion(
                player.x + Math.random() * player.width,
                player.y + Math.random() * player.height,
                '#aa00ff', 1
            );
        }
    }

    shoot(player, bullets) {
        const startX = player.x + player.width / 2;
        const startY = player.y + player.height / 2;

        const b = new Bullet(startX, startY, player.facing, 0, 600, '#dd44ff');
        b.homing = true;
        b.homingStrength = 5;
        b.life = 180;
        bullets.push(b);

        player.shootCooldown = 0.15;
    }

    draw(ctx, player, cameraX, cameraY) {
        const px = player.x - cameraX;
        const py = player.y - cameraY;

        ctx.save();

        ctx.globalAlpha = this.pulseValue;
        ctx.fillStyle = '#aa00ff';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#aa00ff';
        ctx.fillRect(px, py, player.width, player.height);

        ctx.globalAlpha = 1;
        for (let i = 0; i < 4; i++) {
            const sx = px + Math.sin(this.ghostTimer * 3 + i * 2) * player.width / 3 + player.width / 2;
            const sy = py + Math.cos(this.ghostTimer * 2 + i * 3) * player.height / 3 + player.height / 2;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = this.pulseValue * 0.8;
        ctx.strokeStyle = '#cc44ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(px - 2, py - 2, player.width + 4, player.height + 4);

        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';
        const eyeX = player.facing === 1 ? px + 20 : px + 5;
        ctx.fillRect(eyeX, py + 12, 5, 3);

        ctx.restore();
    }
}
