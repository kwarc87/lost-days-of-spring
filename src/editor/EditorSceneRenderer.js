import { DebugGridRenderer } from "../renderers/DebugRenderers.js";
import { drawEntity } from "../renderers/EntityRenderPipeline.js";
import { DefaultWorldRenderer } from "../renderers/WorldRenderers.js";
import { GameFactory } from "../factories/GameFactory.js";

// Same world draw order as SceneRenderer (without UI, bullets and the map view).
// Keep both in sync when a new entity type is added to the game.
const LAYERS_BELOW_PLAYER = [
    ["envParallax", (editor) => editor.parallaxItems],
    ["exit", (editor) => editor.exitController.getExits()],
    ["envPreBackground", (editor) => editor.preBackgroundItems],
    ["platform", (editor) => editor.platforms],
    ["temporaryPlatform", (editor) => editor.temporaryPlatformController.getTemporaryPlatforms()],
    ["envBackground", (editor) => editor.backgroundItems],
    ["hackPanel", (editor) => editor.hackPanelController.getHackPanels()],
    ["coin", (editor) => editor.collectibleController.getCoins()],
    ["splinter", (editor) => editor.collectibleController.getSplinters()],
    ["artifact", (editor) => editor.collectibleController.getArtifacts()],
    ["heart", (editor) => editor.collectibleController.getHearts()],
    ["heartContainer", (editor) => editor.collectibleController.getHeartContainers()],
    ["weaponUpgrade", (editor) => editor.collectibleController.getWeaponUpgrades()],
    ["enemy", (editor) => editor.enemyController.getEnemies()],
    ["elevator", (editor) => editor.elevatorController.getElevators()],
    ["spike", (editor) => editor.combatController.getSpikes()],
    ["cannon", (editor) => editor.combatController.getCannons()],
];

const NO_ITEMS = [];

const LAYERS_ABOVE_PLAYER = [
    ["checkpoint", (editor) => editor.checkpointManager.checkpoints],
    [
        "hiddenWall",
        (editor) =>
            editor.hiddenWallsToggle.isOn ? editor.hiddenWallController.getHiddenWalls() : NO_ITEMS,
    ],
    ["envForeground", (editor) => editor.foregroundItems],
];

function drawLayers(ctx, editor, layers, now) {
    for (const [key, getItems] of layers) {
        for (const item of getItems(editor)) {
            drawEntity(ctx, editor, key, item, now);
        }
    }
}

function drawTeleports(ctx, teleports) {
    ctx.save();
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 1;
    for (const t of teleports) {
        ctx.strokeRect(t.x, t.y, t.w, t.h);
        ctx.strokeRect(t.targetX, t.targetY, t.w, t.h);
    }
    ctx.restore();
}

function drawTileHighlight(ctx, tile, color) {
    if (!tile) {
        return;
    }
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(
        tile.x * GameFactory.GRID,
        tile.y * GameFactory.GRID,
        GameFactory.GRID,
        GameFactory.GRID
    );
    ctx.restore();
}

export const EditorSceneRenderer = {
    draw(ctx, editor, now) {
        const camera = editor.cameraController.camera;

        ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
        ctx.save();

        DefaultWorldRenderer.drawBackground(ctx, editor.canvas, camera);
        ctx.translate(-camera.x, -camera.y);

        drawLayers(ctx, editor, LAYERS_BELOW_PLAYER, now);
        drawEntity(ctx, editor, "player", editor.player, now);
        drawLayers(ctx, editor, LAYERS_ABOVE_PLAYER, now);

        // Debug off = preview: only the tile the new object is being added at stays marked.
        if (editor.showDebug) {
            DebugGridRenderer.draw(ctx, camera, editor.worldSize);
            drawTeleports(ctx, editor.teleportController.getTeleports());
            drawTileHighlight(ctx, editor.hoveredTile, "rgba(255, 255, 255, 0.6)");
        }
        drawTileHighlight(ctx, editor.selectedTile, "yellow");

        ctx.restore();
    },
};
