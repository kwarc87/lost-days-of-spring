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
        ctx.fillRect(x + 6, y + 27, 18, 6);

        // Core Border (Dark Gold / Brown)
        // Draw using 3x3 pixel art blocks to achieve a 30x30 total size
        ctx.fillStyle = "#a87b00";
        ctx.fillRect(x + 9, y + 0, 12, 30); // vertical core
        ctx.fillRect(x + 3, y + 3, 24, 24); // main bulk square
        ctx.fillRect(x + 0, y + 9, 30, 12); // horizontal core

        // Coin Body (Bright Gold)
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(x + 9, y + 3, 12, 24);
        ctx.fillRect(x + 6, y + 6, 18, 18);
        ctx.fillRect(x + 3, y + 9, 24, 12);

        // Right/Bottom Inner Shading (Medium Gold)
        ctx.fillStyle = "#e5a700";
        ctx.fillRect(x + 9, y + 24, 12, 3); // bottom edge inner
        ctx.fillRect(x + 6, y + 21, 18, 3); // bottom slope inner
        ctx.fillRect(x + 24, y + 9, 3, 12); // right edge inner

        // Center Engraving / Slot
        ctx.fillStyle = "#cc9500";
        ctx.fillRect(x + 12, y + 9, 6, 12);

        // Shimmer / Shine (Top-Left corner)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 9, y + 6, 6, 3);
        ctx.fillRect(x + 6, y + 9, 3, 6);

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
