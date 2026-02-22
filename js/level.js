// level.js

class Platform extends Entity {
    constructor(x, y, width, height, color = '#223344') {
        super(x, y, width, height, color);
    }

    draw(ctx, cameraX, cameraY) {
        ctx.save();
        ctx.fillStyle = this.color;

        // neon stroke
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;

        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ffcc';

        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
        ctx.strokeRect(this.x - cameraX, this.y - cameraY, this.width, this.height);

        // grid pattern detail
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let ix = 0; ix < this.width; ix += 20) {
            ctx.moveTo(this.x - cameraX + ix, this.y - cameraY);
            ctx.lineTo(this.x - cameraX + ix, this.y - cameraY + this.height);
        }
        for (let iy = 0; iy < this.height; iy += 20) {
            ctx.moveTo(this.x - cameraX, this.y - cameraY + iy);
            ctx.lineTo(this.x - cameraX + this.width, this.y - cameraY + iy);
        }
        ctx.stroke();

        ctx.restore();
    }
}

const LevelMap = {
    platforms: [],
    enemies: [],
    powerups: [],
    boss: null,
    width: 3000,
    height: 600,

    generate: function () {
        this.platforms = [];
        this.enemies = [];
        this.powerups = [];
        this.boss = null;
        this.width = 4000;

        // Floor pieces (with gaps)
        this.addPlatform(0, 500, 800, 100);
        this.addPlatform(950, 500, 400, 100);
        this.addPlatform(1500, 500, 800, 100);
        this.addPlatform(2400, 500, 1600, 100); // Boss arena

        // Floating platforms
        this.addPlatform(400, 350, 200, 20);
        this.addPlatform(700, 200, 150, 20);
        this.addPlatform(1200, 300, 150, 20);

        this.addPlatform(1600, 250, 200, 20);
        this.addPlatform(1900, 150, 200, 20);
        this.addPlatform(2600, 350, 400, 20);
        this.addPlatform(3200, 200, 400, 20);

        // Enemies
        this.enemies.push(new Enemy(500, 320));
        this.enemies.push(new Enemy(1000, 470));
        this.enemies.push(new Enemy(1600, 470));
        this.enemies.push(new Enemy(1700, 220));
        this.enemies.push(new Enemy(2000, 120));
        this.enemies.push(new Enemy(2800, 320));
        this.enemies.push(new Enemy(3300, 170));

        // Powerups
        this.powerups.push(new PowerUp(550, 200, 'speed')); // Early speed boost
        this.powerups.push(new PowerUp(750, 150, 'spread'));
        this.powerups.push(new PowerUp(1650, 150, 'rapid')); // Rapid fire on medium islands
        this.powerups.push(new PowerUp(1950, 100, 'star'));
        this.powerups.push(new PowerUp(2500, 400, 'shield')); // Shield right before boss
        this.powerups.push(new PowerUp(2800, 450, 'bamboo'));

        // Boss
        this.boss = new Boss(3600, 350);
    },

    addPlatform: function (x, y, w, h) {
        this.platforms.push(new Platform(x, y, w, h));
    },

    drawBackground: function (ctx, cameraX, cameraY, canvas) {
        // Simple parallax stars or grid
        ctx.save();
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        const parallaxOffsetX = (cameraX * 0.5) % 50;

        ctx.beginPath();
        for (let x = -parallaxOffsetX; x < canvas.width; x += 50) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();

        ctx.restore();
    }
};
