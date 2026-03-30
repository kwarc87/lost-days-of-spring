/**
 * Seeded pseudo-random number generator (mulberry32)
 * Deterministic — same seed always produces the same sequence.
 */
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function snap(v, grid) {
    return Math.floor(v / grid) * grid;
}

function wrap(v, max) {
    return ((v % max) + max) % max;
}

// ─── Pre-generated static layout data ──────────────────────────────────────────

const PX = 6;

// --- Layer 0 – deep fog patches (very slow parallax) ---
const fogPatches = (() => {
    const rng = mulberry32(77701);
    const list = [];
    for (let i = 0; i < 35; i++) {
        list.push({
            rx: rng() * 2400,
            ry: rng() * 1600,
            w: (4 + Math.floor(rng() * 5)) * PX,
            h: (1 + Math.floor(rng() * 2)) * PX,
            color:
                i % 3 === 0
                    ? "rgba(40,5,30,0.30)"
                    : i % 3 === 1
                      ? "rgba(50,8,12,0.25)"
                      : "rgba(5,30,25,0.20)",
        });
    }
    return list;
})();

// --- Layer 1 – mid-field texture blocks ---
const blocks = (() => {
    const rng = mulberry32(55543);
    const list = [];
    for (let i = 0; i < 70; i++) {
        list.push({
            rx: rng() * 2400,
            ry: rng() * 1600,
            w: (1 + Math.floor(rng() * 3)) * PX,
            h: (1 + Math.floor(rng() * 2)) * PX,
            color:
                i % 5 === 0
                    ? "#18061a"
                    : i % 5 === 1
                      ? "#1a0810"
                      : i % 5 === 2
                        ? "#061a16"
                        : i % 5 === 3
                          ? "#10080e"
                          : "#0c0c0c",
        });
    }
    return list;
})();

// --- Layer 2 – floating dream particles ---
const particles = (() => {
    const rng = mulberry32(12321);
    const list = [];
    for (let i = 0; i < 30; i++) {
        list.push({
            rx: rng() * 2400,
            ry: rng() * 1600,
            size: (1 + Math.floor(rng() * 2)) * PX,
            color:
                i % 3 === 0
                    ? "rgba(120,20,60,0.12)"
                    : i % 3 === 1
                      ? "rgba(80,20,100,0.10)"
                      : "rgba(15,100,80,0.10)",
        });
    }
    return list;
})();

// ─── Parallax speeds & tiling ──────────────────────────────────────────────────
const SPEED_FOG = 0.015;
const SPEED_BLOCK = 0.06;
const SPEED_PARTICLE = 0.12;
const TILE_W = 2400;
const TILE_H = 1600;

/**
 * Default world background rendering strategy — "Wyśniony Szpital"
 *
 * Dark, oneiric dreamscape. Abstract pixel-art layers with subtle parallax.
 */
export const DefaultWorldRenderer = {
    drawBackground: (ctx, canvas, camera) => {
        const cw = canvas.width;
        const ch = canvas.height;

        // ── Base fill ──
        ctx.fillStyle = "#06010a";
        ctx.fillRect(0, 0, cw, ch);

        // ── Gradient overlay ──
        const grad = ctx.createLinearGradient(0, 0, 0, ch);
        grad.addColorStop(0, "rgba(40,4,18,0.25)");
        grad.addColorStop(0.5, "rgba(10,2,20,0.15)");
        grad.addColorStop(1, "rgba(4,25,20,0.20)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);

        // ── Layer 0 — fog patches ──
        for (const f of fogPatches) {
            const sx = snap(wrap(f.rx - camera.x * SPEED_FOG, TILE_W), PX) % cw;
            const sy = snap(wrap(f.ry - camera.y * SPEED_FOG, TILE_H), PX) % ch;
            ctx.fillStyle = f.color;
            ctx.fillRect(sx, sy, f.w, f.h);
        }

        // ── Layer 1 — texture blocks ──
        for (const b of blocks) {
            const bx = snap(wrap(b.rx - camera.x * SPEED_BLOCK, TILE_W), PX) % cw;
            const by = snap(wrap(b.ry - camera.y * SPEED_BLOCK, TILE_H), PX) % ch;
            ctx.fillStyle = b.color;
            ctx.fillRect(bx, by, b.w, b.h);
        }

        // ── Layer 2 — dream particles ──
        for (const p of particles) {
            const px = snap(wrap(p.rx - camera.x * SPEED_PARTICLE, TILE_W), PX) % cw;
            const py = snap(wrap(p.ry - camera.y * SPEED_PARTICLE, TILE_H), PX) % ch;
            ctx.fillStyle = p.color;
            ctx.fillRect(px, py, p.size, p.size);
        }

        // ── Vignette ──
        const steps = 5;
        const stepSize = PX * 3;
        for (let i = 0; i < steps; i++) {
            const alpha = (0.18 * (steps - i)) / steps;
            ctx.fillStyle = `rgba(2,0,4,${alpha.toFixed(3)})`;
            const d = stepSize * (i + 1);
            ctx.fillRect(0, 0, cw, d);
            ctx.fillRect(0, ch - d, cw, d);
            ctx.fillRect(0, 0, d, ch);
            ctx.fillRect(cw - d, 0, d, ch);
        }
    },
};
