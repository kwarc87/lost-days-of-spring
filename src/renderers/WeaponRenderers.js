export const DefaultWeaponRenderer = {
    draw: (ctx, weapon) => {
        ctx.save();

        const cx = weapon.x + weapon.w / 2;
        const cy = weapon.y + weapon.h / 2;
        const rx = weapon.w / 2;
        const ry = weapon.h / 2;

        // Outer glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffd700";

        // Main bullet body
        ctx.fillStyle = "#ffc200";
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(1, rx / 2), Math.max(1, ry / 2), 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },
};


