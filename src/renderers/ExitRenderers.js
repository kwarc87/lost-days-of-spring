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
};
