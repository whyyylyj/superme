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
        const atkMult = TransformSystem.getAttackMultiplier(player);

        if (player.weapon === 'normal') {
            const b = new Bullet(startX, startY, player.facing, 0, bulletSpeed, '#00ffff', true, 'circle', 1 * atkMult);
            if (player.homingMode) {
                b.homing = true;
                b.homingStrength = 4;
            }
            bullets.push(b);
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_NORMAL;
        } else if (player.weapon === 'rapid') {
            const b = new Bullet(startX, startY, player.facing, 0, bulletSpeed + 200, '#cc00ff', true, 'circle', 0.8 * atkMult);
            if (player.homingMode) {
                b.homing = true;
                b.homingStrength = 3;
            }
            bullets.push(b);
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_RAPID;
        } else if (player.weapon === 'spread') {
            const angles = [0, -0.2, 0.2];
            angles.forEach(angle => {
                const b = new Bullet(startX, startY, player.facing, angle, bulletSpeed, '#ff00ff', true, 'diamond', 1 * atkMult);
                if (player.homingMode) {
                    b.homing = true;
                    b.homingStrength = 3;
                }
                bullets.push(b);
            });
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_SPREAD;
        } else if (player.weapon === 'fireball') {
            const b = new Bullet(startX, startY, player.facing, 0, bulletSpeed * 0.8, '#ff4400', true, 'circle', CONFIG.POWERUPS.FIRE_FLOWER.DAMAGE * atkMult);
            b.width = 20; b.height = 20;
            bullets.push(b);
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_NORMAL * 1.5;
        } else if (player.weapon === 'power_spread') {
            const angles = [0, -0.2, 0.2, -0.4, 0.4];
            angles.forEach(angle => {
                const b = new Bullet(startX, startY, player.facing, angle, bulletSpeed, '#ff0088', true, 'diamond', CONFIG.POWERUPS.POWER_SPREAD.DAMAGE * atkMult);
                bullets.push(b);
            });
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_SPREAD;
        } else if (player.weapon === 'gold') {
            const b = new Bullet(startX, startY, player.facing, 0, bulletSpeed * 1.5, '#ffd700', true, 'star', CONFIG.POWERUPS.GOLD_BULLET.DAMAGE * atkMult);
            b.width = 15; b.height = 15;
            bullets.push(b);
            player.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN_NORMAL;
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
