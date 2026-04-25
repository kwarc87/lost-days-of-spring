// ─── Scissors enemy — pixel-art 16×16 × scale 3, blades pointing RIGHT ───────
// Frame 0: closed  Frame 1: slightly open  Frame 2: open  Frame 3: slightly open
// Only fillRect — no rotations, no arcs.
const SCISSORS_FPS = 6;
const SCISSORS_FRAMES = 4;
const P = 3; // 1 logical pixel = 3 canvas pixels

// ctx origin = top-left of the 16×16 (×P) sprite
function drawScissorsFrame(ctx, frame) {
    // Blade spread (in logical px) per frame — how far each blade moves from centre
    const spread = [0, 1, 2, 1];
    const o = spread[frame];
    const cy = 7; // vertical centre row of the 16-px sprite

    // ── handle bars (left side, static) ──────────────────────────────────────
    ctx.fillStyle = "#4a4a6a";
    ctx.fillRect(0, (cy - 2) * P, 5 * P, 2 * P); // top bar
    ctx.fillRect(0, (cy + 1) * P, 5 * P, 2 * P); // bottom bar
    // highlight edge on top bar (1px bright top)
    ctx.fillStyle = "#6e6e96";
    ctx.fillRect(2 * P, (cy - 2) * P, 3 * P, 1 * P);
    ctx.fillRect(2 * P, (cy + 1) * P, 3 * P, 1 * P);
    // shadow edge on bottom of each bar (1px dark bottom)
    ctx.fillStyle = "#2a2a45";
    ctx.fillRect(0, (cy - 1) * P, 4 * P, 1 * P);
    ctx.fillRect(0, (cy + 2) * P, 4 * P, 1 * P);

    // ── handle rings (darker, far-left) ──────────────────────────────────────
    ctx.fillStyle = "#2d3561";
    ctx.fillRect(0, (cy - 4) * P, 2 * P, 3 * P); // top ring
    ctx.fillRect(0, (cy + 2) * P, 2 * P, 3 * P); // bottom ring
    // inner ring highlight (1×1 px corner accent)
    ctx.fillStyle = "#4a5a8a";
    ctx.fillRect(1 * P, (cy - 4) * P, 1 * P, 1 * P);
    ctx.fillRect(1 * P, (cy + 4) * P, 1 * P, 1 * P);

    // ── pivot screw ──────────────────────────────────────────────────────────
    ctx.fillStyle = "#ffd32a";
    ctx.fillRect(5 * P, (cy - 1) * P, 2 * P, 2 * P);
    // screw shine (top-left pixel)
    ctx.fillStyle = "#ffe87a";
    ctx.fillRect(5 * P, (cy - 1) * P, 1 * P, 1 * P);
    // screw shadow (bottom-right pixel)
    ctx.fillStyle = "#b8900a";
    ctx.fillRect(6 * P, cy * P, 1 * P, 1 * P);

    // ── blades (right side, animated) ────────────────────────────────────────
    // top blade base — light silver
    ctx.fillStyle = "#c8d6e5";
    ctx.fillRect(7 * P, (cy - 1 - o) * P, 8 * P, 2 * P);
    // top blade highlight (top edge, 1px)
    ctx.fillStyle = "#e8f0f8";
    ctx.fillRect(7 * P, (cy - 1 - o) * P, 8 * P, 1 * P);
    // top blade shadow (bottom edge, 1px)
    ctx.fillStyle = "#7a8fa0";
    ctx.fillRect(7 * P, (cy - o) * P, 7 * P, 1 * P);
    // top blade tip accent (rightmost px, darker)
    ctx.fillStyle = "#5a7080";
    ctx.fillRect(14 * P, (cy - 1 - o) * P, 1 * P, 2 * P);

    // bottom blade base — dark silver
    ctx.fillStyle = "#8395a7";
    ctx.fillRect(7 * P, (cy + o) * P, 8 * P, 2 * P);
    // bottom blade highlight (top edge, 1px)
    ctx.fillStyle = "#a0b4c4";
    ctx.fillRect(7 * P, (cy + o) * P, 8 * P, 1 * P);
    // bottom blade shadow (bottom edge, 1px)
    ctx.fillStyle = "#4a5e6e";
    ctx.fillRect(7 * P, (cy + 1 + o) * P, 7 * P, 1 * P);
    // bottom blade tip accent
    ctx.fillStyle = "#3a4e5e";
    ctx.fillRect(14 * P, (cy + o) * P, 1 * P, 2 * P);
}

function drawScissors(ctx, enemy, debug) {
    const frame = Math.floor(
        ((Date.now() * SCISSORS_FPS) / 1000) % SCISSORS_FRAMES,
    );
    const S = 16 * P; // sprite canvas size = 48
    const cx = Math.round(enemy.x + enemy.w / 2);
    const cy = Math.round(enemy.y + enemy.h);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(cx, cy);
    if (enemy.vx < 0) {
        ctx.scale(-1, 1);
    }

    // anchor sprite: horizontally centred, bottom-aligned
    ctx.translate(-S / 2, -S);
    drawScissorsFrame(ctx, frame);

    if (enemy.isDamaged) {
        ctx.fillStyle = "rgba(255, 40, 40, 0.45)";
        ctx.fillRect(0, 0, S, S);
    }

    ctx.restore();

    if (debug) {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x, enemy.y, enemy.w, enemy.h);
        ctx.restore();
    }
}

// ─── Pill enemy ───────────────────────────────────────────────────────────────
function drawPill(ctx, enemy, debug) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const cx = Math.round(enemy.x + enemy.w / 2);
    const cy = Math.round(enemy.y + enemy.h);

    ctx.translate(cx, cy);
    if (enemy.vx < 0) {
        ctx.scale(-1, 1);
    }

    const pw = 28; // pill width
    const ph = 68; // pill height — tall and tablet-proportioned
    const legH = 8; // leg area below pill
    const px = -pw / 2; // -18 (left edge)
    const py = -(ph + legH); // top of pill

    // --- Legs (white — high contrast against dark backgrounds) ---
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-8, -legH, 4, legH - 4); // left leg
    ctx.fillRect(4, -legH, 4, legH - 4); // right leg
    // Feet (wider than legs, slightly off-white)
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(-10, -4, 8, 4); // left foot
    ctx.fillRect(2, -4, 8, 4); // right foot

    // --- Pill shape builder: 2-step 4px caps (subtle tablet rounding, not lemon) ---
    const drawPillShape = (color) => {
        ctx.fillStyle = color;
        ctx.fillRect(px + 8, py, pw - 16, 4); // top cap step 1
        ctx.fillRect(px + 4, py + 4, pw - 8, 4); // top cap step 2
        ctx.fillRect(px, py + 8, pw, ph - 16); // main body
        ctx.fillRect(px + 4, py + ph - 8, pw - 8, 4); // bottom cap step 1
        ctx.fillRect(px + 8, py + ph - 4, pw - 16, 4); // bottom cap step 2
    };

    // Top half — mainColor
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph / 2);
    ctx.clip();
    drawPillShape(enemy.mainColor);
    ctx.restore();

    // Bottom half — secondaryColor
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py + ph / 2, pw, ph / 2);
    ctx.clip();
    drawPillShape(enemy.secondaryColor);
    ctx.restore();

    // Horizontal seam — 4px dark line across full pill width
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(px + 4, py + ph / 2 - 2, pw - 8, 4);

    // --- Color shadows: pixel-art right-edge shadow + left-edge highlight ---
    const pillPath = () => {
        ctx.beginPath();
        ctx.moveTo(px + 8, py);
        ctx.lineTo(px + pw - 8, py);
        ctx.lineTo(px + pw - 8, py + 4);
        ctx.lineTo(px + pw - 4, py + 4);
        ctx.lineTo(px + pw - 4, py + 8);
        ctx.lineTo(px + pw, py + 8);
        ctx.lineTo(px + pw, py + ph - 8);
        ctx.lineTo(px + pw - 4, py + ph - 8);
        ctx.lineTo(px + pw - 4, py + ph - 4);
        ctx.lineTo(px + pw - 8, py + ph - 4);
        ctx.lineTo(px + pw - 8, py + ph);
        ctx.lineTo(px + 8, py + ph);
        ctx.lineTo(px + 8, py + ph - 4);
        ctx.lineTo(px + 4, py + ph - 4);
        ctx.lineTo(px + 4, py + ph - 8);
        ctx.lineTo(px, py + ph - 8);
        ctx.lineTo(px, py + 8);
        ctx.lineTo(px + 4, py + 8);
        ctx.lineTo(px + 4, py + 4);
        ctx.lineTo(px + 8, py + 4);
        ctx.closePath();
    };
    ctx.save();
    pillPath();
    ctx.clip();
    ctx.fillStyle = "rgba(0,0,0,0.22)"; // right-edge shadow
    ctx.fillRect(px + pw - 8, py, 8, ph);
    ctx.fillStyle = "rgba(255,255,255,0.09)"; // left-edge highlight
    ctx.fillRect(px, py, 8, ph);
    ctx.restore();

    // --- Eyes: 8×8 white blocks, 4×4 dark pupils — big and cartoony ---
    const eyeY = py + 8;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-12, eyeY, 8, 8); // left eye
    ctx.fillRect(4, eyeY, 8, 8); // right eye
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(-10, eyeY + 2, 4, 4); // left pupil
    ctx.fillRect(6, eyeY + 2, 4, 4); // right pupil

    // --- Menacing brows: inner end lower than outer (angry V angle) ---
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(-14, eyeY - 6, 8, 4); // outer left
    ctx.fillRect(-8, eyeY - 4, 4, 4); // inner left (drops toward center)
    ctx.fillRect(4, eyeY - 4, 4, 4); // inner right
    ctx.fillRect(6, eyeY - 6, 8, 4); // outer right

    // --- Damage flash: red overlay clipped to pill silhouette ---
    if (enemy.isDamaged) {
        ctx.save();
        pillPath();
        ctx.clip();
        ctx.fillStyle = "rgba(255, 40, 40, 0.45)";
        ctx.fillRect(px, py, pw, ph);
        ctx.restore();
    }

    ctx.restore();

    if (debug) {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x, enemy.y, enemy.w, enemy.h);
        ctx.restore();
    }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────
export const DefaultEnemyRenderer = {
    draw: (ctx, enemy, debug = false) => {
        if (enemy.type === "scissors") {
            drawScissors(ctx, enemy, debug);
        } else {
            drawPill(ctx, enemy, debug);
        }
    },
};
