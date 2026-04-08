import { GameFactory } from "../factories/GameFactory.js";

export const LEVELS = {
    1: () => {
        const groundY = 2527;
        const collectiblesGap = 75;
        return {
            worldSize: { width: 6200, height: 2600, groundY: 2565 },
            playerStart: { x: 50, y: 1800 },
            platforms: [
                // --- GROUND FLOOR ---
                GameFactory.solid(1, 0, groundY, 6200, 73),

                GameFactory.solid(2, 450, 2410, 200, 50),

                // --- LOWER-LEFT TERRAIN ---
                GameFactory.solid(3, 800, 2250, 500, 50),
                GameFactory.solid(4, 1400, 2175, 100, 50),
                GameFactory.solid(5, 1650, 2075, 800, 75),
                GameFactory.solid(46, 1750, 2450, 50, 77),
                GameFactory.solid(47, 1850, 2450, 50, 77),

                // --- PYRAMID (stairs IDs 6-11) ---
                ...GameFactory.stairs(6, 2600, 2050, 100, 50, 6),
                GameFactory.solid(12, 3200, 1800, 100, 300),
                GameFactory.solid(13, 3300, 1800, 300, 100),
                GameFactory.solid(14, 3600, 1800, 100, 300),
                GameFactory.bouncy(15, 3700, 2050, 400, 50),
                GameFactory.solid(16, 3700, 1960, 100, 30),
                GameFactory.solid(17, 3850, 2350, 250, 180),
                GameFactory.solid(18, 4250, 2200, 150, 25),
                GameFactory.booster(19, 3900, 1730, 300, 25, 30),
                GameFactory.booster(20, 3350, 2497, 200, 30, 22),

                // --- TREASURY ---
                GameFactory.solid(21, 1200, 550, 850, 150),

                // --- CLOUDS ---
                GameFactory.solid(22, 2300, 550, 300, 25),
                GameFactory.solid(23, 2850, 575, 50, 25),
                GameFactory.solid(24, 3000, 800, 50, 25),
                GameFactory.solid(25, 2850, 1000, 50, 25),
                GameFactory.solid(26, 2950, 1150, 100, 25),
                GameFactory.solid(27, 3250, 1250, 450, 25),
                GameFactory.bouncy(28, 4150, 900, 400, 150),

                // --- RIGHT SIDE BASE ---
                GameFactory.solid(29, 4550, 2000, 300, 25),
                GameFactory.bouncy(30, 5400, 2410, 800, 60),

                // --- FIRST ASCENT ---
                GameFactory.solid(33, 5600, 2250, 115, 20),
                GameFactory.solid(34, 5800, 2150, 400, 40),

                // --- SECOND ASCENT ---
                GameFactory.solid(35, 5370, 2020, 170, 20),

                // --- BOOST TOWER ---
                GameFactory.booster(36, 5000, 1860, 200, 30, 26),
                GameFactory.solid(37, 5320, 1400, 270, 20),

                // --- THIRD ASCENT ---
                GameFactory.solid(38, 5680, 1360, 100, 20),
                GameFactory.solid(39, 5880, 1270, 80, 20),
                GameFactory.bouncy(40, 6000, 1100, 200, 40),

                // --- FOURTH ASCENT ---
                GameFactory.booster(41, 5620, 980, 210, 20, 22),
                GameFactory.solid(42, 5250, 720, 150, 20),
                GameFactory.solid(43, 5430, 350, 200, 20),
                GameFactory.solid(44, 4900, 500, 300, 40),

                // --- FINAL STEPS ---
                GameFactory.solid(45, 5750, 350, 450, 40),
                GameFactory.solid(46, 4250, 300, 450, 250),
            ],
            enemies: [
                //Lower-left terrain
                GameFactory.enemy(1, 3, 1, {
                    mainColor: "#F2DCC9",
                    secondaryColor: "#BF3604",
                    health: 5,
                }),
                GameFactory.enemy(2, 5, 2, {
                    mainColor: "#F2DCC9",
                    secondaryColor: "#34E3AE",
                    health: 10,
                }),
                // Pyramid
                GameFactory.enemy(3, 17, 2, {
                    mainColor: "#F2DCC9",
                    secondaryColor: "#34E3AE",
                    health: 10,
                }),
                GameFactory.enemy(9, 29, 2, {
                    mainColor: "#F2DCC9",
                    secondaryColor: "#34E3AE",
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
                // --- LOWER-LEFT TERRAIN (C1 - C10) ---
                GameFactory.collectible(1, 537, 2325),
                ...GameFactory.rowOfCollectibles(
                    2,
                    3,
                    962,
                    2175,
                    collectiblesGap,
                ),
                ...GameFactory.rowOfCollectibles(
                    5,
                    6,
                    1875,
                    2000,
                    collectiblesGap,
                ),

                // --- TREASURY (C11 - C46) ---
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

                // --- PYRAMID AREA (C47 - C65) ---
                ...GameFactory.rowOfCollectibles(47, 5, 3337, 1950, 50),
                ...GameFactory.rowOfCollectibles(52, 5, 3337, 2000, 50),
                ...GameFactory.rowOfCollectibles(57, 5, 3337, 2050, 50),
                GameFactory.collectible(62, 3737, 2002),
                ...GameFactory.rowOfCollectibles(
                    63,
                    3,
                    3900,
                    2265,
                    collectiblesGap,
                ),

                // --- CLOUD AREA (C66 - C72) ---
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

                // --- RIGHT SIDE / FIRST ASCENT (C73 - C90) ---
                ...GameFactory.rowOfCollectibles(
                    73,
                    5,
                    5850,
                    2360,
                    collectiblesGap,
                ),
                ...GameFactory.rowOfCollectibles(
                    78,
                    9,
                    5550,
                    2480,
                    collectiblesGap,
                ),
                ...GameFactory.rowOfCollectibles(
                    87,
                    2,
                    6000,
                    2100,
                    collectiblesGap,
                ),
                GameFactory.collectible(89, 5438, 2220),
                GameFactory.collectible(90, 5650, 2150),

                // --- FINAL GOAL AREA (C91 - C126) ---
                ...GameFactory.rowOfCollectibles(91, 12, 5775, 50, 35),
                ...GameFactory.rowOfCollectibles(103, 12, 5775, 100, 35),
                ...GameFactory.rowOfCollectibles(115, 12, 5775, 150, 35),
                ...GameFactory.rowOfCollectibles(136, 12, 5775, 200, 35),

                // --- CUSTOM (C127 - C135) ---
                ...GameFactory.rowOfCollectibles(127, 5, 2750, 2450, 50),
                ...GameFactory.rowOfCollectibles(132, 4, 3400, 1700, 50),
                ...GameFactory.rowOfCollectibles(
                    148,
                    3,
                    4625,
                    1700,
                    collectiblesGap,
                ),
                ...GameFactory.rowOfCollectibles(151, 5, 4350, 150, 50),
                ...GameFactory.rowOfCollectibles(156, 5, 4350, 100, 50),
                GameFactory.collectible(161, 3737, 1912),
                ...GameFactory.rowOfCollectibles(162, 8, 3275, 1150, 50),
                ...GameFactory.rowOfCollectibles(169, 6, 5825, 450, 50),
                ...GameFactory.rowOfCollectibles(176, 5, 4200, 700, 75),
                GameFactory.collectible(181, 1810, 2475),
                ...GameFactory.rowOfCollectibles(182, 9, 4550, 2450, 75),
                ...GameFactory.columnOfCollectibles(191, 5, 4350, 1150, 75),
                ...GameFactory.columnOfCollectibles(195, 5, 5075, 1175, 75),
            ],
        };
    },
};
