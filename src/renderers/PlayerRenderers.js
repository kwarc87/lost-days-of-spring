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
        // 3. Squash vertically if crouching (player.h < originalHeight)
        ctx.translate(cx, cy);
        const scaleX = player.vx < 0 ? -1 : 1;

        // Remove uniform squash for crouching, we will draw a custom sprite for it
        ctx.scale(scaleX, 1);

        // --- AGENT COOPER PIXEL ART (Local coordinates based on new height 60) ---

        if (player.crouch) {
            // == CROUCHING VIEW ==
            // With height increased to 60 and crouchHeight to 35, the overall proportions
            // give us more space. We draw everything anchored slightly higher.
            const crouchOffsetY = 5;

            // Hair
            ctx.fillStyle = "#111111";
            ctx.fillRect(-11, -45 + crouchOffsetY, 22, 6);
            ctx.fillRect(-12, -41 + crouchOffsetY, 3, 6);
            ctx.fillRect(9, -41 + crouchOffsetY, 3, 6);

            // Face
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-9, -40 + crouchOffsetY, 18, 10);

            // Eyes
            ctx.fillStyle = "#000000";
            ctx.fillRect(-5, -37 + crouchOffsetY, 2, 2);
            ctx.fillRect(3, -37 + crouchOffsetY, 2, 2);

            // Suit torso (Squashed and hunched over)
            ctx.fillStyle = "#222222";
            ctx.fillRect(-14, -30 + crouchOffsetY, 28, 14);

            // White shirt
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-4, -30 + crouchOffsetY, 8, 8);

            // Black Tie
            ctx.fillStyle = "#000000";
            ctx.fillRect(-2, -28 + crouchOffsetY, 4, 6);

            // Shoulders/Arms (Resting on knees)
            ctx.fillStyle = "#1c1c1c";
            ctx.fillRect(-16, -28 + crouchOffsetY, 6, 12);
            ctx.fillRect(10, -28 + crouchOffsetY, 6, 12);

            // Tape Recorder (Held lower)
            ctx.fillStyle = "#555555";
            ctx.fillRect(11, -19 + crouchOffsetY, 5, 6);
            ctx.fillStyle = "#bb0000";
            ctx.fillRect(12, -18 + crouchOffsetY, 2, 2);
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(15, -17 + crouchOffsetY, 3, 3);

            // Legs (Bent out wide)
            ctx.fillStyle = "#151515";
            ctx.fillRect(-14, -16 + crouchOffsetY, 8, 11); // Left bent leg
            ctx.fillRect(6, -16 + crouchOffsetY, 8, 11); // Right bent leg

            // Shoes
            ctx.fillStyle = "#050505";
            ctx.fillRect(-16, -5 + crouchOffsetY, 10, 5);
            ctx.fillRect(6, -5 + crouchOffsetY, 10, 5);
        } else if (player.vx === 0) {
            // == FRONT IDLE VIEW ==

            // Shift up the entire body to use the new 60px height
            const idleOffsetY = -15;

            // Hair
            ctx.fillStyle = "#111111"; // Very dark hair
            ctx.fillRect(-11, -45 + idleOffsetY, 22, 6); // Top head
            ctx.fillRect(-12, -41 + idleOffsetY, 3, 6); // Left sideburn
            ctx.fillRect(9, -41 + idleOffsetY, 3, 6); // Right sideburn

            // Face
            ctx.fillStyle = "#ffdbac"; // Skin tone
            ctx.fillRect(-9, -40 + idleOffsetY, 18, 10);

            // Eyes
            ctx.fillStyle = "#000000";
            ctx.fillRect(-5, -37 + idleOffsetY, 2, 2);
            ctx.fillRect(3, -37 + idleOffsetY, 2, 2);

            // Suit torso
            ctx.fillStyle = "#222222"; // Dark greyish-black suit
            ctx.fillRect(-12, -30 + idleOffsetY, 24, 21);

            // White shirt
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-4, -30 + idleOffsetY, 8, 15);

            // Black Tie
            ctx.fillStyle = "#000000";
            ctx.fillRect(-2, -28 + idleOffsetY, 4, 12);
            ctx.fillRect(-1, -16 + idleOffsetY, 2, 2); // Tie tip

            // Left Arm
            ctx.fillStyle = "#1c1c1c";
            ctx.fillRect(-14, -29 + idleOffsetY, 4, 16);

            // Left Hand
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-14, -13 + idleOffsetY, 4, 4);

            // Right Arm
            ctx.fillStyle = "#1c1c1c";
            ctx.fillRect(10, -29 + idleOffsetY, 4, 16);

            // Tape Recorder ("Diane...") in right hand
            ctx.fillStyle = "#555555"; // Grey metallic recorder
            ctx.fillRect(9, -15 + idleOffsetY, 5, 6);
            ctx.fillStyle = "#bb0000"; // Red recording light
            ctx.fillRect(10, -14 + idleOffsetY, 2, 2);
            ctx.fillStyle = "#ffdbac"; // Hand
            ctx.fillRect(13, -13 + idleOffsetY, 3, 3);

            // Pants
            ctx.fillStyle = "#151515";
            ctx.fillRect(-10, -9 + idleOffsetY, 8, 20); // Left leg
            ctx.fillRect(2, -9 + idleOffsetY, 8, 20); // Right leg

            // Shoes
            ctx.fillStyle = "#050505";
            ctx.fillRect(-11, 11 + idleOffsetY, 9, 4);
            ctx.fillRect(2, 11 + idleOffsetY, 9, 4);
        } else {
            // == SIDE WALKING VIEW (Dynamic cup of coffee!) ==

            const runOffsetY = -15;

            // Hair
            ctx.fillStyle = "#111111";
            ctx.fillRect(-9, -45 + runOffsetY, 16, 5);
            ctx.fillRect(-11, -43 + runOffsetY, 5, 8); // Back slick

            // Face
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-6, -41 + runOffsetY, 14, 11);
            ctx.fillRect(8, -37 + runOffsetY, 2, 3); // Pointy nose

            // Eye
            ctx.fillStyle = "#000000";
            ctx.fillRect(3, -38 + runOffsetY, 2, 2);

            // Suit torso profile
            ctx.fillStyle = "#222222";
            ctx.fillRect(-8, -30 + runOffsetY, 14, 21);

            // Shirt collar profile
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(3, -30 + runOffsetY, 4, 13);

            // Tie profile
            ctx.fillStyle = "#000000";
            ctx.fillRect(5, -28 + runOffsetY, 3, 11);

            // Back arm (swinging)
            ctx.fillStyle = "#151515";
            ctx.fillRect(-10, -29 + runOffsetY, 6, 16);

            // Front arm raised holding Coffee ("Damn fine coffee!")
            ctx.fillStyle = "#1c1c1c";
            ctx.fillRect(-3, -29 + runOffsetY, 8, 4); // Upper arm forward
            ctx.fillRect(1, -29 + runOffsetY, 4, 10); // Forearm pointing down to hand

            // Cup of coffee
            ctx.fillStyle = "#ffffff"; // Ceramic mug
            ctx.fillRect(5, -24 + runOffsetY, 6, 7);
            ctx.fillStyle = "#3b1e08"; // Dark coffee inside
            ctx.fillRect(6, -24 + runOffsetY, 4, 2);

            // Coffee Steam
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.fillRect(7, -29 + runOffsetY, 2, 3);
            ctx.fillRect(8, -33 + runOffsetY, 2, 3);

            // Front Hand holding cup
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(2, -19 + runOffsetY, 4, 3);

            // Pants profile walking stride
            ctx.fillStyle = "#111111"; // Back leg darker
            ctx.fillRect(-7, -9 + runOffsetY, 6, 20);
            ctx.fillStyle = "#050505"; // Back shoe
            ctx.fillRect(-9, 11 + runOffsetY, 8, 4);

            ctx.fillStyle = "#151515"; // Front leg brighter
            ctx.fillRect(-1, -9 + runOffsetY, 6, 20);
            ctx.fillStyle = "#050505"; // Front shoe
            ctx.fillRect(-1, 11 + runOffsetY, 9, 4);
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
