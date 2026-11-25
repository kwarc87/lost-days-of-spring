import { GameFactory } from "../factories/GameFactory.js";
import { getImg } from "../utils/imgCache.js";

// Draws an image scaled to canvas height, tiled horizontally with parallax.
function drawLayer(ctx, img, cw, ch, cameraX, parallax) {
    if (!img.complete || img.naturalWidth === 0) {
        return;
    }
    const drawH = ch;
    const drawW = Math.round(img.naturalWidth * (ch / img.naturalHeight));
    const ox = Math.floor(((((-cameraX * parallax) % drawW) + drawW) % drawW) - drawW);
    for (let x = ox; x < cw; x += drawW) {
        ctx.drawImage(img, x, 0, drawW, drawH);
    }
}

const TERMINAL_ARROW_COLOR = "#72eb84";
const TERMINAL_ARROW_PX = GameFactory.SCALE;
const TERMINAL_ARROW_OFFSET_X = 4 * GameFactory.SCALE;
const TERMINAL_ARROW_OFFSET_Y = 4 * GameFactory.SCALE;

const TERMINAL_ARROWS = {
    up: [
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    down: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
    ],
    left: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    right: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
};

function drawTerminalArrow(ctx, item) {
    const pattern = TERMINAL_ARROWS[item.direction];
    if (!pattern) {
        return;
    }
    const baseX = Math.round(item.x) + TERMINAL_ARROW_OFFSET_X;
    const baseY = Math.round(item.y) + TERMINAL_ARROW_OFFSET_Y;
    const px = TERMINAL_ARROW_PX;
    ctx.fillStyle = TERMINAL_ARROW_COLOR;
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col]) {
                ctx.fillRect(baseX + col * px, baseY + row * px, px, px);
            }
        }
    }
}

// Draws a single environment item in world space
function drawEnvironmentItem(ctx, item) {
    const prev = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    const img = getImg(item.url);
    if (!img.complete || img.naturalWidth === 0) {
        ctx.imageSmoothingEnabled = prev;
        return;
    }

    const srcX = item.cordX ?? 0;
    const srcY = item.cordY ?? 0;

    // w/h are stored as world pixels (pre-scaled); derive source dims by dividing back.
    const drawW = Math.round(item.w);
    const drawH = Math.round(item.h);
    const srcW = Math.round(drawW / GameFactory.SCALE);
    const srcH = Math.round(drawH / GameFactory.SCALE);
    const cols = item.repeatX ?? 1;
    const rows = item.repeatY ?? 1;
    const contrast = item.contrast ?? 1;
    const opacity = item.opacity ?? 1;
    const rotate = item.rotate ?? 0;

    const baseX = Math.round(item.x);
    const baseY = Math.round(item.y);

    ctx.save();
    if (contrast !== 1) {
        ctx.filter = `contrast(${contrast})`;
    }
    if (opacity !== 1) {
        ctx.globalAlpha = opacity;
    }

    // repeatX/repeatY may be fractional: the last cell of a row/column is then cropped.
    for (let row = 0; row < rows; row++) {
        const rowShare = Math.min(1, rows - row);
        const cellH = drawH * rowShare;
        const cellSrcH = Math.round(srcH * rowShare);
        for (let col = 0; col < cols; col++) {
            const colShare = Math.min(1, cols - col);
            const cellW = drawW * colShare;
            const cellSrcW = Math.round(srcW * colShare);
            const dx = baseX + col * drawW;
            const dy = baseY + row * drawH;
            if (rotate !== 0) {
                ctx.save();
                ctx.translate(dx + cellW / 2, dy + cellH / 2);
                ctx.rotate((rotate * Math.PI) / 180);
                ctx.drawImage(
                    img,
                    srcX,
                    srcY,
                    cellSrcW,
                    cellSrcH,
                    -cellW / 2,
                    -cellH / 2,
                    cellW,
                    cellH
                );
                ctx.restore();
            } else {
                ctx.drawImage(img, srcX, srcY, cellSrcW, cellSrcH, dx, dy, cellW, cellH);
            }
        }
    }

    ctx.restore();

    ctx.imageSmoothingEnabled = prev;
}

const WAVE_AMPLITUDE_SRC_PX = 1;
// Two waves travelling in opposite directions (different speed and length) cancel out each
// other's net drift, so the surface looks like a pool instead of a flowing river.
const WAVE_A = { speed: 0.003, frequency: 0.4 }; // speed: radians per ms; frequency: radians per source pixel column
const WAVE_B = { speed: -0.002, frequency: 0.27 };

// Draws a repeated tile as 1-source-pixel-wide strips, each shifted vertically by the average of
// two sines (time + world column). Because the phase depends on the world column, the wave is
// continuous across tiles. Only strips inside the camera view are drawn.
function drawWaveItem(ctx, item, now, camera) {
    const img = getImg(item.url);
    if (!img.complete || img.naturalWidth === 0) {
        return;
    }

    const scale = GameFactory.SCALE;
    const baseX = Math.round(item.x);
    const baseY = Math.round(item.y);
    const tileSrcW = Math.round(item.w / scale);
    const tileSrcH = Math.round(item.h / scale);
    const totalCols = tileSrcW * (item.repeatX ?? 1);
    const worldColOffset = Math.round(baseX / scale);
    const firstCol = Math.max(0, Math.floor((camera.x - baseX) / scale));
    const lastCol = Math.min(totalCols - 1, Math.ceil((camera.x + camera.width - baseX) / scale));

    const prevSmoothing = ctx.imageSmoothingEnabled;
    const prevAlpha = ctx.globalAlpha;
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = prevAlpha * (item.opacity ?? 1);

    const srcX = item.cordX ?? 0;
    const srcY = item.cordY ?? 0;
    for (let col = firstCol; col <= lastCol; col++) {
        const worldCol = worldColOffset + col;
        const waveHeight =
            (Math.sin(now * WAVE_A.speed + worldCol * WAVE_A.frequency) +
                Math.sin(now * WAVE_B.speed + worldCol * WAVE_B.frequency)) /
            2;
        const offsetY =
            (Math.round(waveHeight * WAVE_AMPLITUDE_SRC_PX) + WAVE_AMPLITUDE_SRC_PX) * scale;
        ctx.drawImage(
            img,
            srcX + (col % tileSrcW),
            srcY,
            1,
            tileSrcH,
            baseX + col * scale,
            baseY + offsetY,
            scale,
            item.h
        );
    }

    ctx.globalAlpha = prevAlpha;
    ctx.imageSmoothingEnabled = prevSmoothing;
}

export const DefaultWorldRenderer = {
    drawSolidBackground(ctx, item, color) {
        const totalW = Math.round(item.w) * (item.repeatX ?? 1);
        const totalH = Math.round(item.h) * (item.repeatY ?? 1);
        ctx.fillStyle = color;
        ctx.fillRect(item.x, item.y, totalW, totalH);
    },
    drawEnvironmentItem(ctx, item, { now, camera } = {}) {
        if (item.solidFill) {
            this.drawSolidBackground(ctx, item, item.solidFill);
            return;
        }
        if (item.wave) {
            drawWaveItem(ctx, item, now, camera);
            return;
        }
        drawEnvironmentItem(ctx, item);
        if (item.direction) {
            drawTerminalArrow(ctx, item);
        }
    },
    drawParallaxEnvironmentItem(ctx, item, { camera } = {}) {
        const ox = Math.round(camera.x * (1 - (item.parallaxX ?? 1)));
        const oy = Math.round(camera.y * (1 - (item.parallaxY ?? 1)));
        ctx.save();
        ctx.translate(ox, oy);
        if (item.solidFill) {
            this.drawSolidBackground(ctx, item, item.solidFill);
            ctx.restore();
            return;
        }
        drawEnvironmentItem(ctx, item);
        if (item.direction) {
            drawTerminalArrow(ctx, item);
        }
        ctx.restore();
    },
    drawBackground(ctx, canvas, camera) {
        const cw = canvas.width;
        const ch = canvas.height;
        const planet = getImg("textures/background/background.png");
        const forrest = getImg("textures/background/middleground.png");

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);

        const prev = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;

        // Layer 1 - background
        drawLayer(ctx, planet, cw, ch, camera.x, 0.01);
        // Layer 2 - forrest
        drawLayer(ctx, forrest, cw, ch, camera.x, 0.04);

        ctx.imageSmoothingEnabled = prev;
    },

    drawMapBackground(ctx, canvas, worldSize) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(canvas.width / worldSize.width, canvas.height / worldSize.height);
        const offsetX = (canvas.width - worldSize.width * scale) / 2;
        const offsetY = (canvas.height - worldSize.height * scale) / 2;
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
    },

    drawMapUndiscoveredMask(ctx, worldSize, mapDiscovery) {
        if (!mapDiscovery) {
            return;
        }

        ctx.save();
        const t = ctx.getTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = "#000";
        mapDiscovery.forEachUndiscoveredCell((x, y, w, h) => {
            const sx1 = Math.round(t.e + x * t.a);
            const sy1 = Math.round(t.f + y * t.d);
            const sx2 = Math.round(t.e + (x + w) * t.a);
            const sy2 = Math.round(t.f + (y + h) * t.d);
            ctx.fillRect(sx1, sy1, sx2 - sx1, sy2 - sy1);
        });
        ctx.restore();
    },
};
