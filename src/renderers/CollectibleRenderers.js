/**
 * Default collectible rendering strategy (Pixel Art Golden Coin)
 */
export const DefaultCollectibleRenderer = {
    draw: (ctx, collectible) => {
        ctx.save();

        const x = collectible.x;
        const y = collectible.y;

        // Shadow beneath the coin
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(x + 4, y + 23, 17, 3);

        // Core Border (Dark Gold / Brown) — 25x25
        ctx.fillStyle = "#a87b00";
        ctx.fillRect(x + 8, y + 0, 9, 25); // vertical core
        ctx.fillRect(x + 3, y + 3, 19, 19); // main bulk square
        ctx.fillRect(x + 0, y + 8, 25, 9); // horizontal core

        // Coin Body (Bright Gold)
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(x + 8, y + 3, 9, 19);
        ctx.fillRect(x + 5, y + 5, 15, 15);
        ctx.fillRect(x + 3, y + 8, 19, 9);

        // Right/Bottom Inner Shading (Medium Gold)
        ctx.fillStyle = "#e5a700";
        ctx.fillRect(x + 8, y + 20, 9, 2); // bottom edge inner
        ctx.fillRect(x + 5, y + 18, 15, 2); // bottom slope inner
        ctx.fillRect(x + 20, y + 8, 2, 9); // right edge inner

        // Center Engraving / Slot
        ctx.fillStyle = "#cc9500";
        ctx.fillRect(x + 10, y + 8, 5, 9);

        // Shimmer / Shine (Top-Left corner)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 8, y + 5, 5, 2);
        ctx.fillRect(x + 5, y + 8, 2, 5);

        ctx.restore();
    },
};

/**
 * Simplified hitbox rendering mode for physics debugging of collectibles
 */
export const DebugBoxCollectibleRenderer = {
    draw: (ctx, collectible) => {
        ctx.save();

        const w = collectible.w || 30;
        const h = collectible.h || 30;

        ctx.fillStyle = "rgba(255, 215, 0, 0.5)";
        ctx.fillRect(collectible.x, collectible.y, w, h);

        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.strokeRect(collectible.x, collectible.y, w, h);

        ctx.restore();
    },
};
