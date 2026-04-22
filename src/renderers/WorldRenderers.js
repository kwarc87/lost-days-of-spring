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
    const srcW = item.w ?? img.naturalWidth;
    const srcH = item.h ?? img.naturalHeight;

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

    ctx.imageSmoothingEnabled = prev;
}

export const DefaultWorldRenderer = {
    drawEnvironmentItem(ctx, item) {
        return drawEnvironmentItem(ctx, item);
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
};
