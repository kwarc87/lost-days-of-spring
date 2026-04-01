import { GameFactory } from "../factories/GameFactory.js";

export const LEVELS = {
    1: () => ({
        worldSize: { width: 1200, height: 2600 },
        playerStart: { x: 50, y: 2450 },
        platforms: [
            // --- GROUND FLOOR ---
            GameFactory.ground(1, 0, 2550, 1200, 45),

            GameFactory.bouncy(21, 400, 2430, 800, 60, 0.65),

            // --- FIRST ASCENT (Spiral to the right) ---
            GameFactory.ground(2, 200, 2430, 110, 20),
            GameFactory.ground(3, 400, 2310, 105, 20),
            GameFactory.ground(4, 600, 2250, 115, 20),
            GameFactory.ground(5, 800, 2150, 400, 40), // Right wall landing

            // --- SECOND ASCENT (Going back left with bouncy platforms) ---
            GameFactory.ground(6, 560, 2050, 80, 20, 0.6),
            GameFactory.ground(7, 400, 1950, 80, 20, 0.6),

            // --- THE BOOST TOWER (Fast vertical up catapult) ---
            GameFactory.booster(9, 0, 1860, 280, 30, 26),
            GameFactory.ground(10, 320, 1400, 270, 20), // Catch platform in the middle

            // --- THIRD ASCENT (Spiral to right again) ---
            GameFactory.ground(11, 650, 1300, 100, 20),
            GameFactory.ground(12, 850, 1220, 80, 20, 0.65),
            GameFactory.bouncy(13, 1000, 1150, 200, 40), // Right wall landing

            // --- FOURTH ASCENT (Increasingly bouncy staircase to the left) ---
            GameFactory.ground(14, 800, 1040, 100, 20, 0.6),
            GameFactory.booster(15, 600, 930, 100, 20, 20),
            GameFactory.ground(16, 380, 650, 100, 20, 22),
            GameFactory.ground(17, 0, 530, 250, 40),

            // --- FINAL STEPS (Top of the tower approach) ---
            GameFactory.ground(18, 350, 400, 80, 20),
            GameFactory.ground(19, 550, 325, 100, 20),
            GameFactory.ground(20, 750, 200, 450, 40), // The Top / Goal Area!
        ],
        enemies: [
            GameFactory.enemy(21, 2, {
                mainColor: "#F2DCC9",
                secondaryColor: "#BF3604",
            }),
            GameFactory.enemy(5, 4, {
                mainColor: "#F2DCC9",
                secondaryColor: "#65BFA6",
            }),
            GameFactory.enemy(10, 1.5, {
                mainColor: "#F2DCC9",
                secondaryColor: "#4A678C",
            }),
            GameFactory.enemy(20, 2, {
                mainColor: "#8694A6",
                secondaryColor: "#222C40",
            }),
        ],

        collectibles: [
            GameFactory.collectible(1, 230, 2380),
            GameFactory.collectible(2, 430, 2260),
            GameFactory.collectible(3, 400, 1320),
            GameFactory.collectible(4, 900, 110),
            GameFactory.collectible(5, 950, 110),
            GameFactory.collectible(6, 1000, 110),
            GameFactory.collectible(7, 1150, 2500),
            GameFactory.collectible(8, 1100, 2500),
            GameFactory.collectible(9, 1050, 2500),
            GameFactory.collectible(10, 1000, 2500),
            GameFactory.collectible(11, 50, 400),
            GameFactory.collectible(12, 100, 400),
            GameFactory.collectible(13, 150, 400),
            GameFactory.collectible(14, 1100, 1080),
            GameFactory.collectible(15, 1150, 1080),
            GameFactory.collectible(16, 1150, 2380),
            GameFactory.collectible(17, 1100, 2380),
            GameFactory.collectible(18, 1050, 2380),
            GameFactory.collectible(19, 1000, 2380),
            GameFactory.collectible(20, 620, 2180),
        ],
    }),
};
