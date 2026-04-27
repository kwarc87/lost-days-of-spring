import { MessageRenderer } from "./MessageRenderer.js";
import { MESSAGES } from "../messages.js";

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
                title: MESSAGES.PAUSE.TITLE,
                lines: [MESSAGES.PAUSE.RESUME],
            },
            w / 2,
            h / 2,
            { padX: 32, padY: 24 },
        );
    },
};
