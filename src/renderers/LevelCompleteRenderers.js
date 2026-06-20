import { DefaultCollectibleRenderer } from "./CollectibleRenderers.js";
import { MessageRenderer } from "./MessageRenderer.js";
import { MESSAGES, formatPlayTime } from "../messages.js";

const ICON_SIZE = 24;
const ICON_GAP = 8;
const PAD_X = 32;
const PAD_Y = 24;
const GAP = 16;
const TITLE_H = 24;
const LINE_H = 13;
const HINT_H = 11;
const TITLE_FONT = `normal 24px "Silkscreen", monospace`;
const SUB_FONT = `normal 14px "Silkscreen", monospace`;

export const DefaultLevelCompleteRenderer = {
    drawLevelCompleteScreen: (
        ctx,
        canvas,
        coinsCount,
        totalCoins,
        splintersCount,
        totalSplinters,
        enemiesCount,
        totalEnemies,
        playTime,
        deathCount,
    ) => {
        const w = canvas.width;
        const h = canvas.height;

        const coinCountText = `${coinsCount} / ${totalCoins}`;
        const splinterCountText = `${splintersCount} / ${totalSplinters}`;
        const enemiesText = MESSAGES.STATS.ENEMIES_TEXT(
            enemiesCount,
            totalEnemies,
        );
        const deathsText = MESSAGES.LEVEL_COMPLETE.DEATHS_TEXT(deathCount);
        const timeText = MESSAGES.STATS.TIME_TEXT(formatPlayTime(playTime));
        const hintText = MESSAGES.LEVEL_COMPLETE.RESTART_HINT.text;

        ctx.save();

        ctx.font = TITLE_FONT;
        const titleW = Math.ceil(
            ctx.measureText(MESSAGES.LEVEL_COMPLETE.TITLE).width,
        );

        ctx.font = SUB_FONT;
        const coinRowW =
            ICON_SIZE +
            ICON_GAP +
            Math.ceil(ctx.measureText(coinCountText).width);
        const splinterRowW =
            ICON_SIZE +
            ICON_GAP +
            Math.ceil(ctx.measureText(splinterCountText).width);

        const panelW =
            Math.max(
                titleW,
                coinRowW,
                splinterRowW,
                Math.ceil(ctx.measureText(enemiesText).width),
                Math.ceil(ctx.measureText(deathsText).width),
                Math.ceil(ctx.measureText(timeText).width),
                Math.ceil(ctx.measureText(hintText).width),
            ) +
            PAD_X * 2;

        const panelH =
            PAD_Y +
            TITLE_H +
            GAP +
            ICON_SIZE +
            GAP +
            ICON_SIZE +
            GAP +
            LINE_H +
            GAP +
            LINE_H +
            GAP +
            LINE_H +
            GAP +
            HINT_H +
            PAD_Y;

        const panelX = Math.round((w - panelW) / 2);
        const panelY = Math.round((h - panelH) / 2);

        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(0, 0, w, h);

        MessageRenderer.drawBackground(
            ctx,
            panelX,
            panelY,
            panelW,
            panelH,
            { color: "#fff", width: 2, steps: 3 },
            "#3b1158",
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = TITLE_FONT;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillText(
            MESSAGES.LEVEL_COMPLETE.TITLE,
            w / 2 + 1,
            panelY + PAD_Y + 1,
        );
        ctx.fillStyle = MESSAGES.LEVEL_COMPLETE.TITLE_COLOR;
        ctx.fillText(MESSAGES.LEVEL_COMPLETE.TITLE, w / 2, panelY + PAD_Y);

        ctx.font = SUB_FONT;
        ctx.imageSmoothingEnabled = false;
        const textOffY = Math.round((ICON_SIZE - LINE_H) / 2);

        const coinsRowY = panelY + PAD_Y + TITLE_H + GAP;
        const coinsRowX = Math.round(w / 2 - coinRowW / 2);
        DefaultCollectibleRenderer.drawCoin(ctx, {
            x: coinsRowX,
            y: coinsRowY,
        });
        ctx.textAlign = "left";
        ctx.fillStyle = MESSAGES.STATS.COINS_COLOR;
        ctx.fillText(
            coinCountText,
            coinsRowX + ICON_SIZE + ICON_GAP,
            coinsRowY + textOffY,
        );

        const splinterRowY = coinsRowY + ICON_SIZE + GAP;
        const splinterRowX = Math.round(w / 2 - splinterRowW / 2);
        DefaultCollectibleRenderer.drawSplinter(ctx, {
            x: splinterRowX,
            y: splinterRowY,
            w: ICON_SIZE,
            h: ICON_SIZE,
        });
        ctx.fillStyle = MESSAGES.STATS.SPLINTERS_COLOR;
        ctx.fillText(
            splinterCountText,
            splinterRowX + ICON_SIZE + ICON_GAP,
            splinterRowY + textOffY,
        );

        ctx.textAlign = "center";

        const enemiesRowY = splinterRowY + ICON_SIZE + GAP;
        ctx.fillStyle = MESSAGES.STATS.ENEMIES_COLOR;
        ctx.fillText(enemiesText, w / 2, enemiesRowY);

        const deathsY = enemiesRowY + LINE_H + GAP;
        ctx.fillStyle = MESSAGES.LEVEL_COMPLETE.DEATHS_COLOR;
        ctx.fillText(deathsText, w / 2, deathsY);

        const timeY = deathsY + LINE_H + GAP;
        ctx.fillStyle = MESSAGES.STATS.TIME_COLOR;
        ctx.fillText(timeText, w / 2, timeY);

        const hintY = timeY + LINE_H + GAP;
        ctx.fillStyle = MESSAGES.LEVEL_COMPLETE.RESTART_HINT.color;
        ctx.fillText(hintText, w / 2, hintY);

        ctx.imageSmoothingEnabled = true;
        ctx.restore();
    },
};
