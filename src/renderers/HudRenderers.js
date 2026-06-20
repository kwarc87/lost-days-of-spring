import { DefaultCollectibleRenderer } from "./CollectibleRenderers.js";
import { MessageRenderer } from "./MessageRenderer.js";

// 7×6 pixel art heart grid
const HEART_PIXELS = [
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
];

// Highlight pixels (bright spot top-left of each lobe)
const HEART_HIGHLIGHT = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
];

function drawPixelHeart(ctx, x, y, scale, full) {
    for (let row = 0; row < HEART_PIXELS.length; row++) {
        for (let col = 0; col < HEART_PIXELS[row].length; col++) {
            if (!HEART_PIXELS[row][col]) {
                continue;
            }

            if (full) {
                if (HEART_HIGHLIGHT[row][col]) {
                    ctx.fillStyle = "#ff9ab4";
                } else if (
                    row === HEART_PIXELS.length - 1 ||
                    (row >= 1 &&
                        (col === 0 || col === HEART_PIXELS[row].length - 1))
                ) {
                    ctx.fillStyle = "#8b1a28";
                } else {
                    ctx.fillStyle = "#e8334a";
                }
            } else {
                ctx.fillStyle = "#3d2335";
            }

            ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
        }
    }
}

export const DefaultHubRenderer = {
    draw(
        ctx,
        canvas,
        player,
        currentLevelCollectiblesCount,
        currentLevelSplintersCount,
    ) {
        const collected = player.coinsCount;
        const total = currentLevelCollectiblesCount;
        const text = `${collected} / ${total}`;

        ctx.save();

        // ── Hearts panel (top-left) ──────────────────────────────────────────
        const life = player.life ?? 0;
        const maxLife = player.maxLife ?? 6;
        const heartScale = 3;
        const heartW = 7 * heartScale; // 21px
        const heartH = 6 * heartScale; // 18px
        const heartGap = 5;
        const heartPadX = 10;
        const heartPadY = 9;
        const heartsPanelW =
            heartPadX * 2 + maxLife * heartW + (maxLife - 1) * heartGap;
        const heartsPanelH = heartPadY * 2 + heartH;
        const heartsPanelX = 12;
        const heartsPanelY = 12;

        MessageRenderer.drawBackground(
            ctx,
            heartsPanelX,
            heartsPanelY,
            heartsPanelW,
            heartsPanelH,
            { color: "#3b1158", width: 2, steps: 3 },
            "#3b1158",
        );

        for (let i = 0; i < maxLife; i++) {
            const hx = heartsPanelX + heartPadX + i * (heartW + heartGap);
            const hy = heartsPanelY + heartPadY;
            drawPixelHeart(ctx, hx, hy, heartScale, i < life);
        }

        // ── Player name ───────────────────────────────────────────────────────
        ctx.font = `500 20px "Silkscreen", monospace`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const nameX = heartsPanelX + heartsPanelW + 12;
        const nameY = Math.round(heartsPanelY + heartsPanelH / 2);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        ctx.lineJoin = "miter";
        ctx.strokeText("COLIN LA MEHR", nameX, nameY);
        ctx.fillStyle = "#f0cc8b";
        ctx.fillText("COLIN LA MEHR", nameX, nameY);
        // ────────────────────────────────────────────────────────────────────

        // ── Coin + splinter panel (top-right) ────────────────────────────────
        const ICON_SIZE = 24;
        const panelPadX = 10;
        const panelPadY = 8;

        ctx.font = `16px "Silkscreen", monospace`;

        const coinTextW = Math.ceil(
            ctx.measureText(`${total} / ${total}`).width,
        );
        const splinterText = `${player.splintersCount ?? 0} / ${currentLevelSplintersCount ?? 0}`;
        const splinterTextW = Math.ceil(
            ctx.measureText(
                `${currentLevelSplintersCount} / ${currentLevelSplintersCount}`,
            ).width,
        );
        const rowW = Math.max(
            ICON_SIZE + 8 + coinTextW,
            ICON_SIZE + 8 + splinterTextW,
        );
        const rowGap = 8;
        const boxW = panelPadX * 2 + rowW;
        const boxH = panelPadY * 2 + ICON_SIZE + rowGap + ICON_SIZE;
        const boxX = Math.round(canvas.width - boxW - 12);
        const boxY = 12;

        MessageRenderer.drawBackground(
            ctx,
            boxX,
            boxY,
            boxW,
            boxH,
            { color: "#3b1158", width: 2, steps: 3 },
            "#3b1158",
        );

        ctx.textBaseline = "middle";
        const textRightX = boxX + boxW - panelPadX;
        const iconX = boxX + panelPadX;

        // Coin row
        const coinIconY = boxY + panelPadY;
        DefaultCollectibleRenderer.drawCoin(ctx, { x: iconX, y: coinIconY });
        ctx.fillStyle = "#ffd84a";
        ctx.textAlign = "right";
        ctx.fillText(text, textRightX, coinIconY + ICON_SIZE / 2);

        // Splinter row
        const splinterIconY = coinIconY + ICON_SIZE + rowGap;
        DefaultCollectibleRenderer.drawSplinter(ctx, {
            x: iconX,
            y: splinterIconY,
            w: ICON_SIZE,
            h: ICON_SIZE,
        });
        ctx.fillStyle = "#a8e8ff";
        ctx.fillText(splinterText, textRightX, splinterIconY + ICON_SIZE / 2);
        // ────────────────────────────────────────────────────────────────────

        ctx.restore();
    },
};
