import { GameFactory } from "../factories/GameFactory.js";

// --- Background images ---
const _imgs = {};

function loadImg(key, src) {
    if (!_imgs[key]) {
        const img = new Image();
        img.src = src;
        _imgs[key] = img;
    }
    return _imgs[key];
}

// Draws an image scaled to canvas height, tiled horizontally with parallax.
function drawLayer(ctx, img, cw, ch, cameraX, parallax) {
    if (!img.complete || img.naturalWidth === 0) {
        return;
    }
    const drawH = ch;
    const drawW = Math.round(img.naturalWidth * (ch / img.naturalHeight));
    const ox = ((((-cameraX * parallax) % drawW) + drawW) % drawW) - drawW;
    for (let x = ox; x < cw; x += drawW) {
        ctx.drawImage(img, x, 0, drawW, drawH);
    }
}

// Draws a single environment item in world space
function drawEnvironmentItem(ctx, item) {
    const img = loadImg(item.url, item.url);
    if (!img.complete || img.naturalWidth === 0) {
        return;
    }

    const srcX = item.cordX ?? 0;
    const srcY = item.cordY ?? 0;
    const srcW = item.width ?? img.naturalWidth;
    const srcH = item.height ?? img.naturalHeight;

    const drawW = Math.round(srcW * GameFactory.SCALE);
    const drawH = Math.round(srcH * GameFactory.SCALE);
    const cols = item.repeatX ?? 1;
    const rows = item.repeatY ?? 1;
    const contrast = item.contrast ?? 1;
    const opacity = item.opacity ?? 1;
    const rotate = item.rotate ?? 0;

    const baseX = item.x;
    const baseY = item.y;

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
}

export const DefaultWorldRenderer = {
    drawBackground(ctx, canvas, camera) {
        const cw = canvas.width;
        const ch = canvas.height;
        const planet = loadImg(
            "blueBack",
            "textures/background/background.png",
        );
        const forrest = loadImg(
            "blueStars",
            "textures/background/middleground.png",
        );

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);

        const prev = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;

        // Layer 1 - background
        drawLayer(ctx, planet, cw, ch, camera.x, 0.005);
        // Layer 2 - forrest
        drawLayer(ctx, forrest, cw, ch, camera.x, 0.02);

        ctx.imageSmoothingEnabled = prev;
    },

    drawEnvironment(ctx, foregroundItems = []) {
        if (foregroundItems.length === 0) {
            return;
        }

        const prev = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;

        for (const item of foregroundItems) {
            drawEnvironmentItem(ctx, item);
        }

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
};
