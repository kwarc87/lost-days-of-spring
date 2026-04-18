import { GameFactory } from "../factories/GameFactory.js";

export const LEVELS = {
    1: () => {
        return {
            worldSize: {
                width: GameFactory.GRID * 150,
                height: GameFactory.GRID * 112,
            },
            playerStart: {
                x: GameFactory.GRID * 2,
                y: GameFactory.GRID * 80,
            },
            platforms: [
                // GROUND
                GameFactory.grid.solid(1, 0, 110, 150, 4),
                // CEIL
                GameFactory.grid.solid(2, 0, -2, 150, 6),

                // X: 0–20
                GameFactory.grid.booster(3, 0, 60, 3, 1, 29),

                GameFactory.grid.solid(4, 1, 21, 2, 20),
                GameFactory.grid.booster(5, 3, 47, 4, 1, 38),
                GameFactory.grid.solid(6, 6, 17, 2, 1, "boardRight"),
                GameFactory.grid.solid(7, 8, 12, 2, 15),
                GameFactory.grid.solid(8, 9, 107.5, 5, 1, "board"),
                GameFactory.grid.solid(9, 10, 13, 2, 1, "boardLeft"),
                GameFactory.grid.solid(10, 11, 47, 6, 1, "board"),
                GameFactory.grid.solid(11, 17, 104, 12, 1, "board"),
                GameFactory.grid.solid(12, 18, 11, 40, 6),
                GameFactory.grid.solid(13, 18, 52, 2, 1, "board"),
                GameFactory.grid.solid(14, 18, 66, 4, 1, "board"),

                // X: 21–60
                GameFactory.grid.solid(15, 23, 61, 2, 1, "board"),
                GameFactory.grid.solid(16, 25, 10, 2, 2, "metal"),
                GameFactory.grid.solid(17, 25, 56, 2, 1, "board"),
                GameFactory.grid.solid(18, 26, 70, 5, 1, "board"),
                GameFactory.grid.solid(19, 31, 102, 2, 1, "board"),
                GameFactory.grid.solid(20, 36, 98, 14, 6),
                GameFactory.grid.solid(21, 37, 72, 6, 4),
                GameFactory.grid.solid(22, 45, 9, 2, 2, "metal"),
                GameFactory.grid.solid(23, 48, 74, 14, 1, "board"),
                GameFactory.grid.solid(24, 48, 78, 14, 2),
                GameFactory.grid.solid(25, 50, 102, 2, 1, "boardLeft"),
                GameFactory.grid.solid(26, 54, 95, 8, 3),
                GameFactory.grid.booster(27, 55, 109, 6, 1),
                GameFactory.grid.solid(28, 58, 12, 4, 1, "boardLeft"),

                // X: 61–100
                GameFactory.grid.solid(29, 63, 14, 4, 1, "board"),
                GameFactory.grid.solid(30, 63, 91, 2, 1, "board"),
                GameFactory.grid.solid(31, 66, 105, 6, 9),
                GameFactory.grid.booster(32, 67, 87, 8, 1, 30),
                GameFactory.grid.solid(33, 67, 96, 4, 1, "board"),
                GameFactory.grid.solid(34, 68, 16, 4, 1, "board"),
                GameFactory.grid.solid(35, 72, 23, 2, 1, "boardRight"),
                GameFactory.grid.solid(36, 74, 18, 2, 30),
                GameFactory.grid.solid(37, 74, 70, 10, 4),
                GameFactory.grid.solid(38, 74, 101, 2, 1, "board"),
                GameFactory.grid.booster(39, 76, 52, 5, 1, 44),
                GameFactory.grid.solid(40, 79, 99, 12, 1, "board"),
                GameFactory.grid.solid(41, 81, 18, 2, 30),
                GameFactory.grid.solid(42, 83, 24, 3, 1, "boardMid"),
                GameFactory.grid.solid(43, 86, 20, 30, 1, "board"),
                GameFactory.grid.solid(44, 86, 21, 30, 5),
                GameFactory.grid.solid(45, 90, 74, 6, 1, "board"),
                GameFactory.grid.solid(46, 93, 108, 6, 2, "metal"),

                // X: 101–150
                GameFactory.grid.booster(47, 101, 77, 5, 1, 42),
                GameFactory.grid.solid(48, 101, 78, 5, 20),
                GameFactory.grid.solid(49, 106, 45, 9, 1, "board"),
                GameFactory.grid.solid(50, 110, 106.5, 30, 2),
                GameFactory.grid.booster(51, 114, 83, 3, 1, 30),
                GameFactory.grid.solid(52, 116, 24, 2, 1, "boardLeft"),
                GameFactory.grid.booster(53, 118, 43, 8, 1, 32),
                GameFactory.grid.solid(54, 120, 68, 10, 2),
                GameFactory.grid.solid(55, 121, 86, 5, 1, "board"),
                GameFactory.grid.solid(56, 122, 18, 18, 1, "boardRight"),
                GameFactory.grid.solid(57, 128, 47, 2, 1, "board"),
                GameFactory.grid.solid(58, 130, 51, 5, 1, "board"),
                GameFactory.grid.solid(59, 130, 90, 12, 1, "board"),
                GameFactory.grid.solid(60, 134, 65, 2, 1, "board"),
                GameFactory.grid.solid(61, 140, 14, 10, 1, "board"),
                GameFactory.grid.solid(62, 140, 15, 10, 5),
                GameFactory.grid.solid(63, 140, 53, 3, 1, "board"),
                GameFactory.grid.solid(64, 140, 62, 3, 1, "board"),
                GameFactory.grid.booster(65, 144, 107, 4, 2, 32),
                GameFactory.grid.solid(66, 146, 58, 10, 2),
            ],
            enemies: [
                // X: 0–20
                GameFactory.enemy(1, 11, 1.5, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#710952",
                    health: 5,
                }),
                GameFactory.enemy(2, 20, 1.5, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#710952",
                    health: 5,
                }),
                GameFactory.enemy(3, 31, 1.5, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#710952",
                    health: 5,
                }),
                GameFactory.enemy(4, 40, 2, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3b1158",
                    health: 15,
                }),
                GameFactory.enemy(5, 14, 3, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3d83b3",
                    health: 20,
                }),
                GameFactory.enemy(6, 10, 2, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3b1158",
                    health: 15,
                }),
                GameFactory.enemy(7, 46, 1.5, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#710952",
                    health: 5,
                }),
                GameFactory.enemy(8, 50, 2, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3b1158",
                    health: 15,
                }),
                GameFactory.enemy(9, 59, 3, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3d83b3",
                    health: 20,
                }),
                GameFactory.enemy(10, 37, 2, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3b1158",
                    health: 15,
                }),
                GameFactory.enemy(11, 24, 2, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3b1158",
                    health: 15,
                }),
                GameFactory.enemy(12, 29, 2, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3b1158",
                    health: 15,
                }),
                GameFactory.enemy(13, 43, 3, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3d83b3",
                    health: 20,
                }),
                GameFactory.enemy(14, 56, 3, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3d83b3",
                    health: 20,
                }),
                GameFactory.enemy(15, 49, 2, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3b1158",
                    health: 15,
                }),
                GameFactory.enemy(16, 61, 4, {
                    mainColor: "#68eef2",
                    secondaryColor: "#3b1158",
                    health: 50,
                }),
            ],
            collectibles: [
                // X: 0–20
                ...GameFactory.grid.columnOfCollectibles(1, 4, 1, 8, 1),
                ...GameFactory.grid.columnOfCollectibles(5, 4, 1, 9, 1),
                ...GameFactory.grid.columnOfCollectibles(9, 20, 4, 22, 1),
                ...GameFactory.grid.rowOfCollectibles(29, 2, 5, 21, 1),
                ...GameFactory.grid.columnOfCollectibles(31, 20, 5, 22, 1),
                ...GameFactory.grid.rowOfCollectibles(51, 2, 6, 20, 1),
                GameFactory.grid.collectible(53, 11, 105.5),
                GameFactory.grid.collectible(54, 18.5, 48),
                ...GameFactory.grid.rowOfCollectibles(55, 8, 19, 102, 1),

                // X: 21–60
                GameFactory.grid.collectible(63, 23.5, 58),
                GameFactory.grid.collectible(64, 24, 8),
                ...GameFactory.grid.rowOfCollectibles(65, 2, 25, 7, 1),
                ...GameFactory.grid.columnOfCollectibles(67, 2, 25, 50, 1),
                ...GameFactory.grid.columnOfCollectibles(69, 2, 26, 50, 1),
                ...GameFactory.grid.rowOfCollectibles(71, 5, 26, 68, 1),
                GameFactory.grid.collectible(76, 27, 8),
                ...GameFactory.grid.rowOfCollectibles(77, 8, 39, 105, 1),
                ...GameFactory.grid.columnOfCollectibles(85, 3, 45, 5, 1),
                ...GameFactory.grid.columnOfCollectibles(88, 3, 46, 5, 1),
                ...GameFactory.grid.rowOfCollectibles(91, 12, 49, 72, 1),
                ...GameFactory.grid.rowOfCollectibles(103, 12, 49, 76, 1),
                ...GameFactory.grid.rowOfCollectibles(115, 6, 55, 92, 1),
                ...GameFactory.grid.rowOfCollectibles(121, 6, 55, 93, 1),
                ...GameFactory.grid.rowOfCollectibles(127, 6, 55, 99, 1),
                ...GameFactory.grid.rowOfCollectibles(133, 6, 55, 100, 1),

                // X: 61–100
                ...GameFactory.grid.rowOfCollectibles(139, 2, 68, 99, 1),
                ...GameFactory.grid.rowOfCollectibles(141, 2, 68, 100, 1),
                ...GameFactory.grid.columnOfCollectibles(143, 2, 72, 21, 1),
                ...GameFactory.grid.columnOfCollectibles(145, 2, 73, 21, 1),
                ...GameFactory.grid.rowOfCollectibles(147, 8, 75, 64, 1),
                ...GameFactory.grid.rowOfCollectibles(155, 8, 75, 65, 1),
                ...GameFactory.grid.columnOfCollectibles(163, 5, 77, 19, 1),
                ...GameFactory.grid.columnOfCollectibles(168, 5, 77, 31, 1),
                ...GameFactory.grid.columnOfCollectibles(173, 8, 78, 77, 1),
                ...GameFactory.grid.columnOfCollectibles(181, 5, 79, 25, 1),
                ...GameFactory.grid.columnOfCollectibles(186, 5, 79, 37, 1),
                ...GameFactory.grid.columnOfCollectibles(191, 8, 79, 77, 1),
                ...GameFactory.grid.rowOfCollectibles(199, 3, 83, 21, 1),
                ...GameFactory.grid.rowOfCollectibles(202, 3, 83, 22, 1),
                ...GameFactory.grid.rowOfCollectibles(205, 3, 83, 23, 1),
                ...GameFactory.grid.rowOfCollectibles(208, 8, 83, 108, 1),
                ...GameFactory.grid.rowOfCollectibles(216, 28, 87, 18, 1),
                ...GameFactory.grid.rowOfCollectibles(244, 6, 90, 71, 1),
                ...GameFactory.grid.rowOfCollectibles(250, 6, 90, 72, 1),
                ...GameFactory.grid.rowOfCollectibles(256, 4, 94, 106, 1),

                // X: 101–150
                ...GameFactory.grid.columnOfCollectibles(260, 24, 103, 50, 1),
                ...GameFactory.grid.rowOfCollectibles(284, 9, 106, 42, 1),
                ...GameFactory.grid.rowOfCollectibles(293, 9, 106, 43, 1),
                ...GameFactory.grid.rowOfCollectibles(302, 26, 112, 108.75, 1),
                ...GameFactory.grid.columnOfCollectibles(328, 8, 115, 64, 1),
                ...GameFactory.grid.rowOfCollectibles(336, 2, 116, 21, 1),
                ...GameFactory.grid.rowOfCollectibles(338, 2, 116, 22, 1),
                ...GameFactory.grid.rowOfCollectibles(340, 5, 121, 83, 1),
                ...GameFactory.grid.rowOfCollectibles(345, 5, 121, 84, 1),
                ...GameFactory.grid.rowOfCollectibles(350, 4, 124, 24, 1),
                ...GameFactory.grid.rowOfCollectibles(354, 4, 124, 25, 1),
                ...GameFactory.grid.rowOfCollectibles(358, 10, 140, 7, 1),
                ...GameFactory.grid.rowOfCollectibles(368, 10, 140, 8, 1),
                ...GameFactory.grid.rowOfCollectibles(378, 10, 140, 9, 1),
                ...GameFactory.grid.rowOfCollectibles(388, 10, 140, 10, 1),
                GameFactory.grid.collectible(398, 141, 59),
                ...GameFactory.grid.rowOfCollectibles(399, 2, 145, 109, 1),
                ...GameFactory.grid.columnOfCollectibles(401, 4, 148, 53, 1),
            ],

            backgroundItems: [
                // X: 0–20
                GameFactory.grid.environment.wallPlant001(2, 40),
                GameFactory.grid.environment.plant003(5, 110),
                GameFactory.grid.environment.plant004(6, 110),
                GameFactory.grid.environment.plant003(10, 110),
                GameFactory.grid.environment.wallPlant001(13, 3),
                GameFactory.grid.environment.flower002(15, 109),

                // X: 21–60
                GameFactory.grid.environment.wallPlant001(33, 3),
                GameFactory.grid.environment.wallPlant001(38, 103),
                GameFactory.grid.environment.plant004(41, 11),
                GameFactory.grid.environment.plant003(42, 11),
                GameFactory.grid.environment.plant004(43, 11),
                GameFactory.grid.environment.plant003(47, 98),

                // X: 61–100
                GameFactory.grid.environment.plant003(63, 110),
                GameFactory.grid.environment.plate001(68, 105),
                GameFactory.grid.environment.plate001(75, 70),
                GameFactory.grid.environment.wallPlant001(77, 73),
                GameFactory.grid.environment.plate001(79, 70),
                GameFactory.grid.environment.plant004(81, 70),
                GameFactory.grid.environment.plant002(91, 110),
                GameFactory.grid.environment.wallPlant001(92, 25),
                GameFactory.grid.environment.wallPlant001(98, 25),
                GameFactory.grid.environment.flower001(100, 108),

                // X: 101–150
                GameFactory.grid.environment.plant004(111, 106.5),
                GameFactory.grid.environment.wallPlant001(113, 25),
                GameFactory.grid.environment.plant001(118, 106.5),
                GameFactory.grid.environment.plant003(133, 110),
                GameFactory.grid.environment.plant002(136, 107),
                GameFactory.grid.environment.wallPlant001(149, 59),
            ],
            foregroundItems: [
                // X: 0–20
                GameFactory.grid.environment.flower001(1, 19),
                GameFactory.grid.environment.plant004(4, 110),
                GameFactory.grid.environment.flower002(8, 12),

                // X: 21–60
                GameFactory.grid.environment.plant002(22, 110),
                GameFactory.grid.environment.plant004(30, 110),
                GameFactory.grid.environment.plant003(33, 110),
                GameFactory.grid.environment.plant001(35, 11),
                GameFactory.grid.environment.flower002(41, 97),
                GameFactory.grid.environment.plant002(43, 110),
                GameFactory.grid.environment.plant003(44, 11),
                GameFactory.grid.environment.plant001(46, 110),
                GameFactory.grid.environment.plant002(47, 11),
                GameFactory.grid.environment.plant004(52, 78),
                GameFactory.grid.environment.flower002(56, 11),
                GameFactory.grid.environment.plant001(58, 78),
                GameFactory.grid.environment.plant001(59, 95),

                // X: 61–100
                GameFactory.grid.environment.plant002(67, 105),
                GameFactory.grid.environment.plant001(78, 110),
                GameFactory.grid.environment.flower002(81, 18),

                // X: 101–150
                GameFactory.grid.environment.plant003(113, 110),
                GameFactory.grid.environment.plant001(147, 58),
            ],
        };
    },
};
