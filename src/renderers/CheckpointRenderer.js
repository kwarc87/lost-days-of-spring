export const CheckpointRenderer = {
    draw(ctx, cp, debug = false) {
        ctx.save();
        ctx.fillStyle = cp.reached ? "#72eb84" : "#323031";
        ctx.fillRect(cp.x + 42, cp.y + 80, 20, 64);
        ctx.restore();
        if (debug) {
            ctx.save();
            ctx.strokeStyle = "cyan";
            ctx.lineWidth = 1;
            ctx.strokeRect(cp.x, cp.y, cp.w, cp.h);
            ctx.restore();
        }
    },

    drawMap(ctx, cp) {
        ctx.save();
        ctx.fillStyle = cp.reached ? "#72eb84" : "#f472b6";
        ctx.fillRect(cp.x, cp.y, cp.w, cp.h);
        ctx.restore();
    },
};
