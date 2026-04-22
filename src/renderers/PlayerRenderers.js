// ─── Player animations — individual spritesheets per state ───────────────────
// Each sheet: horizontal strip of 75×48 px frames, rendered at SCALE×.
const SCALE = 3;
const FW = 75;
const FH = 48;

const ANIMS = {
    idle: {
        src: "textures/player/pink/idle.png",
        frames: [0, 1, 2, 3],
        fps: 4,
        offsetY: 4,
        loop: true,
    },
    walk: {
        src: "textures/player/pink/walk.png",
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        fps: 12,
        loop: true,
    },
    walkShoot: {
        src: "textures/player/pink/walk-shoot.png",
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        fps: 12,
        loop: true,
    },
    jumpAsc: {
        src: "textures/player/pink/jump.png",
        frames: [0, 1],
        fps: 12,
        offsetY: 4,
        loop: false,
    },
    jumpDesc: {
        src: "textures/player/pink/jump.png",
        frames: [3, 4, 5],
        fps: 12,
        delay: 400,
        offsetY: -4,
        loop: false,
    },
    jumpShoot: {
        src: "textures/player/pink/jump-shoot.png",
        frames: [0],
        fps: 12,
        offsetY: 2,
        loop: false,
    },
    shoot: {
        src: "textures/player/pink/walk-shoot.png",
        frames: [7],
        fps: 12,
        loop: false,
    },
    crouchIdle: {
        src: "textures/player/pink/crouch.png",
        frames: [0],
        fps: 1,
        offsetX: -10,
        loop: false,
    },
    crouchIdleShoot: {
        src: "textures/player/pink/crouch-shoot.png",
        frames: [0],
        fps: 1,
        offsetX: -10,
        loop: false,
    },
    crouch: {
        src: "textures/player/pink/crouch.png",
        frames: [0, 1, 2, 3, 4, 5],
        fps: 10,
        offsetX: -10,
        loop: true,
    },
    crouchShoot: {
        src: "textures/player/pink/crouch-shoot.png",
        frames: [0, 1, 2, 3, 4, 5],
        fps: 10,
        offsetX: -10,
        loop: true,
    },
};

import { getImg } from "../utils/imgCache.js";

let _animStartTime = 0;
let _lastAnimKey = null;
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

function getAnimKey(player) {
    if (player.posture === "crouch") {
        if (Math.abs(player.vx) > 0.5) {
            return player.shooting ? "crouchShoot" : "crouch";
        }
        return player.shooting ? "crouchIdleShoot" : "crouchIdle";
    }

    if (player.airborne) {
        if (player.shooting) {
            return "jumpShoot";
        }
        return player.vy < 0 ? "jumpAsc" : "jumpDesc";
    }

    if (player.shooting) {
        return Math.abs(player.vx) > 0.5 ? "walkShoot" : "shoot";
    }

    if (Math.abs(player.vx) > 0.5) {
        return "walk";
    }

    return "idle";
}

function getCurrentFrame(animKey, anim) {
    const now = Date.now();

    if (_lastAnimKey !== animKey) {
        _animStartTime = now;
        _lastAnimKey = animKey;
    }

    const elapsed = now - _animStartTime;
    const delay = anim.delay ?? 0;

    // ⬅️ najpierw obsługa opóźnienia
    if (elapsed < delay) {
        return anim.frames[0];
    }

    const frameDuration = 1000 / anim.fps;
    const animTime = elapsed - delay;
    const frameIndex = Math.floor(animTime / frameDuration);

    if (anim.loop) {
        return anim.frames[frameIndex % anim.frames.length];
    }

    return anim.frames[Math.min(frameIndex, anim.frames.length - 1)];
}

export const DefaultPlayerRenderer = {
    draw: (ctx, player, debug = false) => {
        const animKey = getAnimKey(player);
        const anim = ANIMS[animKey];
        const img = getImg(anim.src);

        if (!img?.complete || !img.naturalWidth) {
            return;
        }

        const spriteFrame = getCurrentFrame(animKey, anim);
        const dw = FW * SCALE;
        const dh = FH * SCALE;

        const drawX = -dw / 2 + (anim.offsetX ?? 0);
        const drawY = -dh + (anim.offsetY ?? 0);

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(player.x + player.w / 2, player.y + player.h);

        if (player.facing === "left") {
            ctx.scale(-1, 1);
        }

        ctx.drawImage(img, spriteFrame * FW, 0, FW, FH, drawX, drawY, dw, dh);

        if (player.isHit) {
            const outlineSize = 3;
            const { canvas: offCanvas, ctx: offCtx } = getOffCanvas(dw, dh);

            offCtx.clearRect(0, 0, dw, dh);
            offCtx.imageSmoothingEnabled = false;
            offCtx.drawImage(img, spriteFrame * FW, 0, FW, FH, 0, 0, dw, dh);
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

            ctx.drawImage(
                img,
                spriteFrame * FW,
                0,
                FW,
                FH,
                drawX,
                drawY,
                dw,
                dh,
            );
        }

        ctx.restore();

        if (debug) {
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(player.x, player.y, player.w, player.h);
            ctx.restore();
        }
    },
};
