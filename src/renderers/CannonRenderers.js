import { getImg } from "../utils/imgCache.js";

const SPRITE_URL = "textures/tilesets.png";
const SRC_X = 29;
const SRC_Y = 190;
const SRC_W = 32;
const SRC_H = 32;
const DST_W = 128;
const DST_H = 128;

export const CannonRenderer = {
    drawMapCannon: (ctx, cannon) => {
        const x = Math.round(cannon.x);
        const y = Math.round(cannon.y);
        const { w, h } = cannon;

        ctx.fillStyle = "#C1311B";
        ctx.fillRect(x, y, w, h);
    },

    draw: (ctx, cannon) => {
        const img = getImg(SPRITE_URL);
        if (!img?.complete || !img.naturalWidth) {
            return;
        }

        const x = Math.round(cannon.x);
        const y = Math.round(cannon.y);

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, SRC_X, SRC_Y, SRC_W, SRC_H, x, y, DST_W, DST_H);

        const ex = x + 64;
        const ey = y + 100;
        const color = cannon.color ?? "#35fffd";

        // 1. Full shape in main color
        ctx.fillStyle = color;
        ctx.fillRect(ex - 12, ey - 8, 25, 4);
        ctx.fillRect(ex - 16, ey - 4, 33, 4);
        ctx.fillRect(ex - 16, ey, 33, 4);
        ctx.fillRect(ex - 12, ey + 4, 25, 4);
        ctx.fillRect(ex - 8, ey + 8, 17, 4);

        // 2. Darken full shape → creates the border color
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(ex - 12, ey - 8, 25, 4);
        ctx.fillRect(ex - 16, ey - 4, 33, 4);
        ctx.fillRect(ex - 16, ey, 33, 4);
        ctx.fillRect(ex - 12, ey + 4, 25, 4);
        ctx.fillRect(ex - 8, ey + 8, 17, 4);

        // 3. Restore inner fill (inset 3px left/right, skip top+bottom rows)
        ctx.fillStyle = color;
        ctx.fillRect(ex - 12, ey - 4, 25, 4);
        ctx.fillRect(ex - 12, ey, 25, 4);
        ctx.fillRect(ex - 8, ey + 4, 17, 4);

        ctx.restore();
    },
};

export const CannonBulletRenderer = {
    draw: (ctx, bullet) => {
        ctx.save();
        ctx.imageSmoothingEnabled = false;

        const x = Math.round(bullet.x);
        const y = Math.round(bullet.y);
        const { w, h } = bullet;
        const color = bullet.color ?? "#e84855";

        // Drop shadow
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(x + 1, y + 1, w, h);

        // Main body
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);

        // Shading — bottom and right edge strip
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(x, y + h - 2, w, 2);
        ctx.fillRect(x + w - 2, y, 2, h);

        // Highlight — top-left corner
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(x, y, 2, 2);

        ctx.restore();
    },
};
