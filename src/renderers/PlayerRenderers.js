/**
 * Agent Cooper / 90s outsider style player renderer.
 * Pixel-art with detail achieved through colour and shape — no sub-pixel tricks.
 * Multiple shade layers on hair, jacket and pants; softened silhouette corners.
 */
export const DefaultPlayerRenderer = {
    draw: (ctx, player) => {
        ctx.save();

        const cx = player.x + player.w / 2;
        const cy = player.y + player.h;

        ctx.translate(cx, cy);
        ctx.scale(player.facing === "left" ? -1 : 1, 1);

        const px = (x, y, w, h, c) => {
            ctx.fillStyle = c;
            ctx.fillRect(x, y, w, h);
        };

        const suitBlue = player.isHit ? "#7a1212" : "#102a43";
        const suitGray = player.isHit ? "#9e1f1f" : "#243b53";
        const suitLight = player.isHit ? "#c43030" : "#334e68";

        const jeansBlue = "#0E253A";
        const jeansLight = "#193a59";
        const dressBrown = "#34251b";

        const shirtWhite = "#f0f4f7";
        const shirtShade = "#cbd5e0";

        const tieRed = "#d32f2f";
        const tieDark = "#9a1b1b";

        const hairBrown = "#3d2b1f";
        const hairGloss = "#5e4638";

        const skinBase = "#f9d5b0";
        const skinShade = "#eac095";
        const skinDeep = "#d4a77e";

        const eyeColor = "#121212";

        px(-20, -4, 40, 4, "rgba(0,0,0,0.2)");

        if (player.crouch) {
            px(-16, -6, 12, 6, dressBrown);
            px(2, -6, 12, 6, dressBrown);

            px(-18, -14, 14, 8, jeansBlue);
            px(2, -14, 14, 8, jeansBlue);
            px(-16, -12, 6, 4, jeansLight);

            px(-14, -18, 28, 4, jeansBlue);
            px(-16, -24, 32, 8, suitBlue);

            px(-16, -40, 32, 16, suitBlue);
            px(-16, -40, 4, 14, suitLight);
            px(12, -38, 4, 12, suitGray);

            px(-4, -40, 10, 12, shirtWhite);
            px(-2, -38, 4, 10, tieRed);
            px(1, -32, 3, 4, tieDark);

            px(-20, -38, 6, 12, suitBlue);
            px(14, -38, 6, 12, suitBlue);
            px(-20, -26, 6, 4, skinShade);
            px(14, -26, 6, 4, skinBase);

            const hy = 35;
            px(-12, -74 + hy, 24, 20, skinBase);
            px(-12, -74 + hy, 6, 20, skinShade);
            px(-6, -58 + hy, 16, 4, skinDeep);

            px(2, -66 + hy, 4, 4, eyeColor);
            px(12, -66 + hy, 4, 4, eyeColor);

            px(-16, -82 + hy, 32, 10, hairBrown);
            px(-12, -84 + hy, 24, 4, hairGloss);
            px(8, -82 + hy, 12, 6, hairGloss);
        } else {
            px(-14, -6, 12, 6, dressBrown);
            px(2, -6, 12, 6, dressBrown);
            px(-12, -3, 4, 3, "#251a13");

            px(-12, -26, 10, 20, jeansBlue);
            px(-12, -22, 10, 4, jeansLight);

            px(2, -26, 10, 20, jeansBlue);
            px(2, -22, 10, 4, jeansLight);

            px(-12, -32, 24, 8, suitBlue);

            px(-16, -53, 32, 25, suitBlue);
            px(-16, -53, 4, 23, suitLight);
            px(12, -49, 4, 20, suitGray);

            px(-4, -53, 12, 21, shirtWhite);
            px(-4, -53, 4, 21, shirtShade);
            px(-2, -51, 4, 19, tieRed);
            px(1, -41, 3, 10, tieDark);

            px(-20, -49, 6, 21, suitBlue);
            px(14, -49, 6, 21, suitBlue);
            px(-20, -28, 6, 4, skinShade);
            px(14, -28, 6, 4, skinBase);

            px(-2, -55, 8, 4, skinShade);

            px(-12, -75, 24, 22, skinBase);
            px(-12, -75, 6, 22, skinShade);
            px(-4, -57, 16, 4, skinDeep);

            px(2, -67, 4, 4, eyeColor);
            px(12, -67, 4, 4, eyeColor);

            px(-16, -83, 34, 12, hairBrown);
            px(-14, -85, 28, 4, hairGloss);
            px(-16, -77, 8, 12, hairBrown);
            px(12, -81, 10, 6, hairGloss);
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

        // Direction dot
        ctx.fillStyle = "yellow";
        const eyeOff = player.facing === "left" ? 0 : player.w - 4;
        ctx.fillRect(player.x + eyeOff, player.y + 4, 4, 4);

        ctx.restore();
    },
};
