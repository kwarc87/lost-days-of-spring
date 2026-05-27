const FONT_TITLE = `bold 24px "Silkscreen", monospace`;
const FONT_BODY = `bold 13px "Silkscreen", monospace`;
const TITLE_COLOR = "#f5c542";
const ITEM_COLOR = "#ffffff";
const ITEM_DIMMED_COLOR = "#7a8a99";
const TRIANGLE_COLOR = "#f5c542";
const SHADOW_COLOR = "rgba(0, 0, 0, 0.55)";
const SHADOW_OFFSET = 1;

const MENU_ITEMS = ["Resume", "Restart"];

const PAD_X = 36;
const PAD_Y = 20;
const TITLE_H = 24;
const TITLE_GAP = 18;
const ITEM_H = 18;
const ITEM_GAP = 10;
const TRIANGLE_W = 10;
const TRIANGLE_PAD = 10;

export const DefaultPauseRenderer = {
    menuItemCount: MENU_ITEMS.length,

    // Full pause screen: dark overlay + panel. Call once when pausing.
    drawPauseScreen(ctx, canvas, selectedIndex = 0) {
        this.drawPauseBackground(ctx, canvas);
        this.drawPausePanel(ctx, canvas, selectedIndex);
    },

    // Full-screen dark overlay only.
    drawPauseBackground(ctx, canvas) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    },

    // Panel + items only. Background is fully opaque so redrawing cleanly
    // replaces the previous panel without blending issues — no snapshot needed.
    drawPausePanel(ctx, canvas, selectedIndex = 0) {
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();

        ctx.font = FONT_BODY;
        let maxItemW = 0;
        for (const item of MENU_ITEMS) {
            maxItemW = Math.max(maxItemW, ctx.measureText(item).width);
        }

        const contentW = TRIANGLE_W + TRIANGLE_PAD + maxItemW;
        ctx.font = FONT_TITLE;
        const titleW = ctx.measureText("PAUSED").width;
        const panelW = Math.ceil(Math.max(contentW, titleW)) + PAD_X * 2;
        const panelH =
            PAD_Y +
            TITLE_H +
            TITLE_GAP +
            MENU_ITEMS.length * ITEM_H +
            (MENU_ITEMS.length - 1) * ITEM_GAP +
            PAD_Y;

        const panelX = Math.round(w / 2 - panelW / 2);
        const panelY = Math.round(h / 2 - panelH / 2);

        // Fully opaque panel background — overwrites previous panel cleanly
        ctx.fillStyle = "rgb(15, 23, 32)";
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 8);
        ctx.fill();

        // Title
        ctx.font = FONT_TITLE;
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.fillStyle = SHADOW_COLOR;
        ctx.fillText(
            "PAUSED",
            w / 2 + SHADOW_OFFSET,
            panelY + PAD_Y + SHADOW_OFFSET,
        );
        ctx.fillStyle = TITLE_COLOR;
        ctx.fillText("PAUSED", w / 2, panelY + PAD_Y);

        // Menu items
        ctx.font = FONT_BODY;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        const itemsStartY = panelY + PAD_Y + TITLE_H + TITLE_GAP;

        for (let i = 0; i < MENU_ITEMS.length; i++) {
            const itemCenterY =
                itemsStartY + i * (ITEM_H + ITEM_GAP) + ITEM_H / 2;
            const isSelected = i === selectedIndex;
            const textX = panelX + PAD_X + TRIANGLE_W + TRIANGLE_PAD;

            if (isSelected) {
                const tx = panelX + PAD_X;
                ctx.fillStyle = TRIANGLE_COLOR;
                ctx.beginPath();
                ctx.moveTo(tx, itemCenterY - TRIANGLE_W / 2);
                ctx.lineTo(tx, itemCenterY + TRIANGLE_W / 2);
                ctx.lineTo(tx + TRIANGLE_W, itemCenterY);
                ctx.closePath();
                ctx.fill();
            }

            ctx.fillStyle = SHADOW_COLOR;
            ctx.fillText(
                MENU_ITEMS[i],
                textX + SHADOW_OFFSET,
                itemCenterY + SHADOW_OFFSET,
            );
            ctx.fillStyle = isSelected ? ITEM_COLOR : ITEM_DIMMED_COLOR;
            ctx.fillText(MENU_ITEMS[i], textX, itemCenterY);
        }

        ctx.restore();
    },
};
