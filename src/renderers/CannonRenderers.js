import { getImg } from "../utils/imgCache.js";

const SPRITE_URL = "textures/cannon.png";
const SRC_X = 32;
const SRC_Y = 0;
const SRC_W = 32;
const SRC_H = 32;
const DST_W = 96;
const DST_H = 96;

export const CannonRenderer = {
    drawMapCannon: (ctx, cannon) => {
        const x = Math.round(cannon.x);
        const y = Math.round(cannon.y);
        const { w, h } = cannon;
        const innerPad = Math.round(Math.min(w, h) * 0.2);

        // Outer brown square
        ctx.fillStyle = "#6b3a1f";
        ctx.fillRect(x, y, w, h);

        // Inner square in the cannon's custom color
        ctx.fillStyle = cannon.color ?? "#35fffd";
        ctx.fillRect(
            x + innerPad,
            y + innerPad,
            w - innerPad * 2,
            h - innerPad * 2,
        );
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

        const ex = x + 48;
        const ey = y + 75;
        const color = cannon.color ?? "#35fffd";

        // 1. Full shape in main color
        ctx.fillStyle = color;
        ctx.fillRect(ex - 9, ey - 6, 19, 3);
        ctx.fillRect(ex - 12, ey - 3, 25, 3);
        ctx.fillRect(ex - 12, ey, 25, 3);
        ctx.fillRect(ex - 9, ey + 3, 19, 3);
        ctx.fillRect(ex - 6, ey + 6, 13, 3);

        // 2. Darken full shape → creates the border color
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(ex - 9, ey - 6, 19, 3);
        ctx.fillRect(ex - 12, ey - 3, 25, 3);
        ctx.fillRect(ex - 12, ey, 25, 3);
        ctx.fillRect(ex - 9, ey + 3, 19, 3);
        ctx.fillRect(ex - 6, ey + 6, 13, 3);

        // 3. Restore inner fill (inset 3px left/right, skip top+bottom rows)
        ctx.fillStyle = color;
        ctx.fillRect(ex - 9, ey - 3, 19, 3);
        ctx.fillRect(ex - 9, ey, 19, 3);
        ctx.fillRect(ex - 6, ey + 3, 13, 3);

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
