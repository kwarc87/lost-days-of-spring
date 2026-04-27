const BG_COLOR = "rgba(15, 23, 32, 0.75)";
const RADIUS = 8;
const SHADOW_COLOR = "rgba(0, 0, 0, 0.55)";
const SHADOW_OFFSET = 1;

const FONT_TITLE = `bold 24px "Silkscreen", monospace`;
const FONT_BODY = `bold 13px "Silkscreen", monospace`;
const TITLE_H = 24;
const LINE_H = 13;

const PAD_X = 20;
const PAD_Y = 14;
const GAP = 6;
const GAP_AFTER_TITLE = 16;

export const MessageRenderer = {
    // "hitbox": panel centred on the message hitbox in world→screen space.
    // "viewPort": panel centred on the canvas, ignoring world scroll.
    drawMessagePanel(ctx, canvas, message, camera) {
        const ox = message.offsetX ?? 0;
        const oy = message.offsetY ?? 0;
        const anchorX =
            message.relatedTo === "viewPort"
                ? canvas.width / 2 + ox
                : message.x - camera.x + message.w / 2 + ox;
        const anchorY =
            message.relatedTo === "viewPort"
                ? canvas.height / 2 + oy
                : message.y - camera.y + message.h / 2 + oy;
        this.drawPanel(ctx, { lines: message.lines }, anchorX, anchorY);
    },

    drawBackground(ctx, panelX, panelY, panelW, panelH) {
        ctx.fillStyle = BG_COLOR;
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, RADIUS);
        ctx.fill();
    },

    drawPanel(ctx, { title = null, lines = [] }, anchorX, anchorY, opts = {}) {
        const padX = opts.padX ?? PAD_X;
        const padY = opts.padY ?? PAD_Y;
        const gap = opts.gap ?? GAP;

        ctx.save();

        let maxW = 0;
        if (title) {
            ctx.font = FONT_TITLE;
            maxW = Math.max(maxW, ctx.measureText(title.text).width);
        }
        ctx.font = FONT_BODY;
        for (const l of lines) {
            const w = l.segments
                ? l.segments.reduce(
                      (s, seg) => s + ctx.measureText(seg.text).width,
                      0,
                  )
                : ctx.measureText(l.text).width;
            maxW = Math.max(maxW, w);
        }

        const panelW = Math.ceil(maxW) + padX * 2;
        let panelH = padY;
        if (title) {
            panelH += TITLE_H + GAP_AFTER_TITLE;
        }
        if (lines.length > 0) {
            panelH += lines.length * LINE_H + (lines.length - 1) * gap;
        }
        panelH += padY;

        const panelX = Math.round(anchorX - panelW / 2);
        const panelY = Math.round(anchorY - panelH / 2);

        this.drawBackground(ctx, panelX, panelY, panelW, panelH);

        ctx.textBaseline = "top";
        let curY = panelY + padY;

        if (title) {
            ctx.font = FONT_TITLE;
            ctx.textAlign = "center";
            ctx.fillStyle = SHADOW_COLOR;
            ctx.fillText(
                title.text,
                anchorX + SHADOW_OFFSET,
                curY + SHADOW_OFFSET,
            );
            ctx.fillStyle = title.color;
            ctx.fillText(title.text, anchorX, curY);
            curY += TITLE_H + GAP_AFTER_TITLE;
        }

        ctx.font = FONT_BODY;
        for (let i = 0; i < lines.length; i++) {
            const l = lines[i];
            if (l.segments) {
                const lineW = l.segments.reduce(
                    (s, seg) => s + ctx.measureText(seg.text).width,
                    0,
                );
                let cx = Math.round(anchorX - lineW / 2);
                ctx.textAlign = "left";
                for (const { text, color } of l.segments) {
                    ctx.fillStyle = color;
                    ctx.fillText(text, cx, curY);
                    cx += ctx.measureText(text).width;
                }
            } else {
                ctx.textAlign = "center";
                ctx.fillStyle = SHADOW_COLOR;
                ctx.fillText(
                    l.text,
                    anchorX + SHADOW_OFFSET,
                    curY + SHADOW_OFFSET,
                );
                ctx.fillStyle = l.color;
                ctx.fillText(l.text, anchorX, curY);
            }
            curY += LINE_H + (i < lines.length - 1 ? gap : 0);
        }

        ctx.restore();
    },
};
