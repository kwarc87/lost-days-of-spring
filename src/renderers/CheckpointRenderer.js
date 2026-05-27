export const CheckpointRenderer = {
    draw(ctx, cp) {
        ctx.save();
        ctx.fillStyle = cp.reached ? "#68f288" : "#323031";
        ctx.fillRect(cp.x + 32, cp.y + 60, 16, 48);
        ctx.restore();
    },
};
