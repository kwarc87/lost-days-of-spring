import { getImg } from "../utils/imgCache.js";
import { GameFactory } from "../factories/GameFactory.js";

const SPIKE_IMG_PATH = "textures/tilesets.png";
const SPIKE_SW = 16;
const SPIKE_SH = 16;
const SPIKE_SCALE = GameFactory.SCALE;

const SPIKE_VARIANTS = {
    1: { sx: 0, sy: 240 },
    2: { sx: 16, sy: 240 },
};

export const DefaultSpikeRenderer = {
    draw: (ctx, spike, debug = false) => {
        const img = getImg(SPIKE_IMG_PATH);
        const { sx, sy } = SPIKE_VARIANTS[spike.variant] ?? SPIKE_VARIANTS[1];
        const up = spike.position === "up";
        const ox = spike.offsetX ?? 0;
        const oy = spike.offsetY ?? 0;

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        if (up) {
            ctx.translate(
                Math.round(spike.x + (SPIKE_SW * SPIKE_SCALE) / 2 + ox),
                Math.round(spike.y + (SPIKE_SH * SPIKE_SCALE) / 2 - 3 * GameFactory.SCALE + oy)
            );
            ctx.rotate(Math.PI);
            ctx.drawImage(
                img,
                sx,
                sy,
                SPIKE_SW,
                SPIKE_SH,
                (-SPIKE_SW * SPIKE_SCALE) / 2,
                (-SPIKE_SH * SPIKE_SCALE) / 2,
                SPIKE_SW * SPIKE_SCALE,
                SPIKE_SH * SPIKE_SCALE
            );
        } else {
            ctx.drawImage(
                img,
                sx,
                sy,
                SPIKE_SW,
                SPIKE_SH,
                Math.round(spike.x + ox),
                Math.round(spike.y + oy) - 4,
                SPIKE_SW * SPIKE_SCALE,
                SPIKE_SH * SPIKE_SCALE
            );
        }

        ctx.restore();

        if (debug) {
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(spike.x, spike.y, spike.w, spike.h);
            ctx.restore();
        }
    },
};
