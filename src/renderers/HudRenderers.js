// Gems spritesheet cache for HUD splinter icon
let _hudGemsImg = null;

function getHudGemsImg() {
    if (!_hudGemsImg) {
        _hudGemsImg = new Image();
        _hudGemsImg.src = "textures/gems-spritesheet.png";
    }
    return _hudGemsImg;
}

const HUD_SPLINTER_FRAMES = [
    ...Array.from({ length: 7 }, (_, i) => ({ sx: 64 + i * 16, sy: 32 })),
];
const HUD_SPLINTER_FRAME_MS = 150;

function drawHudSplinter(ctx, x, y, scale) {
    const img = getHudGemsImg();
    const { sx, sy } =
        HUD_SPLINTER_FRAMES[
            Math.floor(performance.now() / HUD_SPLINTER_FRAME_MS) %
                HUD_SPLINTER_FRAMES.length
        ];
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, 16, 16, x, y, 16 * scale, 16 * scale);
}

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

// 7×7 pixel art coin, drawn natively at (scale) px/pixel — no ctx.scale
// 0=transparent  1=dark border  2=gold body  3=highlight  4=engraving  5=shadow
const COIN_PIX = [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 2, 3, 2, 1, 0],
    [1, 2, 3, 4, 2, 2, 1],
    [1, 2, 3, 4, 2, 2, 1],
    [1, 2, 2, 2, 5, 2, 1],
    [0, 1, 2, 5, 5, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
];
const COIN_PIX_COLORS = [
    null,
    "#7a5200",
    "#ffd700",
    "#ffe580",
    "#cc9500",
    "#a87b00",
];

function drawHudCoin(ctx, x, y, scale) {
    for (let row = 0; row < COIN_PIX.length; row++) {
        for (let col = 0; col < COIN_PIX[row].length; col++) {
            const ci = COIN_PIX[row][col];
            if (!ci) {
                continue;
            }
            ctx.fillStyle = COIN_PIX_COLORS[ci];
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

        ctx.fillStyle = "rgba(15, 23, 32, 0.82)";
        ctx.beginPath();
        ctx.roundRect(
            heartsPanelX,
            heartsPanelY,
            heartsPanelW,
            heartsPanelH,
            8,
        );
        ctx.fill();

        for (let i = 0; i < maxLife; i++) {
            const hx = heartsPanelX + heartPadX + i * (heartW + heartGap);
            const hy = heartsPanelY + heartPadY;
            drawPixelHeart(ctx, hx, hy, heartScale, i < life);
        }
        // ────────────────────────────────────────────────────────────────────

        // ── Coin panel (top-right) ───────────────────────────────────────────
        const coinScale = 3; // 7×7 grid at 3px/pixel = 21×21px
        const coinPxW = 7 * coinScale; // 21px
        const coinPxH = 7 * coinScale; // 21px
        const panelPadX = 10;
        const panelPadY = 8;

        ctx.font = `14px "Silkscreen", monospace`;

        const textWidth = Math.ceil(ctx.measureText(text).width);
        const boxW = Math.round(panelPadX * 2 + coinPxW + 8 + textWidth);
        const boxH = panelPadY * 2 + coinPxH;
        const boxX = Math.round(canvas.width - boxW - 12);
        const boxY = 12;

        // Panel bg — same style as hearts panel
        ctx.fillStyle = "rgba(15, 23, 32, 0.82)";
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();

        // Coin icon
        drawHudCoin(ctx, boxX + panelPadX, boxY + panelPadY, coinScale);

        // Text
        ctx.fillStyle = "#ffd84a";
        ctx.textBaseline = "middle";
        ctx.fillText(text, boxX + panelPadX + coinPxW + 8, boxY + boxH / 2);
        // ────────────────────────────────────────────────────────────────────

        // ── Splinter panel (below coin panel) ────────────────────────────────
        const splinterScale = 2; // 16×16 sprite at 2px/pixel = 32×32px
        const splinterPxW = 16 * splinterScale;
        const splinterPxH = 16 * splinterScale;
        const splinterPanelPadX = 10;
        const splinterPanelPadY = 8;
        const splinterText = `${player.splintersCount ?? 0} / ${currentLevelSplintersCount ?? 0}`;

        ctx.font = `14px "Silkscreen", monospace`;
        const splinterTextWidth = Math.ceil(
            ctx.measureText(splinterText).width,
        );
        const splinterBoxW = Math.round(
            splinterPanelPadX * 2 + splinterPxW + 8 + splinterTextWidth,
        );
        const splinterBoxH = splinterPanelPadY * 2 + splinterPxH;
        const splinterBoxX = Math.round(canvas.width - splinterBoxW - 12);
        const splinterBoxY = boxY + boxH + 6;

        ctx.fillStyle = "rgba(15, 23, 32, 0.82)";
        ctx.beginPath();
        ctx.roundRect(
            splinterBoxX,
            splinterBoxY,
            splinterBoxW,
            splinterBoxH,
            8,
        );
        ctx.fill();

        drawHudSplinter(
            ctx,
            splinterBoxX + splinterPanelPadX,
            splinterBoxY + splinterPanelPadY,
            splinterScale,
        );

        ctx.fillStyle = "#a8e8ff";
        ctx.textBaseline = "middle";
        ctx.fillText(
            splinterText,
            splinterBoxX + splinterPanelPadX + splinterPxW + 8,
            splinterBoxY + splinterBoxH / 2,
        );
        // ────────────────────────────────────────────────────────────────────

        ctx.restore();
    },

    drawIntro(ctx, canvas, elapsed) {
        const duration = 5000;
        const fadeStart = 4500;
        if (elapsed >= duration) {
            return;
        }

        const alpha =
            elapsed < fadeStart
                ? 1
                : 1 - (elapsed - fadeStart) / (duration - fadeStart);

        const text = "Collect all coins to complete the level";
        const padX = 14;
        const padY = 8;
        const y = canvas.height - 56;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold 13px "Silkscreen", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const tw = ctx.measureText(text).width;
        const boxW = tw + padX * 2;
        const boxH = 13 + padY * 2;
        const boxX = canvas.width / 2 - boxW / 2;
        const boxY = y - boxH / 2;

        ctx.fillStyle = "rgba(15, 23, 32, 0.82)";
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, canvas.width / 2, y);

        ctx.restore();
    },
};
