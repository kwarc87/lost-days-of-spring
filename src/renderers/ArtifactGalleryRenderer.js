import { getImg } from "../utils/imgCache.js";
import { MessageRenderer } from "./MessageRenderer.js";

const ICON_SIZE = 80;
const ICON_OUTLINE = 6;
const ICON_SLOT = ICON_SIZE + ICON_OUTLINE * 2; // 92
const ICON_GAP = 16;
const VISIBLE = 7;
const CAROUSEL_W = VISIBLE * ICON_SLOT + (VISIBLE - 1) * ICON_GAP; // 740
const PANEL_PAD = 32;
const PANEL_W = CAROUSEL_W + PANEL_PAD * 2; // 804
const INDICATOR_H = 12;
const INDICATOR_GAP = 8;
const ANIM_DURATION = 150;
const FONT_TITLE = `normal 24px "Silkscreen", monospace`;
const FONT_BODY = `normal 18px "Silkscreen", monospace`;
const HINT_COLOR = "#7a8a99";
const SHADOW_COLOR = "rgba(0,0,0,0.55)";

// Outer border: all offsets within radius ICON_OUTLINE (circle fill → only boundary is visible after sprite drawn on top)
const OUTLINE_OFFSETS = [];
for (let ox = -ICON_OUTLINE; ox <= ICON_OUTLINE; ox++) {
    for (let oy = -ICON_OUTLINE; oy <= ICON_OUTLINE; oy++) {
        if (
            ox * ox + oy * oy <= ICON_OUTLINE * ICON_OUTLINE &&
            (ox !== 0 || oy !== 0)
        ) {
            OUTLINE_OFFSETS.push([ox, oy]);
        }
    }
}

let _iconOc = null,
    _iconOctx = null;
let _borderOc = null,
    _borderOctx = null;

function getIconCanvas() {
    if (!_iconOc) {
        _iconOc = document.createElement("canvas");
        _iconOc.width = ICON_SLOT;
        _iconOc.height = ICON_SLOT;
        _iconOctx = _iconOc.getContext("2d");
    }
    return [_iconOc, _iconOctx];
}

function getBorderCanvas() {
    if (!_borderOc) {
        _borderOc = document.createElement("canvas");
        _borderOc.width = ICON_SLOT;
        _borderOc.height = ICON_SLOT;
        _borderOctx = _borderOc.getContext("2d");
    }
    return [_borderOc, _borderOctx];
}

function estimateDescHeight(artifact) {
    if (!artifact?.collected || !artifact.message) return 18;
    const { title, lines = [] } = artifact.message;
    let h = 0;
    if (title) h += 32 + 6;
    if (lines.length > 0) h += lines.length * 18 + (lines.length - 1) * 6;
    return Math.max(h, 18);
}

export class ArtifactGalleryRenderer {
    constructor() {
        this.isOpen = false;
        this.artifacts = [];
        this.selectedIndex = 0;
        this._animOffset = 0;
        this._animStartOffset = 0;
        this._animStartAt = 0;
        this._maxDescH = 54;
    }

    open(artifacts, startIndex = 0) {
        this.isOpen = true;
        this.artifacts = artifacts;
        this.selectedIndex = Math.min(
            Math.max(startIndex, 0),
            Math.max(artifacts.length - 1, 0),
        );
        this._animOffset = 0;
        this._animStartOffset = 0;
        this._maxDescH =
            artifacts.length > 0
                ? Math.max(...artifacts.map(estimateDescHeight))
                : 54;
    }

    close() {
        this.isOpen = false;
    }

    navigateLeft() {
        if (this.selectedIndex <= 0) return;
        this.selectedIndex--;
        this._animOffset = -(ICON_SLOT + ICON_GAP);
        this._animStartOffset = this._animOffset;
        this._animStartAt = performance.now();
    }

    navigateRight() {
        if (this.selectedIndex >= this.artifacts.length - 1) return;
        this.selectedIndex++;
        this._animOffset = ICON_SLOT + ICON_GAP;
        this._animStartOffset = this._animOffset;
        this._animStartAt = performance.now();
    }

    draw(ctx, canvas, now) {
        if (!this.isOpen || this.artifacts.length === 0) return;

        if (this._animOffset !== 0) {
            const t = Math.min((now - this._animStartAt) / ANIM_DURATION, 1);
            this._animOffset = this._animStartOffset * (1 - t);
            if (t >= 1) this._animOffset = 0;
        }

        const cw = canvas.width;
        const ch = canvas.height;
        const carouselX = Math.round(cw / 2 - CAROUSEL_W / 2);
        const panelX = Math.round(cw / 2 - PANEL_W / 2);
        const centerX = cw / 2;

        const SECTION_GAP = 16;
        const ESC_H = 18;
        const CAROUSEL_SECTION =
            INDICATOR_H +
            INDICATOR_GAP +
            ICON_SLOT +
            INDICATOR_GAP +
            INDICATOR_H;
        const PANEL_H =
            PANEL_PAD +
            CAROUSEL_SECTION +
            SECTION_GAP +
            this._maxDescH +
            SECTION_GAP +
            ESC_H +
            PANEL_PAD;

        const panelY = Math.round(ch / 2 - PANEL_H / 2);
        const carouselY = panelY + PANEL_PAD + INDICATOR_H + INDICATOR_GAP;

        ctx.save();

        ctx.fillStyle = "rgba(0,0,0,0.72)";
        ctx.fillRect(0, 0, cw, ch);

        MessageRenderer.drawBackground(
            ctx,
            panelX,
            panelY,
            PANEL_W,
            PANEL_H,
            { color: "#fff", width: 2, steps: 3 },
            "#3b1158",
        );

        // Carousel clipped region (extended vertically to show icon border)
        ctx.save();
        ctx.beginPath();
        ctx.rect(
            carouselX,
            carouselY - ICON_OUTLINE,
            CAROUSEL_W,
            ICON_SLOT + ICON_OUTLINE * 2,
        );
        ctx.clip();

        for (let slot = -1; slot <= VISIBLE; slot++) {
            const idx = this.selectedIndex - 3 + slot;
            if (idx < 0 || idx >= this.artifacts.length) continue;
            const slotX =
                carouselX + slot * (ICON_SLOT + ICON_GAP) + this._animOffset;
            this._drawArtifactIcon(
                ctx,
                this.artifacts[idx],
                slotX,
                carouselY,
                idx === this.selectedIndex,
            );
        }
        ctx.restore();

        // Selection indicator triangles (▼ above, ▲ below center slot)
        const TRI_W = 12,
            TRI_H = 10;
        ctx.fillStyle = "#fff";

        const aboveY = panelY + PANEL_PAD;
        ctx.beginPath();
        ctx.moveTo(centerX - TRI_W / 2, aboveY);
        ctx.lineTo(centerX + TRI_W / 2, aboveY);
        ctx.lineTo(centerX, aboveY + TRI_H);
        ctx.closePath();
        ctx.fill();

        const belowY = carouselY + ICON_SLOT + INDICATOR_GAP;
        ctx.beginPath();
        ctx.moveTo(centerX - TRI_W / 2, belowY + TRI_H);
        ctx.lineTo(centerX + TRI_W / 2, belowY + TRI_H);
        ctx.lineTo(centerX, belowY);
        ctx.closePath();
        ctx.fill();

        // Nav arrows (left / right, shown when items exist beyond the 7-item viewport)
        const navCY = carouselY + ICON_SLOT / 2;
        const NAV_W = 10,
            NAV_H = 16;

        if (this.selectedIndex - 3 > 0) {
            const ax = panelX + 16;
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.moveTo(ax + NAV_W, navCY - NAV_H / 2);
            ctx.lineTo(ax + NAV_W, navCY + NAV_H / 2);
            ctx.lineTo(ax, navCY);
            ctx.closePath();
            ctx.fill();
        }

        if (this.selectedIndex + 3 < this.artifacts.length - 1) {
            const ax = panelX + PANEL_W - 16 - NAV_W;
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.moveTo(ax, navCY - NAV_H / 2);
            ctx.lineTo(ax, navCY + NAV_H / 2);
            ctx.lineTo(ax + NAV_W, navCY);
            ctx.closePath();
            ctx.fill();
        }

        // Description — plain text inside panel, no sub-panel border
        const descY =
            carouselY + ICON_SLOT + INDICATOR_GAP + INDICATOR_H + SECTION_GAP;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const artifact = this.artifacts[this.selectedIndex];
        if (artifact?.collected && artifact.message) {
            const { title, lines = [] } = artifact.message;
            let curY = descY;
            if (title) {
                ctx.font = FONT_TITLE;
                ctx.fillStyle = SHADOW_COLOR;
                ctx.fillText(title.text, centerX + 1, curY + 1);
                ctx.fillStyle = title.color ?? "#fff";
                ctx.fillText(title.text, centerX, curY);
                curY += 32 + 6;
            }
            ctx.font = FONT_BODY;
            for (const line of lines) {
                ctx.fillStyle = SHADOW_COLOR;
                ctx.fillText(line.text, centerX + 1, curY + 1);
                ctx.fillStyle = line.color ?? "#fff";
                ctx.fillText(line.text, centerX, curY);
                curY += 18 + 6;
            }
        } else {
            ctx.font = FONT_BODY;
            ctx.fillStyle = SHADOW_COLOR;
            ctx.fillText("???", centerX + 1, descY + 1);
            ctx.fillStyle = "#fff";
            ctx.fillText("???", centerX, descY);
        }

        // ESC hint — plain text at panel bottom
        ctx.font = FONT_BODY;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = HINT_COLOR;
        ctx.fillText(
            "ESC \u2013 return to game",
            centerX,
            panelY + PANEL_H - PANEL_PAD - ESC_H,
        );

        ctx.restore();
    }

    _drawArtifactIcon(ctx, artifact, slotX, slotY, isSelected) {
        const img = getImg("textures/icons.png");
        if (!img) return;

        const outlineColor = isSelected ? "#fff" : "#7374b4";
        const [oc, octx] = getIconCanvas();

        octx.clearRect(0, 0, ICON_SLOT, ICON_SLOT);
        octx.imageSmoothingEnabled = false;
        octx.drawImage(
            img,
            artifact.cordX,
            artifact.cordY,
            16,
            16,
            ICON_OUTLINE,
            ICON_OUTLINE,
            ICON_SIZE,
            ICON_SIZE,
        );

        if (!artifact.collected) {
            octx.globalCompositeOperation = "source-atop";
            octx.fillStyle = "#a0c4ff";
            octx.fillRect(0, 0, ICON_SLOT, ICON_SLOT);
            octx.globalCompositeOperation = "source-over";
        }

        const [bc, bctx] = getBorderCanvas();
        bctx.clearRect(0, 0, ICON_SLOT, ICON_SLOT);
        bctx.drawImage(oc, 0, 0);
        bctx.globalCompositeOperation = "source-atop";
        bctx.fillStyle = outlineColor;
        bctx.fillRect(0, 0, ICON_SLOT, ICON_SLOT);
        bctx.globalCompositeOperation = "source-over";

        for (const [ox, oy] of OUTLINE_OFFSETS) {
            ctx.drawImage(bc, slotX + ox, slotY + oy);
        }
        ctx.drawImage(oc, slotX, slotY);
    }
}
