import { getImg } from "../utils/imgCache.js";
import { DefaultPlatformRenderer } from "./PlatformRenderers.js";

const TITLE_FONT = `normal 90px "Jacquard 12"`;
const PROMPT_FONT = `500 24px "Silkscreen", monospace`;
const CREDITS_FONT = `400 14px "Silkscreen", monospace`;

const TITLE_COLOR = "#73c3eb";
const PROMPT_COLOR = "#f0cc8b";
const CREDITS_COLOR = "#c8c8c8";
const OUTLINE_COLOR = "#3b1158";
const TITLE_OUTLINE_WIDTH = 14;
const TEXT_OUTLINE_WIDTH = 3;

function drawOutlinedText(
    ctx,
    text,
    x,
    y,
    fillColor,
    outlineColor,
    outlineWidth,
) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.lineJoin = "mitel";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
}

export const TitleScreenRenderer = {
    draw(ctx, canvas, hasSave) {
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // Background image (tiled), fallback to black
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);

        const t = performance.now() / 1000;
        const offsetBack = Math.round(Math.sin(t * 0.09) * 40);
        const offsetMid = Math.round(Math.sin(t * 0.12 + 1.2) * 80);

        const bgBack = getImg("textures/background/background.png");
        if (bgBack.complete && bgBack.naturalWidth > 0) {
            const drawH = h;
            const drawW = Math.round(
                bgBack.naturalWidth * (h / bgBack.naturalHeight),
            );
            const ox = ((offsetBack % drawW) + drawW) % drawW;
            for (let x = ox - drawW; x < w; x += drawW) {
                ctx.drawImage(bgBack, x, 0, drawW, drawH);
            }
        }

        // Middleground image tiled horizontally
        const bg = getImg("textures/background/middleground.png");
        if (bg.complete && bg.naturalWidth > 0) {
            const drawH = h;
            const drawW = Math.round(bg.naturalWidth * (h / bg.naturalHeight));
            const ox = ((offsetMid % drawW) + drawW) % drawW;
            for (let x = ox - drawW; x < w; x += drawW) {
                ctx.drawImage(bg, x, 0, drawW, drawH);
            }
        }

        // ── Title ──────────────────────────────────────────────
        ctx.font = TITLE_FONT;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const titleY = 90;

        drawOutlinedText(
            ctx,
            "Lost Days of Spring",
            w / 2,
            titleY,
            TITLE_COLOR,
            OUTLINE_COLOR,
            TITLE_OUTLINE_WIDTH,
        );

        // ── Press Enter prompt (blinking) ──────────────────────
        const BLINK_PERIOD = 400; // ms for one full on/off cycle
        const visible = Math.floor(performance.now() / BLINK_PERIOD) % 2 === 0;

        if (visible) {
            const promptText = hasSave
                ? "Press Enter to continue"
                : "Press Enter to start";
            ctx.font = PROMPT_FONT;
            ctx.textBaseline = "middle";
            const promptY = Math.round(h * 0.54);

            ctx.strokeStyle = OUTLINE_COLOR;
            ctx.lineWidth = 6;
            ctx.lineJoin = "mitel";
            ctx.strokeText(promptText, w / 2, promptY);

            ctx.fillStyle = PROMPT_COLOR;
            ctx.fillText(promptText, w / 2, promptY);
        }

        // ── Credits ────────────────────────────────────────────
        ctx.font = CREDITS_FONT;
        ctx.textBaseline = "bottom";
        const creditsText = "\u00a9 Game created by Jakub Kwarcinski";
        const creditsY = h - 24;

        drawOutlinedText(
            ctx,
            creditsText,
            w / 2,
            creditsY,
            CREDITS_COLOR,
            OUTLINE_COLOR,
            TEXT_OUTLINE_WIDTH,
        );

        // ── Skull decorations ──────────────────────────────────
        const skull = getImg("textures/skull.png");
        if (skull.complete && skull.naturalWidth > 0) {
            const sw = 81,
                sh = 97;
            const scale = 4;
            const dw = sw * scale;
            const dh = sh * scale;
            const dy = Math.round(h / 2 - dh / 2);

            ctx.drawImage(skull, 0, 0, sw, sh, -25, dy, dw, dh);

            ctx.save();
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(skull, 0, 0, sw, sh, -25, dy, dw, dh);
            ctx.restore();
        }

        // ── Side wall platforms ────────────────────────────────
        const TILE = 48;

        ctx.save();
        ctx.translate(0, h);
        ctx.rotate(-Math.PI / 2);
        DefaultPlatformRenderer.draw(
            ctx,
            {
                x: -TILE,
                y: -TILE,
                w: h + TILE * 2,
                h: TILE * 3,
                layout: "ground",
            },
            false,
            {
                x: -TILE,
                y: -TILE,
                width: h + TILE * 2,
                height: TILE * 3,
                margin: 0,
            },
        );
        ctx.restore();

        ctx.save();
        ctx.translate(w, 0);
        ctx.rotate(Math.PI / 2);
        DefaultPlatformRenderer.draw(
            ctx,
            {
                x: -TILE,
                y: -TILE,
                w: h + TILE * 2,
                h: TILE * 3,
                layout: "ground",
            },
            false,
            {
                x: -TILE,
                y: -TILE,
                width: h + TILE * 2,
                height: TILE * 3,
                margin: 0,
            },
        );
        ctx.restore();

        ctx.restore();
    },
};
