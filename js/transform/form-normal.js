// js/transform/form-normal.js

class FormNormal {
    constructor() {
        this.name = 'Normal';
        this.color = CONFIG.FORMS.NORMAL;
        this.speed = CONFIG.PLAYER.BASE_SPEED;
        this.canFly = false;
        this.maxJumps = CONFIG.PLAYER.MAX_JUMPS;
        this.damageMultiplier = 1;
        this.attackMultiplier = 1;
        this.duration = Infinity;
        this.passThrough = false;
    }

    onEnter(player) {
        // Normal form has no special entry effect
    }

    onExit(player) {
        // No exit effect
    }

    update(dt, player) {
        // No additional logic
    }

    shoot(player, bullets) {
        const bulletSpeed = CONFIG.PLAYER.BULLET_SPEED;
        const startX = player.facing === 1 ? player.x + player.width : player.x - 10;
        const startY = player.y + player.height / 2 - 5;

        if (player.weapon === 'normal') {
            bullets.push(new Bullet(startX, startY, player.facing, 0, bulletSpeed, '#00ffff'));
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_NORMAL;
        } else if (player.weapon === 'rapid') {
            bullets.push(new Bullet(startX, startY, player.facing, 0, bulletSpeed + 200, '#cc00ff'));
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_RAPID;
        } else if (player.weapon === 'spread') {
            bullets.push(new Bullet(startX, startY, player.facing, 0, bulletSpeed, '#ff00ff'));
            bullets.push(new Bullet(startX, startY, player.facing, -0.2, bulletSpeed, '#ff00ff'));
            bullets.push(new Bullet(startX, startY, player.facing, 0.2, bulletSpeed, '#ff00ff'));
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_SPREAD;
        }
    }

    draw(ctx, player, cameraX, cameraY) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(player.x - cameraX, player.y - cameraY, player.width, player.height);

        // Eyes
        ctx.fillStyle = 'black';
        ctx.shadowBlur = 0;
        const eyeOffsetX = player.facing === 1 ? 20 : 5;
        ctx.fillRect(player.x - cameraX + eyeOffsetX, player.y - cameraY + 10, 5, 5);
    }
}
