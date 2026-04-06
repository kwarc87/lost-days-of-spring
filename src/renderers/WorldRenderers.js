// ─── Procedural pixel-art hospital wall texture ──────────────────────────────
// 240×320 seamless tile – The Last Door / David Lynch inspired
// Palette: emerald · purple · crimson — pure pixel art, zero blur/effects
// Generated once on an offscreen canvas, then used as a repeating pattern.

const TEX_W = 240;
const TEX_H = 320;

// ─── Deterministic integer hash (position-seeded) ─────────────────────────────
const h32 = (a, b, s = 0) => {
    let h = (a * 374761393 + b * 668265261 + s * 2246822519) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
};
const hf = (a, b, s = 0) => h32(a, b, s) / 4294967296;

// ─── Palette (RGBA quads) ─────────────────────────────────────────────────────
const GROUT = [3, 6, 4, 255];
const E0 = [5, 28, 18, 255];
const E1 = [7, 38, 25, 255];
const E2 = [10, 50, 33, 255];
const E3 = [14, 62, 42, 255];
const E4 = [19, 78, 54, 255];
const EHI = [22, 92, 63, 255];
const ESH = [4, 24, 15, 255];
const P0 = [18, 4, 34, 255];
const P1 = [28, 7, 52, 255];
const P2 = [44, 11, 78, 255];
const P3 = [62, 16, 108, 255];
const R0 = [38, 3, 10, 255];
const R1 = [55, 6, 16, 255];
const R2 = [80, 10, 24, 255];
const R3 = [110, 15, 34, 255];
const DKGR = [2, 4, 3, 255];
const P_OUT = [12, 4, 22, 255];
const R_OUT = [18, 3, 8, 255];
const BOARD_DK = [4, 14, 9, 255];
const BOARD_MD = [8, 30, 20, 255];
const BOARD_HI = [14, 44, 30, 255];

const PERIOD = 16;

// ─── Pixel helpers (ImageData) ────────────────────────────────────────────────
function px(data, x, y, c) {
    if (x < 0 || x >= TEX_W || y < 0 || y >= TEX_H) {
        return;
    }
    const i = (y * TEX_W + x) * 4;
    data[i] = c[0];
    data[i + 1] = c[1];
    data[i + 2] = c[2];
    data[i + 3] = c[3];
}

function fillRect(data, x, y, w, h, c) {
    for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
            px(data, x + dx, y + dy, c);
        }
    }
}

function drawEdges(d, tx, ty, hiC, shC) {
    for (let x = tx; x < tx + 15; x++) {
        px(d, x, ty, hiC);
    }
    for (let y = ty + 1; y < ty + 15; y++) {
        px(d, tx, y, hiC);
    }
    for (let x = tx; x < tx + 14; x++) {
        px(d, x, ty + 14, shC);
    }
    for (let y = ty + 1; y < ty + 14; y++) {
        px(d, tx + 14, y, shC);
    }
    px(d, tx + 14, ty + 14, DKGR);
    px(d, tx, ty, EHI);
}

function drawStain(d, col, row, tx, ty, stainType, stainSz) {
    const [sCore, sRing] = stainType === "P" ? [P2, P1] : [R2, R1];
    const margin = 2;
    const maxOff = 15 - stainSz - margin * 2;
    const scx =
        tx + margin + Math.floor(hf(col, row, 3) * (maxOff > 0 ? maxOff : 1));
    const scy =
        ty + margin + Math.floor(hf(col, row, 4) * (maxOff > 0 ? maxOff : 1));
    fillRect(d, scx, scy, stainSz, stainSz, sCore);
    for (let sy = scy - 1; sy <= scy + stainSz; sy++) {
        for (let sx = scx - 1; sx <= scx + stainSz; sx++) {
            if (
                sy < scy ||
                sy >= scy + stainSz ||
                sx < scx ||
                sx >= scx + stainSz
            ) {
                if (sx > tx && sx < tx + 14 && sy > ty && sy < ty + 14) {
                    px(d, sx, sy, sRing);
                }
            }
        }
    }
    if (stainSz >= 4) {
        const accent = stainType === "P" ? P3 : R3;
        px(d, scx, scy, accent);
    }
}

function drawCrack(d, col, row, tx, ty) {
    if (hf(col, row, 50) < 0.5) {
        for (let s = 0; s < 12; s++) {
            const cx = tx + 13 - Math.round((s * 12) / 11);
            const cy = ty + 1 + Math.round((s * 12) / 11);
            px(d, cx, cy, DKGR);
        }
    } else {
        const xBase = tx + 3 + Math.floor(hf(col, row, 55) * 8);
        for (let s = 1; s <= 12; s++) {
            const jit = s % 3 === 0 ? 1 : s % 5 === 0 ? -1 : 0;
            px(d, xBase + jit, ty + s, DKGR);
        }
    }
    if (hf(col, row, 52) < 0.35) {
        const forkX = tx + 5 + Math.floor(hf(col, row, 53) * 5);
        const forkY = ty + 6 + Math.floor(hf(col, row, 54) * 4);
        px(d, forkX, forkY, DKGR);
        px(d, forkX + 1, forkY + 1, DKGR);
        px(d, forkX + 2, forkY + 1, DKGR);
    }
}

function drawChip(d, col, row, tx, ty) {
    const corner = Math.floor(hf(col, row, 61) * 4);
    const chipC = DKGR;
    if (corner === 0) {
        px(d, tx, ty, chipC);
        px(d, tx + 1, ty, chipC);
        px(d, tx, ty + 1, chipC);
    } else if (corner === 1) {
        px(d, tx + 14, ty, chipC);
        px(d, tx + 13, ty, chipC);
        px(d, tx + 14, ty + 1, chipC);
    } else if (corner === 2) {
        px(d, tx, ty + 14, chipC);
        px(d, tx + 1, ty + 14, chipC);
        px(d, tx, ty + 13, chipC);
    } else {
        px(d, tx + 14, ty + 14, chipC);
        px(d, tx + 13, ty + 14, chipC);
        px(d, tx + 14, ty + 13, chipC);
    }
}

// ─── Big stain halos data ─────────────────────────────────────────────────────
const BIG_STAINS = [
    { x: 47, y: 88, r: 11, t: "P" },
    { x: 176, y: 152, r: 10, t: "P" },
    { x: 120, y: 260, r: 12, t: "R" },
    { x: 222, y: 56, r: 9, t: "R" },
    { x: 73, y: 193, r: 13, t: "P" },
    { x: 161, y: 311, r: 9, t: "R" },
    { x: 32, y: 291, r: 8, t: "P" },
    { x: 206, y: 222, r: 10, t: "P" },
    { x: 128, y: 104, r: 8, t: "R" },
    { x: 95, y: 14, r: 7, t: "P" },
    { x: 14, y: 151, r: 6, t: "R" },
    { x: 230, y: 176, r: 7, t: "P" },
    { x: 56, y: 318, r: 6, t: "R" },
    { x: 188, y: 40, r: 5, t: "P" },
    { x: 105, y: 178, r: 7, t: "R" },
];

// ─── Drip streaks data ────────────────────────────────────────────────────────
const DRIPS = [
    { x: 22, y: 90, len: 18, t: "P" },
    { x: 87, y: 200, len: 22, t: "R" },
    { x: 145, y: 50, len: 15, t: "P" },
    { x: 210, y: 150, len: 20, t: "R" },
    { x: 58, y: 270, len: 14, t: "P" },
    { x: 180, y: 10, len: 17, t: "R" },
];

// ─── Texture generation ──────────────────────────────────────────────────────
function generateTexture() {
    const offscreen = document.createElement("canvas");
    offscreen.width = TEX_W;
    offscreen.height = TEX_H;
    const octx = offscreen.getContext("2d");
    const imgData = octx.createImageData(TEX_W, TEX_H);
    const d = imgData.data;

    fillRect(d, 0, 0, TEX_W, TEX_H, GROUT);

    const COLS = TEX_W / PERIOD;
    const ROWS = TEX_H / PERIOD;

    // ── Tile grid ─────────────────────────────────────────────────────────────
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const tx = col * PERIOD + 1;
            const ty = row * PERIOD + 1;

            const purpleBias =
                row < 3 ? 0.14 : row < 6 ? 0.07 : col > 11 ? 0.05 : 0;
            const crimsonBias = row > 16 ? 0.14 : row > 13 ? 0.06 : 0;
            const diagBias =
                Math.abs(col / COLS - row / ROWS) < 0.15 ? 0.04 : 0;

            const v = hf(col, row);
            const v2 = hf(col, row, 1);
            const adj = v + purpleBias + crimsonBias + diagBias;

            let base, hiC, shC;
            let stainType = null;
            let stainSz = 0;
            let hasCrack = false;
            let hasChip = false;

            if (adj < 0.32) {
                base = E2;
                hiC = EHI;
                shC = ESH;
            } else if (adj < 0.5) {
                base = E1;
                hiC = E3;
                shC = DKGR;
            } else if (adj < 0.58) {
                base = E3;
                hiC = E4;
                shC = E2;
            } else if (adj < 0.64) {
                base = E0;
                hiC = E1;
                shC = DKGR;
                hasChip = hf(col, row, 60) < 0.5;
            } else if (adj < 0.73 + purpleBias) {
                base = E2;
                hiC = EHI;
                shC = ESH;
                stainType = "P";
                stainSz = 3 + Math.floor(v2 * 4);
            } else if (adj < 0.82 + crimsonBias) {
                base = E2;
                hiC = EHI;
                shC = ESH;
                stainType = "R";
                stainSz = 3 + Math.floor(v2 * 4);
            } else if (adj < 0.88) {
                base = P1;
                hiC = P2;
                shC = P0;
            } else if (adj < 0.93) {
                base = R1;
                hiC = R2;
                shC = R0;
            } else if (adj < 0.97) {
                base = E1;
                hiC = E2;
                shC = DKGR;
                hasCrack = true;
            } else {
                base = DKGR;
                hiC = E0;
                shC = DKGR;
                hasCrack = true;
                hasChip = true;
            }

            fillRect(d, tx, ty, 15, 15, base);
            drawEdges(d, tx, ty, hiC, shC);

            // Texture noise (0–3 dark flecks)
            const nf = Math.floor(hf(col, row, 7) * 4);
            for (let n = 0; n < nf; n++) {
                const fx = tx + 2 + Math.floor(hf(col, row, 10 + n) * 11);
                const fy = ty + 2 + Math.floor(hf(col, row, 20 + n) * 11);
                px(d, fx, fy, shC);
            }

            // Worn glaze noise
            if (hf(col, row, 30) < 0.3) {
                const wx = tx + 3 + Math.floor(hf(col, row, 31) * 9);
                const wy = ty + 3 + Math.floor(hf(col, row, 32) * 9);
                px(d, wx, wy, E0);
                px(d, wx + 1, wy, E0);
            }

            if (stainType) {
                drawStain(d, col, row, tx, ty, stainType, stainSz);
            }
            if (hasCrack) {
                drawCrack(d, col, row, tx, ty);
            }
            if (hasChip) {
                drawChip(d, col, row, tx, ty);
            }
        }
    }

    // ── Large psychedelic stain halos (bleed across grout) ─────────────────────
    for (const s of BIG_STAINS) {
        const [core, mid, outer] =
            s.t === "P" ? [P2, P1, P_OUT] : [R2, R1, R_OUT];
        for (let dy = -s.r; dy <= s.r; dy++) {
            for (let dx = -s.r; dx <= s.r; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > s.r) {
                    continue;
                }

                const sx = (((s.x + dx) % TEX_W) + TEX_W) % TEX_W;
                const sy = (((s.y + dy) % TEX_H) + TEX_H) % TEX_H;

                const onGrout = sx % PERIOD === 0 || sy % PERIOD === 0;
                if (onGrout) {
                    px(d, sx, sy, DKGR);
                } else {
                    const color =
                        dist < s.r * 0.3
                            ? core
                            : dist < s.r * 0.6
                              ? mid
                              : outer;
                    px(d, sx, sy, color);
                }
            }
        }
    }

    // ── Horizontal wainscoting band (every 160px) ─────────────────────────────
    for (let bandY = 79; bandY < TEX_H; bandY += 160) {
        for (let x = 0; x < TEX_W; x++) {
            px(d, x, bandY, BOARD_DK);
            px(d, x, bandY + 1, BOARD_MD);
            px(d, x, bandY + 2, BOARD_HI);
            px(d, x, bandY + 3, BOARD_DK);
        }
    }

    // ── Sporadic drip streaks (vertical, Lynchian) ────────────────────────────
    for (const drip of DRIPS) {
        const c1 = drip.t === "P" ? P1 : R1;
        const c2 = drip.t === "P" ? P0 : R0;
        const dripX = drip.x;
        for (let i = 0; i < drip.len; i++) {
            const dripY = (drip.y + i) % TEX_H;
            if (dripY % PERIOD === 0) {
                continue;
            }
            const jitter = hf(drip.x, i, 99) < 0.2 ? 1 : 0;
            px(
                d,
                (((dripX + jitter) % TEX_W) + TEX_W) % TEX_W,
                dripY,
                i < drip.len / 2 ? c1 : c2,
            );
        }
    }

    // ── Single-pixel mould specks ─────────────────────────────────────────────
    for (let i = 0; i < 60; i++) {
        const mx = Math.floor(hf(i, 0, 200) * TEX_W);
        const my = Math.floor(hf(i, 0, 201) * TEX_H);
        if (mx % PERIOD === 0 || my % PERIOD === 0) {
            continue;
        }
        const mc = hf(i, 0, 202) < 0.5 ? P0 : R0;
        px(d, mx, my, mc);
    }

    octx.putImageData(imgData, 0, 0);
    return offscreen;
}

// ─── Bottom-strip background layers ──────────────────────────────────────────
let _bgImg = null; // ldos_background.png  — front tiles
let _blueBack = null; // blue-back.png         — nebula sky (layer 1)
let _blueStars = null; // blue-stars.png        — stars overlay (layer 2)

function ensureBgImg() {
    if (!_bgImg) {
        _bgImg = new Image();
        _bgImg.src = "textures/ldos_background.png";
    }

    if (!_blueBack) {
        _blueBack = new Image();
        _blueBack.src = "textures/background/blue-back.png";
    }
    if (!_blueStars) {
        _blueStars = new Image();
        _blueStars.src = "textures/background/blue-stars.png";
    }
}

// Draws a canvas-generated pattern as a strip ending at groundY (world coords).
function drawPatternStrip(ctx, texCanvas, cw, ch, groundY, cameraX, cameraY) {
    const stripBottom = groundY - cameraY;
    if (stripBottom <= 0) {
        return;
    }

    const pat = ctx.createPattern(texCanvas, "repeat");
    if (!pat) {
        return;
    }

    const tw = texCanvas.width;
    const th = texCanvas.height;
    const ox = ((-cameraX % tw) + tw) % tw;
    const oy = ((groundY % th) + th) % th;
    pat.setTransform(new DOMMatrix([1, 0, 0, 1, ox, stripBottom - oy]));

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cw, Math.min(stripBottom, ch));
    ctx.clip();
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, cw, Math.min(stripBottom, ch));
    ctx.restore();
}

// Draws an image tiled horizontally at the bottom of the world.
function drawStrip(
    ctx,
    img,
    cw,
    ch,
    worldH,
    cameraX,
    cameraY,
    parallax,
    offsetY = 0,
) {
    if (!img || !img.complete || img.naturalWidth === 0) {
        return;
    }
    const drawW = img.naturalWidth;
    const drawH = img.naturalHeight;
    const stripScreenBottom = worldH - cameraY + offsetY;
    const stripScreenTop = stripScreenBottom - drawH;

    if (stripScreenBottom <= 0 || stripScreenTop >= ch) {
        return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(
        0,
        Math.max(stripScreenTop, 0),
        cw,
        Math.min(stripScreenBottom, ch) - Math.max(stripScreenTop, 0),
    );
    ctx.clip();

    const ox = ((((-cameraX * parallax) % drawW) + drawW) % drawW) - drawW;
    for (let x = ox; x < cw; x += drawW) {
        ctx.drawImage(img, x, stripScreenTop, drawW, drawH);
    }

    ctx.restore();
}

// Draws an image tiled horizontally to fill the full canvas height.
function drawFullCanvas(ctx, img, cw, ch, cameraX, parallax, offsetY = 0) {
    if (!img || !img.complete || img.naturalWidth === 0) {
        return;
    }
    const drawH = ch;
    const drawW = Math.round(img.naturalWidth * (ch / img.naturalHeight));
    const ox = ((((-cameraX * parallax) % drawW) + drawW) % drawW) - drawW;
    for (let x = ox; x < cw; x += drawW) {
        ctx.drawImage(img, x, offsetY, drawW, drawH);
    }
}

export const DefaultWorldRenderer = {
    // drawBackground(ctx, canvas, camera, worldSize)
    drawBackground: (ctx, canvas, camera, worldSize) => {
        ensureBgImg();
        const cw = canvas.width;
        const ch = canvas.height;
        const worldH = worldSize ? worldSize.height : 2600;
        const groundY = worldSize?.groundY ?? worldH;

        // Black base.
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, cw, ch);

        const prev = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;

        // Layer 1 (back): blue-back.png — nebula sky, full canvas, parallax 0.02×.
        drawFullCanvas(ctx, _blueBack, cw, ch, camera.x, 0.02, 0);

        // Layer 2 (mid): blue-stars.png — stars, full canvas, parallax 0.06×.
        drawFullCanvas(ctx, _blueStars, cw, ch, camera.x, 0.06, 0);

        // Layer 3 (front): ldos_background.png — tile strip, parallax 0.8×.
        // Desaturated + brightened so it reads as background, not foreground.
        ctx.filter = "brightness(1) saturate(0.75) contrast(0.7)";
        drawStrip(ctx, _bgImg, cw, ch, worldH, camera.x, camera.y, 0.8, -73);
        ctx.filter = "none";

        ctx.imageSmoothingEnabled = prev;
    },

    // drawMapBackground(ctx, canvas, worldSize)
    // Fills black background and applies scale+translate for map overview.
    drawMapBackground: (ctx, canvas, worldSize) => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(
            canvas.width / worldSize.width,
            canvas.height / worldSize.height,
        );
        const offsetX = (canvas.width - worldSize.width * scale) / 2;
        const offsetY = (canvas.height - worldSize.height * scale) / 2;
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
    },
};
