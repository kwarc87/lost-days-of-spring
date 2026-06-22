export const TransitionRenderer = {
    drawFadeOut(ctx, canvas, progress) {
        ctx.globalAlpha = progress;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
    },

    drawFadeIn(ctx, canvas, progress) {
        ctx.globalAlpha = 1 - progress;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
    },
};
