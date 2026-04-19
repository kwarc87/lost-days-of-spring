import {
    repeatHorizontal3x3,
    repeatAllTiles3x3,
    topCap3x3,
    bottomCap3x3,
    leftCap3x3,
    rightCap3x3,
    topLeftEdgeCap3x3,
    topRightEdgeCap3x3,
    leftBottomEdgeCap3x3,
    leftTopEdgeCap3x3,
    rightBottomEdgeCap3x3,
    rightTopEdgeCap3x3,
} from "./PlatformHelpers.js";

const BASE_TILESET = {
    path: "textures/tilesets.png",
    tileWidthSrc: 16,
    tileHeightSrc: 16,
    scale: 3,
};

const GROUND_FULL = {
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
};

const platformCaves = {
    ground: {
        ...BASE_TILESET,
        sprites: GROUND_FULL,
    },

    groundTopCap: {
        ...BASE_TILESET,
        sprites: topCap3x3(GROUND_FULL),
    },
    groundBottomCap: {
        ...BASE_TILESET,
        sprites: bottomCap3x3(GROUND_FULL),
    },
    groundLeftCap: {
        ...BASE_TILESET,
        sprites: leftCap3x3(GROUND_FULL),
    },
    groundRightCap: {
        ...BASE_TILESET,
        sprites: rightCap3x3(GROUND_FULL),
    },

    groundTopLeftEdgeCap: {
        ...BASE_TILESET,
        sprites: topLeftEdgeCap3x3(GROUND_FULL),
    },
    groundTopRightEdgeCap: {
        ...BASE_TILESET,
        sprites: topRightEdgeCap3x3(GROUND_FULL),
    },

    groundLeftBottomEdgeCap: {
        ...BASE_TILESET,
        sprites: leftBottomEdgeCap3x3(GROUND_FULL),
    },
    groundLeftTopEdgeCap: {
        ...BASE_TILESET,
        sprites: leftTopEdgeCap3x3(GROUND_FULL),
    },

    groundRightBottomEdgeCap: {
        ...BASE_TILESET,
        sprites: rightBottomEdgeCap3x3(GROUND_FULL),
    },
    groundRightTopEdgeCap: {
        ...BASE_TILESET,
        sprites: rightTopEdgeCap3x3(GROUND_FULL),
    },

    board: {
        ...BASE_TILESET,
        sprites: repeatHorizontal3x3(
            { x: 32, y: 16 },
            { x: 128, y: 16 },
            { x: 96, y: 16 },
        ),
    },
    boardRightCap: {
        ...BASE_TILESET,
        sprites: repeatHorizontal3x3(
            { x: 128, y: 16 },
            { x: 128, y: 16 },
            { x: 96, y: 16 },
        ),
    },
    boardLeftCap: {
        ...BASE_TILESET,
        sprites: repeatHorizontal3x3(
            { x: 32, y: 16 },
            { x: 128, y: 16 },
            { x: 128, y: 16 },
        ),
    },
    boardConnector: {
        ...BASE_TILESET,
        sprites: repeatAllTiles3x3({ x: 128, y: 16 }),
    },
    booster: {
        ...BASE_TILESET,
        sprites: repeatHorizontal3x3(
            { x: 208, y: 16, padLeft: 6 },
            { x: 176, y: 16 },
            { x: 272, y: 16, padRight: 6 },
        ),
    },
    // only 2 units height is allowed
    metal: {
        ...BASE_TILESET,
        sprites: {
            tLeft: { x: 336, y: 128 },
            tMid: [
                { x: 336, y: 128 },
                { x: 352, y: 128 },
            ],
            tRight: { x: 352, y: 128 },

            // mid section is just a solid color placeholder
            left: { x: 224, y: 128 },
            mid: [
                { x: 224, y: 128 },
                { x: 224, y: 128 },
            ],
            right: { x: 224, y: 128 },

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
