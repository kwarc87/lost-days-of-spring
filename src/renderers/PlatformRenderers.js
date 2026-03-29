/**
 * Default platform rendering strategy
 */
export const DefaultPlatformRenderer = {
    draw: (ctx, platform) => {
        ctx.save();

        const x = platform.x;
        const y = platform.y;
        const w = platform.w;
        const h = platform.h;

        // Base dark stone color
        ctx.fillStyle = platform.patternColor;
        ctx.fillRect(x, y, w, h);

        // Core luminescent glow at the top
        ctx.fillStyle = platform.color;
        ctx.fillRect(x, y, w, 4);

        // Secondary glow/edge
        ctx.fillStyle = platform.secondaryColor;
        ctx.fillRect(x, y + 4, w, 4);

        // Stone texture / Brick pattern
        ctx.fillStyle = platform.textureColor;
        for (let ix = 0; ix < w; ix += 16) {
            for (let iy = 8; iy < h; iy += 16) {
                // Stagger bricks
                const offset = (iy / 16) % 2 === 0 ? 0 : 8;
                if (ix + offset < w) {
                    ctx.fillRect(
                        x + ix + offset,
                        y + iy,
                        Math.min(14, w - (ix + offset)),
                        Math.min(14, h - iy),
                    );
                }
            }
        }

        // Deep shadow at the bottom
        const gradient = ctx.createLinearGradient(0, y + h - 16, 0, y + h);
        gradient.addColorStop(0, "rgba(5, 8, 7, 0)");
        gradient.addColorStop(1, "rgba(5, 8, 7, 1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);

        // Dripping moss / Overhang
        ctx.fillStyle = platform.mossColor;
        for (let i = 0; i < w; i += 8) {
            // Random-looking but deterministic based on position
            const dropLen = ((x + i) * 17) % 12;
            if (dropLen > 3) {
                ctx.fillRect(x + i, y + 8, 4, dropLen);
                // Highlight on moss
                ctx.fillStyle = platform.secondaryColor;
                ctx.fillRect(x + i, y + 8, 2, dropLen - 2);
                ctx.fillStyle = platform.mossColor;
            }
        }

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
