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

    getMessageLines: (hasEnoughCoins, hasEnoughSplinters) => {
        if (hasEnoughCoins && hasEnoughSplinters) {
            return [
                { text: "You are ready to move on.", color: "#3d9f97" },
                { text: "To exit level press Enter", color: "#ffffff" },
            ];
        }
        const lines = [];
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
        return lines;
    },
};
