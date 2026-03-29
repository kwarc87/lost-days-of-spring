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
            // == CROUCHING VIEW ==
            // Hair - Messy
            ctx.fillStyle = "#2b1d14"; // Dark brown
            ctx.fillRect(-18, -48, 36, 12);
            ctx.fillRect(-22, -42, 6, 8); // Messy sides
            ctx.fillRect(16, -45, 8, 10);
            ctx.fillStyle = "#4a3324"; // Hair highlight
            ctx.fillRect(-14, -48, 12, 4);

            // Face
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-14, -38, 28, 18);
            // Shading under hair
            ctx.fillStyle = "#e0c092";
            ctx.fillRect(-14, -38, 28, 4);

            // Eyes (tired/outsider look)
            ctx.fillStyle = "#111111";
            ctx.fillRect(-8, -30, 4, 4);
            ctx.fillRect(4, -30, 4, 4);
            ctx.fillStyle = "#886655"; // Eye bags
            ctx.fillRect(-8, -26, 4, 2);
            ctx.fillRect(4, -26, 4, 2);

            // Torso (Sports jacket)
            ctx.fillStyle = "#2c3e50"; // Dark blue-grey jacket
            ctx.fillRect(-18, -20, 36, 14);
            ctx.fillStyle = "#34495e"; // Jacket highlight
            ctx.fillRect(-14, -20, 10, 14);
            ctx.fillRect(4, -20, 10, 14);

            // Shirt & Red Tie
            ctx.fillStyle = "#ecf0f1";
            ctx.fillRect(-6, -20, 12, 10);
            ctx.fillStyle = "#c0392b"; // Red tie
            ctx.fillRect(-2, -20, 4, 8);

            // Arms resting on knees
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(-22, -18, 8, 12);
            ctx.fillRect(14, -18, 8, 12);

            // Hands (Empty)
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-22, -6, 6, 6);
            ctx.fillRect(16, -6, 6, 6);

            // Legs
            ctx.fillStyle = "#29323c"; // Dark trousers/jeans
            ctx.fillRect(-16, -10, 12, 6);
            ctx.fillRect(4, -10, 12, 6);

            // Shoes
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(-18, -4, 14, 4);
            ctx.fillRect(4, -4, 14, 4);
        } else if (player.vx === 0) {
            // == FRONT IDLE VIEW ==
            // Hair - Messy
            ctx.fillStyle = "#2b1d14";
            ctx.fillRect(-16, -78, 32, 12);
            ctx.fillRect(-20, -70, 6, 10); // Messy left
            ctx.fillRect(14, -72, 8, 12); // Messy right
            ctx.fillRect(-4, -82, 10, 6); // Top tuft
            ctx.fillStyle = "#4a3324"; // Highlight
            ctx.fillRect(-12, -78, 16, 4);

            // Face
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-14, -66, 28, 22);
            ctx.fillStyle = "#e0c092"; // Shading
            ctx.fillRect(-14, -66, 28, 4);
            ctx.fillRect(-4, -50, 8, 4); // Nose shadow

            // Eyes
            ctx.fillStyle = "#111111";
            ctx.fillRect(-8, -56, 4, 4);
            ctx.fillRect(4, -56, 4, 4);
            ctx.fillStyle = "#886655"; // Eye bags
            ctx.fillRect(-8, -52, 4, 2);
            ctx.fillRect(4, -52, 4, 2);

            // Torso (Sports jacket open)
            ctx.fillStyle = "#2c3e50"; // Base jacket
            ctx.fillRect(-16, -44, 32, 26);
            ctx.fillStyle = "#34495e"; // Jacket highlight/texture
            ctx.fillRect(-14, -44, 10, 26);
            ctx.fillRect(4, -44, 10, 26);

            // Shirt
            ctx.fillStyle = "#ecf0f1";
            ctx.fillRect(-6, -44, 12, 22);
            ctx.fillStyle = "#bdc3c7"; // Shirt shading
            ctx.fillRect(-6, -44, 12, 4);

            // Red Tie (Slightly loose)
            ctx.fillStyle = "#c0392b";
            ctx.fillRect(-2, -42, 4, 16);
            ctx.fillRect(-1, -26, 2, 4);
            ctx.fillStyle = "#e74c3c"; // Tie highlight
            ctx.fillRect(0, -40, 2, 12);

            // Arms (Relaxed, empty hands)
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(-22, -44, 6, 24); // Left arm
            ctx.fillRect(16, -44, 6, 24); // Right arm
            ctx.fillStyle = "#1a252f"; // Arm shadow
            ctx.fillRect(-18, -44, 2, 24);
            ctx.fillRect(16, -44, 2, 24);

            // Hands
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-22, -20, 6, 8);
            ctx.fillRect(16, -20, 6, 8);

            // Legs
            ctx.fillStyle = "#29323c"; // Trousers
            ctx.fillRect(-12, -18, 10, 14);
            ctx.fillRect(2, -18, 10, 14);
            ctx.fillStyle = "#1e242b"; // Inner leg shadow
            ctx.fillRect(-4, -18, 2, 14);
            ctx.fillRect(2, -18, 2, 14);

            // Shoes
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(-14, -4, 12, 4);
            ctx.fillRect(2, -4, 12, 4);
            ctx.fillStyle = "#333333"; // Shoe highlight
            ctx.fillRect(-12, -4, 4, 2);
            ctx.fillRect(4, -4, 4, 2);
        } else {
            // == SIDE WALKING VIEW ==
            // Hair - Messy blowing slightly
            ctx.fillStyle = "#2b1d14";
            ctx.fillRect(-12, -78, 24, 12);
            ctx.fillRect(-16, -72, 8, 10); // Back messy
            ctx.fillRect(-2, -82, 12, 6); // Top tuft
            ctx.fillStyle = "#4a3324";
            ctx.fillRect(-8, -78, 12, 4);

            // Face Profile
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(-8, -66, 20, 22);
            ctx.fillRect(12, -56, 4, 6); // Nose
            ctx.fillStyle = "#e0c092"; // Shading
            ctx.fillRect(-8, -66, 12, 22); // Back of head/neck darker

            // Eye
            ctx.fillStyle = "#111111";
            ctx.fillRect(4, -56, 4, 4);
            ctx.fillStyle = "#886655";
            ctx.fillRect(4, -52, 4, 2);

            // Torso (Sports jacket)
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(-10, -44, 20, 26);
            ctx.fillStyle = "#34495e"; // Highlight front
            ctx.fillRect(2, -44, 8, 26);

            // Shirt Collar
            ctx.fillStyle = "#ecf0f1";
            ctx.fillRect(4, -42, 6, 12);
            // Red Tie
            ctx.fillStyle = "#c0392b";
            ctx.fillRect(8, -40, 4, 14);
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(10, -38, 2, 10);

            // Back arm (swinging)
            ctx.fillStyle = "#1a252f";
            ctx.fillRect(-14, -42, 8, 20);
            // Back Hand
            ctx.fillStyle = "#e0c092"; // Darker skin for back
            ctx.fillRect(-14, -22, 6, 6);

            // Front arm (swinging)
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(0, -42, 8, 20);
            ctx.fillStyle = "#34495e";
            ctx.fillRect(4, -42, 4, 20);
            // Front Hand (Empty)
            ctx.fillStyle = "#ffdbac";
            ctx.fillRect(2, -22, 6, 6);

            // Legs walking
            ctx.fillStyle = "#1e242b"; // Back leg darker
            ctx.fillRect(-10, -18, 10, 14);
            ctx.fillStyle = "#1a1a1a"; // Back shoe
            ctx.fillRect(-12, -4, 12, 4);

            ctx.fillStyle = "#29323c"; // Front leg brighter
            ctx.fillRect(2, -18, 10, 14);
            ctx.fillStyle = "#1a1a1a"; // Front shoe
            ctx.fillRect(2, -4, 12, 4);
            ctx.fillStyle = "#333333";
            ctx.fillRect(4, -4, 4, 2);
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
