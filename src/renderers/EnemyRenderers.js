import { getImg } from "../utils/imgCache.js";

const SCALE = 3;
const S = SCALE;
const FPS = 8;
const OUTLINE = 3;

const CFG1 = {
    src: "textures/enemies/enemy001.png",
    fw: 48,
    sx: 0,
    sy: 11,
    sw: 48,
    sh: 48,
    frames: 3,
};
const CFG2 = {
    src: "textures/enemies/enemy002.png",
    fw: 48,
    sx: 11,
    sy: 12,
    sw: 37,
    sh: 36,
    frames: 4,
};

const OUTLINE_OFFSETS = [
    [-OUTLINE, 0],
    [OUTLINE, 0],
    [0, -OUTLINE],
    [0, OUTLINE],
    [-OUTLINE, -OUTLINE],
    [OUTLINE, -OUTLINE],
    [-OUTLINE, OUTLINE],
    [OUTLINE, OUTLINE],
];

let _oc = null,
    _octx = null;

function offCanvas(w, h) {
    if (!_oc) {
        _oc = document.createElement("canvas");
        _octx = _oc.getContext("2d");
    }
    if (_oc.width !== w || _oc.height !== h) {
        _oc.width = w;
        _oc.height = h;
    }
    return [_oc, _octx];
}

function getFrame(frames, dying, now) {
    return dying ? 0 : Math.floor(now / (1000 / FPS)) % frames;
}

function blit(ctx, img, cfg, f, dx, dy) {
    const { fw, sx, sy, sw, sh } = cfg;
    ctx.drawImage(img, f * fw + sx, sy, sw, sh, dx, dy, sw * S, sh * S);
}

function drawDamaged(ctx, img, cfg, f, drawX, drawY) {
    const dw = cfg.sw * S,
        dh = cfg.sh * S;
    const [oc, octx] = offCanvas(dw, dh);
    octx.clearRect(0, 0, dw, dh);
    octx.imageSmoothingEnabled = false;
    blit(octx, img, cfg, f, 0, 0);
    octx.globalCompositeOperation = "source-atop";
    octx.fillStyle = "red";
    octx.fillRect(0, 0, dw, dh);
    octx.globalCompositeOperation = "source-over";
    for (const [ox, oy] of OUTLINE_OFFSETS) {
        ctx.drawImage(oc, drawX + ox, drawY + oy);
    }
    blit(ctx, img, cfg, f, drawX, drawY);
}

function drawEnemy(ctx, enemy, cfg, debug, now, onAfterDraw) {
    const img = getImg(cfg.src);
    if (!img?.complete || !img.naturalWidth) {
        return;
    }

    const f = getFrame(cfg.frames, enemy.dying, now);
    const dw = cfg.sw * S,
        dh = cfg.sh * S;
    const drawX = -dw / 2 + (enemy.offsetX ?? 0);
    const drawY = -dh + (enemy.offsetY ?? 0);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(
        Math.round(enemy.x + enemy.w / 2),
        Math.round(enemy.y + enemy.h),
    );

    if (enemy.dying) {
        ctx.globalAlpha = Math.max(
            0,
            1 - (now - enemy.dyingStartedAtMs) / enemy.dyingDurationMs,
        );
    }
    if (enemy.vx > 0) {
        ctx.scale(-1, 1);
    }

    if (enemy.isDamaged || enemy.dying) {
        drawDamaged(ctx, img, cfg, f, drawX, drawY);
    } else {
        blit(ctx, img, cfg, f, drawX, drawY);
    }

    onAfterDraw?.(ctx, drawX, drawY, f);

    ctx.restore();

    if (debug) {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x, enemy.y, enemy.w, enemy.h);
        ctx.restore();
    }
}

// slime — eye & mouth pixel anchors per frame
const SLIME_EYE_DATA = [
    { x: 10, y: 38 },
    { x: 10, y: 37 },
    { x: 9, y: 36 },
];
const SLIME_MOUTH_DATA = [
    { x: 9, y: 45 },
    { x: 9, y: 44 },
    { x: 8, y: 43 },
];

function drawSlimeEyes(ctx, drawX, drawY, f, eyeColor) {
    const { x: ex, y: ey } = SLIME_EYE_DATA[f];
    const bx = drawX + ex * S,
        by = drawY + ey * S;
    for (const ox of [0, 5 * S]) {
        ctx.fillStyle = eyeColor;
        ctx.fillRect(bx + ox + S, by, 2 * S, S);
        ctx.fillRect(bx + ox, by + S, 4 * S, 2 * S);
        ctx.fillRect(bx + ox + S, by + 3 * S, 2 * S, S);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(bx + ox + S, by + 3 * S, 2 * S, S);
    }
}

function drawSlimeMouth(ctx, drawX, drawY, f, secondaryColor) {
    const { x: mx, y: my } = SLIME_MOUTH_DATA[f];
    const bx = drawX + mx * S,
        by = drawY + my * S;
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(bx + 6, by, 5 * S, S);
    ctx.fillRect(bx + 3, by + S, 7 * S, S);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(bx + 3, by + S, 7 * S, S);
}

function drawSlimeEnemy(ctx, enemy, debug, now) {
    drawEnemy(ctx, enemy, CFG1, debug, now, (ctx, drawX, drawY, f) => {
        drawSlimeEyes(ctx, drawX, drawY, f, enemy.mainColor);
        drawSlimeMouth(ctx, drawX, drawY, f, enemy.secondaryColor);
    });
}

// slime — eye & mouth pixel anchors per frame
const EVIL_EYE_EYE_DATA = [
    { x: 30, y: 54, w: 7, h: 6 },
    { x: 30, y: 42, w: 8, h: 9 },
    { x: 30, y: 26, w: 7, h: 7 },
    { x: 29, y: 30, w: 8, h: 9 },
];

function drawEvilEyeEye(ctx, drawX, drawY, f, eyeColor) {
    const { x: ex, y: ey, w, h } = EVIL_EYE_EYE_DATA[f];
    const bx = drawX + ex;
    const by = drawY + ey;
    ctx.fillStyle = eyeColor;
    ctx.fillRect(bx, by, w, h);
}

function drawEvilEyeEnemy(ctx, enemy, debug, now) {
    drawEnemy(ctx, enemy, CFG2, debug, now, (ctx, drawX, drawY, f) => {
        drawEvilEyeEye(ctx, drawX, drawY, f, enemy.mainColor);
    });
}

export const DefaultEnemyRenderer = {
    drawMapEnemy: (ctx, enemy, type = "slime") => {
        if (type === "evilEye") {
            drawEvilEyeEnemy(ctx, enemy, true);
        } else {
            drawSlimeEnemy(ctx, enemy, true);
        }
    },
    draw: (
        ctx,
        enemy,
        type = "slime",
        debug = false,
        now = performance.now(),
    ) => {
        switch (type) {
            case "evilEye":
                drawEvilEyeEnemy(ctx, enemy, debug, now);
                break;
            default:
                drawSlimeEnemy(ctx, enemy, debug, now);
        }
    },
};
