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
    horizontalConnector3x3,
    verticalConnector3x3,
} from "./PlatformHelpers.js";
import { getImg } from "../utils/imgCache.js";

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
    groundHorizontalConnector: {
        ...BASE_TILESET,
        sprites: horizontalConnector3x3(GROUND_FULL),
    },
    groundVerticalConnector: {
        ...BASE_TILESET,
        sprites: verticalConnector3x3(GROUND_FULL),
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
    brick: {
        ...BASE_TILESET,
        path: "textures/tilesets-2.png",
        sprites: repeatHorizontal3x3(
            { x: 64, y: 0 },
            [
                { x: 64, y: 0 },
                { x: 80, y: 0 },
            ],
            { x: 80, y: 0 },
        ),
    },
    // only 2 units size is allowed
    metal: {
        ...BASE_TILESET,
        tileWidthSrc: 32,
        tileHeightSrc: 32,
        sprites: repeatAllTiles3x3({ x: 336, y: 128 }),
    },
};

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
        if (platform.id != null) {
            ctx.font = "bold 24px monospace";
            ctx.fillStyle = "white";
            ctx.fillText(platform.id, x + 2, y + h - 2);
        }
        ctx.restore();
    }
}

const MAP_COLORS = {
    solid: "#6d5ad9",
    booster: "#e81c9c",
    elevator: "#710952",
};

function drawSimpleTiled(ctx, platform) {
    const color = MAP_COLORS[platform.type];
    if (!color) {
        return;
    }
    ctx.fillStyle = color;
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
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
    drawMap(ctx, platform) {
        drawSimpleTiled(ctx, platform);
    },
};
