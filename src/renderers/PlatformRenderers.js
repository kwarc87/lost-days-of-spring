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
        midFill: "#3b1158",
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
    metalSmall: {
        ...BASE_TILESET,
        tileWidthSrc: 16,
        tileHeightSrc: 16,
        sprites: repeatAllTiles3x3({ x: 336, y: 96 }),
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

function drawSprite(ctx, img, sprite, def, dxBase, dyBase) {
    const { tileWidthSrc, tileHeightSrc, scale } = def;
    const pT = sprite.padTop ?? 0;
    const pB = sprite.padBottom ?? 0;
    const pL = sprite.padLeft ?? 0;
    const pR = sprite.padRight ?? 0;
    ctx.drawImage(
        img,
        sprite.x - pL,
        sprite.y - pT,
        tileWidthSrc + pL + pR,
        tileHeightSrc + pT + pB,
        dxBase - pL * scale,
        dyBase - pT * scale,
        (tileWidthSrc + pL + pR) * scale,
        (tileHeightSrc + pT + pB) * scale,
    );
}

// Returns the first and last tile indices (inclusive) visible in the viewport
// for a given axis. Expands by camera.margin on each side.
function cullRange(
    cameraPos,
    cameraSize,
    margin,
    platformPos,
    tileSize,
    count,
) {
    const viewMin = cameraPos - margin;
    const viewMax = cameraPos + cameraSize + margin;
    const start = Math.max(0, Math.floor((viewMin - platformPos) / tileSize));
    const end = Math.min(
        count - 1,
        Math.floor((viewMax - platformPos) / tileSize) + 1,
    );
    return { start, end };
}

function drawTiled(ctx, platform, def, showDebug, camera) {
    const { w, h } = platform;
    if (!def?.sprites || w <= 0 || h <= 0) {
        return;
    }

    const x = Math.round(platform.x);
    const y = Math.round(platform.y);
    const { tileWidthSrc, tileHeightSrc, scale = 1 } = def;
    const tileWidth = tileWidthSrc * scale;
    const tileHeight = tileHeightSrc * scale;
    const cols = Math.ceil(w / tileWidth);
    const rows = Math.ceil(h / tileHeight);

    const margin = camera?.margin ?? 0;
    const camX = camera?.x ?? 0;
    const camY = camera?.y ?? 0;
    const camW = camera?.width ?? ctx.canvas.width;
    const camH = camera?.height ?? ctx.canvas.height;

    const { start: startCol, end: endCol } = cullRange(
        camX,
        camW,
        margin,
        x,
        tileWidth,
        cols,
    );
    const { start: startRow, end: endRow } = cullRange(
        camY,
        camH,
        margin,
        y,
        tileHeight,
        rows,
    );

    const img = getImg(def.path);
    const imgReady = img.complete && img.naturalWidth > 0;
    if (!def.midFill && !imgReady) {
        return;
    }

    // Avoid ctx.save()/restore() — manually track only what we change.
    const prevSmoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    // --- Interior fill (single call instead of N×M per-tile calls) ---
    if (def.midFill && cols >= 3 && rows >= 3) {
        const c0 = Math.max(1, startCol);
        const c1 = Math.min(cols - 2, endCol);
        const r0 = Math.max(1, startRow);
        const r1 = Math.min(rows - 2, endRow);
        if (c0 <= c1 && r0 <= r1) {
            ctx.fillStyle = def.midFill;
            ctx.fillRect(
                x + c0 * tileWidth,
                y + r0 * tileHeight,
                (c1 - c0 + 1) * tileWidth,
                (r1 - r0 + 1) * tileHeight,
            );
        }
    }

    // --- Border tiles ---
    if (imgReady) {
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const key = getTileKey(col, row, cols, rows);
                if (key === "mid" && def.midFill) {
                    continue;
                }

                const spriteDef = def.sprites[key];
                if (!spriteDef) {
                    continue;
                }

                const sprite = pickSpriteVariant(spriteDef, key, col, row);
                if (!sprite) {
                    continue;
                }

                drawSprite(
                    ctx,
                    img,
                    sprite,
                    def,
                    x + col * tileWidth,
                    y + row * tileHeight,
                );
            }
        }
    }

    ctx.imageSmoothingEnabled = prevSmoothing;

    // --- Debug overlay ---
    if (showDebug) {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        if (platform.id !== null && platform.id !== undefined) {
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
    draw(ctx, platform, showDebug, camera) {
        drawTiled(
            ctx,
            platform,
            platformCaves[platform.layout] ?? platformCaves.ground,
            showDebug,
            camera,
        );
    },
    drawMap(ctx, platform) {
        drawSimpleTiled(ctx, platform);
    },
};
