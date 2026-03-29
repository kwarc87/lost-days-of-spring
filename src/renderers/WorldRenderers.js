/**
 * Default world background rendering strategy (Black Lodge style)
 */
export const DefaultWorldRenderer = {
    drawBackground: (ctx, canvas, camera) => {
        // Solid dark base
        ctx.fillStyle = "#050005";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const pixelSize = 8; // Simulate large pixels

        // Draw pixelated parallax texture/stars
        const numBlocks = 150;
        for (let i = 0; i < numBlocks; i++) {
            // Pseudo-random coordinates
            const pX = (i * 997) % canvas.width;
            const pY = (i * 331) % canvas.height;

            // Parallax shift
            const speed = 0.02 + (i % 5) * 0.03;
            const shiftX = (pX - camera.x * speed) % canvas.width;
            const shiftY = (pY - camera.y * speed) % canvas.height;

            const finalX = shiftX < 0 ? shiftX + canvas.width : shiftX;
            const finalY = shiftY < 0 ? shiftY + canvas.height : shiftY;

            // Snap to pixel grid
            const snapX = Math.floor(finalX / pixelSize) * pixelSize;
            const snapY = Math.floor(finalY / pixelSize) * pixelSize;

            const w = (1 + (i % 3)) * pixelSize;
            const h = (1 + ((i * 3) % 3)) * pixelSize;

            if (i % 3 === 0) {
                ctx.fillStyle = "#1a001a"; // Dark purple
            } else if (i % 3 === 1) {
                ctx.fillStyle = "#260013"; // Dark crimson
            } else {
                ctx.fillStyle = "#001a1a"; // Dark emerald/teal
            }

            ctx.fillRect(snapX, snapY, w, h);
        }

        // Draw a simulated pixelated vignette using stepped opaque/semi-transparent borders
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        const borderStep = 16;
        for (let i = 0; i < 4; i++) {
            const size = borderStep * (i + 1);
            ctx.fillRect(0, 0, canvas.width, size); // Top
            ctx.fillRect(0, canvas.height - size, canvas.width, size); // Bottom
            ctx.fillRect(0, 0, size, canvas.height); // Left
            ctx.fillRect(canvas.width - size, 0, size, canvas.height); // Right
        }
    },
};
