/**
 * Default pause screen rendering strategy
 */
export const DefaultPauseRenderer = {
    drawPauseScreen: (ctx, canvas) => {
        ctx.save();

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "40px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);

        ctx.restore();
    },
};
