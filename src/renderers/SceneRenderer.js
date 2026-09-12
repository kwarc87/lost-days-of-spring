import { DebugGridRenderer } from "./DebugRenderers.js";

// Orchestrates the whole-frame draw order (world -> layers -> entities -> UI
// overlays). Takes the game instance as a state facade so it can call back
// into the entity-specific draw*/render helpers that still live on it.
export const SceneRenderer = {
    draw(ctx, game, now) {
        ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

        ctx.save();

        if (game.mapView) {
            game.worldRenderer.drawMapBackground(ctx, game.canvas, game.worldSize);
        } else {
            game.drawWorld();
            ctx.translate(-game.cameraController.camera.x, -game.cameraController.camera.y);
        }

        for (const i of game.parallaxItems) {
            game.drawEnvParallaxItem(i);
        }

        for (const exit of game.exitController.getExits()) {
            game.drawExit(exit);
        }

        for (const i of game.preBackgroundItems) {
            game.drawEnvPreBackgroundItem(i);
        }

        for (const p of game.platforms) {
            game.drawPlatform(p);
        }

        for (const i of game.backgroundItems) {
            game.drawEnvBackgroundItem(i);
        }

        for (const w of game.projectileController.getBullets()) {
            game.drawBullet(w);
        }

        for (const b of game.projectileController.getCannonBullets()) {
            game.drawCannonBullet(b);
        }

        for (const c of game.collectibleController.getCoins()) {
            if (!c.collected) {
                game.drawCoin(c);
            }
        }

        for (const s of game.collectibleController.getSplinters()) {
            if (!s.collected) {
                game.drawSplinter(s, now);
            }
        }

        for (const a of game.collectibleController.getArtifacts()) {
            if (!a.collected) {
                game.drawArtifact(a, now);
            }
        }

        for (const h of game.collectibleController.getHearts()) {
            if (!h.collected) {
                game.drawHeart(h, now);
            }
        }

        for (const u of game.collectibleController.getWeaponUpgrades()) {
            if (!u.collected) {
                game.drawWeaponUpgrade(u, now);
            }
        }

        for (const wall of game.hiddenWalls) {
            game.drawHiddenWall(wall);
        }

        for (const e of game.elevatorController.getElevators()) {
            game.drawElevator(e);
        }

        for (const spike of game.projectileController.getSpikes()) {
            game.drawSpike(spike);
        }

        for (const e of game.enemyController.getEnemies()) {
            if (e.dead) {
                continue;
            }
            game.drawEnemy(e, now);
        }

        for (const cannon of game.projectileController.getCannons()) {
            game.drawCannon(cannon);
        }

        if (!game.mapView) {
            game.drawPlayer(now);
        }

        for (const cp of game.checkpointManager.checkpoints) {
            game.drawCheckpointIndicator(cp);
        }

        for (const i of game.foregroundItems) {
            game.drawEnvForegroundItem(i);
        }

        if (game.mapView) {
            game.worldRenderer.drawMapUndiscoveredMask(ctx, game.worldSize, game.mapDiscovery);
            game.drawPlayer(now);
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
            game.drawExitMessage();
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
            game.messageRenderer.drawMessagePanel(
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
            game.messageRenderer.drawPanel(
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

        game.hudRenderer.draw(
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

        if (game.levelComplete) {
            game.drawLevelComplete();
        }

        if (game.gameOver) {
            game.drawGameOver(now);
        }
    },
};
