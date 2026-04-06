// ─── Player animations — individual spritesheets per state ───────────────────
// Each sheet: horizontal strip of 75×48 px frames, rendered at SCALE×.
const SCALE = 3;
const FW = 75;
const FH = 48;
const ANIMS = {
    idle: {
        src: "textures/player/idle.png",
        frames: [0, 1, 2, 3],
        fps: 4,
        offsetY: 4,
    },
    walk: {
        src: "textures/player/walk.png",
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        fps: 12,
    },
    walkShoot: {
        src: "textures/player/walk-shoot.png",
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        fps: 12,
    },
    jump: {
        src: "textures/player/jump.png",
        frames: [0, 1, 2],
        fps: 10,
        offsetY: 24,
    },
    jumpShoot: {
        src: "textures/player/jump-shoot.png",
        frames: [3],
        fps: 10,
        offsetY: 2,
    },
    shoot: { src: "textures/player/walk-shoot.png", frames: [7], fps: 12 },
    crouch: {
        src: "textures/player/crouch.png",
        frames: [0, 1, 2, 3, 4, 5],
        fps: 10,
    },
};

const _imgs = {};
let _jumpStartTime = null;
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

function ensureImgs() {
    for (const [key, anim] of Object.entries(ANIMS)) {
        if (!_imgs[key]) {
            const img = new Image();
            img.src = anim.src;
            _imgs[key] = img;
        }
    }
}

function getAnimKey(player) {
    if (player.crouch) {
        return "crouch";
    }
    const airborne = player.onGroundId === null && !player.onGroundType;
    if (airborne || player.isJumping) {
        return player.shooting ? "jumpShoot" : "jump";
    }
    if (player.shooting) {
        return Math.abs(player.vx) > 0.5 ? "walkShoot" : "shoot";
    }
    if (Math.abs(player.vx) > 0.5) {
        return "walk";
    }
    return "idle";
}

export const DefaultPlayerRenderer = {
    draw: (ctx, player, debug = false) => {
        ensureImgs();

        const animKey = getAnimKey(player);
        const anim = ANIMS[animKey];
        const img = _imgs[animKey];
        if (!img?.complete || !img.naturalWidth) {
            return;
        }

        const isJumpAnim = animKey === "jump" || animKey === "jumpShoot";
        if (isJumpAnim) {
            if (_lastAnimKey !== "jump" && _lastAnimKey !== "jumpShoot") {
                _jumpStartTime = Date.now();
            }
        }
        _lastAnimKey = animKey;

        let fi;
        if (isJumpAnim) {
            const elapsed = Date.now() - (_jumpStartTime ?? Date.now());
            fi = Math.min(
                Math.floor(elapsed / (1000 / anim.fps)),
                anim.frames.length - 1,
            );
        } else if (animKey === "crouch" && Math.abs(player.vx) <= 0.5) {
            fi = 0;
        } else {
            fi =
                Math.floor(Date.now() / (1000 / anim.fps)) % anim.frames.length;
        }
        fi = anim.frames[fi];
        const dw = FW * SCALE;
        const dh = FH * SCALE;

        const isCrouch = animKey === "crouch";
        // Sprite is drawn wider than hitbox; shift it forward so it aligns with the front.
        // facing right → shift left (negative), facing left → shift right (positive).
        const crouchOffsetX = isCrouch
            ? player.facing === "left"
                ? 18
                : -18
            : 0;

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(
            player.x + player.w / 2 + crouchOffsetX,
            player.y + player.h,
        );
        if (player.facing === "left") {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(
            img,
            fi * FW,
            0,
            FW,
            FH,
            -dw / 2,
            -dh + (anim.offsetY ?? 0),
            dw,
            dh,
        );

        if (player.isHit) {
            const outlineSize = 3;
            const drawX = -dw / 2;
            const drawY = -dh + (anim.offsetY ?? 0);

            const { canvas: offCanvas, ctx: offCtx } = getOffCanvas(dw, dh);
            offCtx.clearRect(0, 0, dw, dh);
            offCtx.imageSmoothingEnabled = false;
            offCtx.drawImage(img, fi * FW, 0, FW, FH, 0, 0, dw, dh);
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

            // Redraw original sprite on top of the outline
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, fi * FW, 0, FW, FH, drawX, drawY, dw, dh);
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

/**
 * Simplified hitbox rendering mode for physics debugging
 */
export const DebugBoxPlayerRenderer = {
    draw: (ctx, player) => {
        ctx.save();

        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(player.x, player.y, player.w, player.h);

        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x, player.y, player.w, player.h);

        // Direction dot
        ctx.fillStyle = "yellow";
        const eyeOff = player.facing === "left" ? 0 : player.w - 4;
        ctx.fillRect(player.x + eyeOff, player.y + 4, 4, 4);

        ctx.restore();
    },
};
