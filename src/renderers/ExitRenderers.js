import { getImg } from "../utils/imgCache.js";
import { GameFactory } from "../factories/GameFactory.js";

export const DefaultExitRenderer = {
    drawMapExit: (ctx, exit) => {
        const x = Math.round(exit.x);
        const y = Math.round(exit.y);
        const dw = exit.w * GameFactory.SCALE;
        const dh = exit.h * GameFactory.SCALE;

        const poleW = Math.max(3, Math.round(dw * 0.07));
        const poleX = x + Math.round(dw * 0.2);

        // Pole
        ctx.fillStyle = "#22cc44";
        ctx.fillRect(poleX, y, poleW, dh);

        // Flag — triangle pointing right
        const flagLeft = poleX + poleW;
        const flagRight = x + Math.round(dw * 0.85);
        const flagTop = y;
        const flagBottom = y + Math.round(dh * 0.45);
        const flagMidY = flagTop + Math.round((flagBottom - flagTop) * 0.5);

        ctx.fillStyle = "#22cc44";
        ctx.beginPath();
        ctx.moveTo(flagLeft, flagTop);
        ctx.lineTo(flagRight, flagMidY);
        ctx.lineTo(flagLeft, flagBottom);
        ctx.closePath();
        ctx.fill();
    },

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
            Math.round(exit.x),
            Math.round(exit.y),
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
};
