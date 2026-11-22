import { GameFactory } from "../factories/GameFactory.js";

const DROP_COLORS = ["#68eef2", "#51b9db"]; // highlight and base color of the water tile

export const SplashRenderer = {
    draw(ctx, waterController) {
        const size = GameFactory.SCALE * 2;
        const drops = waterController.getDrops();
        for (let i = 0; i < drops.length; i++) {
            const drop = drops[i];
            if (!drop.active) {
                continue;
            }
            ctx.fillStyle = DROP_COLORS[i % DROP_COLORS.length];
            // Snap to the sprite pixel grid to keep the pixel-art look
            ctx.fillRect(
                Math.round(drop.x / size) * size,
                Math.round(drop.y / size) * size,
                size,
                size
            );
        }
    },
};
