// js/danmaku/bullet-pool.js

class BulletPool {
    constructor(maxSize) {
        this.pool = [];
        this.maxSize = maxSize || CONFIG.DANMAKU.BULLET_POOL_SIZE;

        for (let i = 0; i < this.maxSize; i++) {
            const b = new Bullet(0, 0, 0, 0, 0, '#ffffff', false);
            b.active = false;
            this.pool.push(b);
        }
    }

    acquire(x, y, dx, dy, speed, color, friendly) {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                const b = this.pool[i];
                b.x = x;
                b.y = y;
                b.vx = dx * speed;
                b.vy = dy * speed;
                b.color = color;
                b.friendly = friendly;
                b.damage = 1;
                b.life = CONFIG.DANMAKU.DEFAULT_BULLET_LIFE;
                b.markedForDeletion = false;
                b.active = true;
                b.homing = false;
                b.homingStrength = 0;
                b.width = 10;
                b.height = 10;
                return b;
            }
        }
        console.warn('Bullet pool exhausted!');
        return null;
    }

    release(bullet) {
        bullet.active = false;
        bullet.markedForDeletion = false;
    }

    getActiveBullets() {
        return this.pool.filter(b => b.active);
    }

    cleanup() {
        this.pool.forEach(b => {
            if (b.active && b.markedForDeletion) {
                this.release(b);
            }
        });
    }

    releaseAll() {
        this.pool.forEach(b => this.release(b));
    }

    get activeCount() {
        return this.pool.filter(b => b.active).length;
    }
}
