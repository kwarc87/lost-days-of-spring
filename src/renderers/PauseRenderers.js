import { MessageRenderer } from "./MessageRenderer.js";

export const DefaultPauseRenderer = {
    drawPauseScreen: (ctx, canvas) => {
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        MessageRenderer.drawPanel(
            ctx,
            {
                title: { text: "PAUSED", color: "#f5c542" },
                lines: [{ text: "P \u2013 resume", color: "#7a8a99" }],
            },
            w / 2,
            h / 2,
            { padX: 32, padY: 24 },
        );
    },
};
