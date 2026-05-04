import { GameFactory } from "../factories/GameFactory.js";

export const DebugGridRenderer = {
    draw(ctx, camera, worldSize, gapX = 48, gapY = 48) {
        ctx.save();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.5;

        const startX = Math.floor(camera.x / gapX) * gapX;
        const endX = camera.x + camera.width;
        const startY = Math.floor(camera.y / gapY) * gapY;
        const endY = camera.y + camera.height;

        ctx.beginPath();
        for (let x = startX; x <= endX; x += gapX) {
            ctx.moveTo(x, camera.y);
            ctx.lineTo(x, camera.y + camera.height);
        }
        for (let y = startY; y <= endY; y += gapY) {
            ctx.moveTo(camera.x, y);
            ctx.lineTo(camera.x + camera.width, y);
        }
        ctx.stroke();

        ctx.restore();
    },
};

// ─── Debug HUD (player data + cursor position panels) ────────────────────────
const DEBUG_PLAYER_ENTRIES = [
    "x",
    "y",
    "prevX",
    "prevY",
    "w",
    "h",
    "vx",
    "vy",
    "airborne",
    "jumpPressedByUser",
    "jumpPressedAt",
    "facing",
    "shooting",
    "lastShootTime",
    "posture",
    "onGroundId",
    "onGroundType",
    "lastGroundId",
    "lastGroundType",
];

export const DebugHudRenderer = {
    _lastUpdate: 0,

    update(now, canvas, showDebug, debugConfig, player, mouse) {
        if (!showDebug) {
            document.getElementById("debug")?.remove();
            document.getElementById("cursor-pos")?.remove();
            return;
        }

        if (now - this._lastUpdate < debugConfig.updateInterval) {
            return;
        }
        this._lastUpdate = now;

        // Player panel
        let el = document.getElementById("debug");
        if (!el) {
            el = document.createElement("div");
            el.id = "debug";
            document.body.insertBefore(el, document.body.firstChild);
        }
        el.textContent = "";
        for (const key of DEBUG_PLAYER_ENTRIES) {
            const value = player[key];
            const row = document.createElement("div");
            const label = document.createElement("strong");
            label.textContent = key;
            row.appendChild(label);

            const isRounded =
                key === "x" ||
                key === "y" ||
                key === "prevX" ||
                key === "prevY";
            const display = isRounded
                ? String(Math.round(value))
                : value !== null && typeof value === "object"
                  ? JSON.stringify(value).replace(/,/g, ", ")
                  : String(value);

            row.appendChild(document.createTextNode(" " + display));
            el.appendChild(row);

            if (key === "y") {
                const gridX = Math.round(player.x / GameFactory.GRID);
                const gridY = Math.round(player.y / GameFactory.GRID);
                for (const [gKey, gVal] of [
                    ["gridX", gridX],
                    ["gridY", gridY],
                ]) {
                    const gRow = document.createElement("div");
                    gRow.style.color = "red";
                    const gLabel = document.createElement("strong");
                    gLabel.textContent = gKey;
                    gRow.appendChild(gLabel);
                    gRow.appendChild(document.createTextNode(" " + gVal));
                    el.appendChild(gRow);
                }
            }
        }

        // Cursor panel
        let cp = document.getElementById("cursor-pos");
        if (!cp) {
            cp = document.createElement("div");
            cp.id = "cursor-pos";
            document.body.appendChild(cp);
        }
        cp.textContent = "";
        const rowX = document.createElement("div");
        const lx = document.createElement("strong");
        lx.textContent = "x";
        rowX.appendChild(lx);
        rowX.appendChild(
            document.createTextNode(
                " " + Math.floor(mouse.worldX / GameFactory.GRID),
            ),
        );
        cp.appendChild(rowX);
        const rowY = document.createElement("div");
        const ly = document.createElement("strong");
        ly.textContent = "y";
        rowY.appendChild(ly);
        rowY.appendChild(
            document.createTextNode(
                " " + Math.floor(mouse.worldY / GameFactory.GRID),
            ),
        );
        cp.appendChild(rowY);
    },
};
