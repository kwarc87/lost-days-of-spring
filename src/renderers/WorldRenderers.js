/**
 * Default world background rendering strategy (Black Lodge style)
 */
export const DefaultWorldRenderer = {
    drawBackground: (ctx, canvas, camera) => {
        // Base dark scarlet red background (using a radial gradient to give it a vignette/shadowy feel)
        const bgGradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            canvas.height / 4,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width,
        );
        bgGradient.addColorStop(0, "#a00016"); // Brighter scarlet center
        bgGradient.addColorStop(1, "#170003"); // Very dark, shadowy edges

        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw vertical repeating curtains with shadow/gradient simulation
        const stripeWidth = 50;
        const bgOffsetX = -(camera.x * 0.3) % (stripeWidth * 2);

        // We create a linear gradient for each darker 'fold' of the curtain
        for (let x = bgOffsetX; x < canvas.width; x += stripeWidth * 2) {
            // Diagonal gradient for the stripe to give a more natural, subtle shading across the entire fold
            const curtainGradient = ctx.createLinearGradient(
                x,
                0,
                x + stripeWidth,
                canvas.height,
            );
            curtainGradient.addColorStop(0.5, "rgba(65, 0, 0, 0.8)");
            curtainGradient.addColorStop(0, "rgba(100, 0, 10, 0.5)");

            ctx.fillStyle = curtainGradient;
            ctx.fillRect(x, 0, stripeWidth, canvas.height);
        }

        // Overall global overlay shadow logic (dimming the entire room slightly)
        ctx.fillStyle = "rgba(10, 0, 5, 0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
};
