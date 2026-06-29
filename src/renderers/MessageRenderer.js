import { getImg } from "../utils/imgCache.js";

const BG_COLOR = "#3b1158";
const BORDER_COLOR = "#fff";
const BORDER_WIDTH = 2;
const CORNER_STEPS = 3;
const SHADOW_COLOR = "rgba(0, 0, 0, 0.55)";
const SHADOW_OFFSET = 1;

const FONT_TITLE = `normal 20px "Silkscreen", monospace`;
const FONT_BODY = `normal 14px "Silkscreen", monospace`;
const TITLE_H = 24;
const LINE_H = 14;

const PAD_X = 20;
const PAD_Y = 14;
const GAP = 6;
const GAP_AFTER_TITLE = 6;

function pixelRoundRectPath(ctx, x, y, w, h, step, steps) {
    const r = step * steps;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    for (let i = 0; i < steps; i++) {
        ctx.lineTo(x + w - r + (i + 1) * step, y + i * step);
        ctx.lineTo(x + w - r + (i + 1) * step, y + (i + 1) * step);
    }
    ctx.lineTo(x + w, y + h - r);
    for (let i = 0; i < steps; i++) {
        ctx.lineTo(x + w - i * step, y + h - r + (i + 1) * step);
        ctx.lineTo(x + w - (i + 1) * step, y + h - r + (i + 1) * step);
    }
    ctx.lineTo(x + r, y + h);
    for (let i = 0; i < steps; i++) {
        ctx.lineTo(x + r - (i + 1) * step, y + h - i * step);
        ctx.lineTo(x + r - (i + 1) * step, y + h - (i + 1) * step);
    }
    ctx.lineTo(x, y + r);
    for (let i = 0; i < steps; i++) {
        ctx.lineTo(x + i * step, y + r - (i + 1) * step);
        ctx.lineTo(x + (i + 1) * step, y + r - (i + 1) * step);
    }
    ctx.closePath();
}

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
        this.drawPanel(
            ctx,
            { title: message.title ?? null, lines: message.lines },
            anchorX,
            anchorY,
        );
    },

    drawBackground(
        ctx,
        panelX,
        panelY,
        panelW,
        panelH,
        border = null,
        bg = BG_COLOR,
    ) {
        if (border) {
            const { color, width: b, steps: s } = border;
            pixelRoundRectPath(ctx, panelX, panelY, panelW, panelH, b, s);
            ctx.fillStyle = color;
            ctx.fill();
            if (bg !== null) {
                pixelRoundRectPath(
                    ctx,
                    panelX + b,
                    panelY + b,
                    panelW - b * 2,
                    panelH - b * 2,
                    b,
                    s,
                );
                ctx.fillStyle = bg;
                ctx.fill();
            }
        } else if (bg !== null) {
            ctx.fillStyle = bg;
            ctx.fillRect(panelX, panelY, panelW, panelH);
        }
    },

    drawPanel(ctx, { title = null, lines = [] }, anchorX, anchorY, opts = {}) {
        const padX = opts.padX ?? PAD_X;
        const padY = opts.padY ?? PAD_Y;
        const gap = opts.gap ?? GAP;
        const icon = opts.icon ?? null;
        const ICON_GAP = 24;
        const iconTotalW = icon ? icon.size + ICON_GAP : 0;

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

        const panelW = Math.ceil(maxW) + padX * 2 + iconTotalW;
        let panelH = padY;
        if (title) {
            panelH += TITLE_H + GAP_AFTER_TITLE;
        }
        if (lines.length > 0) {
            panelH += lines.length * LINE_H + (lines.length - 1) * gap;
        }
        panelH += padY;
        if (icon) {
            panelH = Math.max(panelH, icon.size + padY);
        }

        const panelX = Math.round(anchorX - panelW / 2);
        const panelY = opts.anchorBottom
            ? Math.round(anchorY - panelH)
            : Math.round(anchorY - panelH / 2);
        const textAnchorX = anchorX + iconTotalW / 2;

        this.drawBackground(
            ctx,
            panelX,
            panelY,
            panelW,
            panelH,
            opts.border ?? {
                color: BORDER_COLOR,
                width: BORDER_WIDTH,
                steps: CORNER_STEPS,
            },
            opts.bg ?? BG_COLOR,
        );

        if (icon) {
            const iconImg = getImg(icon.url);
            if (iconImg) {
                const iconX = Math.round(panelX + padX);
                const iconY = Math.round(panelY + (panelH - icon.size) / 2);
                ctx.save();
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(
                    iconImg,
                    icon.sx,
                    icon.sy,
                    icon.sw,
                    icon.sh,
                    iconX,
                    iconY,
                    icon.size,
                    icon.size,
                );
                ctx.restore();
            }
        }

        ctx.textBaseline = "top";
        let textBlockH = 0;
        if (title) {
            textBlockH += TITLE_H + GAP_AFTER_TITLE;
        }
        if (lines.length > 0) {
            textBlockH += lines.length * LINE_H + (lines.length - 1) * gap;
        }
        const startY =
            icon && textBlockH < panelH - padY * 2
                ? Math.round(panelY + (panelH - textBlockH) / 2)
                : panelY + padY;
        let curY = startY;

        if (title) {
            ctx.font = FONT_TITLE;
            ctx.textAlign = "center";
            ctx.fillStyle = SHADOW_COLOR;
            ctx.fillText(
                title.text,
                textAnchorX + SHADOW_OFFSET,
                curY + SHADOW_OFFSET,
            );
            ctx.fillStyle = title.color ?? "#fff";
            ctx.fillText(title.text, textAnchorX, curY);
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
                let cx = Math.round(textAnchorX - lineW / 2);
                ctx.textAlign = "left";
                for (const { text, color } of l.segments) {
                    ctx.fillStyle = color ?? "#fff";
                    ctx.fillText(text, cx, curY);
                    cx += ctx.measureText(text).width;
                }
            } else {
                ctx.textAlign = "center";
                ctx.fillStyle = SHADOW_COLOR;
                ctx.fillText(
                    l.text,
                    textAnchorX + SHADOW_OFFSET,
                    curY + SHADOW_OFFSET,
                );
                ctx.fillStyle = l.color ?? "#fff";
                ctx.fillText(l.text, textAnchorX, curY);
            }
            curY += LINE_H + (i < lines.length - 1 ? gap : 0);
        }

        ctx.restore();
    },
};
