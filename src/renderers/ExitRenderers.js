import { getImg } from "../utils/imgCache.js";

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
            Math.round(exit.x),
            Math.round(exit.y),
            exit.dw,
            exit.dh
        );
        ctx.restore();
        if (debug) {
            const m = exit.triggerMargin ?? 0;
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(exit.x, exit.y, exit.dw, exit.dh);
            ctx.strokeStyle = "cyan";
            ctx.strokeRect(exit.x - m, exit.y - m, exit.dw + m * 2, exit.dh + m);
            ctx.restore();
        }
    },
};
