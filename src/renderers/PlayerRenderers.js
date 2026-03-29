/**
 * Default player rendering strategy (Agent Cooper in a pixel-art style)
 */
export const DefaultPlayerRenderer = {
    draw: (ctx, player) => {
        ctx.save();

        const cx = player.x + player.w / 2;
        const cy = player.y + player.h; // Anchor at the bottom center

        // Apply transformations:
        // 1. Move to bottom center
        // 2. Flip horizontally if moving left
        ctx.translate(cx, cy);
        const scaleX = player.vx < 0 ? -1 : 1;

        // Remove uniform squash for crouching, we will draw a custom sprite for it
        ctx.scale(scaleX, 1);

        // --- AGENT COOPER PIXEL ART (Cartoon/Big Head Style - base height 80px) ---

        if (player.crouch) {
            // == CROUCHING VIEW (50px height) ==
            // Hair
            ctx.fillStyle = "#111111";
            ctx.fillRect(-18, -50, 36, 10);
            ctx.fillRect(-20, -40, 6, 12);
            ctx.fillRect(14, -40, 6, 12);

            // Face (Big cartoon head)
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-16, -40, 32, 20);

            // Eyes
            ctx.fillStyle = "#000000";
            ctx.fillRect(-8, -32, 4, 5);
            ctx.fillRect(4, -32, 4, 5);

            // Torso (Squashed)
            ctx.fillStyle = "#222222";
            ctx.fillRect(-16, -20, 32, 12);

            // White shirt
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-6, -20, 12, 8);

            // Black Tie
            ctx.fillStyle = "#000000";
            ctx.fillRect(-2, -20, 4, 6);

            // Tape Recorder & Hands
            ctx.fillStyle = "#555555";
            ctx.fillRect(14, -14, 8, 8);
            ctx.fillStyle = "#bb0000";
            ctx.fillRect(16, -12, 4, 3);

            // Shoulders/Arms (Resting on knees)
            ctx.fillStyle = "#1c1c1c";
            ctx.fillRect(-16, -18, 6, 10);
            ctx.fillRect(10, -18, 6, 10);

            ctx.fillStyle = "#ffdbac"; // Hand holding it
            ctx.fillRect(16, -10, 6, 6);

            // Back Hand
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-20, -11, 6, 6);

            // Legs (Bent out wide)
            ctx.fillStyle = "#151515";
            ctx.fillRect(-16, -10, 10, 5);
            ctx.fillRect(6, -10, 10, 5);

            // Shoes
            ctx.fillStyle = "#050505";
            ctx.fillRect(-18, -5, 14, 5);
            ctx.fillRect(4, -5, 14, 5);
        } else if (player.vx === 0) {
            // == FRONT IDLE VIEW (Cartoon Style - 80px height) ==

            // Hair
            ctx.fillStyle = "#111111"; // Very dark hair
            ctx.fillRect(-18, -80, 36, 10); // Top head
            ctx.fillRect(-20, -70, 6, 12); // Left sideburn
            ctx.fillRect(14, -70, 6, 12); // Right sideburn

            // Face (Big cartoon head)
            ctx.fillStyle = "#ffdbac"; // Skin tone
            ctx.fillRect(-16, -70, 32, 24);

            // Eyes
            ctx.fillStyle = "#000000";
            ctx.fillRect(-8, -58, 5, 5);
            ctx.fillRect(3, -58, 5, 5);

            // Suit torso
            ctx.fillStyle = "#222222"; // Dark greyish-black suit
            ctx.fillRect(-15, -46, 30, 26);

            // White shirt
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-6, -46, 12, 18);

            // Black Tie
            ctx.fillStyle = "#000000";
            ctx.fillRect(-2, -44, 4, 14);
            ctx.fillRect(-1, -30, 2, 3); // Tie point

            // Left Arm
            ctx.fillStyle = "#1c1c1c";
            ctx.fillRect(-22, -46, 7, 22);

            // Left Hand
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-21, -24, 6, 6);

            // Right Arm
            ctx.fillStyle = "#1c1c1c";
            ctx.fillRect(15, -46, 7, 22);

            // Tape Recorder ("Diane...") in right hand
            ctx.fillStyle = "#555555"; // Grey metallic recorder
            ctx.fillRect(16, -22, 8, 8);
            ctx.fillStyle = "#bb0000"; // Red recording light
            ctx.fillRect(18, -20, 4, 2);
            ctx.fillStyle = "#ffdbac"; // Hand
            ctx.fillRect(16, -26, 6, 6);

            // Pants
            ctx.fillStyle = "#151515";
            ctx.fillRect(-12, -20, 10, 15); // Left leg
            ctx.fillRect(2, -20, 10, 15); // Right leg

            // Shoes
            ctx.fillStyle = "#050505";
            ctx.fillRect(-14, -5, 12, 5);
            ctx.fillRect(2, -5, 12, 5);
        } else {
            // == SIDE WALKING VIEW (Dynamic cup of coffee! - 80px) ==

            // Hair
            ctx.fillStyle = "#111111";
            ctx.fillRect(-14, -80, 26, 10);
            ctx.fillRect(-18, -75, 8, 16); // Back slick

            // Face (Big profile head)
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-10, -70, 22, 24);
            ctx.fillRect(12, -58, 6, 5); // More prominent nose for profile cartoon

            // Eye
            ctx.fillStyle = "#000000";
            ctx.fillRect(4, -60, 6, 6); // Huge cartoon eye

            // Suit torso profile
            ctx.fillStyle = "#222222";
            ctx.fillRect(-10, -46, 22, 26);

            // Shirt collar profile
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(4, -46, 8, 15);

            // Tie profile
            ctx.fillStyle = "#000000";
            ctx.fillRect(8, -42, 4, 12);

            // Back arm (swinging)
            ctx.fillStyle = "#151515";
            ctx.fillRect(-14, -42, 8, 20);

            // Front arm raised holding Coffee
            ctx.fillStyle = "#1c1c1c";
            ctx.fillRect(0, -42, 16, 6); // Upper arm forward
            ctx.fillRect(10, -42, 6, 10); // Forearm pointing down

            // Cup of coffee
            ctx.fillStyle = "#ffffff"; // Ceramic mug
            ctx.fillRect(10, -34, 10, 12);
            ctx.fillStyle = "#3b1e08"; // Dark coffee inside
            ctx.fillRect(11, -34, 8, 3);

            // Coffee Steam
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.fillRect(11, -40, 3, 4);
            ctx.fillRect(15, -45, 3, 4);

            // Front Hand holding cup
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(12, -26, 6, 6);

            // Pants profile walking stride
            ctx.fillStyle = "#111111"; // Back leg darker
            ctx.fillRect(-8, -20, 8, 15);
            ctx.fillStyle = "#050505"; // Back shoe
            ctx.fillRect(-10, -5, 10, 5);

            ctx.fillStyle = "#151515"; // Front leg brighter
            ctx.fillRect(-2, -20, 8, 15);
            ctx.fillStyle = "#050505"; // Front shoe
            ctx.fillRect(0, -5, 12, 5);
        }

        ctx.restore();
    },
};

/**
 * Simplified hitbox rendering mode for physics debugging
 */
export const DebugBoxPlayerRenderer = {
    draw: (ctx, player) => {
        ctx.save();

        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(player.x, player.y, player.w, player.h);

        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x, player.y, player.w, player.h);

        // Draw the looking direction (a dot on the front side of the box)
        ctx.fillStyle = "yellow";
        const eyeOffset = player.vx < 0 ? 0 : player.w - 4;
        ctx.fillRect(player.x + eyeOffset, player.y + 4, 4, 4);

        ctx.restore();
    },
};
