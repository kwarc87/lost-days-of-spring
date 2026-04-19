/**
 * Default collectible rendering strategy (Pixel Art Golden Coin)
 */
let _gemsImg = null;

function getGemsImg() {
    if (!_gemsImg) {
        _gemsImg = new Image();
        _gemsImg.src = "textures/gems-spritesheet.png";
    }
    return _gemsImg;
}

const SPLINTER_FRAME_MS = 150;
const SPLINTER_SW = 16;
const SPLINTER_SH = 16;
const SPLINTER_SCALE = 3;

const SPLINTER_FRAMES = [
    ...Array.from({ length: 7 }, (_, i) => ({ sx: 64 + i * 16, sy: 32 })),
];

export const DefaultCollectibleRenderer = {
    drawCoin: (ctx, collectible) => {
        ctx.save();

        const x = collectible.x;
        const y = collectible.y;

        // Shadow beneath the coin
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(x + 4, y + 22, 16, 3);

        // Core Border (Dark Gold / Brown) — 24x24
        ctx.fillStyle = "#a87b00";
        ctx.fillRect(x + 8, y + 0, 9, 24); // vertical core
        ctx.fillRect(x + 3, y + 3, 19, 19); // main bulk square
        ctx.fillRect(x + 0, y + 8, 24, 9); // horizontal core

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

    drawSplinter: (ctx, collectible) => {
        const img = getGemsImg();
        const { sx, sy } =
            SPLINTER_FRAMES[
                Math.floor(performance.now() / SPLINTER_FRAME_MS) %
                    SPLINTER_FRAMES.length
            ];

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            img,
            sx,
            sy,
            SPLINTER_SW,
            SPLINTER_SH,
            collectible.x,
            collectible.y,
            SPLINTER_SW * SPLINTER_SCALE,
            SPLINTER_SH * SPLINTER_SCALE,
        );
        ctx.restore();
    },
};
