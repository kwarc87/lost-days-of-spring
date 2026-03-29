import { GameFactory } from "../factories/GameFactory.js";

export const LEVELS = {
    1: () => ({
        worldSize: { width: 1200, height: 2600 },
        playerStart: { x: 50, y: 2450 },
        platforms: [
            // --- GROUND FLOOR ---
            GameFactory.ground(1, 0, 2550, 1200, 50),

            GameFactory.bouncy(21, 400, 2450, 800, 45, 0.65),

            // --- FIRST ASCENT (Spiral to the right) ---
            GameFactory.ground(2, 200, 2450, 100, 20),
            GameFactory.ground(3, 400, 2330, 100, 20),
            GameFactory.ground(4, 600, 2250, 100, 20),
            GameFactory.ground(5, 800, 2150, 400, 40), // Right wall landing

            // --- SECOND ASCENT (Going back left with bouncy platforms) ---
            GameFactory.ground(6, 650, 2050, 80, 20, 0.6),
            GameFactory.ground(7, 450, 1950, 80, 20, 0.6),

            // --- THE BOOST TOWER (Fast vertical up catapult) ---
            GameFactory.booster(9, 0, 1860, 280, 30, 25),
            GameFactory.ground(10, 320, 1400, 270, 20), // Catch platform in the middle

            // --- THIRD ASCENT (Spiral to right again) ---
            GameFactory.ground(11, 650, 1300, 100, 20),
            GameFactory.bouncy(12, 850, 1200, 170, 20, 0.65),
            GameFactory.ground(13, 1050, 1100, 150, 40), // Right wall landing

            // --- FOURTH ASCENT (Increasingly bouncy staircase to the left) ---
            GameFactory.ground(14, 850, 1000, 100, 20, 0.6),
            GameFactory.booster(15, 600, 900, 100, 20, 20),
            GameFactory.ground(16, 380, 630, 100, 20, 22),
            GameFactory.ground(17, 0, 530, 250, 40),

            // --- FINAL STEPS (Top of the tower approach) ---
            GameFactory.ground(18, 350, 400, 80, 20),
            GameFactory.ground(19, 550, 325, 80, 20),
            GameFactory.ground(20, 750, 200, 450, 40), // The Top / Goal Area!
        ],
        enemies: [
            GameFactory.enemy(21, 2),
            GameFactory.enemy(5, 4, {
                mainColor: "#eeba30",
                secondaryColor: "#d3a625",
            }),
            GameFactory.enemy(10, 1, {
                mainColor: "#733073",
                secondaryColor: "#1e140d",
            }),
            GameFactory.enemy(20, 2, {
                mainColor: "#fc3468",
                secondaryColor: "#ffc2cd",
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
            GameFactory.collectible(14, 1100, 1000),
            GameFactory.collectible(15, 1150, 1000),
            GameFactory.collectible(16, 1150, 2400),
            GameFactory.collectible(17, 1100, 2400),
            GameFactory.collectible(18, 1050, 2400),
            GameFactory.collectible(19, 1000, 2400),
            GameFactory.collectible(20, 620, 2180),
        ],
    }),
};
