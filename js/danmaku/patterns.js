// js/danmaku/patterns.js

const DanmakuPatterns = {

    circle(originX, originY, options = {}) {
        const {
            count = 16,
            speed = 300,
            color = '#ff5500',
            friendly = false,
            offset = 0
        } = options;

        const bullets = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + offset;
            bullets.push({
                x: originX, y: originY,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed, color, friendly
            });
        }
        return bullets;
    },

    fan(originX, originY, targetX, targetY, options = {}) {
        const {
            count = 5,
            spreadAngle = Math.PI / 4,
            speed = 400,
            color = '#ffaa00',
            friendly = false
        } = options;

        const baseAngle = Math.atan2(targetY - originY, targetX - originX);
        const bullets = [];

        for (let i = 0; i < count; i++) {
            const angle = baseAngle - spreadAngle / 2 + (spreadAngle / (count - 1)) * i;
            bullets.push({
                x: originX, y: originY,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed, color, friendly
            });
        }
        return bullets;
    },

    spiral(originX, originY, options = {}) {
        const {
            arms = 3,
            speed = 250,
            color = '#ff00ff',
            friendly = false,
            offset = 0
        } = options;

        const bullets = [];
        for (let i = 0; i < arms; i++) {
            const angle = (Math.PI * 2 / arms) * i + offset;
            bullets.push({
                x: originX, y: originY,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed, color, friendly
            });
        }
        return bullets;
    },

    rain(areaX, areaWidth, originY, options = {}) {
        const {
            count = 8,
            speed = 200,
            color = '#44aaff',
            friendly = false,
            spreadX = 0.3
        } = options;

        const bullets = [];
        for (let i = 0; i < count; i++) {
            const x = areaX + Math.random() * areaWidth;
            const dx = (Math.random() - 0.5) * spreadX;
            bullets.push({
                x: x, y: originY,
                dx: dx,
                dy: 1,
                speed: speed + Math.random() * 100,
                color, friendly
            });
        }
        return bullets;
    },

    cross(originX, originY, options = {}) {
        const {
            count = 5,
            speed = 350,
            color = '#ff4444',
            friendly = false,
            offset = 0,
            spacing = 15
        } = options;

        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
        ];

        const bullets = [];
        const cos = Math.cos(offset);
        const sin = Math.sin(offset);

        directions.forEach(dir => {
            const rdx = dir.dx * cos - dir.dy * sin;
            const rdy = dir.dx * sin + dir.dy * cos;

            for (let i = 0; i < count; i++) {
                bullets.push({
                    x: originX + rdx * spacing * i,
                    y: originY + rdy * spacing * i,
                    dx: rdx,
                    dy: rdy,
                    speed, color, friendly
                });
            }
        });
        return bullets;
    },

    flower(originX, originY, options = {}) {
        const {
            petals = 6,
            bulletsPerPetal = 5,
            speed = 200,
            color1 = '#ff88cc',
            color2 = '#ffccee',
            friendly = false,
            offset = 0,
            radius = 0
        } = options;

        const bullets = [];
        for (let p = 0; p < petals; p++) {
            const petalAngle = (Math.PI * 2 / petals) * p + offset;

            for (let b = 0; b < bulletsPerPetal; b++) {
                const t = b / bulletsPerPetal;
                const angle = petalAngle + Math.sin(t * Math.PI) * 0.5;
                const bulletSpeed = speed * (0.7 + t * 0.6);
                const color = b % 2 === 0 ? color1 : color2;

                bullets.push({
                    x: originX + Math.cos(petalAngle) * radius,
                    y: originY + Math.sin(petalAngle) * radius,
                    dx: Math.cos(angle),
                    dy: Math.sin(angle),
                    speed: bulletSpeed,
                    color, friendly
                });
            }
        }
        return bullets;
    },

    laser(originX, originY, angle, options = {}) {
        const {
            count = 10,
            speed = 800,
            spacing = 5,
            color = '#ff0000',
            friendly = false
        } = options;

        const bullets = [];
        for (let i = 0; i < count; i++) {
            bullets.push({
                x: originX - Math.cos(angle) * spacing * i,
                y: originY - Math.sin(angle) * spacing * i,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed, color, friendly
            });
        }
        return bullets;
    },

    scatter(originX, originY, facing, options = {}) {
        const {
            count = 8,
            speed = 600,
            spread = 0.6,
            color = '#ffff00',
            friendly = true
        } = options;

        const bullets = [];
        const baseAngle = facing === 1 ? 0 : Math.PI;

        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * spread;
            const bulletSpeed = speed + (Math.random() - 0.5) * 200;
            bullets.push({
                x: originX, y: originY,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed: bulletSpeed,
                color, friendly
            });
        }
        return bullets;
    }
};
