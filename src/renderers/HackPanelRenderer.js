import { GameFactory } from "../factories/GameFactory.js";
import { getImg } from "../utils/imgCache.js";

// Fills `rows` sprite-pixel rows of a screen, starting at `fromRow` (keeps the pixel-art grid).
function fillScreen(ctx, panel, screen, color, fromRow = 0, rows = screen.h) {
    const s = GameFactory.SCALE;
    ctx.fillStyle = color;
    ctx.fillRect(
        Math.round(panel.x) + screen.x * s,
        Math.round(panel.y) + (screen.y + fromRow) * s,
        screen.w * s,
        rows * s
    );
}

// While hacking the bar fills from the bottom; while active it drains from the top.
function drawProgressScreen(ctx, panel) {
    const screen = panel.progressScreen;
    const ratio = panel.active ? panel.activeRatio : panel.hackProgress;
    const rows = panel.active ? Math.ceil(ratio * screen.h) : Math.round(ratio * screen.h);
    if (rows > 0) {
        fillScreen(ctx, panel, screen, panel.barColor, screen.h - rows, rows);
    }
}

// Status (left) screen: blinks amber when idle, glows steady amber while being hacked,
// blinks green while active (colors come from the panel: idleColor / hackingColor / onColor).
function drawStatusScreen(ctx, panel, now) {
    const isHacking = !panel.active && panel.hackStartedAt !== null;
    const blinkOn = Math.floor(now / panel.blinkMs) % 2 === 0;
    if (!isHacking && !blinkOn) {
        return;
    }
    let color = panel.idleColor;
    if (panel.active) {
        color = panel.onColor;
    } else if (isHacking) {
        color = panel.hackingColor;
    }
    fillScreen(ctx, panel, panel.statusScreen, color);
}

export const HackPanelRenderer = {
    draw(ctx, panel, { debug = false, now = 0 } = {}) {
        const img = getImg(panel.url);
        if (!img?.complete || !img.naturalWidth) {
            return;
        }
        // w/h are world pixels (pre-scaled); source size is derived by dividing back.
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            img,
            panel.cordX,
            panel.cordY,
            panel.w / GameFactory.SCALE,
            panel.h / GameFactory.SCALE,
            Math.round(panel.x),
            Math.round(panel.y),
            panel.w,
            panel.h
        );
        drawStatusScreen(ctx, panel, now);
        drawProgressScreen(ctx, panel);
        ctx.restore();
        if (debug) {
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
            ctx.restore();
        }
    },
};
