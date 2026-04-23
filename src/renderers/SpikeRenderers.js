import { getImg } from "../utils/imgCache.js";

const SPIKE_IMG_PATH = "textures/spike.png";
const SPIKE_SW = 16;
const SPIKE_SH = 16;
const SPIKE_SCALE = 3;

const SPIKE_VARIANTS = {
    1: { sx: 0, sy: 0 },
    2: { sx: 16, sy: 0 },
};

export const DefaultSpikeRenderer = {
    draw: (ctx, spike) => {
        const img = getImg(SPIKE_IMG_PATH);
        const { sx, sy } = SPIKE_VARIANTS[spike.variant] ?? SPIKE_VARIANTS[1];

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            img,
            sx,
            sy,
            SPIKE_SW,
            SPIKE_SH,
            spike.x,
            spike.y,
            SPIKE_SW * SPIKE_SCALE,
            SPIKE_SH * SPIKE_SCALE,
        );
        ctx.restore();
    },
    drawMapSpike: (ctx, spike) => {
        ctx.save();
        ctx.fillStyle = "#e84855";
        ctx.beginPath();
        ctx.moveTo(spike.x + spike.w / 2, spike.y);
        ctx.lineTo(spike.x + spike.w, spike.y + spike.h);
        ctx.lineTo(spike.x, spike.y + spike.h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },
};
