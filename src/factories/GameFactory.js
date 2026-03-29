export const GameFactory = {
    ground: (id, x, y, w, h) => ({
        id,
        x,
        y,
        w,
        h,
        color: "#2a7049", // emerald grass
        secondaryColor: "#1e140d", // dark dirt
        elasticity: 0,
        type: "normal",
    }),
    bouncy: (id, x, y, w, h, elasticity = 0.5) => ({
        id,
        x,
        y,
        w,
        h,
        color: elasticity > 0.6 ? "#932fa6" : "#4682b4",
        secondaryColor: "rgba(255, 255, 255, 0.4)",
        elasticity,
        type: "normal",
    }),
    booster: (id, x, y, w, h, boostSpeed = 11) => ({
        id,
        x,
        y,
        w,
        h,
        color: "#d95a00", // booster - orange
        secondaryColor: "#ffe600", // glossy yellow top
        elasticity: 0,
        type: "booster",
        boostSpeed,
    }),
    enemy: (platformId, speed = 1.5, overrides = {}) => ({
        platformId,
        w: 24,
        h: 30,
        speed,
        color: "#8B0000",
        ...overrides,
    }),
};
