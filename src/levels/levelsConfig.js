import { GameFactory } from "../factories/GameFactory.js";

export const LEVELS = {
    1: () => {
        const groundY = 2550;
        const collectiblesGap = 75;
        return {
            worldSize: { width: 6200, height: 2600 },
            playerStart: { x: 50, y: 2250 },
            platforms: [
                // --- GROUND FLOOR ---
                GameFactory.ground(1, 0, groundY, 6200, 45),

                // --- LOWER-LEFT TERRAIN ---
                GameFactory.ground(2, 450, 2400, 200, 50),
                GameFactory.ground(3, 800, 2300, 500, 50),
                GameFactory.ground(4, 1400, 2375, 200, 25),
                GameFactory.ground(5, 1650, 2200, 800, 75),

                // --- PYRAMID (stairs IDs 6–11) ---
                ...GameFactory.stairs(6, 2600, 2050, 100, 50, 6),
                GameFactory.ground(12, 3200, 1800, 100, 300),
                GameFactory.ground(13, 3300, 1800, 300, 100),
                GameFactory.ground(14, 3600, 1800, 100, 300),
                GameFactory.bouncy(15, 3700, 2050, 280, 50, 0.6),
                GameFactory.ground(16, 3700, 1900, 100, 50),
                GameFactory.ground(17, 3850, 2350, 250, 200),
                GameFactory.ground(18, 4200, 2175, 150, 25),
                GameFactory.booster(19, 3900, 1700, 300, 25, 30),
                GameFactory.booster(20, 3350, 2525, 200, 25, 23),

                // --- TREASURY ---
                GameFactory.ground(21, 1200, 550, 850, 150),

                // --- CLOUDS ---
                GameFactory.ground(22, 2300, 550, 300, 25),
                GameFactory.ground(23, 2850, 600, 50, 25),
                GameFactory.ground(24, 3000, 700, 50, 25),
                GameFactory.ground(25, 2850, 900, 50, 25),
                GameFactory.ground(26, 2950, 1050, 100, 25),
                GameFactory.ground(27, 3300, 1150, 300, 25),
                GameFactory.bouncy(28, 4150, 900, 400, 150),

                // --- RIGHT SIDE BASE ---
                GameFactory.ground(29, 4450, 2000, 400, 25),
                GameFactory.bouncy(30, 5400, 2430, 800, 60, 0.65),

                // --- FIRST ASCENT ---
                GameFactory.ground(31, 5200, 2430, 110, 20),
                GameFactory.ground(32, 5400, 2310, 105, 20),
                GameFactory.ground(33, 5600, 2250, 115, 20),
                GameFactory.ground(34, 5800, 2150, 400, 40),

                // --- SECOND ASCENT ---
                GameFactory.ground(35, 5370, 2020, 170, 20),

                // --- BOOST TOWER ---
                GameFactory.booster(36, 5000, 1860, 200, 30, 26),
                GameFactory.ground(37, 5320, 1400, 270, 20),

                // --- THIRD ASCENT ---
                GameFactory.ground(38, 5650, 1300, 100, 20),
                GameFactory.ground(39, 5850, 1220, 80, 20),
                GameFactory.bouncy(40, 6000, 1100, 200, 40),

                // --- FOURTH ASCENT ---
                GameFactory.booster(41, 5690, 920, 140, 20, 21),
                GameFactory.ground(42, 5380, 650, 100, 20),
                GameFactory.ground(43, 5000, 530, 250, 40),

                // --- FINAL STEPS ---
                GameFactory.ground(44, 5380, 350, 160, 20),
                GameFactory.ground(45, 5750, 200, 450, 40),
            ],
            enemies: [
                // Lower-left terrain
                GameFactory.enemy(1, 3, 1, {
                    mainColor: "#F2DCC9",
                    secondaryColor: "#BF3604",
                    health: 5,
                }),
                GameFactory.enemy(2, 5, 1, {
                    mainColor: "#F2DCC9",
                    secondaryColor: "#BF3604",
                    health: 5,
                }),
                // Pyramid
                GameFactory.enemy(3, 17, 4, {
                    mainColor: "#F2DCC9",
                    secondaryColor: "#65BFA6",
                    health: 10,
                }),
                // Clouds
                GameFactory.enemy(4, 22, 2, {
                    mainColor: "#8694A6",
                    secondaryColor: "#222C40",
                    health: 15,
                }),
                // Right side base
                GameFactory.enemy(5, 30, 2, {
                    mainColor: "#F2DCC9",
                    secondaryColor: "#BF3604",
                    health: 5,
                }),
                // First ascent
                GameFactory.enemy(6, 34, 4, {
                    mainColor: "#F2DCC9",
                    secondaryColor: "#65BFA6",
                    health: 10,
                }),
                // Boost tower
                GameFactory.enemy(7, 37, 1.5, {
                    mainColor: "#F2DCC9",
                    secondaryColor: "#4A678C",
                }),
                // Final goal
                GameFactory.enemy(8, 45, 2, {
                    mainColor: "#8694A6",
                    secondaryColor: "#222C40",
                    health: 15,
                }),
            ],
            collectibles: [
                // --- LOWER-LEFT TERRAIN (C1–C10) ---
                GameFactory.collectible(1, 537, 2300),
                ...GameFactory.rowOfCollectibles(
                    2,
                    3,
                    962,
                    2225,
                    collectiblesGap,
                ),
                ...GameFactory.rowOfCollectibles(
                    5,
                    6,
                    1875,
                    2125,
                    collectiblesGap,
                ),

                // --- TREASURY (C11–C46) ---
                ...GameFactory.rowOfCollectibles(
                    11,
                    12,
                    1200,
                    250,
                    collectiblesGap,
                ),
                ...GameFactory.rowOfCollectibles(
                    23,
                    12,
                    1200,
                    300,
                    collectiblesGap,
                ),
                ...GameFactory.rowOfCollectibles(
                    35,
                    12,
                    1200,
                    350,
                    collectiblesGap,
                ),

                // --- PYRAMID AREA (C47–C65) ---
                ...GameFactory.rowOfCollectibles(47, 5, 3337, 1950, 50),
                ...GameFactory.rowOfCollectibles(52, 5, 3337, 2000, 50),
                ...GameFactory.rowOfCollectibles(57, 5, 3337, 2050, 50),
                GameFactory.collectible(62, 3737, 1982),
                ...GameFactory.rowOfCollectibles(
                    63,
                    3,
                    3900,
                    2265,
                    collectiblesGap,
                ),

                // --- CLOUD AREA (C66–C72) ---
                ...GameFactory.rowOfCollectibles(
                    66,
                    5,
                    4200,
                    800,
                    collectiblesGap,
                ),
                ...GameFactory.rowOfCollectibles(
                    71,
                    2,
                    6050,
                    1000,
                    collectiblesGap,
                ),

                // --- RIGHT SIDE / FIRST ASCENT (C73–C91) ---
                ...GameFactory.rowOfCollectibles(
                    73,
                    5,
                    5850,
                    2380,
                    collectiblesGap,
                ),
                ...GameFactory.rowOfCollectibles(
                    78,
                    10,
                    5550,
                    2500,
                    collectiblesGap,
                ),
                ...GameFactory.rowOfCollectibles(
                    88,
                    2,
                    6000,
                    2100,
                    collectiblesGap,
                ),
                GameFactory.collectible(90, 5438, 2220),
                GameFactory.collectible(91, 5650, 2150),

                // --- FINAL GOAL AREA (C92–C127) ---
                ...GameFactory.rowOfCollectibles(92, 12, 5775, 120, 35),
                ...GameFactory.rowOfCollectibles(104, 12, 5775, 85, 35),
                ...GameFactory.rowOfCollectibles(116, 12, 5775, 50, 35),
            ],
        };
    },
};
