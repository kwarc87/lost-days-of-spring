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
        GameFactory.grid.solid({ id: 30, x: 52, y: 124, w: 20, h: 4 }),
        GameFactory.grid.solid({ id: 59, x: 54, y: 127, w: 15, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 60, x: 60, y: 128, w: 7, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 31, x: 90, y: 133, w: 20, h: 10, layout: "groundTopCap" }),
        GameFactory.grid.oneDirection({ id: 32, x: 86, y: 133, w: 4, h: 1 }),
        GameFactory.grid.oneDirection({ id: 33, x: 86, y: 138, w: 4, h: 1 }),
        GameFactory.grid.solid({ id: 34, x: 76, y: 129, w: 6, h: 5, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 61, x: 75, y: 132, w: 1, h: 1, layout: "metalSmall" }),
        GameFactory.grid.solid({ id: 88, x: 54, y: 122, w: 2, h: 2, layout: "metal" }),
        GameFactory.grid.solid({ id: 89, x: 60, y: 123, w: 6, h: 2, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 90, x: 55, y: 121, w: 1, h: 1, layout: "metalSmall" }),
        GameFactory.grid.solid({ id: 91, x: 56, y: 123, w: 1, h: 1, layout: "metalSmall" }),

        // inverted L cave
        GameFactory.grid.solid({ id: 36, x: 106, y: 128, w: 4, h: 6, layout: "groundTopRightEdgeCap" }),
        GameFactory.grid.solid({ id: 37, x: 109, y: 128, w: 4, h: 4, layout: "groundRightTopEdgeCap" }),
        GameFactory.grid.solid({ id: 39, x: 112, y: 133, w: 10, h: 6 }),
        GameFactory.grid.solid({ id: 40, x: 121, y: 133, w: 10, h: 3, layout: "groundRightTopEdgeCap" }),
        GameFactory.grid.solid({ id: 41, x: 125, y: 129, w: 6, h: 5, layout: "groundTopRightEdgeCap" }),
        GameFactory.grid.solid({ id: 43, x: 139, y: 125, w: 10, h: 12 }),
        GameFactory.grid.solid({ id: 44, x: 139, y: 140, w: 10, h: 4, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 45, x: 130, y: 129, w: 10, h: 3, layout: "groundHorizontalConnectorRightClean" }),
        GameFactory.grid.solid({ id: 46, x: 145, y: 136, w: 4, h: 3, layout: "groundBottomRightEdgeCap" }),

        // west side tunnel
        GameFactory.grid.solid({ id: 51, x: -1, y: 0, w: 2, h: 103, layout: "groundTopCap" }),

        // floor 0 - section available for double jump
        GameFactory.grid.solid({ id: 52, x: 6, y: 106, w: 6, h: 3, layout: "groundBottomRightEdgeCap" }),
        GameFactory.grid.oneDirection({ id: 53, x: 12, y: 106, w: 6, h: 1 }),
        GameFactory.grid.solid({ id: 54, x: 6, y: 93, w: 16, h: 5 }),
        GameFactory.grid.solid({ id: 55, x: 18, y: 104, w: 18, h: 5 }),
        GameFactory.grid.solid({ id: 56, x: 39, y: 104, w: 18, h: 5 }),
        GameFactory.grid.solid({ id: 57, x: 21, y: 93, w: 10, h: 3, layout: "groundRightTopEdgeCap" }),
        GameFactory.grid.solid({ id: 58, x: 33, y: 93, w: 13, h: 3 }),
        GameFactory.grid.solid({ id: 62, x: 5, y: 94, w: 2, h: 3, layout: "groundLeftCap" }),
        GameFactory.grid.solid({ id: 63, x: 6, y: 66, w: 12, h: 23 }),
        GameFactory.grid.solid({ id: 64, x: 56, y: 104, w: 430, h: 3, layout: "groundRightTopEdgeCap" }),
        GameFactory.grid.solid({ id: 80, x: 20, y: 108, w: 9, h: 3, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 81, x: 22, y: 110, w: 4, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 82, x: 68, y: 106, w: 7, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 83, x: 40, y: 108, w: 8, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 84, x: 43, y: 109, w: 3, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 85, x: 23, y: 103, w: 6, h: 2, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 86, x: 13, y: 97, w: 5, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 38, x: 48, y: 102, w: 2, h: 2, layout: "metal" }),
        GameFactory.grid.solid({ id: 98, x: 40, y: 95, w: 5, h: 3, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 99, x: 42, y: 97, w: 2, h: 2, layout: "groundBottomCap" }),
        
        // lonely island with coins heart
        GameFactory.grid.solid({ id: 65, x: 57, y: 112, w: 8, h: 1, layout: "board" }),
        GameFactory.grid.solid({ id: 66, x: 57, y: 113, w: 8, h: 3 }),
        GameFactory.grid.solid({ id: 67, x: 58, y: 115, w: 6, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 68, x: 59, y: 116, w: 4, h: 2, layout: "groundBottomCap" }),

        // jaws cave with elevator
        GameFactory.grid.solid({ id: 35, x: 76, y: 116, w: 50, h: 8 }),
        GameFactory.grid.solid({ id: 69, x: 119, y: 106, w: 6, h: 11, layout: "groundVerticalConnectorBothClean" }),
        GameFactory.grid.solid({ id: 70, x: 80, y: 113, w: 6, h: 4, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 71, x: 80, y: 112, w: 3, h: 2, layout: "groundTopLeftEdgeCap" }),
        GameFactory.grid.solid({ id: 72, x: 90, y: 113, w: 2, h: 4, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 73, x: 98, y: 113, w: 2, h: 4, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 74, x: 106, y: 113, w: 2, h: 4, layout: "groundTopCap" }),
        GameFactory.grid.solid({ id: 75, x: 116, y: 112, w: 4, h: 3, layout: "groundLeftCap" }),
        GameFactory.grid.solid({ id: 76, x: 113, y: 113, w: 4, h: 2, layout: "groundLeftBottomEdgeCap" }),
        GameFactory.grid.solid({ id: 77, x: 90, y: 106, w: 2, h: 5, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 78, x: 98, y: 106, w: 2, h: 5, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 79, x: 106, y: 106, w: 2, h: 5, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 87, x: 84, y: 106, w: 3, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 92, x: 74, y: 116, w: 3, h: 3, layout: "groundLeftTopEdgeCap" }),

        // zig zack upstairs
        GameFactory.grid.solid({ id: 47, x: 153, y: 139, w: 3, h: 1, layout: "board" }),
        GameFactory.grid.solid({ id: 48, x: 150, y: 135, w: 3, h: 1, layout: "board" }),
        GameFactory.grid.solid({ id: 49, x: 153, y: 131, w: 3, h: 1, layout: "board" }),
        GameFactory.grid.solid({ id: 50, x: 150, y: 127, w: 3, h: 1, layout: "board" }),

        // pool with cannons
        GameFactory.grid.solid({ id: 93, x: 90, y: 131, w: 2, h: 3, layout: "groundTopLeftEdgeCap" }),
        GameFactory.grid.solid({ id: 94, x: 86, y: 123, w: 8, h: 2, layout: "groundBottomCap" }),
        GameFactory.grid.solid({ id: 95, x: 87, y: 124, w: 7, h: 2, layout: "groundBottomRightEdgeCap" }),
        GameFactory.grid.solid({ id: 96, x: 88, y: 125, w: 6, h: 2, layout: "groundBottomRightEdgeCap" }),
        GameFactory.grid.solid({ id: 97, x: 89, y: 126, w: 5, h: 2, layout: "groundBottomRightEdgeCap" }),
    ],
    hackPanels: [
        GameFactory.grid.hackPanel({ id: 1, x: 6, y: 139.5, activationDuration: 5000, platformIds: [3001, 3002, 3003, 3004, 3005] }),
        GameFactory.grid.hackPanel({ id: 2, x: 7.5, y: 99.5, activationDuration: 7000, platformIds: [3006, 3007, 3008, 3009] }),
        GameFactory.grid.hackPanel({ id: 3, x: 78, y: 126.5, activationDuration: 9000, platformIds: [3010] }),

        GameFactory.grid.hackPanel({ id: 4, x: 34, y: 101.5, activationDuration: 5000, mode: "deactivate", platformIds: [3011] }),
    ],
    temporaryPlatforms: [
        GameFactory.grid.temporaryPlatform({ id: 3001, x: 15, y: 119, w: 3, h: 1 }),
        GameFactory.grid.temporaryPlatform({ id: 3002, x: 23, y: 131, w: 3, h: 1 }),
        GameFactory.grid.temporaryPlatform({ id: 3003, x: 28, y: 127, w: 2, h: 1, layout: "boardTemporaryLeftCap" }),
        GameFactory.grid.temporaryPlatform({ id: 3004, x: 13, y: 138, w: 2, h: 1, layout: "boardTemporaryLeftCap" }),
        GameFactory.grid.temporaryPlatform({ id: 3005, x: 20, y: 126, w: 2, h: 1, layout: "boardTemporaryRightCap" }),

        // one-direction platforms west side
        GameFactory.grid.temporaryPlatform({ id: 3006, x: 1, y: 96, w: 4, h: 1, type: "oneDirection", layout: "boardTemporaryOneDirection" }),
        GameFactory.grid.temporaryPlatform({ id: 3007, x: 1, y: 85, w: 5, h: 1, type: "oneDirection", layout: "boardTemporaryOneDirection" }),
        GameFactory.grid.temporaryPlatform({ id: 3008, x: 1, y: 76, w: 5, h: 1, type: "oneDirection", layout: "boardTemporaryOneDirection" }),
        GameFactory.grid.temporaryPlatform({ id: 3009, x: 1, y: 68, w: 5, h: 1, type: "oneDirection", layout: "boardTemporaryOneDirection" }),

        // pool with cannons
        GameFactory.grid.temporaryPlatform({ id: 3010, x: 104, y: 130, w: 2, h: 1, layout: "boardTemporaryLeftCap" }),

        // temporary spring wall
        GameFactory.grid.temporaryPlatform({ id: 3011, x: 43, y: 99, w: 1, h: 5, active: true, layout: "temporarySpringWall",  }),

    ],
    hiddenWalls: [
        GameFactory.grid.cracks({ id: 2001, x: 3, y: 127, w: 9, h: 5, layout: "cracksOnlyRightTopClean" }),

        //fountain
        GameFactory.grid.cracks({ id: 2002, x: 42, y: 133, w: 4, h: 10, layout: "cracksOnlyTop", group: "fountainA" }),
        GameFactory.grid.cracks({ id: 2003, x: 46, y: 138, w: 40, h: 5, layout: "cracksOnlyRightBottomClean", group: "fountainA" }),

        //L shape cave
        GameFactory.grid.cracks({ id: 2004, x: 109, y: 133, w: 4, h: 10, layout: "cracksOnlyTopLeftClean", group: "caveA" }),
        GameFactory.grid.cracks({ id: 2005, x: 113, y: 135, w: 17, h: 8, layout: "cracksSimple", group: "caveA" }),
        GameFactory.grid.cracks({ id: 2006, x: 130, y: 131, w: 10, h: 12, layout: "cracksSimple", group: "caveA" }),
        GameFactory.grid.cracks({ id: 2007, x: 140, y: 136, w: 2, h: 5, layout: "cracksOnlyRightBothClean", group: "caveA" }),

        // jaws cave with elevator
        GameFactory.grid.cracks({ id: 2008, x: 99, y: 106, w: 8, h: 5, layout: "cracksOnlyBottom" }),
        GameFactory.grid.cracks({ id: 2009, x: 91, y: 113, w: 8, h: 5, layout: "cracksOnlyTop" }),
        GameFactory.grid.cracks({ id: 2010, x: 113, y: 114, w: 7, h: 3, layout: "cracksOnlyLeftBottomClean" }),
    ],
    pools: [
        GameFactory.grid.pool({ id: 1, x: 32, y: 124, w: 12, h: 2 }),
        GameFactory.grid.pool({ id: 2, x: 92, y: 131, w: 15, h: 2 }),

        GameFactory.grid.pool({ id: 3, x: 148, y: 140, w: 160, h: 2 }),
    ],
    teleports: [
        GameFactory.grid.teleport({ id: 1, x: 2, y: 111, targetX: 35, targetY: 138 }),
    ],
    elevators: [
        GameFactory.grid.elevator({ id: 1001, startX: 83, startY: 112, w: 3, h: 1, targetX: 113, targetY: 112, speed: 6, waitTime: 1500 }),
    ],
    enemies: [
        GameFactory.grid.sludge({ id: 1, startX: 44, targetX: 49, startY: 122, targetY: 122, speed: 1, health: 25, mainColor: "#373835", secondaryColor: "#373835" }),
        GameFactory.grid.sludge({ id: 2, startX: 76, targetX: 82, startY: 127, targetY: 127, speed: 1, health: 25, mainColor: "#373835", secondaryColor: "#373835" }),
        GameFactory.grid.evilEye({ id: 3, startX: 16.5, targetX: 16.5, startY: 129, targetY: 135, speed: 2, health: 25, mainColor: "#000", secondaryColor: "#000" }),
        GameFactory.grid.sludge({ id: 4, startX: 60, targetX: 66, startY: 121, targetY: 121, speed: 1.25, health: 50, mainColor: "#fa9bdd", secondaryColor: "#fa9bdd" }),
        GameFactory.grid.evilEye({ id: 5, startX: 69, targetX: 73, startY: 128, targetY: 133, speed: 2, health: 25, mainColor: "#000", secondaryColor: "#000" }),
    ],
    cannons: [
        GameFactory.grid.cannon({ id: 1, x: 45, y: 127, targetY: 133 }),

        // pool with cannons
        GameFactory.grid.cannon({ id: 2, x: 94, y: 123, targetY: 132, shootFrequency: 1500 }),
        GameFactory.grid.cannon({ id: 3, x: 97, y: 123, targetY: 132, shootFrequency: 1500, delay: 150 }),
        GameFactory.grid.cannon({ id: 4, x: 100, y: 123, targetY: 132, shootFrequency: 1500, delay: 300 }),
        GameFactory.grid.cannon({ id: 5, x: 103, y: 123, targetY: 132, shootFrequency: 1500, delay: 450 }),
    ],
    spikes: [
    ...GameFactory.grid.rowOfSpikes({ startId: 1, count: 4, x: 86, y: 115 }),
    ...GameFactory.grid.rowOfSpikes({ startId: 5, count: 2, x: 90, y: 112 }),
    ...GameFactory.grid.rowOfSpikes({ startId: 7, count: 2, x: 98, y: 112 }),
    ...GameFactory.grid.rowOfSpikes({ startId: 9, count: 2, x: 106, y: 112 }),
    ...GameFactory.grid.rowOfSpikes({ startId: 11, count: 2, x: 108, y: 115 }),
    ],
    collectibles: {
        coins: [
            ...GameFactory.grid.rowOfCollectibles({ startId: 1, count: 8, x: 31, y: 134.5 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 9, count: 8, x: 31, y: 135.5 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 17, count: 4, x: 13, y: 103 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 21, count: 4, x: 13, y: 104 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 25, count: 4, x: 19, y: 138 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 29, count: 4, x: 20, y: 138 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 33, count: 5, x: 6, y: 129 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 38, count: 2, x: 57, y: 110 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 40, count: 3, x: 58, y: 109 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 43, count: 3, x: 59, y: 109 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 46, count: 2, x: 60, y: 110 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 48, count: 2, x: 61, y: 110 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 50, count: 3, x: 62, y: 109 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 53, count: 3, x: 63, y: 109 }),
            ...GameFactory.grid.columnOfCollectibles({ startId: 56, count: 2, x: 64, y: 110 }),

            // jaws cave with elevator
            ...GameFactory.grid.rowOfCollectibles({ startId: 58, count: 6, x: 92, y: 107 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 64, count: 6, x: 92, y: 108 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 70, count: 6, x: 92, y: 109 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 76, count: 6, x: 92, y: 110 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 82, count: 4, x: 114, y: 115 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 86, count: 6, x: 92, y: 113 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 92, count: 6, x: 92, y: 114 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 98, count: 6, x: 92, y: 115 }),

            //underground 001
            ...GameFactory.grid.rowOfCollectibles({ startId: 104, count: 35, x: 50, y: 140 }),
            ...GameFactory.grid.rowOfCollectibles({ startId: 139, count: 7, x: 60, y: 131 }),
        ],
        splinters: [
            GameFactory.grid.splinters({ id: 1, x: 37, y: 115 }),
            GameFactory.grid.splinters({ id: 2, x: 32.5, y: 138.5 }),
            GameFactory.grid.splinters({ id: 3, x: 13.5, y: 140.5 }),
            GameFactory.grid.splinters({ id: 4, x: 5, y: 129 }),
            GameFactory.grid.splinters({ id: 5, x: 41, y: 131 }),
            GameFactory.grid.splinters({ id: 6, x: 143, y: 138 }),
            GameFactory.grid.splinters({ id: 7, x: 50, y: 110 }),
            GameFactory.grid.splinters({ id: 8, x: 118, y: 115 }),
            GameFactory.grid.splinters({ id: 9, x: 102.5, y: 108 }),
            GameFactory.grid.splinters({ id: 10, x: 87.5, y: 140, }),
        ],
        heartContainers: [
            GameFactory.grid.heartContainers({ id: 1, x: 60.5, y: 108.5 }),
        ],
        artifacts: [
            GameFactory.grid.artifact({ id: 1, x: 26, y: 139, cordX: 0, cordY: 0, message: MESSAGES.LEVEL_1.ARTIFACTS.CDROM }), //CD
            GameFactory.grid.artifact({ id: 2, x: 87.5, y: 135.5, cordX: 11, cordY: 2, message: MESSAGES.LEVEL_1.ARTIFACTS.EIGHTBALL }), //eight ball
            GameFactory.grid.artifact({ id: 3, x: 40, y: 101, cordX: 15, cordY: 6, message: MESSAGES.LEVEL_1.ARTIFACTS.DICE001 }), //dice
            GameFactory.grid.artifact({ id: 4, x: 154, y: 137, cordX: 5, cordY: 5, message: MESSAGES.LEVEL_1.ARTIFACTS.PENDRIVE }), //pendrive
            GameFactory.grid.artifact({ id: 5, x: 102.5, y: 114, cordX: 4, cordY: 6, message: MESSAGES.LEVEL_1.ARTIFACTS.CASH }), //cash
            GameFactory.grid.artifact({ id: 6, x: 117, y: 108, cordX: 15, cordY: 9, message: MESSAGES.LEVEL_1.ARTIFACTS.FLOWER }), //flower
        ]
    },
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

        //wall 002 (fountain)
        GameFactory.grid.environment.wallSharpHole({ x: 39, y: 97 }),
        GameFactory.grid.environment.wallSharpHole({ x: 36.5, y: 105 }),
        GameFactory.grid.environment.wallSharpHole({ x: 34, y: 119 }),
        GameFactory.grid.environment.wallSharpHole({ x: 40, y: 115 }),
        GameFactory.grid.environment.wallSharpHole({ x: 45, y: 129 }),
        GameFactory.grid.environment.wallSharpHole({ x: 32, y: 134 }),
        GameFactory.grid.environment.wallSharpHole({ x: 37, y: 137 }),
        GameFactory.grid.environment.wallSharpHole({ x: 48, y: 139 }),
        GameFactory.grid.environment.wallSharpHole({ x: 63, y: 138 }),

        GameFactory.grid.environment.wallBrickLeftSquare({ x: 33, y: 95.5 }),
        GameFactory.grid.environment.wallBrickLeft({ x: 32.5, y: 97 }),
        GameFactory.grid.environment.wallBrickLeft({ x: 31, y: 101 }),
        GameFactory.grid.environment.wallBrickLeft({ x: 30, y: 108 }),
        GameFactory.grid.environment.wallBrickLeftSquare({ x: 30, y: 111.5 }),
        GameFactory.grid.environment.wallBrickLeftSquare({ x: 31, y: 113 }),
        GameFactory.grid.environment.wallBrickLeft({ x: 31.5, y: 114.5 }),
        GameFactory.grid.environment.wallBrickLeft({ x: 30, y: 118.5 }),
        GameFactory.grid.environment.wallBrickLeftSquare({ x: 30, y: 122.5 }),

        GameFactory.grid.environment.wallBrickRight({ x: 42.5, y: 94 }),
        GameFactory.grid.environment.wallBrickRight({ x: 43, y: 98 }),
        GameFactory.grid.environment.wallBrickRight({ x: 42.75, y: 102 }),
        GameFactory.grid.environment.wallBrickRight({ x: 42, y: 108 }),
        GameFactory.grid.environment.wallBrickRight({ x: 42.5, y: 112 }),
        GameFactory.grid.environment.wallBrickRightSquare({ x: 42.5, y: 115.5 }),
        GameFactory.grid.environment.wallBrickRight({ x: 42.5, y: 117 }),
        GameFactory.grid.environment.wallBrickRight({ x: 44, y: 121 }),
        GameFactory.grid.environment.wallBrickRightSquare({ x: 46, y: 127.5 }),
        GameFactory.grid.environment.wallBrickRight({ x: 47, y: 129 }),

        GameFactory.grid.environment.wallClean({ x: 34, y: 95, w: 5, h: 10 }),
        GameFactory.grid.environment.wallClean({ x: 39, y: 100, w: 5, h: 15 }),
        GameFactory.grid.environment.wallClean({ x: 41, y: 95, w: 2, h: 5 }),
        GameFactory.grid.environment.wallClean({ x: 39, y: 95, w: 2, h: 2 }),
        GameFactory.grid.environment.wallClean({ x: 35, y: 105, w: 1.5, h: 3 }),
        GameFactory.grid.environment.wallClean({ x: 38.5, y: 105, w: 1, h: 3 }),
        GameFactory.grid.environment.wallClean({ x: 33, y: 108, w: 6, h: 11 }),
        GameFactory.grid.environment.wallClean({ x: 42, y: 115, w: 2, h: 12 }),
        GameFactory.grid.environment.wallClean({ x: 36, y: 119, w: 4, h: 9 }),
        GameFactory.grid.environment.wallClean({ x: 32, y: 122, w: 5, h: 12 }),
        GameFactory.grid.environment.wallClean({ x: 33, y: 119, w: 1, h: 3 }),
        GameFactory.grid.environment.wallClean({ x: 39, y: 115, w: 1, h: 4 }),
        GameFactory.grid.environment.wallClean({ x: 40, y: 118, w: 2, h: 9 }),
        GameFactory.grid.environment.wallClean({ x: 37, y: 127, w: 8, h: 10 }),
        GameFactory.grid.environment.wallClean({ x: 43, y: 132, w: 5, h: 12 }),
        GameFactory.grid.environment.wallClean({ x: 34, y: 134, w: 3, h: 10 }),
        GameFactory.grid.environment.wallClean({ x: 29, y: 133, w: 3, h: 11 }),
        GameFactory.grid.environment.wallClean({ x: 32, y: 137, w: 2, h: 7 }),
        GameFactory.grid.environment.wallClean({ x: 37, y: 140, w: 4, h: 4 }),
        GameFactory.grid.environment.wallClean({ x: 45, y: 127, w: 2, h: 2 }),
        GameFactory.grid.environment.wallClean({ x: 50, y: 138, w: 13, h: 5 }),
        GameFactory.grid.environment.wallClean({ x: 65, y: 133, w: 26, h: 10 }),
        GameFactory.grid.environment.wallClean({ x: 63, y: 141, w: 2, h: 2 }),
        GameFactory.grid.environment.wallClean({ x: 48, y: 138, w: 2, h: 1 }),

        GameFactory.grid.environment.wallBrickVerticalPattern({ x: 37, y: 117, repeatY: 2 }),
        GameFactory.grid.environment.wallBrickVerticalPattern({ x: 42, y: 100 }),
        GameFactory.grid.environment.wallBrickVerticalPattern({ x: 53, y: 138 }),
        GameFactory.grid.environment.wallBrickVerticalPattern({ x: 73, y: 138 }),
        GameFactory.grid.environment.wallBrickVerticalPattern({ x: 81, y: 140 }),
        GameFactory.grid.environment.wallBrickVerticalPattern({ x: 40, y: 122 }),
        GameFactory.grid.environment.electronics({ x: 87, y: 140, w: 2, h: 1 }),

        //wall 003 (floor 0 - section available for double jump)
        GameFactory.grid.environment.wallClean({ x: 7, y: 97, w: 3, h: 6 }),
        ...GameFactory.grid.environment.wallSharpLeftCol({ x: 5, y: 97, count: 6 }),
        ...GameFactory.grid.environment.wallSharpRightCol({ x: 10, y: 97, count: 6 }),

        //wall 004 (pool with cannons)
        ...GameFactory.grid.environment.wallSharpLeftCol({ x: 75, y: 124, count: 6 }),
        ...GameFactory.grid.environment.wallSharpRightCol({ x: 91, y: 127, count: 5 }),
        GameFactory.grid.environment.wallClean({ x: 77, y: 123, w: 3, h: 12 }),
        GameFactory.grid.environment.wallClean({ x: 80, y: 123, w: 11, h: 3 }),
        GameFactory.grid.environment.wallClean({ x: 82, y: 126, w: 9, h: 4 }),
        GameFactory.grid.environment.wallClean({ x: 81, y: 130, w: 6, h: 4 }),
        GameFactory.grid.environment.wallClean({ x: 89, y: 130, w: 2, h: 3 }),
        GameFactory.grid.environment.wallSharpHole({ x: 80, y: 126 }),
        GameFactory.grid.environment.wallSharpHole({ x: 87, y: 130 }),
    ],
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
        ...GameFactory.grid.environment.grass({ x: 45, y: 124, w: 3 }),
        ...GameFactory.grid.environment.grass({ x: 60, y: 133, w: 8 }),
        GameFactory.grid.environment.grass001({ x: 71, y: 133, repeatX: 4 }),
        GameFactory.grid.environment.grass001({ x: 61, y: 123, repeatX: 4 }),

        //electronics (fountain)
        GameFactory.grid.environment.electronics({ x: 0, y: 134, w: 2, h: 2 }),
        GameFactory.grid.environment.electronics({ x: 1, y: 126, w: 2, h: 1 }),
        GameFactory.grid.environment.electronics({ x: 5, y: 140, w: 3, h: 1 }),
        GameFactory.grid.environment.electronics({ x: 7, y: 107, w: 2, h: 1 }),
        GameFactory.grid.environment.electronics({ x: 7, y: 136, w: 2, h: 1 }),
        GameFactory.grid.environment.electronics({ x: 8, y: 120, w: 2, h: 2 }),
        GameFactory.grid.environment.electronics({ x: 9, y: 103, w: 2, h: 2 }),
        GameFactory.grid.environment.electronic002({ x: 12, y: 126 }),
        GameFactory.grid.environment.electronic003({ x: 14, y: 125 }),
        GameFactory.grid.environment.electronics({ x: 15, y: 125, w: 4, h: 2 }),
        GameFactory.grid.environment.electronics({ x: 15, y: 136, w: 2, h: 2 }),
        GameFactory.grid.environment.electronic003({ x: 16, y: 138 }),
        GameFactory.grid.environment.electronic003({ x: 16, y: 127 }),
        GameFactory.grid.environment.electronics({ x: 17, y: 127, w: 2, h: 1 }),
        GameFactory.grid.environment.electronic003({ x: 19, y: 106 }),
        GameFactory.grid.environment.electronics({ x: 46, y: 125, w: 2, h: 2 }),
        GameFactory.grid.environment.electronic001({ x: 45, y: 125 }),
        GameFactory.grid.environment.electronics({ x: 40, y: 137, h: 4, w: 2 }),
        GameFactory.grid.environment.electronic001({ x: 42, y: 119 }),
        GameFactory.grid.environment.electronic002({ x: 39, y: 119 }),
        GameFactory.grid.environment.electronics({ x: 33, y: 110, h: 1, w: 2 }),
        GameFactory.grid.environment.electronics({ x: 59, y: 116, h: 1, w: 4 }),
        GameFactory.grid.environment.electronics({ x: 53, y: 125, h: 2, w: 2 }),
        GameFactory.grid.environment.electronics({ x: 48, y: 134, h: 1, w: 4 }),
        GameFactory.grid.environment.electronics({ x: 68, y: 136, h: 1, w: 4 }),
        GameFactory.grid.environment.electronics({ x: 77, y: 127, h: 1, w: 2 }),
        GameFactory.grid.environment.electronics({ x: 83, y: 130, h: 2, w: 2 }),

        // terminals
        GameFactory.grid.environment.terminalDirection({ x: 4, y: 116.25, direction: "right" }),
        GameFactory.grid.environment.terminalDirection({ x: 19, y: 95, direction: "right" }),
        GameFactory.grid.environment.terminalDirection({ x: 40, y: 119, direction: "right" }),
        GameFactory.grid.environment.terminalDirection({ x: 22.25, y: 139.25, direction: "up" }),
        GameFactory.grid.environment.terminalDirection({ x: 69, y: 125, direction: "right" }),
        GameFactory.grid.environment.terminalDirection({ x: 107, y: 129, direction: "right" }),
        
        //wall elements (fountain)
        GameFactory.grid.environment.wallInside({ x: 1, y: 129 }),
        GameFactory.grid.environment.wallPipe({ x: 2, y: 121 }),
        GameFactory.grid.environment.wallInside({ x: 2, y: 138, repeatY: 2 }),
        GameFactory.grid.environment.wallInside({ x: 2, y: 118 }),
        GameFactory.grid.environment.wallInside({ x: 6, y: 116 }),
        GameFactory.grid.environment.wallPipe({ x: 16, y: 140 }),
        GameFactory.grid.environment.wallPipe({ x: 32, y: 127 }),
        GameFactory.grid.environment.wallPipe({ x: 35, y: 127 }),
        GameFactory.grid.environment.wallPipe({ x: 38, y: 127 }),
        GameFactory.grid.environment.wallInside({ x: 41, y: 134 }),
        GameFactory.grid.environment.wallInside({ x: 41, y: 137, repeatY: 2 }),
        GameFactory.grid.environment.wallPipe({ x: 61, y: 126 }),
        GameFactory.grid.environment.wallPipe({ x: 46, y: 136 }),

        // jaws cave with elevator
        ...GameFactory.grid.environment.grass({ x: 113, y: 113, w: 3 }),
        ...GameFactory.grid.environment.grass({ x: 100, y: 116, w: 6 }),
        ...GameFactory.grid.environment.grass({ x: 108, y: 116, w: 6 }),
        ...GameFactory.grid.environment.grass({ x: 80, y: 112, w: 3 }),
        ...GameFactory.grid.environment.grass({ x: 83, y: 113, w: 3 }),
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
        GameFactory.grid.environment.wallPlant001({ x: 9, y: 108 }),
        GameFactory.grid.environment.wallPlant001({ x: 23, y: 111 }),
        GameFactory.grid.environment.wallPlant001({ x: 44, y: 110 }),
        GameFactory.grid.environment.wallPlant001({ x: 52, y: 108 }),
        GameFactory.grid.environment.wallPlant001({ x: 56, y: 128 }),
        GameFactory.grid.environment.wallPlant001({ x: 65, y: 129 }),

        // jaws cave with elevator
        GameFactory.grid.environment.plant007({ x: 112.75, y: 113 }),
        GameFactory.grid.environment.plant007({ x: 107, y: 106 }),
        
        GameFactory.grid.environment.plant008({ x: 119, y: 106 }),
        GameFactory.grid.environment.wallPlant001({ x: 115, y: 106 }),
        GameFactory.grid.environment.wallPlant001({ x: 111, y: 106 }),
        GameFactory.grid.environment.plant007({ x: 90, y: 106 }),
        GameFactory.grid.environment.flower001({ x: 100, y: 114 }),
        GameFactory.grid.environment.flower002({ x: 104, y: 115 }),
        GameFactory.grid.environment.flower002({ x: 90, y: 109 }),
        GameFactory.grid.environment.flower002({ x: 113, y: 105 }),
        GameFactory.grid.environment.plant008({ x: 106, y: 113 }),
    ] 
};
