"use strict";
class Obstacle {
    constructor(x, gapY, gapHeight, width, worldHeight) {
        this.x = x;
        this.gapY = gapY;
        this.gapHeight = gapHeight;
        this.width = width;
        this.worldHeight = worldHeight;
        this.passed = false;
    }
    update(deltaTime, speed) {
        this.x -= speed * deltaTime;
    }
    collidesWith(player) {
        const bounds =
            player.getBounds();
        const horizontalCollision =
            bounds.right > this.x &&
            bounds.left < this.x + this.width;
        if (!horizontalCollision) {
            return false;
        }
        const gapTop =
            this.gapY -
            this.gapHeight / 2;
        const gapBottom =
            this.gapY +
            this.gapHeight / 2;
        const hitsTop =
            bounds.top < gapTop;
        const hitsBottom = 
            bounds.bottom > gapBottom;
        return hitsTop || hitsBottom;
    }
    draw(ctx) {
        const gapTop = this.gapY - this.gapHeight / 2;
        const gapBottom = this.gapY + this.gapHeight / 2;

        ctx.fillStyle = "#46513c";
        ctx.fillRect(
            this.x,
            0,
            this.width,
            gapTop
        );

        ctx.fillRect(
            this.x,
            gapBottom,
            this.width,
            this.worldHeight - gapBottom
        );
        
    }
}