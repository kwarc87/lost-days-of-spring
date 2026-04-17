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
                // --- GROUND FLOOR ---
                GameFactory.grid.solid(1, 0, 110, 150, 4),

                GameFactory.grid.solid(2, 9, 107.5, 5, 1, "board"),
                GameFactory.grid.solid(3, 17, 104, 12, 1, "board"),
                GameFactory.grid.solid(4, 31, 102, 2, 1, "board"),
                GameFactory.grid.solid(5, 36, 98, 14, 6),
                GameFactory.grid.solid(6, 54, 95, 8, 3),

                GameFactory.grid.booster(7, 55, 109, 6, 1),

                GameFactory.grid.solid(8, 66, 105, 6, 9),
                GameFactory.grid.solid(9, 74, 101, 2, 1, "board"),
                GameFactory.grid.solid(10, 67, 96, 4, 1, "board"),
                GameFactory.grid.solid(11, 79, 99, 12, 1, "board"),
                GameFactory.grid.solid(12, 50, 102, 2, 1, "board"),

                GameFactory.grid.solid(13, 93, 108, 6, 2, "metal"),
                GameFactory.grid.solid(14, 110, 106.5, 30, 2),
                GameFactory.grid.solid(15, 63, 91, 2, 1, "board"),

                GameFactory.grid.booster(16, 67, 87, 8, 1, 30),

                GameFactory.grid.solid(17, 74, 70, 10, 4),

                GameFactory.grid.booster(18, 144, 107, 4, 2, 32),

                GameFactory.grid.solid(19, 130, 90, 12, 1, "board"),
                GameFactory.grid.solid(20, 121, 86, 5, 1, "board"),

                GameFactory.grid.booster(21, 114, 83, 3, 1, 30),

                GameFactory.grid.solid(22, 120, 68, 10, 2),
                GameFactory.grid.solid(23, 134, 65, 2, 1, "board"),
                GameFactory.grid.solid(24, 140, 62, 3, 1, "board"),

                GameFactory.grid.solid(25, 146, 58, 10, 2),
            ],
            enemies: [
                GameFactory.enemy(1, 3, 1.5, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#710952",
                    health: 5,
                }),
                GameFactory.enemy(1, 11, 2, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3b1158",
                    health: 15,
                }),
                GameFactory.enemy(1, 14, 3, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3d83b3",
                    health: 20,
                }),
                GameFactory.enemy(1, 19, 2, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3b1158",
                    health: 15,
                }),
                GameFactory.enemy(1, 22, 2, {
                    mainColor: "#fa9bdd",
                    secondaryColor: "#3b1158",
                    health: 15,
                }),
            ],
            collectibles: [
                GameFactory.grid.collectible(1, 11, 105.5),
                ...GameFactory.grid.rowOfCollectibles(2, 8, 19, 102, 1),
                ...GameFactory.grid.rowOfCollectibles(10, 6, 55, 99, 1),
                ...GameFactory.grid.rowOfCollectibles(16, 6, 55, 100, 1),
                ...GameFactory.grid.rowOfCollectibles(22, 2, 68, 99, 1),
                ...GameFactory.grid.rowOfCollectibles(24, 2, 68, 100, 1),
                ...GameFactory.grid.rowOfCollectibles(26, 8, 39, 105, 1),
                ...GameFactory.grid.rowOfCollectibles(34, 26, 112, 108.75, 1),
                ...GameFactory.grid.columnOfCollectibles(60, 8, 78, 77, 1),
                ...GameFactory.grid.columnOfCollectibles(68, 8, 79, 77, 1),
                ...GameFactory.grid.rowOfCollectibles(76, 8, 83, 108, 1),
                ...GameFactory.grid.rowOfCollectibles(84, 4, 94, 106, 1),
                ...GameFactory.grid.rowOfCollectibles(87, 2, 145, 109, 1),
                ...GameFactory.grid.columnOfCollectibles(89, 4, 148, 53, 1),
                ...GameFactory.grid.columnOfCollectibles(93, 8, 115, 64, 1),
            ],

            backgroundItems: [
                GameFactory.grid.environment.plant003(5, 110),
                GameFactory.grid.environment.plant004(6, 110),
                GameFactory.grid.environment.wallPlant001(38, 103),
                GameFactory.grid.environment.plant003(10, 110),
                GameFactory.grid.environment.plate001(68, 105),
                GameFactory.grid.environment.plant003(63, 110),
                GameFactory.grid.environment.plant001(118, 106.5),
            ],
            foregroundItems: [
                GameFactory.grid.environment.plant004(4, 110),
                GameFactory.grid.environment.plant004(30, 110),
                GameFactory.grid.environment.plant003(33, 110),
                GameFactory.grid.environment.plant001(46, 110),
                GameFactory.grid.environment.plant002(22, 110),
                GameFactory.grid.environment.plant002(43, 110),
                GameFactory.grid.environment.plant001(59, 95),
                GameFactory.grid.environment.plant001(78, 110),
                GameFactory.grid.environment.plant002(67, 105),
            ],
        };
    },
};
