import { LEVELS } from "../levels/levelsConfig.js";
import { GameFactory } from "../factories/GameFactory.js";
import { CameraController } from "../systems/CameraController.js";
import { adjustAnimStartTime, PLAYER_DYING_DURATION_MS } from "../renderers/PlayerRenderers.js";
import {
    DefaultPauseRenderer,
    MENU_ITEMS,
    PAUSE_MENU_ACTION,
} from "../renderers/PauseRenderers.js";
import { DebugHudRenderer } from "../renderers/DebugRenderers.js";
import { SceneRenderer } from "../renderers/SceneRenderer.js";
import { DefaultLevelCompleteRenderer } from "../renderers/LevelCompleteRenderers.js";
import { DefaultGameOverRenderer } from "../renderers/GameOverRenderer.js";
import { CheckpointStorage } from "../services/CheckpointStorage.js";
import { CheckpointManager } from "../systems/CheckpointManager.js";
import { PauseController } from "../systems/PauseController.js";
import { ExitController } from "../systems/ExitController.js";
import { TitleScreenController } from "../systems/TitleScreenController.js";
import { ArtifactGalleryController } from "../systems/ArtifactGalleryController.js";
import { TeleportController } from "../systems/TeleportController.js";
import { HiddenWallController } from "../systems/HiddenWallController.js";
import { CombatController } from "../systems/CombatController.js";
import { ElevatorController } from "../systems/ElevatorController.js";
import { EnemyController } from "../systems/EnemyController.js";
import { CollectibleController } from "../systems/CollectibleController.js";
import { MessageController } from "../systems/MessageController.js";
import { PlayerPhysicsController } from "../systems/PlayerPhysicsController.js";
import { PlayerPostureController } from "../systems/PlayerPostureController.js";
import { PlayerHealthController } from "../systems/PlayerHealthController.js";
import { LevelLoader } from "../services/LevelLoader.js";
import { InputController } from "../systems/InputController.js";
import { KEYS_MAP } from "../config/keysMap.js";
import { PHYSICS } from "../config/physics.js";
import { DisplayController } from "../systems/DisplayController.js";
import { DebugMouseTracker } from "../systems/DebugMouseTracker.js";
import { TitleScreenRenderer } from "../renderers/TitleScreenRenderer.js";
import { TransitionRenderer } from "../renderers/TransitionRenderer.js";
import { ArtifactGalleryRenderer } from "../renderers/ArtifactGalleryRenderer.js";

export class LostDaysOfSpring {
    constructor(canvasId, showDebug = true, initialHp = 6) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.showDebug = showDebug;
        this.initialHp = initialHp;

        // ====== INPUT ======
        this.keysMap = KEYS_MAP;
        this.inputController = new InputController(this.keysMap);

        // ====== GAME STATE ======
        this.currentLevelId = null;
        this.pendingReset = false;
        this.checkpointManager = new CheckpointManager();
        this.pauseController = new PauseController();
        this.deathCount = 0;
        this.mapView = false;
        this.levelComplete = false;
        this.gameOver = false;
        this.titleScreenController = new TitleScreenController();
        this.gameFadeIn = { active: false, startTime: 0, duration: 750 };
        this.levelCompleteAt = 0; // timestamp (ms) when level was completed
        this.gameOverAt = 0; // timestamp (ms) when game over occurred
        this.levelStartAt = 0; // timestamp (ms) when the level was loaded
        this.accumulatedPlayTime = 0; // play time (ms) carried over from previous sessions via checkpoint
        this.gameOverDelay = 15000; // ms until auto-restart after game over
        this.worldGroundId = "world-ground";
        this.verticalHitRecoilMultiplier = 1.5;
        this.mapDiscovery = null;

        // ====== PLAYER (Base static attributes set by factory) ======
        this.player = GameFactory.player({
            weapon: GameFactory.weapon(),
            life: this.initialHp,
            maxLife: this.initialHp,
        });

        // ====== PROJECTILES (bullets, cannons, spikes) ======
        this.combatController = new CombatController();

        // ====== ELEVATORS ======
        this.elevatorController = new ElevatorController();

        // ====== ENEMIES ======
        this.enemyController = new EnemyController();

        // ====== COLLECTIBLES ======
        this.collectibleController = new CollectibleController();

        // ====== MESSAGES ======
        this.messageController = new MessageController();

        // ====== TELEPORTS ======
        this.teleportController = new TeleportController();

        // ====== EXITS ======
        this.exitController = new ExitController();

        // ====== HIDDEN WALLS ======
        this.hiddenWallController = new HiddenWallController();

        // ====== CAMERA ======
        this.cameraController = new CameraController(this.canvas.width, this.canvas.height);
        this.displayController = new DisplayController(this.canvas, this.cameraController);

        // ====== PHYSICS ======
        this.physics = PHYSICS;
        this.playerPhysicsController = new PlayerPhysicsController(this.physics);

        // ====== POSTURES ======
        this.playerPostures = {
            STANDING: "standing",
            CROUCH: "crouch",
        };
        this.playerPostureController = new PlayerPostureController(this.playerPostures);

        // ====== PLAYER HEALTH ======
        this.playerHealthController = new PlayerHealthController(this.verticalHitRecoilMultiplier);

        // ====== DEBUG ======
        this.debug = {
            updateInterval: 50, // ms
            lastUpdate: 0,
        };

        // ====== GAME LOOP CONFIG ======
        this.gameLoop = {
            fixedDt: 1 / 60,
            maxFrameTime: 0.25,
        };

        this.galleryController = new ArtifactGalleryController(new ArtifactGalleryRenderer());

        this.lastTime = performance.now();
        this.accumulator = 0;
        this.simulatedTime = 0; // independent simulation clock, advanced by fixedDt per step
        this.loop = this.loop.bind(this);
        this.isRunning = false;

        this.mouse = new DebugMouseTracker(this.canvas, () => this.cameraController.camera);
        if (this.showDebug) {
            this.mouse.attach(() => this.updateDebugIfStopped());
        }
        this.inputHandlers = {
            title: (e) => this.handleTitleScreenKeyDown(e),
            gallery: (e) => this.handleGalleryKeyDown(e),
            pause: (e) => this.handlePauseMenuKey(e.code),
            gameplay: (e) => this.handleGameplayKeyDown(e),
        };
        this.initControls();

        this.displayController.resizeCanvasToFit();
        this.displayController.attach();
    }

    get hasEnoughCoins() {
        return this.player.coinsCount >= this.currentLevelCoinsCount / 2;
    }

    get hasEnoughSplinters() {
        return this.player.splintersCount >= this.currentLevelSplintersCount / 2;
    }

    get hasEnoughArtifacts() {
        return this.player.artifactsCount >= this.currentLevelArtifactsCount / 2;
    }

    loadLevel(levelId, now = performance.now()) {
        if (!LEVELS[levelId]) {
            // eslint-disable-next-line no-console
            console.error(`[LostDaysOfSpring] Level ${levelId} not found.`);
            return;
        }

        // Clear checkpoint state after completing the level
        if (this.levelComplete) {
            this.checkpointManager.clear();
        }

        // On first load or page reload, restore checkpoint from localStorage
        if (this.checkpointManager.loadSaved(levelId)) {
            this.galleryController.resetLastIndex();
        }

        // Reset death counter only when completing a level (starting fresh).
        // Otherwise restore from checkpoint so it survives page refreshes,
        // matching the same behaviour as accumulatedPlayTime.
        if (this.levelComplete) {
            this.deathCount = 0;
        } else {
            this.deathCount = this.checkpointManager.getRespawn()?.deathCount ?? this.deathCount;
        }

        this.currentLevelId = levelId;

        // Generate a fresh instance of the level data
        const levelData = LEVELS[levelId]();
        const loaded = LevelLoader.load(levelData, {
            elevatorController: this.elevatorController,
            enemyController: this.enemyController,
            collectibleController: this.collectibleController,
            combatController: this.combatController,
            messageController: this.messageController,
            exitController: this.exitController,
            teleportController: this.teleportController,
            hiddenWallController: this.hiddenWallController,
            checkpointManager: this.checkpointManager,
        });
        this.worldSize = loaded.worldSize;
        this.mapDiscovery = loaded.mapDiscovery;
        this.platforms = loaded.platforms;
        this.solids = loaded.solids;
        this.foregroundItems = loaded.foregroundItems;
        this.backgroundItems = loaded.backgroundItems;
        this.preBackgroundItems = loaded.preBackgroundItems;
        this.parallaxItems = loaded.parallaxItems;
        this.currentLevelCoinsCount = loaded.currentLevelCoinsCount;
        this.currentLevelSplintersCount = loaded.currentLevelSplintersCount;
        this.currentLevelArtifactsCount = loaded.currentLevelArtifactsCount;
        this.currentLevelEnemiesCount = loaded.currentLevelEnemiesCount;

        this.resetPlayerProperties(levelData);

        // Clear held keys to prevent ghost input on level start
        this.inputController.clear();

        // Reset bullets
        this.combatController.resetBullets();

        // Reset cannon bullets
        this.combatController.resetCannonBullets();

        // Reset Camera
        this.resetCameraToPlayerStart();
        this.mapDiscovery?.markFromPlayer(this.player);

        // Reset level-complete and game-over state
        const wasLevelComplete = this.levelComplete;
        const wasGameOver = this.gameOver;
        const gameOverAt = this.gameOverAt;
        this.levelComplete = false;
        this.levelCompleteAt = 0;
        this.gameOver = false;
        this.gameOverAt = 0;
        // Preserve the timer across deaths — only reset after level complete
        if (wasLevelComplete) {
            this.levelStartAt = now;
            this.pauseController.totalPausedTime = 0;
            this.accumulatedPlayTime = this.checkpointManager.getRespawn()?.playTimeMs ?? 0;
        } else if (wasGameOver) {
            this.pauseController.totalPausedTime += now - gameOverAt;
        }
        this.pauseController.resetMenu();
        this.mapView = false;
    }

    startLevel(now) {
        this.lastTime = now;
        this.simulatedTime = now; // sync simulation clock with wall clock at level start
        this.gameFadeIn.active = true;
        this.gameFadeIn.startTime = now;
        this.combatController.resetCannonTimers(now);
    }

    resetPlayerProperties(levelData) {
        Object.assign(
            this.player,
            GameFactory.playerRespawn({
                player: this.player,
                checkpoint: this.checkpointManager.getRespawn(),
                levelData,
                posture: this.playerPostures.STANDING,
            })
        );
    }

    initControls() {
        this.inputController.attach({
            onBlur: () => this.inputController.clear(),
            onKeyDown: (e) => this.handleKeyDown(e),
            onKeyUp: (e) => this.inputController.markKeyUp(e.code),
        });
    }

    handleKeyDown(e) {
        this.handleGlobalToggles(e);

        const mode = this.currentInputMode();
        if (mode === "pause" && e.repeat) {
            return;
        }
        this.inputHandlers[mode]?.(e);
    }

    // The mode currently receiving keyboard input; drives InputRouter dispatch.
    currentInputMode() {
        if (this.titleScreenController.active) {
            return "title";
        }
        if (this.galleryController.active) {
            return "gallery";
        }
        if (this.pauseController.isPaused) {
            return "pause";
        }
        return "gameplay";
    }

    // Toggles active regardless of game mode (title screen, gallery, pause, gameplay).
    handleGlobalToggles(e) {
        if (e.code === this.keysMap.debugToggle && !e.repeat) {
            this.showDebug = !this.showDebug;
            if (this.showDebug) {
                this.mouse.attach(() => this.updateDebugIfStopped());
            } else {
                this.mouse.detach();
            }
            this.updateDebug();
        }

        if (e.code === this.keysMap.fullscreen && !e.repeat) {
            this.displayController.toggleFullscreen();
        }
    }

    handleTitleScreenKeyDown(e) {
        if (
            e.code === this.keysMap.enter &&
            !e.repeat &&
            !this.titleScreenController.fadeOut.active &&
            !this.titleScreenController.fadeOut.pending
        ) {
            if (!document.fullscreenElement) {
                this.canvas
                    .requestFullscreen()
                    .then(() => {
                        navigator.keyboard?.lock?.(["Escape"]).catch(() => {});
                    })
                    .catch(() => {});
            }
            this.titleScreenController.requestFadeOut();
            this.inputController.clear();
        }
    }

    handleGalleryKeyDown(e) {
        if (e.repeat) {
            return;
        }

        if (e.code === this.keysMap.escape || e.code === this.keysMap.gallery) {
            this.closeArtifactGallery();
        } else if (e.code === this.keysMap.left) {
            this.galleryController.navigateLeft();
            this.animateGallery();
        } else if (e.code === this.keysMap.right) {
            this.galleryController.navigateRight();
            this.animateGallery();
        }
    }

    handleGameplayKeyDown(e) {
        if (
            (e.code === this.keysMap.escape || e.code === this.keysMap.pause) &&
            !e.repeat &&
            !this.levelComplete &&
            !this.gameOver &&
            !this.player.dying &&
            !this.mapView
        ) {
            this.openPauseMenu();
            return;
        }

        if (e.code === this.keysMap.gallery && !e.repeat) {
            if (!this.levelComplete && !this.gameOver && !this.mapView && !this.player.dying) {
                this.openArtifactGallery();
                return;
            }
        }

        // Toggle map overview
        if (e.code === this.keysMap.map && !e.repeat) {
            this.toggleMapView();
        }

        // Exit map view with ESC
        if (e.code === this.keysMap.escape && !e.repeat && this.mapView) {
            this.toggleMapView();
        }

        if ((e.code === this.keysMap.jump || e.code === this.keysMap.jumpAlt) && !e.repeat) {
            this.inputController.markJumpJustPressed();
        }

        this.inputController.markKeyDown(e.code);
    }

    isPlayerCrouching() {
        return this.playerPostureController.isCrouching(this.player);
    }

    resetGame() {
        // Defer level reload to the start of the next update tick to avoid
        // mutating game state mid-loop (enemies, collectibles, bullets, etc.).
        this.pendingReset = true;
    }

    update(now) {
        // Process deferred reset at the top of the tick before any logic runs
        if (this.pendingReset) {
            this.pendingReset = false;
            this.loadLevel(this.currentLevelId, now);
            this.startLevel(now);
            return;
        }

        // Dismiss level-complete or game-over screen
        if (this.inputController.isDown("escape")) {
            if (this.levelComplete || this.gameOver) {
                this.resetGame();
                return;
            }
        }

        // Freeze game logic while level-complete or game-over screen is shown
        if (this.levelComplete || this.gameOver) {
            return;
        }

        // Player dying — play death animation, then trigger game over
        if (this.player.dying) {
            if (now - this.player.dyingStartedAt >= PLAYER_DYING_DURATION_MS) {
                this.playerHealthController.finishDying(this.player);
                this.gameOver = true;
                this.gameOverAt = now;
                if (this.checkpointManager.getRespawn() !== null) {
                    this.snapshotCheckpointState(now);
                }
            }
            this.updateCamera(now);
            return;
        }

        this.handleInput(now);
        this.applyPhysics();
        this.applyCarryDecay(now);

        this.recordPreviousPosition();

        this.updateElevators(now);

        this.movePlayerX(now);
        this.movePlayerY(now);

        this.updateEnemies(now);
        this.updateSpikesDamage(now);

        this.updateBullets(now);
        this.updateCannons(now);
        this.updateCannonBullets(now);
        this.updateCollectibles(now);
        this.updateCheckpoints(now);
        this.updateTeleports(now);
        this.updateHiddenWalls();
        this.updateExit();
        this.updateMessages(now);
        this.updateArtifactMessage(now);
        this.mapDiscovery?.markFromPlayer(this.player);

        this.updateCamera(now);
        this.updateDamageCooldown(now);
    }

    // Handle keyboard input: movement, crouch, shooting, jump
    handleInput(now) {
        if (this.inputController.consumeJumpBuffer()) {
            this.playerPhysicsController.registerJumpPress(this.player, now);
        }
        if (this.player.frozenForTeleport) {
            return;
        }
        this.handleHorizontalMovementInput(now);
        this.handleCrouchInput();
        this.handleShootingInput(now);
        this.handleJumpInput(now);
        this.handleEnterInput(now);
    }

    handleHorizontalMovementInput(now) {
        this.playerPhysicsController.handleHorizontalMovementInput(now, this.player, {
            inputController: this.inputController,
            isCrouching: () => this.isPlayerCrouching(),
            solids: this.solids,
        });
    }

    handleCrouchInput() {
        this.playerPostureController.handleCrouchInput(
            this.player,
            this.solids,
            this.enemyController.getEnemies(),
            this.inputController,
            this.playerPhysicsController
        );
    }

    applyPosture(posture, anchor = "center") {
        this.playerPostureController.applyPosture(
            this.player,
            posture,
            this.playerPhysicsController,
            anchor
        );
    }

    handleShootingInput(now) {
        this.combatController.handlePlayerShootingInput(
            now,
            this.player,
            this.inputController,
            this.isPlayerCrouching()
        );
    }

    handleJumpInput(now) {
        this.playerPhysicsController.handleJumpInput(now, this.player, {
            isCrouching: () => this.isPlayerCrouching(),
            elevatorController: this.elevatorController,
        });
    }

    handleEnterInput(now) {
        if (this.inputController.isDown("enter")) {
            if (
                this.exitController.playerAtExit &&
                this.hasEnoughCoins &&
                this.hasEnoughSplinters &&
                this.hasEnoughArtifacts
            ) {
                this.levelComplete = true;
                this.levelCompleteAt = now;
                this.playerPhysicsController.stopMovement(this.player);
                this.combatController.stopShooting(this.player);
                this.playerPhysicsController.cancelJumpCut(this.player);
                this.checkpointManager.clear();
                this.galleryController.resetLastIndex();
            }
        }
    }

    // Apply gravity and enforce terminal velocity
    applyPhysics() {
        const jumpHeld =
            this.inputController.isDown("jump") || this.inputController.isDown("jumpAlt");
        this.playerPhysicsController.applyPhysics(this.player, jumpHeld);
    }

    // Decay the carry velocity inherited from a moving elevator
    applyCarryDecay(now) {
        this.playerPhysicsController.applyCarryDecay(now, this.player);
    }

    recordPreviousPosition() {
        this.playerPhysicsController.recordPreviousPosition(this.player);
    }

    // Move player along the X axis and resolve platform collisions
    movePlayerX(now) {
        this.playerPhysicsController.movePlayerX(now, this.player, {
            solids: this.solids,
            worldSize: this.worldSize,
            enemies: this.enemyController.getEnemies(),
            onPlayerHit: (hitNow, e) => this.applyDamageToPlayer(hitNow, e),
        });
    }

    // Move player along the Y axis, resolve platform collisions, and check fall-off
    movePlayerY(now) {
        this.playerPhysicsController.movePlayerY(now, this.player, {
            solids: this.solids,
            worldSize: this.worldSize,
            worldGroundId: this.worldGroundId,
            isCrouching: () => this.isPlayerCrouching(),
            canStandUp: () =>
                this.playerPostureController.canStandUp(
                    this.player,
                    this.solids,
                    this.enemyController.getEnemies()
                ),
            onStandUp: () => this.applyPosture(this.playerPostures.STANDING),
            elevatorController: this.elevatorController,
        });
    }

    // Also used by updateElevators() when the player lands on a moving elevator.
    handlePlatformLanding(platform, now) {
        this.playerPhysicsController.handlePlatformLanding(
            platform,
            now,
            this.player,
            this.elevatorController
        );
    }

    // Also used by updateElevators() when the player lands on a moving elevator.
    handlePlatformLandingResponse(platform) {
        this.playerPhysicsController.handlePlatformLandingResponse(platform, this.player);
    }

    updateElevators(now) {
        this.elevatorController.update(now, {
            player: this.player,
            platforms: this.platforms,
            enemies: this.enemyController.getEnemies(),
            isVisibleInCamera: (obj, margin) => this.cameraController.isVisible(obj, margin),
            onPlatformLanding: (elevator, landingNow) => {
                this.handlePlatformLanding(elevator, landingNow);
                this.handlePlatformLandingResponse(elevator);
            },
            onPlayerHit: (hitNow, enemy) => this.applyDamageToPlayer(hitNow, enemy),
        });
    }

    // Move enemies and check player-enemy collisions
    updateEnemies(now) {
        this.enemyController.update(now, {
            player: this.player,
            solids: this.solids,
            verticalHitRecoilMultiplier: this.verticalHitRecoilMultiplier,
            onPlayerHit: (hitNow, enemy, hitFromAbove, hitFromBelow) =>
                this.applyDamageToPlayer(hitNow, enemy, hitFromAbove, hitFromBelow),
            playerPhysicsController: this.playerPhysicsController,
        });
    }

    applyDamageToPlayer(now, source, hitFromAbove = false, hitFromBelow = false) {
        this.playerHealthController.applyDamage(
            now,
            this.player,
            source,
            hitFromAbove,
            hitFromBelow,
            () => {
                this.deathCount++;
            },
            this.playerPhysicsController,
            this.combatController
        );
    }

    // Gathers the game state CheckpointManager needs but has no direct access to.
    buildCheckpointContext() {
        return {
            currentLevelId: this.currentLevelId,
            player: this.player,
            coins: this.collectibleController.getCoins(),
            splinters: this.collectibleController.getSplinters(),
            artifacts: this.collectibleController.getArtifacts(),
            hearts: this.collectibleController.getHearts(),
            weaponUpgrades: this.collectibleController.getWeaponUpgrades(),
            enemies: this.enemyController.getEnemies(),
            elevators: this.elevatorController.getElevators(),
            messages: this.messageController.getMessages(),
            mapDiscovery: this.mapDiscovery,
            levelStartAt: this.levelStartAt,
            totalPausedTime: this.pauseController.totalPausedTime,
            accumulatedPlayTime: this.accumulatedPlayTime,
            deathCount: this.deathCount,
        };
    }

    snapshotCheckpointState(now) {
        this.checkpointManager.snapshot(now, this.buildCheckpointContext());
    }

    updateSpikesDamage(now) {
        this.combatController.updateSpikesDamage(now, this.player, (now, spike, hitFromAbove) => {
            this.applyDamageToPlayer(now, spike, hitFromAbove);
        });
    }

    // Move bullets, remove out-of-bounds ones, and check bullet-enemy collisions
    updateBullets(now) {
        this.combatController.updateBullets(now, {
            worldSize: this.worldSize,
            enemies: this.enemyController.getEnemies(),
            solids: this.solids,
            onEnemyHit: (hitNow, enemy, damage) => this.applyDamageToEnemy(hitNow, enemy, damage),
        });
    }

    applyDamageToEnemy(now, enemy, damage) {
        this.enemyController.applyDamage(now, enemy, damage);
    }

    // Trigger cannons to shoot based on shootFrequency
    updateCannons(now) {
        this.combatController.updateCannons(now);
    }

    // Move cannon bullets and check collision with player only
    updateCannonBullets(now) {
        this.combatController.updateCannonBullets(now, this.player, (now, bullet) => {
            this.applyDamageToPlayer(now, bullet);
            return this.gameOver;
        });
    }

    // Check player-collectible collisions and mark collected items
    updateCollectibles(now) {
        this.collectibleController.update(now, {
            player: this.player,
            onArtifactMessage: (message, source, msgNow) =>
                this.messageController.showArtifactMessage(message, source, msgNow),
            onWeaponMessage: (message, msgNow) =>
                this.messageController.showWeaponMessage(message, msgNow),
            onWeaponPickup: (weapon) => this.combatController.equipWeapon(this.player, weapon),
            onHeartPickup: () => this.playerHealthController.heal(this.player),
            canHeal: () => this.playerHealthController.canHeal(this.player),
        });
    }

    updateHiddenWalls() {
        this.hiddenWallController.update(this.player);
    }

    resetCameraToPlayerStart() {
        this.cameraController.resetToPlayerStart(this.player, this.worldSize);
    }

    updateCamera(now) {
        if (this.mapView) {
            return;
        }

        this.cameraController.update(now, {
            player: this.player,
            worldSize: this.worldSize,
            elevators: this.elevatorController.getElevators(),
            physics: this.physics,
            isCrouching: this.isPlayerCrouching(),
        });
    }

    updateDamageCooldown(now) {
        this.playerHealthController.updateDamageCooldown(now, this.player);
    }

    drawTitleScreen() {
        const hasSave = CheckpointStorage.load() !== null;
        TitleScreenRenderer.draw(this.ctx, this.canvas, hasSave);
    }

    draw(now = performance.now()) {
        SceneRenderer.draw(this.ctx, this, now);
    }

    // Shared coins/splinters/enemies/artifacts/time stats for the level-complete and game-over screens.
    buildLevelStats(completedAt) {
        const playTimeMs =
            completedAt -
            this.levelStartAt -
            this.pauseController.totalPausedTime +
            this.accumulatedPlayTime;
        return {
            coinsCount: this.player.coinsCount,
            currentLevelCoinsCount: this.currentLevelCoinsCount,
            splintersCount: this.player.splintersCount,
            currentLevelSplintersCount: this.currentLevelSplintersCount,
            enemiesDefeated: this.enemyController.getEnemies().filter((e) => e.dead || e.dying)
                .length,
            currentLevelEnemiesCount: this.currentLevelEnemiesCount,
            playTimeMs,
            deathCount: this.deathCount,
            artifactsCount: this.player.artifactsCount,
            currentLevelArtifactsCount: this.currentLevelArtifactsCount,
        };
    }

    drawLevelComplete() {
        const stats = this.buildLevelStats(this.levelCompleteAt);
        DefaultLevelCompleteRenderer.draw(
            this.ctx,
            this.canvas,
            stats.coinsCount,
            stats.currentLevelCoinsCount,
            stats.splintersCount,
            stats.currentLevelSplintersCount,
            stats.enemiesDefeated,
            stats.currentLevelEnemiesCount,
            stats.playTimeMs,
            stats.deathCount,
            stats.artifactsCount,
            stats.currentLevelArtifactsCount
        );
    }

    drawGameOver(now) {
        const elapsed = now - this.gameOverAt;
        const remaining = Math.max(0, Math.ceil((this.gameOverDelay - elapsed) / 1000));
        const stats = this.buildLevelStats(this.gameOverAt);

        DefaultGameOverRenderer.draw(
            this.ctx,
            this.canvas,
            stats.coinsCount,
            stats.currentLevelCoinsCount,
            stats.splintersCount,
            stats.currentLevelSplintersCount,
            stats.enemiesDefeated,
            stats.currentLevelEnemiesCount,
            remaining,
            stats.playTimeMs,
            stats.deathCount,
            stats.artifactsCount,
            stats.currentLevelArtifactsCount
        );
    }

    getCurrentPlayTimeMs() {
        return (
            this.simulatedTime -
            this.levelStartAt -
            this.pauseController.totalPausedTime +
            this.accumulatedPlayTime
        );
    }

    updateExit() {
        this.exitController.update(this.player);
    }

    updateArtifactMessage(now) {
        this.messageController.updateArtifactMessage(now);
    }

    updateMessages(now) {
        this.messageController.updateMessages(now, this.player);
    }

    updateCheckpoints(now) {
        this.checkpointManager.checkForNewlyReached(
            now,
            this.player,
            this.buildCheckpointContext()
        );
    }

    updateTeleports(now) {
        this.teleportController.update(now, this.player, this.playerPhysicsController);
    }

    updateDebug() {
        DebugHudRenderer.update(this.canvas, this.showDebug, this.debug, this.player, this.mouse);
    }

    // Mouse-move debug refresh only matters while the game loop itself isn't already updating it.
    updateDebugIfStopped() {
        if (!this.isRunning) {
            this.updateDebug();
        }
    }

    drawGameFadeIn(now) {
        const elapsed = now - this.gameFadeIn.startTime;
        const progress = Math.min(elapsed / this.gameFadeIn.duration, 1);
        TransitionRenderer.drawFadeIn(this.ctx, this.canvas, progress);
        if (progress >= 1) {
            this.gameFadeIn.active = false;
        }
    }

    loopTitleScreen(now) {
        this.drawTitleScreen();
        const fade = this.titleScreenController.update(now);
        if (fade) {
            TransitionRenderer.drawFadeOut(this.ctx, this.canvas, fade.progress);
            if (fade.justFinished) {
                this.levelStartAt = now;
                this.pauseController.totalPausedTime = 0;
                this.accumulatedPlayTime = this.checkpointManager.getRespawn()?.playTimeMs ?? 0;
                this.startLevel(now);
            }
        }
    }

    loop(now) {
        if (!this.isRunning) {
            return;
        }

        if (this.titleScreenController.active) {
            this.loopTitleScreen(now);
            window.requestAnimationFrame(this.loop);
            return;
        }

        let frameTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        if (frameTime > this.gameLoop.maxFrameTime) {
            frameTime = this.gameLoop.maxFrameTime;
        }

        this.accumulator += frameTime;

        while (this.accumulator >= this.gameLoop.fixedDt) {
            this.update(this.simulatedTime);
            this.simulatedTime += this.gameLoop.fixedDt * 1000;
            this.accumulator -= this.gameLoop.fixedDt;
        }

        this.draw(this.simulatedTime);
        this.updateDebug();

        if (this.gameFadeIn.active) {
            this.drawGameFadeIn(now);
        }

        if (this.gameOver && this.simulatedTime - this.gameOverAt >= this.gameOverDelay) {
            this.resetGame();
        }

        window.requestAnimationFrame(this.loop);
    }

    start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.lastTime = performance.now() - this.gameLoop.fixedDt * 1000;
        window.requestAnimationFrame(this.loop);
    }

    stop() {
        this.isRunning = false;
    }

    handlePauseMenuKey(code) {
        switch (code) {
            case this.keysMap.menuUp:
            case this.keysMap.menuDown: {
                const count = MENU_ITEMS.length;
                const dir = code === this.keysMap.menuUp ? -1 : 1;
                this.pauseController.moveMenuIndex(dir, count);
                DefaultPauseRenderer.drawPausePanel(
                    this.ctx,
                    this.canvas,
                    this.pauseController.menuIndex,
                    this.getCurrentPlayTimeMs()
                );
                break;
            }
            case this.keysMap.menuConfirm:
            case this.keysMap.menuConfirmAlt:
                this.confirmPauseMenuItem();
                break;
            case this.keysMap.escape:
            case this.keysMap.pause:
                this.closePauseMenu();
                break;
        }
    }

    openPauseMenu() {
        this.stop();
        this.pauseController.open(performance.now());
        this.draw(this.simulatedTime);
        DefaultPauseRenderer.drawPauseScreen(
            this.ctx,
            this.canvas,
            this.pauseController.menuIndex,
            this.getCurrentPlayTimeMs()
        );
    }

    resumeFromPause() {
        const pauseDuration = this.pauseController.endFreeze(performance.now());

        this.pauseController.adjustPlayerTimers(this.player, pauseDuration);
        this.messageController.adjustForPause(pauseDuration);
        this.combatController.adjustForPause(pauseDuration);
        this.elevatorController.adjustForPause(pauseDuration);
        this.enemyController.adjustForPause(pauseDuration);
        this.teleportController.adjustForPause(pauseDuration);
        adjustAnimStartTime(pauseDuration);
        this.simulatedTime += pauseDuration;
        if (this.gameFadeIn.active) {
            this.gameFadeIn.startTime += pauseDuration;
        }
    }

    closePauseMenu() {
        this.pauseController.close();
        this.resumeFromPause();
        this.start();
    }

    confirmPauseMenuItem() {
        const action = this.pauseController.menuIndex;

        if (action === PAUSE_MENU_ACTION.RESUME) {
            this.closePauseMenu();
            return;
        }

        if (action === PAUSE_MENU_ACTION.GALLERY) {
            // Artifact gallery — account for pause time, then open gallery
            this.pauseController.close();
            this.resumeFromPause();
            this.openArtifactGallery();
            return;
        }

        this.pauseController.close();
        this.pauseController.resetClock();
        this.levelStartAt = performance.now();

        if (action === PAUSE_MENU_ACTION.RESET_PROGRESS) {
            this.resetProgress();
        } else if (action === PAUSE_MENU_ACTION.RETURN_TO_TITLE) {
            this.returnToTitleScreen();
        }

        this.loadLevel(this.currentLevelId);
        this.startLevel(performance.now());
        this.start();
    }

    resetProgress() {
        this.checkpointManager.clear();
        this.deathCount = 0;
        this.accumulatedPlayTime = 0;
        this.galleryController.resetLastIndex();
    }

    returnToTitleScreen() {
        const cr = this.checkpointManager.getRespawn();
        this.accumulatedPlayTime = cr?.playTimeMs ?? 0;
        this.deathCount = cr?.deathCount ?? 0;
        this.titleScreenController.active = true;
    }

    toggleMapView() {
        if (!this.mapView) {
            this.mapView = true;
            this.stop();
            this.pauseController.beginFreeze(performance.now());
            this.draw(this.simulatedTime);
        } else {
            this.resumeFromPause();
            this.mapView = false;
            this.start();
        }
    }

    openArtifactGallery() {
        this.galleryController.activate();
        this.pauseController.beginFreeze(performance.now());
        this.stop();
        this.draw(this.simulatedTime);
        this.galleryController.present(this.canvas, this.collectibleController.getArtifacts());
        this.drawGallery();
    }

    drawGallery() {
        this.galleryController.draw(this.ctx, this.canvas, performance.now());
    }

    // Burst RAF — runs only while the carousel is sliding (~150ms), then stops.
    animateGallery() {
        this.drawGallery();
        if (this.galleryController.isAnimating()) {
            requestAnimationFrame(() => this.animateGallery());
        }
    }

    closeArtifactGallery() {
        this.galleryController.deactivate();
        this.resumeFromPause();
        this.lastTime = performance.now();
        this.start();
    }
}
