/**
 * Default platform rendering strategy
 */
export const DefaultPlatformRenderer = {
    draw: (ctx, platform) => {
        ctx.save();

        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
        ctx.fillStyle = platform.secondaryColor;
        ctx.fillRect(platform.x, platform.y + 8, platform.w, platform.h - 8);

        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 1;
        ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);

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
