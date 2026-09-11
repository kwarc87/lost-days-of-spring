// ─── Map-view renderers — Strategy pattern for `LostDaysOfSpring#renderByMode` ──
// Each object exposes a uniform `draw(ctx, obj, debug)` method (debug is ignored
// by renderers that have nothing to gate). Consolidated in one file, mirroring
// the existing DebugRenderers.js / CollectibleRenderers.js grouping convention.

const MAP_COLORS = {
    solid: "#6d5ad9",
    oneDirection: "#4a3db0",
    booster: "#FBDB6D",
    elevator: "#3d83b3",
};

export const MapPlayerRenderer = {
    draw: (ctx, player) => {
        // Icon is always ~24px wide in screen space, regardless of map scale.
        // Width = r * 4.4 is the larger dimension, so r = ICON_SIZE / 4.4.
        const ICON_SIZE = 24;
        const r = ICON_SIZE / 4.4;

        // Convert world-space player position to screen space using current transform.
        const t = ctx.getTransform();
        const screenCx = t.e + (player.x + player.w / 2) * t.a;
        const screenBottom = t.f + (player.y + player.h) * t.d;

        const headR = r * 1.3;
        const shoulderRx = r * 2.2;
        const shoulderRy = r * 1.5;
        const shoulderCY = screenBottom - shoulderRy;
        const headCY = shoulderCY - headR - shoulderRy * 0.5;

        const fill = "#ff9020";
        const outline = "#b84000";

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.lineWidth = Math.max(2, r * 0.15);
        ctx.lineJoin = "round";

        // Shoulders — top half of an ellipse
        ctx.beginPath();
        ctx.ellipse(
            screenCx,
            shoulderCY,
            shoulderRx,
            shoulderRy,
            0,
            Math.PI,
            0,
            true,
        );
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = outline;
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.arc(screenCx, headCY, headR, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = outline;
        ctx.stroke();

        ctx.restore();
    },
};

export const MapPlatformRenderer = {
    draw(ctx, platform) {
        const color = platform.color ?? MAP_COLORS[platform.type];
        if (!color) {
            return;
        }
        // Snap world-space rect to exact screen pixels to prevent sub-pixel
        // anti-aliasing seams between touching platforms.  Two platforms sharing
        // the same world boundary will compute the same Math.round() value and
        // therefore the same screen edge — guaranteed zero gap.
        const t = ctx.getTransform();
        const sx1 = Math.round(t.e + platform.x * t.a);
        const sy1 = Math.round(t.f + platform.y * t.d);
        const sx2 = Math.round(t.e + (platform.x + platform.w) * t.a);
        const sy2 = Math.round(t.f + (platform.y + platform.h) * t.d);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = color;
        ctx.fillRect(sx1, sy1, sx2 - sx1, sy2 - sy1);
        ctx.restore();
    },
};

export const MapEnemyRenderer = {
    draw: (ctx, enemy, debug = false) => {
        if (!debug) {
            return;
        }
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    },
};

export const MapCoinRenderer = {
    draw: (ctx, collectible, debug = false) => {
        if (!debug) {
            return;
        }
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(
            collectible.x,
            collectible.y,
            collectible.w,
            collectible.h,
        );
    },
};

export const MapSplinterRenderer = {
    draw: (ctx, collectible, debug = false) => {
        if (!debug) {
            return;
        }
        ctx.fillStyle = "#68eef2";
        ctx.fillRect(
            collectible.x,
            collectible.y,
            collectible.w,
            collectible.h,
        );
    },
};

export const MapArtifactRenderer = {
    draw: (ctx, collectible, debug = false) => {
        if (!debug) {
            return;
        }
        ctx.fillStyle = "#4772da";
        ctx.fillRect(
            collectible.x,
            collectible.y,
            collectible.w,
            collectible.h,
        );
    },
};

export const MapHeartRenderer = {
    draw: (ctx, collectible, debug = false) => {
        if (!debug) {
            return;
        }
        const x = collectible.x;
        const y = collectible.y;

        ctx.fillStyle = "#e8334a";
        // Left lobe
        ctx.fillRect(x + 2, y, 8, 8);
        // Right lobe
        ctx.fillRect(x + 14, y, 8, 8);
        // Body connecting lobes
        ctx.fillRect(x + 1, y + 4, 22, 10);
        // Lower V — narrowing to tip
        ctx.fillRect(x + 4, y + 14, 16, 6);
        ctx.fillRect(x + 8, y + 20, 8, 4);
    },
};

export const MapCannonRenderer = {
    draw: (ctx, cannon) => {
        const x = Math.round(cannon.x);
        const y = Math.round(cannon.y);
        const { w, h } = cannon;

        ctx.fillStyle = "#C1311B";
        ctx.fillRect(x, y, w, h);
    },
};

export const MapSpikeRenderer = {
    draw: (ctx, spike) => {
        const up = spike.position === "up";
        ctx.save();
        ctx.fillStyle = "#C1311B";
        ctx.beginPath();
        if (up) {
            ctx.moveTo(spike.x + spike.w / 2, spike.y + spike.h);
            ctx.lineTo(spike.x + spike.w, spike.y);
            ctx.lineTo(spike.x, spike.y);
        } else {
            ctx.moveTo(spike.x + spike.w / 2, spike.y);
            ctx.lineTo(spike.x + spike.w, spike.y + spike.h);
            ctx.lineTo(spike.x, spike.y + spike.h);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },
};

export const MapCheckpointRenderer = {
    draw(ctx, cp) {
        ctx.save();
        ctx.fillStyle = cp.reached ? "#72eb84" : "#f472b6";
        ctx.fillRect(cp.x, cp.y, cp.w, cp.h);
        ctx.restore();
    },
};

export const MapExitRenderer = {
    draw: (ctx, exit) => {
        const x = Math.round(exit.x);
        const y = Math.round(exit.y);
        const dw = exit.dw;
        const dh = exit.dh;

        const poleW = Math.max(3, Math.round(dw * 0.07));
        const poleX = x + Math.round(dw * 0.2);

        // Pole
        ctx.fillStyle = "#22cc44";
        ctx.fillRect(poleX, y, poleW, dh);

        // Flag — triangle pointing right
        const flagLeft = poleX + poleW;
        const flagRight = x + Math.round(dw * 0.85);
        const flagTop = y;
        const flagBottom = y + Math.round(dh * 0.45);
        const flagMidY = flagTop + Math.round((flagBottom - flagTop) * 0.5);

        ctx.fillStyle = "#22cc44";
        ctx.beginPath();
        ctx.moveTo(flagLeft, flagTop);
        ctx.lineTo(flagRight, flagMidY);
        ctx.lineTo(flagLeft, flagBottom);
        ctx.closePath();
        ctx.fill();
    },
};

// Shared no-op for entities that render nothing in map view (weapon upgrades,
// environment items) — keeps the dispatcher generic with no special-casing.
export const NOOP_RENDERER = { draw: () => {} };
