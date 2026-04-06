// ─── Ground texture pattern cache ────────────────────────────────────────────
let _groundImg = null;
let _groundData = null;
let _groundDataCtx = null;

function ensureGroundImg() {
    if (_groundImg) {
        return;
    }
    _groundImg = new Image();
    _groundImg.src = "textures/ldos_ground.png";
}

function buildGroundData(ctx) {
    const img = _groundImg;
    if (!img || !img.complete || img.naturalWidth === 0) {
        return null;
    }
    const tw = img.naturalWidth;
    const th = img.naturalHeight;
    const off = document.createElement("canvas");
    off.width = tw;
    off.height = th;
    const octx = off.getContext("2d");
    octx.imageSmoothingEnabled = false;
    octx.drawImage(img, 0, 0, tw, th);

    // Sample the middle pixel of the last row for the fill colour below the texture.
    const px = octx.getImageData(Math.floor(tw / 2), th - 1, 1, 1).data;
    const lastRowColor = `rgb(${px[0]},${px[1]},${px[2]})`;

    // repeat-x: tiles only horizontally, not vertically.
    const pattern = ctx.createPattern(off, "repeat-x");
    return { pattern, lastRowColor, tileH: th };
}

export const DefaultPlatformRenderer = {
    draw: (ctx, platform) => {
        ensureGroundImg();

        if (!_groundData || _groundDataCtx !== ctx) {
            _groundData = buildGroundData(ctx);
            _groundDataCtx = ctx;
        }

        const { x, y, w, h } = platform;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();

        if (_groundData) {
            const { pattern, lastRowColor, tileH } = _groundData;

            // Fill area below the texture with the last-row colour.
            if (h > tileH) {
                ctx.fillStyle = lastRowColor;
                ctx.fillRect(x, y + tileH, w, h - tileH);
            }

            // Draw texture tiled horizontally, anchored to platform top-left.
            pattern.setTransform(new DOMMatrix([1, 0, 0, 1, x, y]));
            ctx.fillStyle = pattern;
            ctx.fillRect(x, y, w, Math.min(tileH, h));
        } else {
            ctx.fillStyle = "#1e0c16";
            ctx.fillRect(x, y, w, h);
        }

        ctx.restore();

        // Dark outline
        ctx.save();
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        ctx.restore();
    },
};

/**
 * Shared helper: draws the ground texture tiled on any platform,
 * then overlays a semi-transparent tint colour on top.
 */
function drawTintedGroundPlatform(ctx, platform, tintColor, compositing) {
    ensureGroundImg();

    if (!_groundData || _groundDataCtx !== ctx) {
        _groundData = buildGroundData(ctx);
        _groundDataCtx = ctx;
    }

    const { x, y, w, h } = platform;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    if (_groundData) {
        const { pattern, lastRowColor, tileH } = _groundData;
        if (h > tileH) {
            ctx.fillStyle = lastRowColor;
            ctx.fillRect(x, y + tileH, w, h - tileH);
        }
        pattern.setTransform(new DOMMatrix([1, 0, 0, 1, x, y]));
        ctx.fillStyle = pattern;
        ctx.fillRect(x, y, w, Math.min(tileH, h));
    } else {
        ctx.fillStyle = "#1e0c16";
        ctx.fillRect(x, y, w, h);
    }

    // Tint overlay
    ctx.globalCompositeOperation = compositing;
    ctx.fillStyle = tintColor;
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = "source-over";

    ctx.restore();

    // Dark outline
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 4;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.restore();
}

/**
 * Bouncy platform renderer — ground texture with orange tint
 */
export const BouncyPlatformRenderer = {
    draw: (ctx, platform) => {
        drawTintedGroundPlatform(
            ctx,
            platform,
            "rgba(137,217,157,0.95)",
            "color",
        );
    },
};

/**
 * Booster platform renderer — ground texture with yellow tint + upward arrows
 */
export const BoosterPlatformRenderer = {
    draw: (ctx, platform) => {
        drawTintedGroundPlatform(
            ctx,
            platform,
            "rgb(242, 203, 5, 0.65)",
            "lighter",
        );

        const { x, y, w, h } = platform;
        if (h >= 16) {
            const arrowW = 12;
            const arrowH = Math.min(16, h - 8);
            const arrowCount = Math.max(1, Math.floor((w - 8) / 24));
            ctx.save();
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            for (let i = 0; i < arrowCount; i++) {
                const ax =
                    x +
                    4 +
                    Math.floor(((w - 8) / arrowCount) * i) +
                    Math.floor((w - 8) / arrowCount / 2) -
                    arrowW / 2;
                const ay = y + Math.floor((h - arrowH) / 2);
                if (arrowH >= 16) {
                    ctx.fillRect(ax + 4, ay, 4, 4);
                    ctx.fillRect(ax + 2, ay + 4, 8, 4);
                    ctx.fillRect(ax, ay + 8, 12, 4);
                    ctx.fillRect(ax + 4, ay + 12, 4, 4);
                } else {
                    ctx.fillRect(ax + 4, ay, 4, 4);
                    ctx.fillRect(ax, ay + 4, 12, 4);
                }
            }
            ctx.restore();
        }
    },
};

/**
 * Simplified hitbox rendering mode for platforms
 */
export const DebugBoxPlatformRenderer = {
    draw: (ctx, platform) => {
        ctx.save();

        ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
        ctx.fillRect(platform.x, platform.y, platform.w, platform.h);

        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);

        ctx.restore();
    },
};
