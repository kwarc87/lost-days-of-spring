import { GameFactory } from "../factories/GameFactory.js";
import { platformCaves } from "../renderers/PlatformRenderers.js";

// Config table (Registry) of everything the editor can add. Each kind says which level
// section it is saved to, which factory functions build it and which form fields it has.
// The form shows the fields in this order; empty fields are left out of the saved entry
// so the factory defaults apply.

const PLATFORM_LAYOUTS = Object.keys(platformCaves);

const TILE_RECT_FIELDS = [
    { name: "x", input: "number" },
    { name: "y", input: "number" },
    { name: "w", input: "number", defaultValue: 1 },
    { name: "h", input: "number", defaultValue: 1 },
];

const LAYOUT_FIELD = { name: "layout", input: "select", options: PLATFORM_LAYOUTS };

const environmentItemKind = (label, section) => ({
    label,
    section,
    firstId: null,
    factoryPath: "GameFactory.grid.environment",
    factoryOwner: GameFactory.grid.environment,
    factoryNames: Object.keys(GameFactory.grid.environment),
    fields: [
        { name: "x", input: "number" },
        { name: "y", input: "number" },
        { name: "w", input: "number" },
        { name: "h", input: "number" },
        { name: "repeatX", input: "number" },
        { name: "repeatY", input: "number" },
        { name: "count", input: "number" },
    ],
});

export const EDITOR_OBJECT_KINDS = {
    platform: {
        label: "Platform",
        section: "platforms",
        firstId: 1,
        factoryPath: "GameFactory.grid",
        factoryOwner: GameFactory.grid,
        factoryNames: ["solid", "oneDirection", "ice", "oneDirectionIce", "booster"],
        fields: [...TILE_RECT_FIELDS, LAYOUT_FIELD, { name: "boostSpeed", input: "number" }],
    },
    hiddenWall: {
        label: "Hidden wall",
        section: "hiddenWalls",
        firstId: 2001,
        factoryPath: "GameFactory.grid",
        factoryOwner: GameFactory.grid,
        factoryNames: ["cracks"],
        fields: [...TILE_RECT_FIELDS, LAYOUT_FIELD, { name: "group", input: "text" }],
    },
    temporaryPlatform: {
        label: "Temporary platform",
        section: "temporaryPlatforms",
        firstId: 3001,
        factoryPath: "GameFactory.grid",
        factoryOwner: GameFactory.grid,
        factoryNames: ["temporaryPlatform"],
        fields: [
            ...TILE_RECT_FIELDS,
            { name: "type", input: "select", options: ["solid", "oneDirection"] },
            LAYOUT_FIELD,
            { name: "active", input: "checkbox" },
        ],
    },
    preBackgroundItem: environmentItemKind("Pre-background item", "preBackgroundItems"),
    backgroundItem: environmentItemKind("Background item", "backgroundItems"),
    foregroundItem: environmentItemKind("Foreground item", "foregroundItems"),
};
