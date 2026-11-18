import { GameFactory } from "../factories/GameFactory.js";

// prettier-ignore
export const LEVEL_003 = {
    worldSize: {
        width: GameFactory.GRID * 520,
        height: GameFactory.GRID * 144,
    },
    playerStart: {
        x: GameFactory.GRID * 22,
        y: GameFactory.GRID * 80,
    },
    platforms: [
        // GROUND
        GameFactory.grid.solid({ id: 1, x: -1, y: 92, w: 22, h: 53 }),
        GameFactory.grid.solid({ id: 2, x: 20, y: 92, w: 20, h: 4, layout: "groundRightTopEdgeCap" }),
        
        GameFactory.grid.solid({ id: 3, x: 32, y: 95, w: 8, h: 8, layout: "groundBottomRightEdgeCap" }),
        GameFactory.grid.solid({ id: 4, x: 44, y: 92, w: 22, h: 53 }),
        GameFactory.grid.solid({ id: 5, x: 20, y: 106, w: 25, h: 40, layout: "groundHorizontalConnectorBothClean" }),

        GameFactory.grid.solid({ id: 6, x: 39, y: 101, w: 2, h: 2, layout: "groundRightBottomEdgeCap" }),
        GameFactory.grid.solid({ id: 7, x: 43, y: 96, w: 2, h: 2, layout: "groundLeftBottomEdgeCap" }),
    ],
    hiddenWalls: [
        GameFactory.grid.cracks({ id: 2001, x: 39, y: 92, w: 6, h: 15, layout: "cracksOnlyTop", group: "secretA" }),
        GameFactory.grid.cracks({ id: 2002, x: 20, y: 95, w: 19, h: 15, layout: "cracksSimple", group: "secretA" }),
    ],
};
