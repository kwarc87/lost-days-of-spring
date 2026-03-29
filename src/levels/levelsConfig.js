import { GameFactory } from "../factories/GameFactory.js";

export const LEVELS = {
    1: () => ({
        worldSize: { width: 2000, height: 600 },
        playerStart: { x: 320, y: 60 },
        platforms: [
            GameFactory.ground(2, 0, 480, 600, 80),
            GameFactory.ground(3, 800, 480, 300, 80),
            GameFactory.ground(4, 1180, 480, 300, 80),
            GameFactory.bouncy(6, 180, 320, 80, 25, 0.5),
            GameFactory.bouncy(7, 880, 190, 60, 25, 0.5),
            GameFactory.booster(8, 670, 420, 160, 25, 11),
            GameFactory.ground(10, 90, 425, 130, 25),
            GameFactory.bouncy(11, 410, 290, 110, 25, 0.9),
            GameFactory.bouncy(12, 1130, 250, 210, 25, 0.9),
        ],
        enemies: [GameFactory.enemy(10, 1.5)],
    }),
};
