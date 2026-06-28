/**
 * Default collectible rendering strategy (Pixel Art Golden Coin)
 */
import { getImg } from "../utils/imgCache.js";

const GEMS_IMG_PATH = "textures/gems-spritesheet.png";
const SPLINTER_FRAME_MS = 150;
const SPLINTER_SW = 12;
const SPLINTER_SH = 12;
const SPLINTER_SCALE = 3;

const SPLINTER_FRAMES = [
    ...Array.from({ length: 7 }, (_, i) => ({ sx: 66 + i * 16, sy: 34 })),
];

const WEAPON_IMG_PATH = "textures/tilesets.png";
const WEAPON_FRAME_MS = 250;
const WEAPON_SW = 16;
const WEAPON_SH = 16;
const WEAPON_SCALE = 2;

const WEAPON_FRAMES = [
    ...Array.from({ length: 5 }, (_, i) => ({ sx: i * 80, sy: 324 })),
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

const WEAPON_OUTLINE = 3;
const WEAPON_OUTLINE_COLOR = "#51b9db";
const WEAPON_OUTLINE_OFFSETS = [
    [-WEAPON_OUTLINE, 0],
    [WEAPON_OUTLINE, 0],
    [0, -WEAPON_OUTLINE],
    [0, WEAPON_OUTLINE],
    [-WEAPON_OUTLINE, -WEAPON_OUTLINE],
    [WEAPON_OUTLINE, -WEAPON_OUTLINE],
    [-WEAPON_OUTLINE, WEAPON_OUTLINE],
    [WEAPON_OUTLINE, WEAPON_OUTLINE],
];

let _woc = null,
    _woctx = null;
function getWeaponOffCanvas(w, h) {
    if (!_woc) {
        _woc = document.createElement("canvas");
        _woctx = _woc.getContext("2d");
    }
    if (_woc.width !== w || _woc.height !== h) {
        _woc.width = w;
        _woc.height = h;
    }
    return [_woc, _woctx];
}

// Floating bob animation: ±4px sine wave, staggered per collectible ID
const HEART_BOB_PERIOD = 1800; // ms per full cycle
const HEART_BOB_AMPLITUDE = 4;

function getHeartBobOffset(collectible, now) {
    const phase = (collectible.id ?? 0) * 1.1;
    return Math.round(
        Math.sin((now / HEART_BOB_PERIOD) * Math.PI * 2 + phase) *
            HEART_BOB_AMPLITUDE,
    );
}

export const DefaultCollectibleRenderer = {
    drawCoin: (ctx, collectible, showDebug = false) => {
        ctx.save();

        const x = Math.round(collectible.x);
        const y = Math.round(collectible.y);

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
    drawSplinter: (
        ctx,
        collectible,
        showDebug = false,
        now = performance.now(),
    ) => {
        const img = getImg(GEMS_IMG_PATH);
        const { sx, sy } =
            SPLINTER_FRAMES[
                Math.floor(now / SPLINTER_FRAME_MS) % SPLINTER_FRAMES.length
            ];

        const dw = collectible.w ?? SPLINTER_SW * SPLINTER_SCALE;
        const dh = collectible.h ?? SPLINTER_SH * SPLINTER_SCALE;

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            img,
            sx,
            sy,
            SPLINTER_SW,
            SPLINTER_SH,
            Math.round(collectible.x),
            Math.round(collectible.y),
            dw,
            dh,
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
    drawWeaponUpgrade: (ctx, collectible, now = performance.now()) => {
        const img = getImg(WEAPON_IMG_PATH);
        const { sx, sy } =
            WEAPON_FRAMES[
                Math.floor(now / WEAPON_FRAME_MS) % WEAPON_FRAMES.length
            ];

        const dw = WEAPON_SW * WEAPON_SCALE;
        const dh = WEAPON_SH * WEAPON_SCALE;
        const dx = Math.round(collectible.x);
        const dy = Math.round(collectible.y);

        const [oc, octx] = getWeaponOffCanvas(dw, dh);
        octx.clearRect(0, 0, dw, dh);
        octx.imageSmoothingEnabled = false;
        octx.drawImage(img, sx, sy, WEAPON_SW, WEAPON_SH, 0, 0, dw, dh);
        octx.globalCompositeOperation = "source-atop";
        octx.fillStyle = WEAPON_OUTLINE_COLOR;
        octx.fillRect(0, 0, dw, dh);
        octx.globalCompositeOperation = "source-over";

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        for (const [ox, oy] of WEAPON_OUTLINE_OFFSETS) {
            ctx.drawImage(oc, dx + ox, dy + oy);
        }
        ctx.drawImage(img, sx, sy, WEAPON_SW, WEAPON_SH, dx, dy, dw, dh);
        ctx.restore();
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
        ctx.fillStyle = "#68eef2";
        ctx.fillRect(
            collectible.x,
            collectible.y,
            collectible.w,
            collectible.h,
        );
    },

    drawHeart: (
        ctx,
        collectible,
        showDebug = false,
        now = performance.now(),
    ) => {
        ctx.save();
        const x = Math.round(collectible.x);
        const y =
            Math.round(collectible.y) + getHeartBobOffset(collectible, now);

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

    drawArtifact: (
        ctx,
        collectible,
        showDebug = false,
        now = performance.now(),
    ) => {
        const img = getImg("textures/icons.png");
        const sx = collectible.cordX ?? 0;
        const sy = collectible.cordY ?? 0;
        const sw = 16;
        const sh = 16;
        const dw = collectible.w ?? 48;
        const dh = collectible.h ?? 48;
        const bobY = getHeartBobOffset(collectible, now);

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            img,
            sx,
            sy,
            sw,
            sh,
            Math.round(collectible.x),
            Math.round(collectible.y) + bobY,
            dw,
            dh,
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

    drawMapArtifact: (ctx, collectible) => {
        ctx.fillStyle = "#4772da";
        ctx.fillRect(
            collectible.x,
            collectible.y,
            collectible.w,
            collectible.h,
        );
    },
};
