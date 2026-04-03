export const DefaultLevelCompleteRenderer = {
    drawLevelCompleteScreen: (
        ctx,
        canvas,
        collectiblesCount,
        totalCollectibles,
        remaining,
    ) => {
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();

        // ── Overlay ──────────────────────────────────────────────────────────
        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(0, 0, w, h);

        // ── Measure text to size panel ───────────────────────────────────────
        const titleFont = `bold 24px "Silkscreen", monospace`;
        const subFont   = `bold 13px "Silkscreen", monospace`;

        ctx.font = titleFont;
        const titleW = Math.ceil(ctx.measureText("LEVEL COMPLETE!").width);

        ctx.font = subFont;
        const statsText = `Zebrano: ${collectiblesCount} / ${totalCollectibles}`;
        const subText   = `Restart za ${remaining}s  –  ESC`;
        const statsW = Math.ceil(ctx.measureText(statsText).width);
        const subW   = Math.ceil(ctx.measureText(subText).width);

        const padX  = 32;
        const padY  = 24;
        const gap   = 16;
        const titleH = 24;
        const lineH  = 13;

        const panelW = Math.max(titleW, statsW, subW) + padX * 2;
        const panelH = padY + titleH + gap + lineH + gap + lineH + padY;
        const panelX = Math.round((w - panelW) / 2);
        const panelY = Math.round((h - panelH) / 2);

        // Panel bg — same as HUD and game-over
        ctx.fillStyle = "rgba(15, 23, 32, 0.82)";
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 8);
        ctx.fill();

        // ── Title ────────────────────────────────────────────────────────────
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = titleFont;

        // shadow
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillText("LEVEL COMPLETE!", w / 2 + 2, panelY + padY + 2);

        ctx.fillStyle = "#f5c542";
        ctx.fillText("LEVEL COMPLETE!", w / 2, panelY + padY);

        // ── Stats ────────────────────────────────────────────────────────────
        ctx.font = subFont;
        ctx.fillStyle = "#c8d8e8";
        ctx.fillText(statsText, w / 2, panelY + padY + titleH + gap);

        // ── Countdown ────────────────────────────────────────────────────────
        ctx.fillStyle = "#7a8a99";
        ctx.fillText(subText, w / 2, panelY + padY + titleH + gap + lineH + gap);

        ctx.restore();
    },
};
