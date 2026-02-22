// js/danmaku/danmaku-engine.js

class DanmakuEmitter {
    constructor(config) {
        this.pattern = config.pattern;
        this.originX = config.originX || 0;
        this.originY = config.originY || 0;
        this.duration = config.duration || 5;
        this.interval = config.interval || 0.1;
        this.patternOptions = config.patternOptions || {};
        this.onUpdate = config.onUpdate || null;

        this.timer = 0;
        this.elapsed = 0;
        this.active = true;
        this.offset = 0;
    }

    update(dt) {
        if (!this.active) return [];

        this.elapsed += dt;
        this.timer -= dt;

        if (this.elapsed >= this.duration) {
            this.active = false;
            return [];
        }

        if (this.timer <= 0) {
            this.timer = this.interval;
            this.offset += 0.1;

            if (this.onUpdate) {
                this.onUpdate(this);
            }

            const options = {
                ...this.patternOptions,
                offset: this.offset
            };

            const patternFn = DanmakuPatterns[this.pattern];
            if (patternFn) {
                return patternFn(this.originX, this.originY, options);
            }
        }

        return [];
    }
}

const DanmakuEngine = {
    emitters: [],
    bulletPool: null,

    init() {
        this.bulletPool = new BulletPool(CONFIG.DANMAKU.BULLET_POOL_SIZE);
        this.emitters = [];
    },

    createEmitter(config) {
        const emitter = new DanmakuEmitter(config);
        this.emitters.push(emitter);
        return emitter;
    },

    fireBullets(bulletConfigs, targetBulletsArray) {
        bulletConfigs.forEach(config => {
            // 🔧 P0修复：使用对象池代替 new Bullet()，避免 GC 压力
            const bullet = this.bulletPool
                ? this.bulletPool.acquire(
                    config.x, config.y,
                    config.dx, config.dy,
                    config.speed,
                    config.color,
                    config.friendly !== undefined ? config.friendly : false
                )
                : new Bullet(config.x, config.y, config.dx, config.dy, config.speed, config.color, config.friendly);

            if (!bullet) return; // 对象池耗尽时 acquire 返回 null
            if (config.damage !== undefined) bullet.damage = config.damage;
            if (config.life !== undefined) bullet.life = config.life;
            if (config.homing !== undefined) bullet.homing = config.homing;
            if (config.homingStrength !== undefined) bullet.homingStrength = config.homingStrength;
            targetBulletsArray.push(bullet);
        });
    },

    update(dt, targetBulletsArray) {
        this.emitters.forEach(emitter => {
            const bulletConfigs = emitter.update(dt);
            if (bulletConfigs.length > 0) {
                this.fireBullets(bulletConfigs, targetBulletsArray);
            }
        });

        // 清理已完成的 emitter
        this.emitters = this.emitters.filter(e => e.active);

        // 回收弹幕系统产生的、被标记删除的对象池子弹
        if (this.bulletPool) {
            this.bulletPool.cleanup();
        }
    },

    reset() {
        this.emitters = [];
        if (this.bulletPool) this.bulletPool.releaseAll();
    }
};
