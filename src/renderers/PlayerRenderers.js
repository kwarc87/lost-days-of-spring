/**
 * Default player rendering strategy (character in a suit)
 */
export const DefaultPlayerRenderer = {
    draw: (ctx, player) => {
        ctx.save();

        const cx = player.x + player.w / 2;
        const cy = player.y + player.h / 2;

        // Flip around the center if moving left
        if (player.vx < 0) {
            ctx.translate(cx, cy);
            ctx.scale(-1, 1);
            ctx.translate(-cx, -cy);
        }

        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(player.x, player.y, player.w, player.h);

        if (player.vx === 0) {
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(player.x + 6, player.y + 2, player.w - 12, 12);

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(player.x + 10, player.y + 14, player.w - 20, 10);

            ctx.fillStyle = "#000000";
            ctx.fillRect(player.x + 13, player.y + 14, 4, 12);
        } else {
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(player.x + 10, player.y + 2, player.w - 12, 12);

            ctx.fillStyle = "#0a0a0a";
            ctx.fillRect(player.x, player.y, player.w - 8, 14);

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(player.x + 14, player.y + 14, player.w - 20, 10);

            ctx.fillStyle = "#000000";
            ctx.fillRect(player.x + 17, player.y + 14, 4, 12);
        }

        ctx.restore();
    },
};

/**
 * Simplified hitbox rendering mode for physics debugging
 */
export const DebugBoxPlayerRenderer = {
    draw: (ctx, player) => {
        ctx.save();

        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(player.x, player.y, player.w, player.h);

        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x, player.y, player.w, player.h);

        // Draw the looking direction (a dot on the front side of the box)
        ctx.fillStyle = "yellow";
        const eyeOffset = player.vx < 0 ? 0 : player.w - 4;
        ctx.fillRect(player.x + eyeOffset, player.y + 4, 4, 4);

        ctx.restore();
    },
};
