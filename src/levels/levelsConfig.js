import { GameFactory } from "../factories/GameFactory.js";

export const LEVELS = {
    1: () => ({
        worldSize: { width: 1200, height: 2600 },
        playerStart: { x: 50, y: 2450 },
        platforms: [
            // --- GROUND FLOOR ---
            GameFactory.ground(1, 0, 2550, 1200, 50),

            GameFactory.bouncy(21, 400, 2450, 800, 45, 0.75),

            // --- FIRST ASCENT (Spiral to the right) ---
            GameFactory.ground(2, 200, 2450, 100, 20),
            GameFactory.ground(3, 400, 2330, 100, 20),
            GameFactory.ground(4, 600, 2250, 100, 20),
            GameFactory.ground(5, 800, 2150, 400, 40), // Right wall landing

            // --- SECOND ASCENT (Going back left with bouncy platforms) ---
            GameFactory.ground(6, 650, 2050, 80, 20, 0.6),
            GameFactory.ground(7, 450, 1950, 80, 20, 0.6),

            // --- THE BOOST TOWER (Fast vertical up catapult) ---
            GameFactory.booster(9, 0, 1860, 280, 20, 25.5),
            GameFactory.ground(10, 350, 1400, 200, 20), // Catch platform in the middle

            // --- THIRD ASCENT (Spiral to right again) ---
            GameFactory.ground(11, 650, 1300, 100, 20),
            GameFactory.ground(12, 850, 1200, 100, 20),
            GameFactory.ground(13, 1050, 1100, 150, 40), // Right wall landing

            // --- FOURTH ASCENT (Increasingly bouncy staircase to the left) ---
            GameFactory.ground(14, 850, 1000, 100, 20, 0.6),
            GameFactory.booster(15, 600, 900, 100, 20, 20),
            GameFactory.ground(16, 380, 630, 100, 20, 22),
            GameFactory.ground(17, 0, 530, 250, 40),

            // --- FINAL STEPS (Top of the tower approach) ---
            GameFactory.ground(18, 350, 400, 120, 20),
            GameFactory.ground(19, 550, 280, 80, 20),
            GameFactory.ground(20, 750, 180, 450, 40),
        ],
        enemies: [GameFactory.enemy(21, 4)],
    }),
};
