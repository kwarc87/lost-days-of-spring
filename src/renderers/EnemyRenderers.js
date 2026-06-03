import { getImg } from "../utils/imgCache.js";

const SCALE = 3;
const SRC = "textures/enemies/enemy001.png";
const FW = 48;
const FH = 48;
const SRC_Y = 11;
const FPS = 8;

let _offCanvas = null;
let _offCtx = null;

function getOffCanvas(w, h) {
    if (!_offCanvas) {
        _offCanvas = document.createElement("canvas");
        _offCtx = _offCanvas.getContext("2d");
    }
    if (_offCanvas.width !== w || _offCanvas.height !== h) {
        _offCanvas.width = w;
        _offCanvas.height = h;
    }
    return { canvas: _offCanvas, ctx: _offCtx };
}

function getCurrentFrame() {
    return Math.floor(Date.now() / (1000 / FPS)) % 3;
}

// per-frame eye anchor (sprite pixel coords, top-left of eye shape)
const EYE_DATA = [
    { x: 10, y: 38 }, // frame 0
    { x: 10, y: 37 }, // frame 1
    { x: 9, y: 36 }, // frame 2
];

// per-frame mouth anchor
const MOUTH_DATA = [
    { x: 9, y: 45 }, // frame 0
    { x: 9, y: 44 }, // frame 1
    { x: 8, y: 43 }, // frame 2
];

function drawEyes(ctx, drawX, drawY, frame, eyeColor) {
    const { x: ex, y: ey } = EYE_DATA[frame] ?? EYE_DATA[0];
    const bx = drawX + ex * SCALE;
    const by = drawY + ey * SCALE;
    const S = SCALE;

    for (const ox of [0, 5 * S]) {
        ctx.fillStyle = eyeColor;
        ctx.fillRect(bx + ox + 1 * S, by, 2 * S, S);
        ctx.fillRect(bx + ox, by + S, 4 * S, 2 * S);
        ctx.fillRect(bx + ox + S, by + 3 * S, 2 * S, S);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(bx + ox + S, by + 3 * S, 2 * S, S);
    }
}

function drawMouth(ctx, drawX, drawY, frame, secondaryColor) {
    const { x: mx, y: my } = MOUTH_DATA[frame] ?? MOUTH_DATA[0];
    const bx = drawX + mx * SCALE;
    const by = drawY + my * SCALE;
    const S = SCALE;

    // top lip line
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(bx + 6, by, 5 * S, S);
    // bottom lip line (slightly darker)
    ctx.fillRect(bx + 3, by + S, 7 * S, S);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(bx + 3, by + S, 7 * S, S);
}

function drawEnemy001(ctx, enemy, debug, nowMs = performance.now()) {
    const img = getImg(SRC);

    if (!img?.complete || !img.naturalWidth) {
        return;
    }

    const frame = enemy.dying ? 0 : getCurrentFrame();
    const dw = FW * SCALE;
    const dh = FH * SCALE;
    const drawX = -dw / 2 + (enemy.offsetX ?? 0);
    const drawY = -dh + (enemy.offsetY ?? 0);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(
        Math.round(enemy.x + enemy.w / 2),
        Math.round(enemy.y + enemy.h),
    );

    if (enemy.dying) {
        const elapsed = nowMs - enemy.dyingStartedAtMs;
        const alpha = Math.max(0, 1 - elapsed / enemy.dyingDurationMs);
        ctx.globalAlpha = alpha;
    }

    // sprite faces left by default; flip for right-facing
    if (enemy.vx > 0) {
        ctx.scale(-1, 1);
    }

    if (enemy.isDamaged || enemy.dying) {
        const outlineSize = 3;
        const { canvas: offCanvas, ctx: offCtx } = getOffCanvas(dw, dh);

        offCtx.clearRect(0, 0, dw, dh);
        offCtx.imageSmoothingEnabled = false;
        offCtx.drawImage(img, frame * FW, SRC_Y, FW, FH, 0, 0, dw, dh);
        offCtx.globalCompositeOperation = "source-atop";
        offCtx.fillStyle = "red";
        offCtx.fillRect(0, 0, dw, dh);
        offCtx.globalCompositeOperation = "source-over";

        const offsets = [
            [-outlineSize, 0],
            [outlineSize, 0],
            [0, -outlineSize],
            [0, outlineSize],
            [-outlineSize, -outlineSize],
            [outlineSize, -outlineSize],
            [-outlineSize, outlineSize],
            [outlineSize, outlineSize],
        ];

        for (const [ox, oy] of offsets) {
            ctx.drawImage(offCanvas, drawX + ox, drawY + oy);
        }

        ctx.drawImage(img, frame * FW, SRC_Y, FW, FH, drawX, drawY, dw, dh);
    } else {
        ctx.drawImage(img, frame * FW, SRC_Y, FW, FH, drawX, drawY, dw, dh);
    }

    drawEyes(ctx, drawX, drawY, frame, enemy.mainColor);
    drawMouth(ctx, drawX, drawY, frame, enemy.secondaryColor);

    ctx.restore();

    if (debug) {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x, enemy.y, enemy.w, enemy.h);
        ctx.restore();
    }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────
export const DefaultEnemyRenderer = {
    drawMapEnemy: (ctx, enemy) => {
        drawEnemy001(ctx, enemy, true);
    },

    draw: (ctx, enemy, debug = false, nowMs = performance.now()) => {
        drawEnemy001(ctx, enemy, debug, nowMs);
    },
};
