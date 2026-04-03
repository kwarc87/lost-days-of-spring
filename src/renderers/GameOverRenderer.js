export const DefaultGameOverRenderer = {
    drawGameOverScreen(ctx, canvas, remaining) {
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
        const titleW = Math.ceil(ctx.measureText("GAME OVER").width);

        ctx.font = subFont;
        const subText = `Restart za ${remaining}s  –  ESC`;
        const subW = Math.ceil(ctx.measureText(subText).width);

        const padX = 32;
        const padY = 24;
        const gap = 18;
        const titleH = 24;
        const subH = 13;

        const panelW = Math.max(titleW, subW) + padX * 2;
        const panelH = padY + titleH + gap + subH + padY;
        const panelX = Math.round((w - panelW) / 2);
        const panelY = Math.round((h - panelH) / 2);

        // Panel bg — same as HUD
        ctx.fillStyle = "rgba(15, 23, 32, 0.82)";
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 8);
        ctx.fill();

        // ── Title ────────────────────────────────────────────────────────────
        ctx.textAlign = "center";
        ctx.font = titleFont;

        // shadow
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.textBaseline = "top";
        ctx.fillText("GAME OVER", w / 2 + 2, panelY + padY + 2);

        ctx.fillStyle = "#e8334a";
        ctx.fillText("GAME OVER", w / 2, panelY + padY);

        // ── Subtitle ─────────────────────────────────────────────────────────
        ctx.font = subFont;
        ctx.fillStyle = "#7a8a99";
        ctx.textBaseline = "top";
        ctx.fillText(subText, w / 2, panelY + padY + titleH + gap);

        ctx.restore();
    },
};
