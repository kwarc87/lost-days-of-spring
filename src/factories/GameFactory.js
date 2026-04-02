export const GameFactory = {
    solid: (id, x, y, w, h) => ({
        id,
        x,
        y,
        w,
        h,
        color: "#5c2040",
        secondaryColor: "#3a1528",
        textureColor: "#2a1020",
        patternColor: "#1e0c16",
        mossColor: "#0dfa9d",
        mossShadowColor: "#07965c",
        accentColor: "#ff3a3a",
        bottomLightColor: "#1e0c16",
        bottomDarkColor: "#1b080f",
        type: "solid",
    }),
    bouncy: (id, x, y, w, h, elasticity = 0.5) => ({
        id,
        x,
        y,
        w,
        h,
        color: "#c42040",
        secondaryColor: "#8c1530",
        textureColor: "#5a1020",
        patternColor: "#300c14",
        mossColor: "#0dfa9d",
        mossShadowColor: "#07965c",
        accentColor: "#ff6040",
        bottomLightColor: "#29040d",
        bottomDarkColor: "#300c14",
        elasticity,
        type: "bouncy",
    }),
    booster: (id, x, y, w, h, boostSpeed = 20) => ({
        id,
        x,
        y,
        w,
        h,
        color: "#ffe568",
        secondaryColor: "#ffc300",
        mossColor: "#dc562e",
        textureColor: "#ff8800",
        patternColor: "#ffa200",
        elasticity: 0,
        type: "booster",
        boostSpeed,
    }),
    enemy: (id, platformId, speed = 1.5, overrides = {}) => ({
        id,
        platformId,
        w: 36,
        h: 76,
        speed,
        health: 15,
        isDamaged: false,
        damageTime: 0,
        mainColor: "#e84855", // vivid coral red
        secondaryColor: "#f7b32b", // warm amber yellow
        ...overrides,
    }),
    player: (overrides = {}) => ({
        x: 0,
        y: 0,
        w: 40,
        h: 85,
        vx: 0,
        vy: 0,
        acceleration: 0.65,
        deceleration: 0.85,
        airAcceleration: 0.55,
        airDeceleration: 0.45,
        speed: 5.8,
        crouch: false,
        crouchHeight: 50,
        originalHeight: 85,
        jump: 15.4,
        isJumping: false,
        jumpPressedAt: 0,
        jumpBufferDuration: 80,
        lastGroundedAt: 0,
        coyoteDuration: 80,
        onGroundId: null,
        onGroundType: null,
        lastGroundId: null,
        lastGroundType: null,
        bounceCount: 0,
        collectiblesCount: 0,
        facing: "right",
        shooting: false,
        lastShootTime: 0,
        ...overrides,
    }),
    collectible: (id, x, y, overrides = {}) => ({
        id,
        x,
        y,
        w: 25,
        h: 25,
        collected: false,
        ...overrides,
    }),
    weapon: (overrides = {}) => ({
        id: null,
        color: "#ffc300",
        speed: 12,
        shootFrequency: 250,
        ammo: {
            vx: 0,
            vy: 0,
            w: 8,
            h: 8,
            damage: 5,
        },
        ...overrides,
    }),
    rowOfCollectibles: (startId, count, startX, y, gap) =>
        Array.from({ length: count }, (_, i) =>
            GameFactory.collectible(startId + i, startX + i * gap, y),
        ),
    /**
     * Half-pyramid staircase (left-aligned, widens towards the bottom).
     * Row 0 = top (narrowest), row height-1 = bottom (widest).
     * Each subsequent row is `width` block-units wider than the one above.
     *
     * @param {number} startId  - First platform id
     * @param {number} startX   - Left edge X of all rows
     * @param {number} startY   - Y of the topmost row
     * @param {number} blockWidth  - Width of one block unit (default 50)
     * @param {number} blockHeight - Height of one block unit (default 50)
     * @param {number} height   - Number of rows/steps
     * @param {number} width    - How many block-units each row adds relative to the one above
     */
    stairs: (
        startId,
        startX,
        startY,
        blockWidth = 50,
        blockHeight = 50,
        width,
    ) => {
        const platforms = [];
        let id = startId;
        for (let i = 0; i < width; i++) {
            platforms.push(
                GameFactory.solid(
                    id++,
                    startX + i * blockWidth,
                    startY - i * blockHeight,
                    blockWidth * width - i * blockWidth,
                    blockHeight,
                ),
            );
        }
        return platforms;
    },
};
