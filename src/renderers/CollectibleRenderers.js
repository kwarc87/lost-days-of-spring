/**
 * Default collectible rendering strategy (Pixel Art Golden Coin)
 */
import { getImg } from "../utils/imgCache.js";

const GEMS_IMG_PATH = "textures/gems-spritesheet.png";

const SPLINTER_FRAME_MS = 150;
const SPLINTER_SW = 16;
const SPLINTER_SH = 16;
const SPLINTER_SCALE = 3;

const SPLINTER_FRAMES = [
    ...Array.from({ length: 7 }, (_, i) => ({ sx: 64 + i * 16, sy: 32 })),
];

// 8×8 pixel art heart with outline — rendered at scale=3 → 24×24px
// 0=transparent  1=outline  2=body  3=highlight  4=shadow
const HEART_PIXELS = [
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 2, 3, 1, 1, 3, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 4, 1],
    [0, 1, 2, 2, 2, 4, 1, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const HEART_COLORS = [
    null,
    "#1a0000", // outline
    "#e8334a", // body
    "#ff9ab4", // highlight
    "#991b2e", // shadow
];

const HEART_SCALE = 3;

// Floating bob animation: ±4px sine wave, staggered per collectible ID
const HEART_BOB_PERIOD = 1800; // ms per full cycle
const HEART_BOB_AMPLITUDE = 4;

function getHeartBobOffset(collectible) {
    const phase = (collectible.id ?? 0) * 1.1;
    return (
        Math.sin((performance.now() / HEART_BOB_PERIOD) * Math.PI * 2 + phase) *
        HEART_BOB_AMPLITUDE
    );
}

export const DefaultCollectibleRenderer = {
    drawCoin: (ctx, collectible, showDebug = false) => {
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

        if (showDebug) {
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                collectible.x,
                collectible.y,
                collectible.w,
                collectible.h,
            );
            ctx.restore();
        }
    },

    drawSplinter: (ctx, collectible, showDebug = false) => {
        const img = getImg(GEMS_IMG_PATH);
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

        if (showDebug) {
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                collectible.x,
                collectible.y,
                collectible.w,
                collectible.h,
            );
            ctx.restore();
        }
    },
    drawMapCoin: (ctx, collectible) => {
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(
            collectible.x,
            collectible.y,
            collectible.w,
            collectible.h,
        );
    },

    drawMapSplinter: (ctx, collectible) => {
        ctx.fillStyle = "#51b9db";
        ctx.fillRect(
            collectible.x,
            collectible.y,
            collectible.w,
            collectible.h,
        );
    },

    drawHeart: (ctx, collectible, showDebug = false) => {
        ctx.save();
        const x = collectible.x;
        const y = collectible.y + getHeartBobOffset(collectible);

        for (let row = 0; row < HEART_PIXELS.length; row++) {
            for (let col = 0; col < HEART_PIXELS[row].length; col++) {
                const ci = HEART_PIXELS[row][col];
                if (!ci) {
                    continue;
                }
                ctx.fillStyle = HEART_COLORS[ci];
                ctx.fillRect(
                    x + col * HEART_SCALE,
                    y + row * HEART_SCALE,
                    HEART_SCALE,
                    HEART_SCALE,
                );
            }
        }

        ctx.restore();

        if (showDebug) {
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                collectible.x,
                collectible.y,
                collectible.w,
                collectible.h,
            );
            ctx.restore();
        }
    },

    drawMapHeart: (ctx, collectible) => {
        const x = collectible.x;
        const y = collectible.y;

        ctx.fillStyle = "#e8334a";
        // Left lobe
        ctx.fillRect(x + 2, y, 8, 8);
        // Right lobe
        ctx.fillRect(x + 14, y, 8, 8);
        // Body connecting lobes
        ctx.fillRect(x + 1, y + 4, 22, 10);
        // Lower V — narrowing to tip
        ctx.fillRect(x + 4, y + 14, 16, 6);
        ctx.fillRect(x + 8, y + 20, 8, 4);
    },
};
