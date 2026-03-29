/**
 * Default enemy rendering strategy (The Man From Another Place - Red Room dwarf style)
 */
export const DefaultEnemyRenderer = {
    draw: (ctx, enemy) => {
        ctx.save();

        const cx = enemy.x + enemy.w / 2;
        const cy = enemy.y + enemy.h; // Bottom center anchor

        // Flip horizontally if moving left
        ctx.translate(cx, cy);
        if (enemy.vx < 0) {
            ctx.scale(-1, 1);
        }

        // The Man From Another Place details (Cartoon/Big Head Style - H:60px, W:36px)

        // --- Hair & Head (Massive) ---
        ctx.fillStyle = "#bbbbbb"; // Greyish sparse hair
        ctx.fillRect(-16, -60, 32, 8);
        ctx.fillRect(-18, -52, 6, 6); // Left side puff

        // Face
        ctx.fillStyle = "#f5c3a2"; // Pale skin tone
        ctx.fillRect(-14, -52, 28, 17);

        // Creepy staring eyes (facing forward looking at player)
        ctx.fillStyle = "#000000";
        ctx.fillRect(-6, -45, 5, 5); // Left eye
        ctx.fillRect(1, -45, 5, 5); // Right eye

        // Sinister grin
        ctx.fillStyle = "#aa3333";
        ctx.fillRect(-2, -38, 8, 2);

        // --- Body / Red Suit (Small compared to head) ---
        ctx.fillStyle = enemy.mainColor; // Red suit torso
        ctx.fillRect(-12, -35, 24, 20);

        // --- White Shirt ---
        ctx.fillStyle = enemy.secondaryColor;
        ctx.fillRect(0, -35, 6, 15);

        // --- Arms (Suit colored) ---
        // Back slightly hidden swinging arm
        ctx.fillStyle = "#8a1313"; // Darker red for depth
        ctx.fillRect(-16, -30, 6, 15);

        // Front arm (in dynamic pose like his dance)
        ctx.fillStyle = enemy.mainColor;
        ctx.fillRect(8, -32, 10, 6); // Upper arm angled forward
        ctx.fillRect(14, -40, 5, 10); // Forearm pointing up "dancing"

        // Hands
        ctx.fillStyle = "#f5c3a2";
        ctx.fillRect(-16, -15, 6, 5); // Back hand
        ctx.fillRect(14, -45, 5, 5); // Hand up in the air

        // --- Legs / Pants (Suit colored but shaded slightly) ---
        ctx.fillStyle = "#8a1313";

        // Walking/Dancing leg animation step
        ctx.fillRect(-10, -15, 8, 11); // Back leg
        ctx.fillRect(2, -15, 8, 11); // Front leg

        // --- Shoes ---
        ctx.fillStyle = "#111111"; // Black shiny shoes
        ctx.fillRect(-12, -4, 10, 4);
        ctx.fillRect(2, -4, 11, 4);

        ctx.restore();
    },
};

/**
 * Simplified hitbox rendering mode for enemies
 */
export const DebugBoxEnemyRenderer = {
    draw: (ctx, enemy) => {
        ctx.save();

        ctx.fillStyle = "rgba(255, 100, 0, 0.5)";
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

        ctx.strokeStyle = "#ff6600";
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.w, enemy.h);

        // Draw the looking direction (a dot on the front side of the box)
        ctx.fillStyle = "yellow";
        const eyeOffset = enemy.vx > 0 ? enemy.w - 4 : 0;
        ctx.fillRect(enemy.x + eyeOffset, enemy.y + 4, 4, 4);

        ctx.restore();
    },
};
