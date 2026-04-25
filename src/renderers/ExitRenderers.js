import { getImg } from "../utils/imgCache.js";
import { GameFactory } from "../factories/GameFactory.js";

export const DefaultExitRenderer = {
    draw: (ctx, exit, debug = false) => {
        const img = getImg(exit.url);
        if (!img?.complete || !img.naturalWidth) {
            return;
        }
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            img,
            exit.cordX,
            exit.cordY,
            exit.w,
            exit.h,
            exit.x,
            exit.y,
            exit.w * GameFactory.SCALE,
            exit.h * GameFactory.SCALE,
        );
        ctx.restore();
        if (debug) {
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                exit.x,
                exit.y,
                exit.w * GameFactory.SCALE,
                exit.h * GameFactory.SCALE,
            );
            ctx.restore();
        }
    },

    drawMessage: (
        ctx,
        canvas,
        hasEnoughCoins,
        hasEnoughSplinters,
        exitScreenY = null,
        exitScreenX = null,
    ) => {
        const w = canvas.width;
        const h = canvas.height;

        const font = `bold 13px "Silkscreen", monospace`;

        const bothReady = hasEnoughCoins && hasEnoughSplinters;

        const lines = []; // { text, color }
        if (bothReady) {
            lines.push({ text: "You are ready to move on.", color: "#3d9f97" });
            lines.push({ text: "To exit level press Enter", color: "#ffffff" });
        } else {
            if (!hasEnoughCoins) {
                lines.push({
                    text: "You didn't get enough coins",
                    color: "#f5c542",
                });
            }
            if (!hasEnoughSplinters) {
                lines.push({
                    text: "You didn't get enough splinters",
                    color: "#5ce8d0",
                });
            }
            lines.push({ text: "to complete the level.", color: "#ffffff" });
        }

        const padX = 20;
        const padY = 14;
        const gap = 6;
        const lineH = 13;

        ctx.save();
        ctx.font = font;

        let maxW = 0;
        for (const l of lines) {
            maxW = Math.max(maxW, ctx.measureText(l.text).width);
        }

        const panelW = maxW + padX * 2;
        const panelH =
            padY + lines.length * lineH + (lines.length - 1) * gap + padY;
        const anchorX = exitScreenX !== null ? exitScreenX : w / 2;
        const anchorY = exitScreenY !== null ? exitScreenY : h / 2;
        const panelX = Math.round(anchorX - panelW / 2);
        const panelY = Math.round(anchorY - panelH / 2);

        ctx.fillStyle = "rgba(15, 23, 32, 0.75)";
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 8);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        for (let i = 0; i < lines.length; i++) {
            const { text, color } = lines[i];
            const ty = panelY + padY + i * (lineH + gap);
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            ctx.fillText(text, anchorX + 1, ty + 1);
            ctx.fillStyle = color;
            ctx.fillText(text, anchorX, ty);
        }

        ctx.restore();
    },
};
