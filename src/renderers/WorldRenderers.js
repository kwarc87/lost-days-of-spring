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

// Draws a single bgItem.
// If item.parallaxX or item.parallaxY is provided (number), the item is drawn
// in screen space with independent per-axis parallax offsets.
// If neither is set the item is drawn in world space (ctx already translated).
function drawBgItem(ctx, item, camera) {
    const img = loadImg(item.url, item.url);
    if (!img.complete || img.naturalWidth === 0) {
        return;
    }

    const drawW = Math.round(img.naturalWidth * item.scale);
    const drawH = Math.round(img.naturalHeight * item.scale);
    const cols = item.repeatX ?? 1;
    const rows = item.repeatY ?? 1;
    const contrast = item.contrast ?? 1;
    const opacity = item.opacity ?? 1;
    const rotate = item.rotate ?? 0;
    const px = item.parallaxX ?? null;
    const py = item.parallaxY ?? null;

    const hasParallax = px !== null || py !== null;

    // Base X/Y: screen-space with per-axis parallax, or world-space.
    const baseX = hasParallax
        ? item.x - Math.round(camera.x * (px ?? 1))
        : item.x;
    const baseY = hasParallax
        ? item.y - Math.round(camera.y * (py ?? 1)) - drawH
        : item.y - drawH;

    ctx.save();
    if (contrast !== 1) {
        ctx.filter = `contrast(${contrast})`;
    }
    if (opacity !== 1) {
        ctx.globalAlpha = opacity;
    }

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cx = baseX + col * drawW + drawW / 2;
            const cy = baseY + row * drawH + drawH / 2;
            if (rotate !== 0) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate((rotate * Math.PI) / 180);
                ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
                ctx.restore();
            } else {
                ctx.drawImage(
                    img,
                    baseX + col * drawW,
                    baseY + row * drawH,
                    drawW,
                    drawH,
                );
            }
        }
    }

    ctx.restore();
}

export const DefaultWorldRenderer = {
    drawBackground(ctx, canvas, camera, bgItems = []) {
        const cw = canvas.width;
        const ch = canvas.height;
        const blueBack = loadImg(
            "blueBack",
            "textures/background/blue-back.png",
        );
        const blueStars = loadImg(
            "blueStars",
            "textures/background/blue-stars.png",
        );

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);

        const prev = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;

        // Layer 1 - nebula sky
        drawLayer(ctx, blueBack, cw, ch, camera.x, 0.02);
        // Layer 2 - stars, slower
        drawLayer(ctx, blueStars, cw, ch, camera.x, 0.005);

        ctx.imageSmoothingEnabled = prev;

        // Background items — pixel-perfect (no smoothing).
        // Items with parallaxX or parallaxY are drawn in screen space; others in world space.
        ctx.imageSmoothingEnabled = false;
        const parallaxItems = bgItems.filter(
            (i) =>
                (i.parallaxX !== null && i.parallaxX !== undefined) ||
                (i.parallaxY !== null && i.parallaxY !== undefined),
        );
        const worldItems = bgItems.filter(
            (i) =>
                (i.parallaxX === null || i.parallaxX === undefined) &&
                (i.parallaxY === null || i.parallaxY === undefined),
        );

        for (const item of parallaxItems) {
            drawBgItem(ctx, item, camera);
        }

        if (worldItems.length > 0) {
            ctx.save();
            ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
            for (const item of worldItems) {
                drawBgItem(ctx, item, camera);
            }
            ctx.restore();
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
