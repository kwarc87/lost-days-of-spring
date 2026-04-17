const platformCaves = {
    ground: {
        path: "textures/tilesets.png",
        tileWidthSrc: 16,
        tileHeightSrc: 16,
        scale: 3,
        sprites: {
            tLeft: { x: 208, y: 112, padLeft: 4, padTop: 5 },
            tMid: [
                { x: 224, y: 112, padTop: 5 },
                { x: 240, y: 112, padTop: 5 },
            ],
            tRight: { x: 256, y: 112, padRight: 4, padTop: 5 },

            left: [
                { x: 208, y: 128, padLeft: 4 },
                { x: 208, y: 144, padLeft: 4 },
            ],
            mid: { x: 224, y: 128 },

            right: [
                { x: 256, y: 128, padRight: 4 },
                { x: 256, y: 144, padRight: 4 },
            ],

            bLeft: { x: 208, y: 162, padLeft: 4, padBottom: 8 },
            bMid: [
                { x: 224, y: 162, padBottom: 8 },
                { x: 240, y: 162, padBottom: 8 },
            ],
            bRight: { x: 256, y: 162, padRight: 4, padBottom: 8 },
        },
    },
    board: {
        path: "textures/tilesets.png",
        tileWidthSrc: 16,
        tileHeightSrc: 16,
        scale: 3,
        sprites: {
            tLeft: { x: 32, y: 16 },
            tMid: { x: 128, y: 16 },
            tRight: { x: 96, y: 16 },
            left: { x: 32, y: 16 },
            mid: { x: 128, y: 16 },
            right: { x: 96, y: 16 },
            bLeft: { x: 32, y: 16 },
            bMid: { x: 128, y: 16 },
            bRight: { x: 96, y: 16 },
        },
    },
    booster: {
        path: "textures/tilesets.png",
        tileWidthSrc: 16,
        tileHeightSrc: 16,
        scale: 3,
        sprites: {
            tLeft: { x: 208, y: 16, padLeft: 6 },
            tMid: { x: 176, y: 16 },
            tRight: { x: 272, y: 16, padRight: 6 },
            left: { x: 208, y: 16, padLeft: 6 },
            mid: { x: 176, y: 16 },
            right: { x: 272, y: 16, padRight: 6 },
            bLeft: { x: 208, y: 16, padLeft: 6 },
            bMid: { x: 176, y: 16 },
            bRight: { x: 272, y: 16, padRight: 6 },
        },
    },
    metal: {
        path: "textures/tilesets.png",
        tileWidthSrc: 16,
        tileHeightSrc: 16,
        scale: 3,
        sprites: {
            tLeft: { x: 336, y: 128 },
            tMid: [
                { x: 336, y: 128 },
                { x: 352, y: 128 },
            ],
            tRight: { x: 352, y: 128 },

            left: { x: 336, y: 144 },
            mid: [
                { x: 336, y: 144 },
                { x: 352, y: 144 },
            ],
            right: { x: 352, y: 144 },

            bLeft: { x: 336, y: 144 },
            bMid: [
                { x: 336, y: 144 },
                { x: 352, y: 144 },
            ],
            bRight: { x: 352, y: 144 },
        },
    },
};

const _imgCache = {};

function getImg(path) {
    if (!_imgCache[path]) {
        const img = new Image();
        img.src = path;
        _imgCache[path] = img;
    }
    return _imgCache[path];
}

function getTileKey(col, row, cols, rows) {
    const isLeft = col === 0;
    const isRight = col === cols - 1;
    const isTop = row === 0;
    const isBottom = row === rows - 1;

    if (isTop) {
        if (isLeft) {
            return "tLeft";
        }
        if (isRight) {
            return "tRight";
        }
        return "tMid";
    }

    if (isBottom) {
        if (isLeft) {
            return "bLeft";
        }
        if (isRight) {
            return "bRight";
        }
        return "bMid";
    }

    if (isLeft) {
        return "left";
    }
    if (isRight) {
        return "right";
    }
    return "mid";
}

function pickSpriteVariant(spriteDef, key, col, row) {
    if (!Array.isArray(spriteDef)) {
        return spriteDef;
    }
    if (spriteDef.length === 0) {
        return null;
    }
    const idx = key === "left" || key === "right" ? row : col;
    return spriteDef[idx % spriteDef.length];
}

function drawSprite(
    ctx,
    img,
    sprite,
    tileWidthSrc,
    tileHeightSrc,
    scale,
    dxBase,
    dyBase,
) {
    const pT = sprite.padTop ?? 0;
    const pB = sprite.padBottom ?? 0;
    const pL = sprite.padLeft ?? 0;
    const pR = sprite.padRight ?? 0;

    const sx = sprite.x - pL;
    const sy = sprite.y - pT;
    const sw = tileWidthSrc + pL + pR;
    const sh = tileHeightSrc + pT + pB;

    const dx = dxBase - pL * scale;
    const dy = dyBase - pT * scale;
    const dw = sw * scale;
    const dh = sh * scale;

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawTiled(ctx, platform, def, showDebug) {
    const { x, y, w, h } = platform;

    if (!def || !def.sprites || w <= 0 || h <= 0) {
        return;
    }

    const img = getImg(def.path);
    const tileWidthSrc = def.tileWidthSrc;
    const tileHeightSrc = def.tileHeightSrc;
    const scale = def.scale ?? 1;

    const tileWidth = tileWidthSrc * scale;
    const tileHeight = tileHeightSrc * scale;

    const cols = Math.ceil(w / tileWidth);
    const rows = Math.ceil(h / tileHeight);

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (img.complete && img.naturalWidth) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const key = getTileKey(col, row, cols, rows);
                const spriteDef = def.sprites[key];

                if (!spriteDef) {
                    continue;
                }

                const sprite = pickSpriteVariant(spriteDef, key, col, row);

                if (!sprite) {
                    continue;
                }

                const dxBase = x + col * tileWidth;
                const dyBase = y + row * tileHeight;

                drawSprite(
                    ctx,
                    img,
                    sprite,
                    tileWidthSrc,
                    tileHeightSrc,
                    scale,
                    dxBase,
                    dyBase,
                );
            }
        }
    }

    ctx.restore();

    if (showDebug) {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
    }
}

export const DefaultPlatformRenderer = {
    draw(ctx, platform, showDebug) {
        drawTiled(
            ctx,
            platform,
            platformCaves[platform.layout] ?? platformCaves.ground,
            showDebug,
        );
    },
};
