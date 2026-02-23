// js/transform/form-mecha.js

class FormMecha {
    constructor() {
        this.name = 'Mecha';
        this.color = CONFIG.FORMS.MECHA;
        this.speed = 250;
        this.canFly = false;
        this.maxJumps = 2;
        this.damageMultiplier = 0.5;
        this.attackMultiplier = 2;
        this.duration = 12;
        this.passThrough = false;
        this.jetTimer = 0;
    }

    onEnter(player) {
        ParticleSystem.createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#cccccc', 40
        );
        player.width = 40;
        player.height = 45;
    }

    onExit(player) {
        // 🔧 P2修复：先用旧尺寸计算爆炸中心，再恢复正常尺寸
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        player.width = 30;
        player.height = 40;
        ParticleSystem.createExplosion(centerX, centerY, '#cccccc', 20);
    }

    update(dt, player) {
        this.jetTimer += dt;
    }

    shoot(player, bullets) {
        const bulletSpeed = CONFIG.PLAYER.BULLET_SPEED;
        const startX = player.facing === 1 ? player.x + player.width : player.x - 10;
        const startY = player.y + player.height / 2;

        const spreadAngles = [-0.4, -0.2, 0, 0.2, 0.4];
        spreadAngles.forEach(angle => {
            const b = new Bullet(startX, startY, player.facing, angle, bulletSpeed, '#ffff88');
            b.damage = 2;
            if (player.homingMode) {
                b.homing = true;
                b.homingStrength = 3.5;
            }
            bullets.push(b);
        });

        player.shootCooldown = 0.35;
    }

    draw(ctx, player, cameraX, cameraY) {
        const px = player.x - cameraX;
        const py = player.y - cameraY;

        ctx.fillStyle = '#aaaaaa';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#888888';
        ctx.fillRect(px, py, player.width, player.height);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 2, py + 5);
        ctx.lineTo(px + player.width - 2, py + 5);
        ctx.moveTo(px + 2, py + player.height - 5);
        ctx.lineTo(px + player.width - 2, py + player.height - 5);
        ctx.stroke();

        ctx.fillStyle = '#888888';
        ctx.fillRect(px - 5, py, 10, 12);
        ctx.fillRect(px + player.width - 5, py, 10, 12);

        const gunX = player.facing === 1 ? px + player.width : px - 12;
        ctx.fillStyle = '#666666';
        ctx.fillRect(gunX, py + player.height / 2 - 3, 12, 6);

        if (Math.sin(this.jetTimer * 10) > 0) {
            ctx.fillStyle = '#4488ff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#4488ff';
            ctx.fillRect(px + player.width / 2 - 4, py + player.height, 8, 5);
        }

        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ff0000';
        const eyeX = player.facing === 1 ? px + 28 : px + 5;
        ctx.fillRect(eyeX, py + 12, 6, 3);

        ctx.shadowBlur = 0;
    }
}
