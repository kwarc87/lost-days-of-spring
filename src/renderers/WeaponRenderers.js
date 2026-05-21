const darkenColor = (hex, factor) => {
    const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
    const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
    const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

export const DefaultWeaponRenderer = {
    draw: (ctx, weapon) => {
        ctx.save();
        ctx.imageSmoothingEnabled = false;

        const x = Math.round(weapon.x);
        const y = Math.round(weapon.y);
        const { w, h } = weapon;

        ctx.fillStyle = darkenColor(weapon.color, 0.48);
        ctx.fillRect(x + 1, y + 1, w, h);

        ctx.fillStyle = weapon.color;
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = darkenColor(weapon.color, 0.78);
        ctx.fillRect(x, y + h - 2, w, 2);
        ctx.fillRect(x + w - 2, y, 2, h);

        ctx.fillStyle = weapon.color;
        ctx.fillRect(x, y, 2, 2);

        ctx.restore();
    },
};
