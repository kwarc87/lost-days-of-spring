import { GameFactory } from "../factories/GameFactory.js";
import { MESSAGES } from "../messages.js";

// prettier-ignore
export const LEVEL_003 = {
    worldSize: {
        width: GameFactory.GRID * 520,
        height: GameFactory.GRID * 144,
    },
    playerStart: {
        x: GameFactory.GRID * 2,
        y: GameFactory.GRID * 121.75,
    },
    platforms: [
        //boxes (fountain)
        GameFactory.grid.solid({ id: 15, x: 28, y: 140, w: 4, h: 2, layout: "metal" }),
        GameFactory.grid.solid({ id: 17, x: 28.25, y: 138, w: 2, h: 2, layout: "metal" }),
        GameFactory.grid.solid({ id: 18, x: 27.9, y: 136, w: 2, h: 2, layout: "metal" }),
        GameFactory.grid.solid({ id: 19, x: 28.5, y: 134, w: 2, h: 2, layout: "metal" }),
        GameFactory.grid.solid({ id: 20, x: 29, y: 132, w: 2, h: 2, layout: "metal" }),
        GameFactory.grid.solid({ id: 21, x: 30.25, y: 139, w: 1, h: 1, layout: "metalSmall" }),
        GameFactory.grid.solid({ id: 29, x: 30, y: 130, w: 1, h: 2, layout: "metalSmall" }),

        //fountain
        GameFactory.grid.solid({ id: 1, x: -1, y: 124, w: 21, h: 4 }),
        GameFactory.grid.solid({ id: 2, x: -1, y: 104, w: 2, h: 22, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 3, x: 0, y: 115, w: 8, h: 4, layout: "groundRightCap" }),
        GameFactory.grid.solid({ id: 4, x: 0, y: 102, w: 12, h: 5, layout: "groundRightCap" }),
        GameFactory.grid.solid({ id: 5, x: 9, y: 115, w: 2, h: 1, layout: "board" }),

        GameFactory.grid.solid({ id: 10, x: -1, y: 127, w: 5, h: 17, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 11, x: 3, y: 131, w: 9, h: 3, layout: "groundRightCap" }),
        GameFactory.grid.solid({ id: 12, x: 3, y: 142, w: 520, h: 3, layout: "groundRightCap" }),
        GameFactory.grid.solid({ id: 13, x: 21, y: 138, w: 4, h: 5, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 14, x: 15, y: 135, w: 4, h: 8, layout: "groundTopCap" }),

        GameFactory.grid.solid({ id: 25, x: 5, y: 133, w: 4, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 26, x: 16, y: 127, w: 3, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 27, x: 2, y: 118, w: 3, h: 2, layout: "groundBottomCap" }),
        
        // pool rock
        GameFactory.grid.solid({ id: 6, x: 30, y: 126, w: 12, h: 4 }),
        GameFactory.grid.solid({ id: 7, x: 30, y: 124, w: 2, h: 3, layout: "groundTopLeftEdgeCap" }),
        GameFactory.grid.solid({ id: 8, x: 41, y: 126, w: 8, h: 2, layout: "groundRightTopEdgeCap" }),
        GameFactory.grid.solid({ id: 9, x: 44, y: 124, w: 5, h: 3, layout: "groundTopRightEdgeCap" }),
        GameFactory.grid.solid({ id: 22, x: 31, y: 129, w: 9, h: 4, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 23, x: 40, y: 133, w: 3, h: 10, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 24, x: 39, y: 137, w: 2, h: 4, layout: "groundLeftCap" }),

        //after the fountain
        GameFactory.grid.solid({ id: 28, x: 45, y: 133, w: 41, h: 6 }),
        GameFactory.grid.solid({ id: 30, x: 52, y: 124, w: 20, h: 5 }),
        GameFactory.grid.solid({ id: 31, x: 90, y: 133, w: 20, h: 10, layout: "groundTopCap" }),
        GameFactory.grid.oneDirection({ id: 32, x: 86, y: 133, w: 4, h: 1 }),
        GameFactory.grid.oneDirection({ id: 33, x: 86, y: 138, w: 4, h: 1 }),
        GameFactory.grid.solid({ id: 34, x: 76, y: 129, w: 6, h: 5, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 35, x: 76, y: 116, w: 50, h: 8 }),

        // inverted L cave
        GameFactory.grid.solid({ id: 36, x: 106, y: 128, w: 4, h: 6, layout: "groundTopRightEdgeCap" }),
        GameFactory.grid.solid({ id: 37, x: 109, y: 128, w: 4, h: 4, layout: "groundRightTopEdgeCap" }),
        GameFactory.grid.solid({ id: 38, x: 104, y: 131, w: 2, h: 2, layout: "metal" }),
        GameFactory.grid.solid({ id: 39, x: 112, y: 133, w: 10, h: 6 }),
        GameFactory.grid.solid({ id: 40, x: 121, y: 133, w: 10, h: 3, layout: "groundRightTopEdgeCap" }),
        GameFactory.grid.solid({ id: 41, x: 125, y: 129, w: 6, h: 5, layout: "groundTopRightEdgeCap" }),
        GameFactory.grid.solid({ id: 43, x: 139, y: 125, w: 10, h: 12 }),
        GameFactory.grid.solid({ id: 44, x: 139, y: 140, w: 10, h: 4, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 45, x: 130, y: 129, w: 10, h: 3, layout: "groundHorizontalConnectorRightClean" }),
        GameFactory.grid.solid({ id: 46, x: 145, y: 136, w: 4, h: 3, layout: "groundBottomRightEdgeCap" }),

        //zig zack upstairs
        GameFactory.grid.solid({ id: 47, x: 153, y: 138, w: 3, h: 1, layout: "board" }),
        GameFactory.grid.solid({ id: 48, x: 150, y: 134, w: 3, h: 1, layout: "board" }),
        GameFactory.grid.solid({ id: 49, x: 153, y: 130, w: 3, h: 1, layout: "board" }),
        GameFactory.grid.solid({ id: 50, x: 150, y: 126, w: 3, h: 1, layout: "board" }),
    ],
    temporaryPlatforms: [
        GameFactory.grid.temporaryPlatform({ id: 3001, x: 15, y: 119, w: 3, h: 1, layout: "board" }),
        GameFactory.grid.temporaryPlatform({ id: 3002, x: 23, y: 131, w: 3, h: 1, layout: "board" }),
        GameFactory.grid.temporaryPlatform({ id: 3003, x: 28, y: 127, w: 2, h: 1, layout: "boardLeftCap" }),
        GameFactory.grid.temporaryPlatform({ id: 3004, x: 13, y: 138, w: 2, h: 1, layout: "boardLeftCap" }),
        GameFactory.grid.temporaryPlatform({ id: 3005, x: 20, y: 126, w: 2, h: 1, layout: "boardRightCap" }),
    ],
    hiddenWalls: [
        GameFactory.grid.cracks({ id: 2001, x: 3, y: 127, w: 9, h: 5, layout: "cracksOnlyRight" }),

        //fountainA
        GameFactory.grid.cracks({ id: 2002, x: 42, y: 133, w: 4, h: 10, layout: "cracksOnlyTop", group: "fountainA" }),
        GameFactory.grid.cracks({ id: 2003, x: 46, y: 138, w: 40, h: 5, layout: "cracksOnlyRightBottomClean", group: "fountainA" }),

        //L shape cave
        GameFactory.grid.cracks({ id: 2004, x: 109, y: 133, w: 4, h: 10, layout: "cracksOnlyTopLeftClean", group: "caveA" }),
        GameFactory.grid.cracks({ id: 2005, x: 113, y: 135, w: 17, h: 8, layout: "cracksSimple", group: "caveA" }),
        GameFactory.grid.cracks({ id: 2006, x: 130, y: 131, w: 10, h: 12, layout: "cracksSimple", group: "caveA" }),
        GameFactory.grid.cracks({ id: 2007, x: 140, y: 136, w: 2, h: 5, layout: "cracksOnlyRightBothClean", group: "caveA" }),
    ],
    pools: [
        GameFactory.grid.pool({ id: 1, x: 32, y: 124, w: 12, h: 2 }),
    ],
    hackPanels: [
        GameFactory.grid.hackPanel({ id: 1, x: 6, y: 139.5, activationDuration: 5000, platformIds: [3001, 3002, 3003, 3004, 3005] }),
    ],
    teleports: [
        GameFactory.grid.teleport({ id: 1, x: 2, y: 111, targetX: 35, targetY: 138 }),
    ],
    cannons: [
        GameFactory.grid.cannon({ id: 1, x: 45, y: 127, targetY: 133 }),
    ],
    collectibles: {
        coins: [
            ...GameFactory.grid.rowOfCollectibles({ startId: 1, count: 8, x: 31, y: 134.5 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 9, count: 8, x: 31, y: 135.5 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 17, count: 4, x: 5, y: 136 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 21, count: 4, x: 5, y: 137 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 25, count: 4, x: 19, y: 138 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 29, count: 4, x: 20, y: 138 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 33, count: 5, x: 6, y: 129 }),
        ],
        splinters: [
            GameFactory.grid.splinters({ id: 1, x: 37, y: 115 }),
            GameFactory.grid.splinters({ id: 2, x: 32.5, y: 138.5 }),
            GameFactory.grid.splinters({ id: 3, x: 13.5, y: 140.5 }),
            GameFactory.grid.splinters({ id: 4, x: 5, y: 129 }),
            GameFactory.grid.splinters({ id: 5, x: 41, y: 131 }),
            GameFactory.grid.splinters({ id: 6, x: 143, y: 138 }),
        ],
        artifacts: [
            GameFactory.grid.artifact({ id: 1, x: 26, y: 139, cordX: 0, cordY: 0, message: MESSAGES.LEVEL_1.ARTIFACTS.CDROM }), //CD
            GameFactory.grid.artifact({ id: 2, x: 87.5, y: 135.5, cordX: 11, cordY: 2, message: MESSAGES.LEVEL_1.ARTIFACTS.EIGHTBALL }), //eight ball
        ]
    },
    backgroundItems:[
        //grass and flowers (fountain)
        GameFactory.grid.environment.grass001({ x: 3, y: 124, repeatX: 3 }),
        GameFactory.grid.environment.grass001({ x: 1, y: 115 }),
        GameFactory.grid.environment.grass001({ x: 4, y: 115, repeatX: 3 }),
        ...GameFactory.grid.environment.grass({ x: 4, y: 131, w: 8 }),
        GameFactory.grid.environment.grass002({ x: 6, y: 142, repeatX: 2 }),
        GameFactory.grid.environment.grass002({ x: 8, y: 124, repeatX: 3 }),
        ...GameFactory.grid.environment.grass({ x: 10, y: 142, w: 5 }),
        GameFactory.grid.environment.plate001({ x: 16, y: 135 }),
        GameFactory.grid.environment.grass001({ x: 19, y: 142, repeatX: 2 }),
        GameFactory.grid.environment.plate001({ x: 22, y: 138 }),
        ...GameFactory.grid.environment.grass({ x: 25, y: 142, w: 3 }),
        ...GameFactory.grid.environment.grass({ x: 32, y: 142, w: 3 }),
        ...GameFactory.grid.environment.grass({ x: 37, y: 142, w: 3 }),

        //electronics (fountain)
        GameFactory.grid.environment.electronics({ x: 0, y: 134, w: 2, h: 2 }),
        GameFactory.grid.environment.electronics({ x: 1, y: 126, w: 2, h: 1 }),
        GameFactory.grid.environment.electronics({ x: 5, y: 140, w: 3, h: 1 }),
        GameFactory.grid.environment.electronics({ x: 8, y: 120, w: 2, h: 2 }),
        GameFactory.grid.environment.electronic002({ x: 12, y: 126 }),
        GameFactory.grid.environment.electronic003({ x: 14, y: 125 }),
        GameFactory.grid.environment.electronics({ x: 15, y: 125, w: 4, h: 2 }),
        GameFactory.grid.environment.electronics({ x: 15, y: 136, w: 2, h: 2 }),
        GameFactory.grid.environment.electronic003({ x: 16, y: 138 }),
        GameFactory.grid.environment.electronics({ x: 17, y: 127, w: 2, h: 1 }),
        GameFactory.grid.environment.electronic003({ x: 16, y: 127 }),
        
        //wall elements (fountain)
        GameFactory.grid.environment.wallInside({ x: 1, y: 129 }),
        GameFactory.grid.environment.wallPipe({ x: 2, y: 121 }),
        GameFactory.grid.environment.wallInside({ x: 2, y: 138, repeatY: 2 }),
        GameFactory.grid.environment.wallInside({ x: 2, y: 118 }),
        GameFactory.grid.environment.wallInside({ x: 6, y: 116 }),
        GameFactory.grid.environment.wallPipe({ x: 22, y: 139 }),
        GameFactory.grid.environment.wallPipe({ x: 32, y: 127 }),
        GameFactory.grid.environment.wallPipe({ x: 35, y: 127 }),
        GameFactory.grid.environment.wallPipe({ x: 38, y: 127 }),
        GameFactory.grid.environment.wallInside({ x: 41, y: 134 }),
        GameFactory.grid.environment.wallInside({ x: 41, y: 137, repeatY: 2 }),
        
    ],
    preBackgroundItems: [
        //wall 001 (fountain)
        GameFactory.grid.environment.wallClean({ x: -1, y: 106, w: 10, h: 20 }),
        GameFactory.grid.environment.wallClean({ x: 9, y: 111, w: 3, h: 14 }),
        GameFactory.grid.environment.wallBrickRight({ x: 9, y: 106 }),
        GameFactory.grid.environment.wallBrickRightSquare({ x: 9, y: 110 }),
        GameFactory.grid.environment.wallBrickRightSquare({ x: 10, y: 111.5 }),
        GameFactory.grid.environment.wallBrickRight({ x: 10, y: 113 }),
        GameFactory.grid.environment.wallBrickRight({ x: 10.5, y: 117 }),
        GameFactory.grid.environment.wallBrickRight({ x: 11.5, y: 121 }),
        GameFactory.grid.environment.wallInside({ x: 11, y: 123 }),
        GameFactory.grid.environment.wallClean({ x: -1, y: 127, w: 12, h: 20 }),
        GameFactory.grid.environment.wallBrickRightSquare({ x: 11, y: 131 }),
        GameFactory.grid.environment.wallBrickRight({ x: 11, y: 127 }),
        GameFactory.grid.environment.wallBrickRight({ x: 11, y: 132.5 }),
        GameFactory.grid.environment.wallBrickRight({ x: 10.5, y: 136.5 }),
        GameFactory.grid.environment.wallBrickRight({ x: 10, y: 140.5 }),
        GameFactory.grid.environment.wallBrickVerticalPattern({ x: 5, y: 111 }),
    ],
    foregroundItems: [
        //flowers and mushrooms (fountain)
        GameFactory.grid.environment.mushroom({ x: 8, y: 123 }),
        GameFactory.grid.environment.plant002({ x: 8, y: 142 }),
        GameFactory.grid.environment.plant008({ x: 10, y: 132 }),
        GameFactory.grid.environment.plant001({ x: 13, y: 124 }),
        GameFactory.grid.environment.plant002({ x: 18, y: 124 }),
        GameFactory.grid.environment.plant008({ x: 15, y: 126 }),
        GameFactory.grid.environment.plant007({ x: 3, y: 118 }),
        GameFactory.grid.environment.plant007({ x: 30, y: 124 }),
        GameFactory.grid.environment.flower002({ x: 13, y: 141 }),
        GameFactory.grid.environment.plant008({ x: 38, y: 131 }),
        GameFactory.grid.environment.plant007({ x: 40, y: 133 }),

        //grass
        GameFactory.grid.environment.grass001({ x: 42, y: 133 }),
        ...GameFactory.grid.environment.grass({ x: 45, y: 133, w: 3 }),

        //wall plants (fountain)
        GameFactory.grid.environment.wallPlant001({ x: 6, y: 134, repeatX: 2 }),
        GameFactory.grid.environment.wallPlant001({ x: 32, y: 132 }),
    ]
    
};
