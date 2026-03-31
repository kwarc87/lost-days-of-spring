export const GameFactory = {
    ground: (id, x, y, w, h) => ({
        id,
        x,
        y,
        w,
        h,
        color: "#5c2040", // top edge highlight — lighter scarlet
        secondaryColor: "#3a1528", // second edge strip — mid crimson
        textureColor: "#2a1020", // brick face — dark crimson
        patternColor: "#1e0c16", // mortar/base — visible against bg #06010a
        mossColor: "#0dfa9d", // neon green glowing moss (accent only)
        mossShadowColor: "#07965c", // darker green for moss shadow
        accentColor: "#ff3a3a", // red warning accent
        bottomLightColor: "#1e0c16", // lighter scarlet bottom (for short platforms)
        bottomDarkColor: "#1b080f",
        elasticity: 0,
        type: "normal",
    }),
    bouncy: (id, x, y, w, h, elasticity = 0.5) => ({
        id,
        x,
        y,
        w,
        h,
        color: "#c42040", // top edge — vivid red
        secondaryColor: "#8c1530", // second strip — deep red
        textureColor: "#5a1020", // brick face — saturated crimson
        patternColor: "#300c14", // mortar — dark red
        mossColor: "#0dfa9d", // neon green accent
        mossShadowColor: "#07965c",
        accentColor: "#ff6040", // warm orange-red accent
        bottomLightColor: "#29040d",
        bottomDarkColor: "#300c14",
        elasticity,
        type: "normal",
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
    enemy: (platformId, speed = 1.5, overrides = {}) => ({
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
        color: "#005C53",
        speed: 6,
        crouch: false,
        crouchHeight: 50,
        originalHeight: 85,
        jump: 13,
        isJumping: false,
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
        w: 30,
        h: 30,
        collected: false,
        ...overrides,
    }),
    weapon: (overrides = {}) => ({
        id: null,
        color: "#ffc300",
        speed: 12,
        shootFrequency: 400,
        ammo: {
            vx: 0,
            vy: 0,
            w: 8,
            h: 8,
            damage: 5,
        },
        ...overrides,
    }),
};
