import { GameFactory } from "../factories/GameFactory.js";
import { getImg } from "../utils/imgCache.js";

// Draws an image scaled to canvas height, tiled horizontally with parallax.
function drawLayer(ctx, img, cw, ch, cameraX, parallax) {
    if (!img.complete || img.naturalWidth === 0) {
        return;
    }
    const drawH = ch;
    const drawW = Math.round(img.naturalWidth * (ch / img.naturalHeight));
    const ox = Math.floor(
        ((((-cameraX * parallax) % drawW) + drawW) % drawW) - drawW,
    );
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

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const dx = baseX + col * drawW;
            const dy = baseY + row * drawH;
            if (rotate !== 0) {
                ctx.save();
                ctx.translate(dx + drawW / 2, dy + drawH / 2);
                ctx.rotate((rotate * Math.PI) / 180);
                ctx.drawImage(
                    img,
                    srcX,
                    srcY,
                    srcW,
                    srcH,
                    -drawW / 2,
                    -drawH / 2,
                    drawW,
                    drawH,
                );
                ctx.restore();
            } else {
                ctx.drawImage(
                    img,
                    srcX,
                    srcY,
                    srcW,
                    srcH,
                    dx,
                    dy,
                    drawW,
                    drawH,
                );
            }
        }
    }

    ctx.restore();

    ctx.imageSmoothingEnabled = prev;
}

export const DefaultWorldRenderer = {
    drawSolidBackground(ctx, item, color) {
        const totalW = Math.round(item.w) * (item.repeatX ?? 1);
        const totalH = Math.round(item.h) * (item.repeatY ?? 1);
        ctx.fillStyle = color;
        ctx.fillRect(item.x, item.y, totalW, totalH);
    },
    drawEnvironmentItem(ctx, item) {
        if (item.solidFill) {
            this.drawSolidBackground(ctx, item, item.solidFill);
            return;
        }
        drawEnvironmentItem(ctx, item);
        if (item.direction) {
            drawTerminalArrow(ctx, item);
        }
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

        const scale = Math.min(
            canvas.width / worldSize.width,
            canvas.height / worldSize.height,
        );
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
