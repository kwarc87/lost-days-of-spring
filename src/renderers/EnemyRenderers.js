/**
 * Default enemy rendering strategy
 */
export const DefaultEnemyRenderer = {
    draw: (ctx, enemy) => {
        ctx.save();

        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

        const eyeOffset = enemy.vx > 0 ? 10 : 0;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(enemy.x + 3 + eyeOffset, enemy.y + 6, 8, 8);
        ctx.fillStyle = "#000000";
        ctx.fillRect(enemy.x + 5 + eyeOffset, enemy.y + 8, 4, 4);

        ctx.restore();
    },
};

/**
 * Simplified hitbox rendering mode for enemies
 */
export const DebugBoxEnemyRenderer = {
    draw: (ctx, enemy) => {
        ctx.save();

        ctx.fillStyle = "rgba(255, 100, 0, 0.5)";
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

        ctx.strokeStyle = "#ff6600";
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.w, enemy.h);

        // Draw the looking direction (a dot on the front side of the box)
        ctx.fillStyle = "yellow";
        const eyeOffset = enemy.vx > 0 ? enemy.w - 4 : 0;
        ctx.fillRect(enemy.x + eyeOffset, enemy.y + 4, 4, 4);

        ctx.restore();
    },
};
