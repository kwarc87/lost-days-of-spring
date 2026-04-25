// ─── Shared visual constants (reference: exitMessage style) ──────────────────
const BG_COLOR = "rgba(15, 23, 32, 0.75)";
const RADIUS = 8;
const SHADOW_COLOR = "rgba(0, 0, 0, 0.55)";
const SHADOW_OFFSET = 1;

const FONT_TITLE = `bold 24px "Silkscreen", monospace`;
const FONT_BODY = `bold 13px "Silkscreen", monospace`;
const TITLE_H = 24;
const LINE_H = 13;

// Default padding / spacing (match exitMessage)
const PAD_X = 20;
const PAD_Y = 14;
const GAP = 6;
const GAP_AFTER_TITLE = 16;

export const MessageRenderer = {
    /**
     * Draws only the rounded semi-transparent panel background.
     * Use this when the caller manages content rendering itself.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} panelX
     * @param {number} panelY
     * @param {number} panelW
     * @param {number} panelH
     */
    drawBackground(ctx, panelX, panelY, panelW, panelH) {
        ctx.fillStyle = BG_COLOR;
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, RADIUS);
        ctx.fill();
    },

    /**
     * Measures, lays out and draws a complete text panel:
     * background → optional title → body lines.
     * The panel is centred on (anchorX, anchorY).
     *
     * Each line is either:
     *   { text: string, color: string }          — single colour with shadow
     *   { segments: { text: string, color: string }[] } — multi-colour, no shadow
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {{ title?: {text:string, color:string}, lines?: (SingleLine|SegmentedLine)[] }} content
     * @param {number} anchorX  horizontal centre of the panel (px)
     * @param {number} anchorY  vertical centre of the panel (px)
     * @param {{ padX?:number, padY?:number, gap?:number }} [opts]
     */
    drawPanel(ctx, { title = null, lines = [] }, anchorX, anchorY, opts = {}) {
        const padX = opts.padX ?? PAD_X;
        const padY = opts.padY ?? PAD_Y;
        const gap = opts.gap ?? GAP;

        ctx.save();

        // ── Measure ───────────────────────────────────────────────────────
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

        // ── Background ────────────────────────────────────────────────────
        this.drawBackground(ctx, panelX, panelY, panelW, panelH);

        ctx.textBaseline = "top";
        let curY = panelY + padY;

        // ── Title ─────────────────────────────────────────────────────────
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

        // ── Body lines ────────────────────────────────────────────────────
        ctx.font = FONT_BODY;
        for (let i = 0; i < lines.length; i++) {
            const l = lines[i];
            if (l.segments) {
                // Multi-colour segmented line — left-aligned from the left edge of the content area
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
