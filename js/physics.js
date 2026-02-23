// physics.js

const Physics = {
    // Axis-Aligned Bounding Box Collision Detection
    // Rect objects need: x, y, width, height
    checkCollision: function(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    },

    // Get intersection depth for resolving collisions
    getIntersection: function(rect1, rect2) {
        if (!this.checkCollision(rect1, rect2)) {
            return null;
        }

        const overlapX1 = rect1.x + rect1.width - rect2.x;
        const overlapX2 = rect2.x + rect2.width - rect1.x;
        const overlapY1 = rect1.y + rect1.height - rect2.y;
        const overlapY2 = rect2.y + rect2.height - rect1.y;

        // Find the smallest overlap
        const minOverlapX = Math.min(overlapX1, overlapX2);
        const minOverlapY = Math.min(overlapY1, overlapY2);

        if (minOverlapX < minOverlapY) {
            return {
                axis: 'x',
                depth: minOverlapX,
                dir: overlapX1 < overlapX2 ? -1 : 1 // -1 means rect1 is to the left of rect2
            };
        } else {
            return {
                axis: 'y',
                depth: minOverlapY,
                dir: overlapY1 < overlapY2 ? -1 : 1 // -1 means rect1 is above rect2
            };
        }
    }
};
