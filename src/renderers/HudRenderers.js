export const DefaultHubRenderer = {
    draw(ctx, canvas, player, currentLevelCollectiblesCount) {
        const collected = player.collectiblesCount;
        const total = currentLevelCollectiblesCount;
        const text = `${collected} / ${total}`;
        const padding = 12;
        const coinSize = 18;
        const fontSize = 18;

        ctx.save();
        ctx.font = `bold ${fontSize}px ui-monospace, monospace`;

        const textWidth = ctx.measureText(text).width;
        const boxW = coinSize + 8 + textWidth + padding * 2;
        const boxH = 36;
        const boxX = canvas.width - boxW - 12;
        const boxY = 12;

        // Background
        ctx.fillStyle = "rgba(15, 23, 32, 0.82)";
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();

        // Coin icon (small pixel-style circle)
        const cx = boxX + padding + coinSize / 2;
        const cy = boxY + boxH / 2;
        ctx.fillStyle = "#a87b00";
        ctx.beginPath();
        ctx.arc(cx, cy, coinSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(cx, cy, coinSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#cc9500";
        ctx.fillRect(cx - 2, cy - coinSize / 4, 4, coinSize / 2);

        // Text
        ctx.fillStyle = "#f8fafc";
        ctx.textBaseline = "middle";
        ctx.fillText(text, cx + coinSize / 2 + 8, cy);

        ctx.restore();
    },
};
