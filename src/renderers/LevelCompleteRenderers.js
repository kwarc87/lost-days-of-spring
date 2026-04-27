import { getImg } from "../utils/imgCache.js";
import { MessageRenderer } from "./MessageRenderer.js";
import { MESSAGES } from "../messages.js";

const GEMS_IMG_PATH = "textures/gems-spritesheet.png";

const LC_SPLINTER_FRAMES = Array.from({ length: 7 }, (_, i) => ({
    sx: 64 + i * 16,
    sy: 32,
}));
const LC_SPLINTER_FRAME_MS = 150;

const LC_COIN_PIX = [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 2, 3, 2, 1, 0],
    [1, 2, 3, 4, 2, 2, 1],
    [1, 2, 3, 4, 2, 2, 1],
    [1, 2, 2, 2, 5, 2, 1],
    [0, 1, 2, 5, 5, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
];
const LC_COIN_COLORS = [
    null,
    "#7a5200",
    "#ffd700",
    "#ffe580",
    "#cc9500",
    "#a87b00",
];

const LC_SKULL_PIX = [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 2, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
];
const LC_SKULL_COLORS = [null, "#c8c8aa", "#1a1a2e"];

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
    ) => {
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();

        // ── Overlay ──────────────────────────────────────────────────────────
        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(0, 0, w, h);

        // ── Measure text to size panel ───────────────────────────────────────
        const titleFont = `bold 24px "Silkscreen", monospace`;
        const subFont = `bold 13px "Silkscreen", monospace`;

        ctx.font = titleFont;
        const titleW = Math.ceil(
            ctx.measureText(MESSAGES.LEVEL_COMPLETE.TITLE).width,
        );

        ctx.font = subFont;
        const statsCoinsText = MESSAGES.STATS.COINS_TEXT(
            coinsCount,
            totalCoins,
        );
        const statsEnemiesText = MESSAGES.STATS.ENEMIES_TEXT(
            enemiesCount,
            totalEnemies,
        );
        const statsSplintersText = MESSAGES.STATS.SPLINTERS_TEXT(
            splintersCount,
            totalSplinters,
        );

        const padX = 32;
        const padY = 24;
        const gap = 16;
        const titleH = 24;
        const lineH = 13;
        const gemScale = 2; // spritesheet texels → px
        const pixScale = 2; // pixel-art cells → px
        const gemIconSize = 16 * gemScale; // 32px
        const artIconSize = 7 * pixScale; // 14px
        const iconGap = 8;
        const rowH = gemIconSize; // all stat rows same height

        const coinsTextW = Math.ceil(ctx.measureText(statsCoinsText).width);
        const enemiesTextW = Math.ceil(ctx.measureText(statsEnemiesText).width);
        const splintersTextW = Math.ceil(
            ctx.measureText(statsSplintersText).width,
        );

        const coinsRowW = artIconSize + iconGap + coinsTextW;
        const enemiesRowW = artIconSize + iconGap + enemiesTextW;
        const splinterRowW = gemIconSize + iconGap + splintersTextW;

        const panelW =
            Math.max(titleW, coinsRowW, enemiesRowW, splinterRowW) + padX * 2;
        const panelH =
            padY + titleH + gap + rowH + gap + rowH + gap + rowH + padY;
        const panelX = Math.round((w - panelW) / 2);
        const panelY = Math.round((h - panelH) / 2);

        // Panel bg
        MessageRenderer.drawBackground(ctx, panelX, panelY, panelW, panelH);

        // ── Title ────────────────────────────────────────────────────────────────
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = titleFont;

        // shadow
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillText(
            MESSAGES.LEVEL_COMPLETE.TITLE,
            w / 2 + 1,
            panelY + padY + 1,
        );

        ctx.fillStyle = MESSAGES.LEVEL_COMPLETE.TITLE_COLOR;
        ctx.fillText(MESSAGES.LEVEL_COMPLETE.TITLE, w / 2, panelY + padY);

        // ── Stats ────────────────────────────────────────────────────────────
        ctx.font = subFont;
        ctx.imageSmoothingEnabled = false;

        const textOffY = Math.round((rowH - lineH) / 2);

        // ── Coins row ────────────────────────────────────────────────────────
        const coinsRowY = panelY + padY + titleH + gap;
        {
            const rowX = Math.round(w / 2 - coinsRowW / 2);
            const iconY = Math.round(coinsRowY + (rowH - artIconSize) / 2);
            for (let r = 0; r < LC_COIN_PIX.length; r++) {
                for (let c = 0; c < LC_COIN_PIX[r].length; c++) {
                    const ci = LC_COIN_PIX[r][c];
                    if (!ci) {
                        continue;
                    }
                    ctx.fillStyle = LC_COIN_COLORS[ci];
                    ctx.fillRect(
                        rowX + c * pixScale,
                        iconY + r * pixScale,
                        pixScale,
                        pixScale,
                    );
                }
            }
            ctx.textAlign = "left";
            ctx.fillStyle = MESSAGES.STATS.COINS_COLOR;
            ctx.fillText(
                statsCoinsText,
                rowX + artIconSize + iconGap,
                coinsRowY + textOffY,
            );
            ctx.textAlign = "center";
        }

        // ── Enemies row ──────────────────────────────────────────────────────
        const enemiesRowY = coinsRowY + rowH + gap;
        {
            const rowX = Math.round(w / 2 - enemiesRowW / 2);
            const iconY = Math.round(enemiesRowY + (rowH - artIconSize) / 2);
            for (let r = 0; r < LC_SKULL_PIX.length; r++) {
                for (let c = 0; c < LC_SKULL_PIX[r].length; c++) {
                    const ci = LC_SKULL_PIX[r][c];
                    if (!ci) {
                        continue;
                    }
                    ctx.fillStyle = LC_SKULL_COLORS[ci];
                    ctx.fillRect(
                        rowX + c * pixScale,
                        iconY + r * pixScale,
                        pixScale,
                        pixScale,
                    );
                }
            }
            ctx.textAlign = "left";
            ctx.fillStyle = MESSAGES.STATS.ENEMIES_COLOR;
            ctx.fillText(
                statsEnemiesText,
                rowX + artIconSize + iconGap,
                enemiesRowY + textOffY,
            );
            ctx.textAlign = "center";
        }

        // ── Splinters row ────────────────────────────────────────────────────
        const splinterRowY = enemiesRowY + rowH + gap;
        {
            const rowX = Math.round(w / 2 - splinterRowW / 2);
            const gemsImg = getImg(GEMS_IMG_PATH);
            const frame =
                LC_SPLINTER_FRAMES[
                    Math.floor(performance.now() / LC_SPLINTER_FRAME_MS) %
                        LC_SPLINTER_FRAMES.length
                ];
            if (gemsImg.complete && gemsImg.naturalWidth > 0) {
                ctx.drawImage(
                    gemsImg,
                    frame.sx,
                    frame.sy,
                    16,
                    16,
                    rowX,
                    splinterRowY,
                    gemIconSize,
                    gemIconSize,
                );
            }
            ctx.textAlign = "left";
            ctx.fillStyle = MESSAGES.STATS.SPLINTERS_COLOR;
            ctx.fillText(
                statsSplintersText,
                rowX + gemIconSize + iconGap,
                splinterRowY + textOffY,
            );
            ctx.textAlign = "center";
        }

        ctx.imageSmoothingEnabled = true;

        ctx.restore();
    },
};
