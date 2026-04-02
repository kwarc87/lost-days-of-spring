export const DebugGridRenderer = {
    draw(ctx, camera, worldSize, gapX = 50, gapY = 50) {
        ctx.save();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.5;

        const startX = Math.floor(camera.x / gapX) * gapX;
        const endX = camera.x + camera.width;
        const startY = Math.floor(camera.y / gapY) * gapY;
        const endY = camera.y + camera.height;

        ctx.beginPath();
        for (let x = startX; x <= endX; x += gapX) {
            ctx.moveTo(x, camera.y);
            ctx.lineTo(x, camera.y + camera.height);
        }
        for (let y = startY; y <= endY; y += gapY) {
            ctx.moveTo(camera.x, y);
            ctx.lineTo(camera.x + camera.width, y);
        }
        ctx.stroke();

        ctx.restore();
    },
};
