// entity.js

class Entity {
    constructor(x, y, width, height, color = 'white') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.vx = 0;
        this.vy = 0;

        this.markedForDeletion = false;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx, cameraX, cameraY) {
        ctx.fillStyle = this.color;
        // Adjust for camera
        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
    }
}
