/**
 * Default level-complete screen rendering strategy
 */
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

        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 0, w, h);

        ctx.textAlign = "center";

        ctx.fillStyle = "#f5c542";
        ctx.font = `bold ${Math.round(h * 0.08)}px sans-serif`;
        ctx.fillText("LEVEL COMPLETE!", w / 2, h * 0.38);

        ctx.fillStyle = "#ffffff";
        ctx.font = `${Math.round(h * 0.045)}px sans-serif`;
        ctx.fillText(
            `Zebrano: ${collectiblesCount} / ${totalCollectibles}`,
            w / 2,
            h * 0.5,
        );

        ctx.fillStyle = "#aaaaaa";
        ctx.font = `${Math.round(h * 0.032)}px sans-serif`;
        ctx.fillText(
            `Restart za ${remaining}s  –  wciśnij Spację`,
            w / 2,
            h * 0.62,
        );

        ctx.restore();
    },
};
