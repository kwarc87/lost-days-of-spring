import { DebugGridRenderer } from "./DebugRenderers.js";
import { drawEntity } from "./EntityRenderPipeline.js";
import { DefaultWorldRenderer } from "./WorldRenderers.js";
import { MessageRenderer } from "./MessageRenderer.js";
import { DefaultHubRenderer } from "./HudRenderers.js";
import { getExitLevelLines } from "../messages.js";

// Orchestrates the whole-frame draw order (world -> layers -> entities -> UI
// overlays). Takes the game instance as a state facade so it can call back
// into the entity-specific draw*/render helpers that still live on it.
export const SceneRenderer = {
    draw(ctx, game, now) {
        ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

        ctx.save();

        if (game.mapView) {
            DefaultWorldRenderer.drawMapBackground(ctx, game.canvas, game.worldSize);
        } else {
            DefaultWorldRenderer.drawBackground(ctx, game.canvas, game.cameraController.camera);
            ctx.translate(-game.cameraController.camera.x, -game.cameraController.camera.y);
        }

        for (const i of game.parallaxItems) {
            drawEntity(ctx, game, "envParallax", i, now);
        }

        for (const exit of game.exitController.getExits()) {
            drawEntity(ctx, game, "exit", exit, now);
        }

        for (const i of game.preBackgroundItems) {
            drawEntity(ctx, game, "envPreBackground", i, now);
        }

        for (const p of game.platforms) {
            drawEntity(ctx, game, "platform", p, now);
        }

        for (const i of game.backgroundItems) {
            drawEntity(ctx, game, "envBackground", i, now);
        }

        for (const w of game.combatController.getBullets()) {
            drawEntity(ctx, game, "bullet", w, now);
        }

        for (const b of game.combatController.getCannonBullets()) {
            drawEntity(ctx, game, "cannonBullet", b, now);
        }

        for (const c of game.collectibleController.getCoins()) {
            if (!c.collected) {
                drawEntity(ctx, game, "coin", c, now);
            }
        }

        for (const s of game.collectibleController.getSplinters()) {
            if (!s.collected) {
                drawEntity(ctx, game, "splinter", s, now);
            }
        }

        for (const a of game.collectibleController.getArtifacts()) {
            if (!a.collected) {
                drawEntity(ctx, game, "artifact", a, now);
            }
        }

        for (const h of game.collectibleController.getHearts()) {
            if (!h.collected) {
                drawEntity(ctx, game, "heart", h, now);
            }
        }

        for (const u of game.collectibleController.getWeaponUpgrades()) {
            if (!u.collected) {
                drawEntity(ctx, game, "weaponUpgrade", u, now);
            }
        }

        for (const wall of game.hiddenWallController.getHiddenWalls()) {
            drawEntity(ctx, game, "hiddenWall", wall, now);
        }

        for (const e of game.elevatorController.getElevators()) {
            drawEntity(ctx, game, "elevator", e, now);
        }

        for (const spike of game.combatController.getSpikes()) {
            drawEntity(ctx, game, "spike", spike, now);
        }

        for (const e of game.enemyController.getEnemies()) {
            if (e.dead) {
                continue;
            }
            drawEntity(ctx, game, "enemy", e, now);
        }

        for (const cannon of game.combatController.getCannons()) {
            drawEntity(ctx, game, "cannon", cannon, now);
        }

        if (!game.mapView) {
            drawEntity(ctx, game, "player", game.player, now);
        }

        for (const cp of game.checkpointManager.checkpoints) {
            drawEntity(ctx, game, "checkpoint", cp, now);
        }

        for (const i of game.foregroundItems) {
            drawEntity(ctx, game, "envForeground", i, now);
        }

        if (game.mapView) {
            DefaultWorldRenderer.drawMapUndiscoveredMask(ctx, game.worldSize, game.mapDiscovery);
            drawEntity(ctx, game, "player", game.player, now);
        }

        if (game.showDebug && !game.mapView) {
            DebugGridRenderer.draw(ctx, game.cameraController.camera, game.worldSize);
            for (const t of game.teleportController.getTeleports()) {
                ctx.save();
                ctx.strokeStyle = "cyan";
                ctx.lineWidth = 1;
                ctx.strokeRect(t.x, t.y, t.w, t.h);
                ctx.strokeRect(t.targetX, t.targetY, t.w, t.h);
                ctx.restore();
            }
        }

        ctx.restore();

        if (
            game.exitController.playerAtExit &&
            !game.levelComplete &&
            !game.gameOver &&
            !game.galleryController.active
        ) {
            const exit = game.exitController.findActiveExit(game.player);
            if (exit) {
                const camera = game.cameraController.camera;
                const anchorX = exit.x - camera.x + exit.dw / 2;
                const anchorY = exit.y - camera.y + exit.dh / 2;
                const lines = getExitLevelLines(
                    game.hasEnoughCoins,
                    game.hasEnoughSplinters,
                    game.hasEnoughArtifacts
                );
                MessageRenderer.drawPanel(ctx, { lines }, anchorX, anchorY);
            }
        }

        const activeMessage = game.messageController.getActiveMessage();
        if (
            activeMessage &&
            !game.levelComplete &&
            !game.gameOver &&
            !game.mapView &&
            !game.pauseController.isPaused &&
            !game.galleryController.active
        ) {
            MessageRenderer.drawMessagePanel(
                ctx,
                game.canvas,
                activeMessage,
                game.cameraController.camera
            );
        }

        const activeArtifactMessage = game.messageController.getActiveArtifactMessage();
        if (
            activeArtifactMessage &&
            !game.levelComplete &&
            !game.gameOver &&
            !game.mapView &&
            !game.pauseController.isPaused &&
            !game.galleryController.active
        ) {
            const activeArtifactSource = game.messageController.getActiveArtifactSource();
            MessageRenderer.drawPanel(
                ctx,
                {
                    title: activeArtifactMessage.title ?? null,
                    lines: activeArtifactMessage.lines,
                },
                game.canvas.width / 2 + (activeArtifactMessage.offsetX ?? 0),
                game.canvas.height - 8 + (activeArtifactMessage.offsetY ?? 0),
                {
                    anchorBottom: true,
                    bg: "#533794",
                    border: { color: "#fff", width: 2, steps: 3 },
                    icon: activeArtifactSource
                        ? {
                              url: activeArtifactSource.url,
                              sx: activeArtifactSource.cordX,
                              sy: activeArtifactSource.cordY,
                              sw: 16,
                              sh: 16,
                              size: 48,
                          }
                        : undefined,
                }
            );
        }

        DefaultHubRenderer.draw(
            ctx,
            game.canvas,
            game.player,
            game.currentLevelCoinsCount,
            game.currentLevelSplintersCount,
            game.hasEnoughCoins,
            game.hasEnoughSplinters,
            game.currentLevelArtifactsCount,
            game.hasEnoughArtifacts
        );
    },
};
