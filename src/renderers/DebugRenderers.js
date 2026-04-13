export const DebugGridRenderer = {
    draw(ctx, camera, worldSize, gapX = 50, gapY = 50) {
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
            if (canvas.parentElement) {
                canvas.parentElement.insertBefore(el, canvas);
            } else {
                document.body.appendChild(el);
            }
        }
        el.textContent = "";
        for (const [key, value] of Object.entries(player)) {
            const row = document.createElement("div");
            const label = document.createElement("strong");
            label.textContent = key;
            row.appendChild(label);
            const display =
                value !== null && typeof value === "object"
                    ? JSON.stringify(value).replace(/,/g, ", ")
                    : String(value);
            row.appendChild(document.createTextNode(" " + display));
            el.appendChild(row);
        }

        // Cursor panel
        let cp = document.getElementById("cursor-pos");
        if (!cp) {
            cp = document.createElement("div");
            cp.id = "cursor-pos";
            if (canvas.parentElement) {
                canvas.parentElement.appendChild(cp);
            } else {
                document.body.appendChild(cp);
            }
        }
        cp.textContent = "";
        const rowX = document.createElement("div");
        const lx = document.createElement("strong");
        lx.textContent = "x";
        rowX.appendChild(lx);
        rowX.appendChild(document.createTextNode(" " + mouse.worldX));
        cp.appendChild(rowX);
        const rowY = document.createElement("div");
        const ly = document.createElement("strong");
        ly.textContent = "y";
        rowY.appendChild(ly);
        rowY.appendChild(document.createTextNode(" " + mouse.worldY));
        cp.appendChild(rowY);
    },
};
