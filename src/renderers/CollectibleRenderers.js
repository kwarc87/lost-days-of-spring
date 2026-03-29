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
        ctx.fillRect(x + 8, y + 36, 24, 8);

        // Core Border (Dark Gold / Brown)
        // We draw thick blocks to simulate a large 10x10 pixel art grid (where 1 pixel = 4x4 real pixels)
        ctx.fillStyle = "#a87b00";
        ctx.fillRect(x + 12, y + 0, 16, 40); // vertical core
        ctx.fillRect(x + 4, y + 4, 32, 32); // main bulk square
        ctx.fillRect(x + 0, y + 12, 40, 16); // horizontal core

        // Coin Body (Bright Gold)
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(x + 12, y + 4, 16, 32);
        ctx.fillRect(x + 8, y + 8, 24, 24);
        ctx.fillRect(x + 4, y + 12, 32, 16);

        // Right/Bottom Inner Shading (Medium Gold)
        ctx.fillStyle = "#e5a700";
        ctx.fillRect(x + 12, y + 32, 16, 4); // bottom edge inner
        ctx.fillRect(x + 8, y + 28, 24, 4); // bottom slope inner
        ctx.fillRect(x + 32, y + 12, 4, 16); // right edge inner

        // Center Engraving / Slot
        ctx.fillStyle = "#cc9500";
        ctx.fillRect(x + 16, y + 12, 8, 16);

        // Shimmer / Shine (Top-Left corner)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 12, y + 8, 8, 4);
        ctx.fillRect(x + 8, y + 12, 4, 8);

        ctx.restore();
    },
};

/**
 * Simplified hitbox rendering mode for physics debugging of collectibles
 */
export const DebugBoxCollectibleRenderer = {
    draw: (ctx, collectible) => {
        ctx.save();

        const w = collectible.w || 40;
        const h = collectible.h || 40;

        ctx.fillStyle = "rgba(255, 215, 0, 0.5)";
        ctx.fillRect(collectible.x, collectible.y, w, h);

        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.strokeRect(collectible.x, collectible.y, w, h);

        ctx.restore();
    },
};
