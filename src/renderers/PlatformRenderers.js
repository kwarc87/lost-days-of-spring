/**
 * Default platform rendering strategy
 */
export const DefaultPlatformRenderer = {
    draw: (ctx, platform) => {
        ctx.save();

        const { x, y, w, h } = platform;
        const {
            patternColor,
            secondaryColor,
            textureColor,
            color,
            mossColor,
            mossShadowColor,
            accentColor,
            bottomLightColor = "#2a1020",
            bottomDarkColor = "#220e1a",
        } = platform;

        // --- Base fill (mortar — visible against #06010a bg) ---
        ctx.fillStyle = patternColor;
        ctx.fillRect(x, y, w, h);

        // --- Staggered bricks with crimson shadow strips ---
        for (let iy = 8; iy < h - 8; iy += 12) {
            const rowOffset = ((iy / 12) | 0) % 2 === 0 ? 0 : 14;
            for (let ix = -14; ix < w + 28; ix += 28) {
                const bx = x + ix + rowOffset;
                const drawX = Math.max(bx, x);
                const drawW = Math.min(bx + 24, x + w) - drawX;
                if (drawW <= 0) {
                    continue;
                }
                // Brick face
                ctx.fillStyle = textureColor;
                ctx.fillRect(drawX, y + iy, drawW, 8);
                // Bottom shadow strip (patternColor — same family, darker)
                ctx.fillStyle = patternColor;
                ctx.fillRect(drawX, y + iy + 6, drawW, 2);
                // Right shadow strip
                const shadowX = Math.min(bx + 22, x + w - 2);
                if (shadowX >= drawX) {
                    ctx.fillRect(shadowX, y + iy, 2, 8);
                }
            }
        }

        // --- Top cap: scarlet edge strips (contrast with bg) ---
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, 4);
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(x, y + 4, w, 4);

        // --- Bottom shadow (uses platform-defined colors) ---
        ctx.fillStyle = bottomLightColor;
        ctx.fillRect(x, y + h - 8, w, 8);
        ctx.fillStyle = bottomDarkColor;
        ctx.fillRect(x, y + h - 16, w, 8);

        // --- Sparse glowing moss drips: 1-2 per platform (deterministic) ---
        const mossCount = 1 + ((x * 7 + w) % 2 === 0 ? 1 : 0);
        const maxDripLen = Math.floor(h * 0.8) - 14; // anchor(8) + tip(6) = 14 fixed px
        for (let i = 1; i <= mossCount; i++) {
            const mossX = x + Math.floor((w / (mossCount + 1)) * i);
            const dripLen = Math.min(
                12 + (((Math.abs(x) + mossX) * 13) % 16),
                maxDripLen,
            ); // 12–28px, capped at 80% of h

            // Anchor block (12×8) with shadow
            ctx.fillStyle = mossColor;
            ctx.fillRect(mossX - 4, y, 12, 8);
            ctx.fillStyle = mossShadowColor;
            ctx.fillRect(mossX + 6, y, 2, 8); // right shadow
            ctx.fillRect(mossX - 4, y + 6, 12, 2); // bottom shadow

            // Drip body (6px wide) with right shadow
            ctx.fillStyle = mossColor;
            ctx.fillRect(mossX - 1, y + 8, 6, dripLen);
            ctx.fillStyle = mossShadowColor;
            ctx.fillRect(mossX + 3, y + 8, 2, dripLen);

            // Glow core (2px, bright teal)
            ctx.fillStyle = "#b0fff2";
            ctx.fillRect(mossX, y + 8, 2, dripLen - 4);

            // Tip drop (6×6) with bottom shadow
            ctx.fillStyle = mossColor;
            ctx.fillRect(mossX - 1, y + 8 + dripLen, 6, 6);
            ctx.fillStyle = mossShadowColor;
            ctx.fillRect(mossX - 1, y + 12 + dripLen, 6, 2);
        }

        // --- Red warning accent (only on wider platforms) ---
        if (w >= 48) {
            const redX = x + w - 16;
            ctx.fillStyle = accentColor;
            ctx.fillRect(redX, y, 8, 4);
            ctx.fillStyle = "#ff9090";
            ctx.fillRect(redX + 2, y, 4, 2);
        }

        ctx.restore();
    },
};

/**
 * Bouncy platform renderer — vivid crimson/red variant of DefaultPlatformRenderer
 */
export const BouncyPlatformRenderer = {
    draw: (ctx, platform) => {
        ctx.save();

        const { x, y, w, h } = platform;
        const {
            patternColor,
            secondaryColor,
            textureColor,
            color,
            mossColor,
            mossShadowColor,
            accentColor,
            bottomLightColor = "#3a1020",
            bottomDarkColor = "#2e0e1a",
        } = platform;

        // --- Base fill ---
        ctx.fillStyle = patternColor;
        ctx.fillRect(x, y, w, h);

        // --- Staggered bricks ---
        for (let iy = 8; iy < h - 8; iy += 12) {
            const rowOffset = ((iy / 12) | 0) % 2 === 0 ? 0 : 14;
            for (let ix = -14; ix < w + 28; ix += 28) {
                const bx = x + ix + rowOffset;
                const drawX = Math.max(bx, x);
                const drawW = Math.min(bx + 24, x + w) - drawX;
                if (drawW <= 0) {
                    continue;
                }
                ctx.fillStyle = textureColor;
                ctx.fillRect(drawX, y + iy, drawW, 8);
                ctx.fillStyle = patternColor;
                ctx.fillRect(drawX, y + iy + 6, drawW, 2);
                const shadowX = Math.min(bx + 22, x + w - 2);
                if (shadowX >= drawX) {
                    ctx.fillRect(shadowX, y + iy, 2, 8);
                }
            }
        }

        // --- Top cap ---
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, 4);
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(x, y + 4, w, 4);

        // --- Left + right edge strips ---
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(x, y + 8, 4, h - 16);
        ctx.fillRect(x + w - 4, y + 8, 4, h - 16);

        // --- Bottom shadow (uses platform-defined colors) ---
        ctx.fillStyle = bottomLightColor;
        ctx.fillRect(x, y + h - 8, w, 8);
        ctx.fillStyle = bottomDarkColor;
        ctx.fillRect(x, y + h - 16, w, 8);

        // --- Sparse glowing moss drips ---
        const mossCount = 1 + ((x * 7 + w) % 2 === 0 ? 1 : 0);
        for (let i = 1; i <= mossCount; i++) {
            const mossX = x + Math.floor((w / (mossCount + 1)) * i);
            const dripLen = 12 + (((Math.abs(x) + mossX) * 13) % 16);

            ctx.fillStyle = mossColor;
            ctx.fillRect(mossX - 4, y, 12, 8);
            ctx.fillStyle = mossShadowColor;
            ctx.fillRect(mossX + 6, y, 2, 8);
            ctx.fillRect(mossX - 4, y + 6, 12, 2);

            ctx.fillStyle = mossColor;
            ctx.fillRect(mossX - 1, y + 8, 6, dripLen);
            ctx.fillStyle = mossShadowColor;
            ctx.fillRect(mossX + 3, y + 8, 2, dripLen);

            ctx.fillStyle = "#b0fff2";
            ctx.fillRect(mossX, y + 8, 2, dripLen - 4);

            ctx.fillStyle = mossColor;
            ctx.fillRect(mossX - 1, y + 8 + dripLen, 6, 6);
            ctx.fillStyle = mossShadowColor;
            ctx.fillRect(mossX - 1, y + 12 + dripLen, 6, 2);
        }

        // --- Orange accent (only on wider platforms) ---
        if (w >= 48) {
            const accX = x + w - 16;
            ctx.fillStyle = accentColor;
            ctx.fillRect(accX, y, 8, 4);
            ctx.fillStyle = "#ffb090";
            ctx.fillRect(accX + 2, y, 4, 2);
        }

        ctx.restore();
    },
};

/**
 * Booster platform renderer — warm yellow/orange, upward arrows
 */
export const BoosterPlatformRenderer = {
    draw: (ctx, platform) => {
        ctx.save();
        const { x, y, w, h } = platform;
        const { color, secondaryColor, textureColor, patternColor, mossColor } =
            platform;

        // Base fill
        ctx.fillStyle = textureColor;
        ctx.fillRect(x, y, w, h);

        // Left/right edge — warm lighter strip
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(x, y, 4, h);
        ctx.fillRect(x + w - 4, y, 4, h);

        // Bottom strip — warm, not dark
        ctx.fillStyle = patternColor;
        ctx.fillRect(x, y + h - 4, w, 4);

        // Upward arrows
        if (h >= 16) {
            const arrowW = 12;
            const arrowH = Math.min(16, h - 8);
            const spacing = 24;
            const arrowCount = Math.max(1, Math.floor((w - 8) / spacing));
            for (let i = 0; i < arrowCount; i++) {
                const ax =
                    x +
                    4 +
                    Math.floor(((w - 8) / arrowCount) * i) +
                    Math.floor((w - 8) / arrowCount / 2) -
                    arrowW / 2;
                const ay = y + Math.floor((h - arrowH) / 2);
                ctx.fillStyle = mossColor;
                if (arrowH >= 16) {
                    // Full pixel art arrow (12×16): tip → mid → base → shaft
                    ctx.fillRect(ax + 4, ay, 4, 4); // tip
                    ctx.fillRect(ax + 2, ay + 4, 8, 4); // mid
                    ctx.fillRect(ax, ay + 8, 12, 4); // base
                    ctx.fillRect(ax + 4, ay + 12, 4, 4); // shaft
                } else {
                    // Small chevron for thin platforms
                    ctx.fillRect(ax + 4, ay, 4, 4);
                    ctx.fillRect(ax, ay + 4, 12, 4);
                }
            }
        }

        // Top glow edge
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, 4);
        ctx.fillStyle = "#fff9c4";
        ctx.fillRect(x + 2, y, w - 4, 2);

        ctx.restore();
    },
};

/**
 * Simplified hitbox rendering mode for platforms
 */
export const DebugBoxPlatformRenderer = {
    draw: (ctx, platform) => {
        ctx.save();

        ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
        ctx.fillRect(platform.x, platform.y, platform.w, platform.h);

        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);

        ctx.restore();
    },
};
