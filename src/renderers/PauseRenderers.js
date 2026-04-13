export const DefaultPauseRenderer = {
    drawPauseScreen: (ctx, canvas) => {
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();

        // ── Overlay ───────────────────────────────────────────────────────────
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, w, h);

        // ── Measure text to size panel ────────────────────────────────────────
        const titleFont = `bold 24px "Silkscreen", monospace`;
        const subFont = `bold 13px "Silkscreen", monospace`;
        const subText = "P – wznów";

        ctx.font = titleFont;
        const titleW = Math.ceil(ctx.measureText("PAUZA").width);
        ctx.font = subFont;
        const subW = Math.ceil(ctx.measureText(subText).width);

        const padX = 32;
        const padY = 24;
        const gap = 16;
        const titleH = 24;
        const lineH = 13;

        const panelW = Math.max(titleW, subW) + padX * 2;
        const panelH = padY + titleH + gap + lineH + padY;
        const panelX = Math.round((w - panelW) / 2);
        const panelY = Math.round((h - panelH) / 2);

        // ── Panel bg ──────────────────────────────────────────────────────────
        ctx.fillStyle = "rgba(15, 23, 32, 0.82)";
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 8);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // ── Title ─────────────────────────────────────────────────────────────
        ctx.font = titleFont;

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillText("PAUZA", w / 2 + 2, panelY + padY + 2);

        ctx.fillStyle = "#f5c542";
        ctx.fillText("PAUZA", w / 2, panelY + padY);

        // ── Hint ──────────────────────────────────────────────────────────────
        ctx.font = subFont;
        ctx.fillStyle = "#7a8a99";
        ctx.fillText(subText, w / 2, panelY + padY + titleH + gap);

        ctx.restore();
    },
};
