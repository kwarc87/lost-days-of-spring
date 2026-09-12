import { DefaultCollectibleRenderer } from "./CollectibleRenderers.js";
import { MessageRenderer } from "./MessageRenderer.js";
import { MESSAGES, formatPlayTime } from "../messages.js";

const PAD_X = 24;
const PAD_Y = 18;

const ICON_SIZE = 24;
const ICON_GAP = 16;
const GAP = 18;
const SUB_GAP = 6;
const TITLE_H = 32;
const LINE_H = 18;
const TITLE_FONT = `normal 24px "Silkscreen", monospace`;
const SUB_FONT = `normal 18px "Silkscreen", monospace`;

// Shared centered stats-panel layout used by the level-complete and game-over
// screens; they only differ in copy/colors and in the final row (restart hint
// vs auto-restart countdown), passed in as extraRowText/extraRowColor.
export function drawStatsPanel(
    ctx,
    canvas,
    {
        title,
        titleColor,
        subtitle,
        subtitle2,
        subtitleColor,
        coinsCount,
        totalCoins,
        splintersCount,
        totalSplinters,
        artifactsCount,
        totalArtifacts,
        enemiesCount,
        totalEnemies,
        playTime,
        deathsText,
        deathsColor,
        extraRowText,
        extraRowColor,
    }
) {
    const w = canvas.width;
    const h = canvas.height;

    const coinCountText = `${coinsCount} / ${totalCoins}`;
    const splinterCountText = `${splintersCount} / ${totalSplinters}`;
    const artifactCountText = `${artifactsCount ?? 0} / ${totalArtifacts ?? 0}`;
    const hasArtifacts = (totalArtifacts ?? 0) > 0;
    const enemiesText = MESSAGES.STATS.ENEMIES_TEXT(enemiesCount, totalEnemies);
    const timeText = MESSAGES.STATS.TIME_TEXT(formatPlayTime(playTime));

    ctx.save();

    ctx.font = TITLE_FONT;
    const titleW = Math.ceil(ctx.measureText(title).width);

    ctx.font = SUB_FONT;
    const subtitleW = Math.ceil(ctx.measureText(subtitle).width);
    const subtitle2W = Math.ceil(ctx.measureText(subtitle2).width);
    const coinRowW = ICON_SIZE + ICON_GAP + Math.ceil(ctx.measureText(coinCountText).width);
    const splinterRowW = ICON_SIZE + ICON_GAP + Math.ceil(ctx.measureText(splinterCountText).width);
    const artifactRowW = ICON_SIZE + ICON_GAP + Math.ceil(ctx.measureText(artifactCountText).width);

    const panelW =
        Math.max(
            titleW,
            subtitleW,
            subtitle2W,
            coinRowW,
            splinterRowW,
            ...(hasArtifacts ? [artifactRowW] : []),
            Math.ceil(ctx.measureText(enemiesText).width),
            Math.ceil(ctx.measureText(deathsText).width),
            Math.ceil(ctx.measureText(timeText).width),
            Math.ceil(ctx.measureText(extraRowText).width)
        ) +
        PAD_X * 2;

    const panelH =
        PAD_Y +
        TITLE_H +
        SUB_GAP +
        LINE_H +
        SUB_GAP +
        LINE_H +
        GAP +
        ICON_SIZE +
        GAP +
        ICON_SIZE +
        (hasArtifacts ? GAP + ICON_SIZE : 0) +
        GAP +
        LINE_H +
        GAP +
        LINE_H +
        GAP +
        LINE_H +
        GAP +
        LINE_H +
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
        "#3b1158"
    );

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = TITLE_FONT;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillText(title, w / 2 + 1, panelY + PAD_Y + 1);
    ctx.fillStyle = titleColor;
    ctx.fillText(title, w / 2, panelY + PAD_Y);

    ctx.font = SUB_FONT;
    const subtitleY = panelY + PAD_Y + TITLE_H + SUB_GAP;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillText(subtitle, w / 2 + 1, subtitleY + 1);
    ctx.fillStyle = subtitleColor;
    ctx.fillText(subtitle, w / 2, subtitleY);

    const subtitle2Y = subtitleY + LINE_H + SUB_GAP;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillText(subtitle2, w / 2 + 1, subtitle2Y + 1);
    ctx.fillStyle = subtitleColor;
    ctx.fillText(subtitle2, w / 2, subtitle2Y);

    ctx.imageSmoothingEnabled = false;
    const textOffY = Math.round((ICON_SIZE - LINE_H) / 2);

    const coinsRowY = subtitle2Y + LINE_H + GAP;
    const coinsRowX = Math.round(w / 2 - coinRowW / 2);
    DefaultCollectibleRenderer.drawCoin(ctx, {
        x: coinsRowX,
        y: coinsRowY,
        w: ICON_SIZE,
        h: ICON_SIZE,
    });
    ctx.textAlign = "left";
    ctx.fillStyle = MESSAGES.STATS.COINS_COLOR;
    ctx.fillText(coinCountText, coinsRowX + ICON_SIZE + ICON_GAP, coinsRowY + textOffY);

    const splinterRowY = coinsRowY + ICON_SIZE + GAP;
    const splinterRowX = Math.round(w / 2 - splinterRowW / 2);
    DefaultCollectibleRenderer.drawSplinter(ctx, {
        x: splinterRowX,
        y: splinterRowY,
        w: ICON_SIZE,
        h: ICON_SIZE,
    });
    ctx.fillStyle = MESSAGES.STATS.SPLINTERS_COLOR;
    ctx.fillText(splinterCountText, splinterRowX + ICON_SIZE + ICON_GAP, splinterRowY + textOffY);

    let artifactBaseY = splinterRowY + ICON_SIZE;
    if (hasArtifacts) {
        const artifactRowY = artifactBaseY + GAP;
        const artifactRowX = Math.round(w / 2 - artifactRowW / 2);
        DefaultCollectibleRenderer.drawArtifact(
            ctx,
            {
                x: artifactRowX,
                y: artifactRowY,
                w: ICON_SIZE,
                h: ICON_SIZE,
                cordX: 400,
                cordY: 48,
            },
            { debug: false, now: 0 }
        );
        ctx.fillStyle = MESSAGES.STATS.ARTIFACTS_COLOR;
        ctx.textAlign = "left";
        ctx.fillText(
            artifactCountText,
            artifactRowX + ICON_SIZE + ICON_GAP,
            artifactRowY + textOffY
        );
        artifactBaseY = artifactRowY + ICON_SIZE;
    }

    ctx.textAlign = "center";

    const enemiesRowY = artifactBaseY + GAP;
    ctx.fillStyle = MESSAGES.STATS.ENEMIES_COLOR;
    ctx.fillText(enemiesText, w / 2, enemiesRowY);

    const deathsY = enemiesRowY + LINE_H + GAP;
    ctx.fillStyle = deathsColor;
    ctx.fillText(deathsText, w / 2, deathsY);

    const timeY = deathsY + LINE_H + GAP;
    ctx.fillStyle = MESSAGES.STATS.TIME_COLOR;
    ctx.fillText(timeText, w / 2, timeY);

    const extraRowY = timeY + LINE_H + GAP;
    ctx.fillStyle = extraRowColor;
    ctx.fillText(extraRowText, w / 2, extraRowY);

    ctx.imageSmoothingEnabled = true;
    ctx.restore();
}
