import { GameFactory } from "../factories/GameFactory.js";
import { platformCaves } from "../renderers/PlatformRenderers.js";

// Config table (Registry) of everything the editor can add. Each kind says which level
// section it is saved to ("a.b" = section b nested in a), which factory functions build it,
// how its id is assigned and which form fields it has.
// The form shows the fields in this order; empty fields are left out of the saved entry
// so the factory defaults apply.
//
// id: null when the kind has no id, otherwise
// { field: name of the id prop, firstId, group: which ids it must not collide with (see
// ID_GROUPS in LevelEditor.js), block: true when the entry uses a range of ids from `field` }.
//
// fixedProps (optional): props always added to the saved entry, without a form field.

const PLATFORM_LAYOUTS = Object.keys(platformCaves);

const solidId = (firstId) => ({ field: "id", firstId, group: "solids", block: false });

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
    id: null,
    factoryPath: "GameFactory.grid.environment",
    factoryOwner: GameFactory.grid.environment,
    factoryNames: Object.keys(GameFactory.grid.environment),
    fields: [
        { name: "x", input: "number" },
        { name: "y", input: "number" },
        { name: "w", input: "number" },
        { name: "h", input: "number" },
    ],
});

export const EDITOR_OBJECT_KINDS = {
    platform: {
        label: "Platform",
        section: "platforms",
        id: solidId(1),
        factoryPath: "GameFactory.grid",
        factoryOwner: GameFactory.grid,
        factoryNames: ["solid", "oneDirection", "ice", "oneDirectionIce", "booster"],
        fields: [...TILE_RECT_FIELDS, LAYOUT_FIELD, { name: "boostSpeed", input: "number" }],
    },
    hiddenWall: {
        label: "Hidden wall",
        section: "hiddenWalls",
        id: solidId(2001),
        factoryPath: "GameFactory.grid",
        factoryOwner: GameFactory.grid,
        factoryNames: ["cracks"],
        fields: [...TILE_RECT_FIELDS, LAYOUT_FIELD, { name: "group", input: "text" }],
    },
    temporaryPlatform: {
        label: "Temporary platform",
        section: "temporaryPlatforms",
        id: solidId(3001),
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
    coins: {
        label: "Coins",
        section: "collectibles.coins",
        id: { field: "startId", firstId: 1, group: "coins", block: true },
        factoryPath: "GameFactory.grid",
        factoryOwner: GameFactory.grid,
        factoryNames: ["rectOfCollectibles"],
        fields: [...TILE_RECT_FIELDS, { name: "gap", input: "number" }],
    },
    splinter: {
        label: "Splinter",
        section: "collectibles.splinters",
        id: { field: "id", firstId: 1, group: "splinters", block: false },
        factoryPath: "GameFactory.grid",
        factoryOwner: GameFactory.grid,
        factoryNames: ["splinters"],
        fields: [
            { name: "x", input: "number" },
            { name: "y", input: "number" },
        ],
    },
    artifact: {
        label: "Artifact",
        section: "collectibles.artifacts",
        id: { field: "id", firstId: 1, group: "artifacts", block: false },
        factoryPath: "GameFactory.grid",
        factoryOwner: GameFactory.grid,
        factoryNames: ["artifact"],
        fields: [
            { name: "x", input: "number" },
            { name: "y", input: "number" },
            // Icon position in textures/icons.png, in 16 px tiles
            { name: "cordX", input: "number", defaultValue: 0 },
            { name: "cordY", input: "number", defaultValue: 0 },
        ],
        // Story text is filled in by hand later (e.g. MESSAGES.LEVEL_1.ARTIFACTS.X).
        fixedProps: { message: "" },
    },
    spikes: {
        label: "Spikes",
        section: "spikes",
        id: { field: "startId", firstId: 1, group: "spikes", block: true },
        factoryPath: "GameFactory.grid",
        factoryOwner: GameFactory.grid,
        factoryNames: ["rowOfSpikes"],
        fields: [
            { name: "x", input: "number" },
            { name: "y", input: "number" },
            { name: "count", input: "number", defaultValue: 1 },
            { name: "position", input: "select", options: ["down", "up"] },
            { name: "damage", input: "number" },
        ],
    },
    preBackgroundItem: environmentItemKind("Pre-background item", "preBackgroundItems"),
    backgroundItem: environmentItemKind("Background item", "backgroundItems"),
    foregroundItem: environmentItemKind("Foreground item", "foregroundItems"),
    hackPanel: {
        label: "Hack terminal",
        section: "hackPanels",
        id: { field: "id", firstId: 1, group: "hackPanels", block: false },
        factoryPath: "GameFactory.grid",
        factoryOwner: GameFactory.grid,
        factoryNames: ["hackPanel"],
        fields: [
            { name: "x", input: "number" },
            { name: "y", input: "number" },
            { name: "mode", input: "select", options: ["activate", "deactivate"] },
            { name: "hackDuration", input: "number" },
            { name: "activationDuration", input: "number" },
            // Ids of the temporary platforms it controls, comma-separated, e.g. 3001, 3002
            { name: "platformIds", input: "numberList" },
        ],
    },
    terminal: {
        label: "Terminal",
        section: "backgroundItems",
        id: null,
        factoryPath: "GameFactory.grid.environment",
        factoryOwner: GameFactory.grid.environment,
        factoryNames: ["terminalDirection"],
        fields: [
            { name: "x", input: "number" },
            { name: "y", input: "number" },
            { name: "direction", input: "select", options: ["up", "down", "left", "right"] },
        ],
    },
};
