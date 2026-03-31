export const DefaultWeaponRenderer = {
    draw: (ctx, weapon) => {
        ctx.save();
        ctx.imageSmoothingEnabled = false;

        const { x, y, w, h } = weapon;

        // Drop shadow (1px offset, dark amber)
        ctx.fillStyle = "#7a4400";
        ctx.fillRect(x + 1, y + 1, w, h);

        // Main body (gold)
        ctx.fillStyle = "#ffc200";
        ctx.fillRect(x, y, w, h);

        // Mid shading — bottom and right edge strip (deeper gold)
        ctx.fillStyle = "#c87800";
        ctx.fillRect(x, y + h - 2, w, 2); // bottom strip
        ctx.fillRect(x + w - 2, y, 2, h); // right strip

        // Highlight — top-left corner (bright yellow, 2×2 px)
        ctx.fillStyle = "#fff176";
        ctx.fillRect(x, y, 2, 2);

        ctx.restore();
    },
};
