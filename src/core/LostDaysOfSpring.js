import { LEVELS } from "../levels/levelsConfig.js";
import { GameFactory } from "../factories/GameFactory.js";
import { CameraController } from "../systems/CameraController.js";
import {
    DefaultPlayerRenderer,
    adjustAnimStartTime,
    PLAYER_DYING_DURATION_MS,
} from "../renderers/PlayerRenderers.js";
import { DefaultPlatformRenderer } from "../renderers/PlatformRenderers.js";
import { DefaultEnemyRenderer } from "../renderers/EnemyRenderers.js";
import { DefaultWorldRenderer } from "../renderers/WorldRenderers.js";
import { DefaultPauseRenderer } from "../renderers/PauseRenderers.js";
import { DefaultCollectibleRenderer } from "../renderers/CollectibleRenderers.js";
import { DefaultWeaponRenderer } from "../renderers/WeaponRenderers.js";
import { DebugHudRenderer } from "../renderers/DebugRenderers.js";
import { SceneRenderer } from "../renderers/SceneRenderer.js";
import { DefaultHubRenderer } from "../renderers/HudRenderers.js";
import { DefaultLevelCompleteRenderer } from "../renderers/LevelCompleteRenderers.js";
import { DefaultGameOverRenderer } from "../renderers/GameOverRenderer.js";
import { DefaultSpikeRenderer } from "../renderers/SpikeRenderers.js";
import { CheckpointRenderer } from "../renderers/CheckpointRenderer.js";
import { DefaultExitRenderer } from "../renderers/ExitRenderers.js";
import { MessageRenderer } from "../renderers/MessageRenderer.js";
import { CannonRenderer, CannonBulletRenderer } from "../renderers/CannonRenderers.js";
import { getExitLevelLines } from "../messages.js";
import { CheckpointStorage } from "../services/CheckpointStorage.js";
import { CheckpointManager } from "../systems/CheckpointManager.js";
import { PauseController } from "../systems/PauseController.js";
import { ExitController } from "../systems/ExitController.js";
import { TitleScreenController } from "../systems/TitleScreenController.js";
import { ArtifactGalleryController } from "../systems/ArtifactGalleryController.js";
import { TeleportController } from "../systems/TeleportController.js";
import { ProjectileController } from "../systems/ProjectileController.js";
import { ElevatorController } from "../systems/ElevatorController.js";
import { EnemyController } from "../systems/EnemyController.js";
import { CollectibleController } from "../systems/CollectibleController.js";
import { MessageController } from "../systems/MessageController.js";
import { PlayerPhysicsController } from "../systems/PlayerPhysicsController.js";
import { PlayerPostureController } from "../systems/PlayerPostureController.js";
import { PlayerHealthController } from "../systems/PlayerHealthController.js";
import { LevelLoader } from "../services/LevelLoader.js";
import { rectsCollide } from "../utils/collision.js";
import { InputController } from "../systems/InputController.js";
import { KEYS_MAP } from "../config/keysMap.js";
import { PHYSICS } from "../config/physics.js";
import { DisplayController } from "../systems/DisplayController.js";
import { DebugMouseTracker } from "../systems/DebugMouseTracker.js";
import { TitleScreenRenderer } from "../renderers/TitleScreenRenderer.js";
import { TransitionRenderer } from "../renderers/TransitionRenderer.js";
import { ArtifactGalleryRenderer } from "../renderers/ArtifactGalleryRenderer.js";
import {
    MapPlayerRenderer,
    MapPlatformRenderer,
    MapEnemyRenderer,
    MapCoinRenderer,
    MapSplinterRenderer,
    MapArtifactRenderer,
    MapHeartRenderer,
    MapCannonRenderer,
    MapSpikeRenderer,
    MapCheckpointRenderer,
    MapExitRenderer,
    NOOP_RENDERER,
} from "../renderers/MapRenderers.js";

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
        this.projectileController = new ProjectileController();

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

        // Default player drawing method assigned via Strategy pattern
        this.playerRenderer = DefaultPlayerRenderer;
        this.platformRenderer = DefaultPlatformRenderer;
        this.enemyRenderer = DefaultEnemyRenderer;
        this.collectibleRenderer = DefaultCollectibleRenderer;
        this.worldRenderer = DefaultWorldRenderer;
        this.pauseRenderer = DefaultPauseRenderer;
        this.weaponRenderer = DefaultWeaponRenderer;
        this.hudRenderer = DefaultHubRenderer;
        this.levelCompleteRenderer = DefaultLevelCompleteRenderer;
        this.gameOverRenderer = DefaultGameOverRenderer;
        this.spikeRenderer = DefaultSpikeRenderer;
        this.checkpointRenderer = CheckpointRenderer;
        this.exitRenderer = DefaultExitRenderer;
        this.messageRenderer = MessageRenderer;
        this.cannonRenderer = CannonRenderer;
        this.cannonBulletRenderer = CannonBulletRenderer;
        this.titleScreenRenderer = TitleScreenRenderer;
        this.transitionRenderer = TransitionRenderer;
        this.mapPlayerRenderer = MapPlayerRenderer;
        this.mapPlatformRenderer = MapPlatformRenderer;
        this.mapEnemyRenderer = MapEnemyRenderer;
        this.mapCoinRenderer = MapCoinRenderer;
        this.mapSplinterRenderer = MapSplinterRenderer;
        this.mapArtifactRenderer = MapArtifactRenderer;
        this.mapHeartRenderer = MapHeartRenderer;
        this.mapCannonRenderer = MapCannonRenderer;
        this.mapSpikeRenderer = MapSpikeRenderer;
        this.mapCheckpointRenderer = MapCheckpointRenderer;
        this.mapExitRenderer = MapExitRenderer;
        this.galleryController = new ArtifactGalleryController(new ArtifactGalleryRenderer());
        this.sceneRenderer = SceneRenderer;

        this.lastTime = performance.now();
        this.accumulator = 0;
        this.simulatedTime = 0; // independent simulation clock, advanced by fixedDt per step
        this.loop = this.loop.bind(this);
        this.isRunning = false;

        this.mouse = new DebugMouseTracker(this.canvas, () => this.cameraController.camera);
        if (this.showDebug) {
            this.mouse.attach(() => {
                if (!this.isRunning) {
                    this.updateDebug();
                }
            });
        }
        this.inputHandlers = {
            title: (e) => this.handleTitleScreenKeyDown(e),
            gallery: (e) => this.handleGalleryKeyDown(e),
            pause: (e) => this.handlePauseMenuKey(e.code),
            gameplay: (e) => this.handleGameplayKeyDown(e),
        };
        this.initControls();

        this.decorateDrawMethods();

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

    decorateDrawMethods() {
        this.drawPlatform = this.withCameraCulling(this.drawPlatform);
        this.drawElevator = this.withCameraCulling(this.drawElevator);
        this.drawEnemy = this.withCameraCulling(this.drawEnemy);
        this.drawCoin = this.withCameraCulling(this.drawCoin);
        this.drawSplinter = this.withCameraCulling(this.drawSplinter);
        this.drawArtifact = this.withCameraCulling(this.drawArtifact);
        this.drawWeaponUpgrade = this.withCameraCulling(this.drawWeaponUpgrade);
        this.drawBullet = this.withCameraCulling(this.drawBullet);
        this.drawCannon = this.withCameraCulling(this.drawCannon);
        this.drawCannonBullet = this.withCameraCulling(this.drawCannonBullet);
        this.drawEnvPreBackgroundItem = this.withCameraCulling(this.drawEnvPreBackgroundItem);
        this.drawEnvBackgroundItem = this.withCameraCulling(this.drawEnvBackgroundItem);
        this.drawEnvForegroundItem = this.withCameraCulling(this.drawEnvForegroundItem);
        this.drawSpike = this.withCameraCulling(this.drawSpike);
        this.drawHeart = this.withCameraCulling(this.drawHeart);
        this.drawHiddenWall = this.withCameraCulling(this.drawHiddenWall);
        this.drawExit = this.withCameraCulling(this.drawExit);
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
            projectileController: this.projectileController,
            messageController: this.messageController,
            exitController: this.exitController,
            teleportController: this.teleportController,
            checkpointManager: this.checkpointManager,
        });
        this.worldSize = loaded.worldSize;
        this.mapDiscovery = loaded.mapDiscovery;
        this.platforms = loaded.platforms;
        this.solids = loaded.solids;
        this.hiddenWalls = loaded.hiddenWalls;
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
        this.projectileController.resetBullets();

        // Reset cannon bullets
        this.projectileController.resetCannonBullets();

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
        this.projectileController.resetCannonTimers(now);
    }

    resetPlayerProperties(levelData) {
        const cr = this.checkpointManager.getRespawn();
        const respawnX = cr?.x ?? levelData?.playerStart?.x ?? 0;
        const respawnY = cr?.y ?? levelData?.playerStart?.y ?? 0;

        Object.assign(
            this.player,
            GameFactory.playerRespawnState({
                x: respawnX,
                y: respawnY,
                h: this.player.originalHeight,
                w: this.player.originalWidth,
                life: this.player.maxLife,
                posture: this.playerPostures.STANDING,
                weapon: cr?.weapon ?? GameFactory.weapon(),
                coinsCount: cr?.coinsCount ?? 0,
                splintersCount: cr?.splintersCount ?? 0,
                artifactsCount: cr?.artifactsCount ?? 0,
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
                this.mouse.attach(() => {
                    if (!this.isRunning) {
                        this.updateDebug();
                    }
                });
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

    findCrouchAnchor() {
        return this.playerPostureController.findCrouchAnchor(
            this.player,
            this.solids,
            this.enemyController.getEnemies()
        );
    }

    canStandUp() {
        return this.playerPostureController.canStandUp(
            this.player,
            this.solids,
            this.enemyController.getEnemies()
        );
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
                this.player.dying = false;
                this.player.dead = true;
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

        this.player.prevX = this.player.x;
        this.player.prevY = this.player.y;

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
            this.player.jumpPressedAt = now;
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
        if (now < this.player.knockbackUntil) {
            return;
        }

        let targetVx = 0;

        const speed = this.isPlayerCrouching() ? this.player.crouchSpeed : this.player.speed;

        if (this.inputController.isDown("left") && !this.inputController.isDown("right")) {
            targetVx = -speed;
            this.player.facing = "left";
        } else if (this.inputController.isDown("right") && !this.inputController.isDown("left")) {
            targetVx = speed;
            this.player.facing = "right";
        }

        this.player.movingByInput = targetVx !== 0;

        this.playerPhysicsController.applyHorizontalMovement(this.player, targetVx, this.solids);
    }

    handleCrouchInput() {
        if (
            (this.inputController.isDown("crouchAlt") || this.inputController.isDown("crouch")) &&
            !this.player.airborne
        ) {
            if (!this.isPlayerCrouching()) {
                const anchor = this.findCrouchAnchor();
                if (anchor !== null) {
                    this.applyPosture(this.playerPostures.CROUCH, anchor);
                }
            }
        } else if (this.isPlayerCrouching() && this.canStandUp()) {
            this.applyPosture(this.playerPostures.STANDING);
        }
    }

    applyPosture(posture, anchor = "center") {
        this.playerPostureController.applyPosture(this.player, posture, anchor);
    }

    handleShootingInput(now) {
        const customShootingOffsetY = this.isPlayerCrouching()
            ? this.player.shootingCrouchOffsetY
            : this.player.shootingOffsetY;
        const customShootingOffsetX = this.isPlayerCrouching()
            ? this.player.shootingCrouchOffsetX
            : this.player.shootingOffsetX;
        if (this.inputController.isDown("shoot") || this.inputController.isDown("shootAlt")) {
            this.player.shooting = true;
            if (now - this.player.lastShootTime > this.player.weapon.shootFrequency) {
                const bulletVx =
                    this.player.facing === "left"
                        ? -this.player.weapon.speed
                        : this.player.weapon.speed;
                this.projectileController.spawnBullet({
                    ...this.player.weapon.ammo,
                    color: this.player.weapon.color,
                    x:
                        this.player.facing === "left"
                            ? this.player.x - customShootingOffsetX
                            : this.player.x +
                              this.player.w -
                              this.player.weapon.ammo.w +
                              customShootingOffsetX,
                    y: this.player.y + this.player.h / 2 + customShootingOffsetY,
                    vx: bulletVx,
                });
                this.player.lastShootTime = now;
            }
        } else {
            this.player.shooting = false;
        }
    }

    handleJumpInput(now) {
        if (this.isPlayerCrouching()) {
            return;
        }
        if (now < this.player.knockbackUntil) {
            return;
        }
        const jumpBuffered = now - this.player.jumpPressedAt <= this.player.jumpBufferDuration;

        const isOnBooster = this.player.onGroundType === "booster";
        const leftBoosterRecently = this.player.lastGroundType === "booster";

        const hasCoyoteTime =
            now - this.player.lastGroundedAt <= this.player.coyoteDuration && !leftBoosterRecently;

        const canGroundJump = !isOnBooster && (!this.player.airborne || hasCoyoteTime);

        if (jumpBuffered && canGroundJump) {
            this.player.vy = -this.player.jump;

            this.handleElevatorJump(now);

            this.player.airborne = true;
            this.player.lastGroundedAt = 0;
            this.player.onGroundId = null;
            this.player.onGroundType = null;
            this.player.jumpPressedByUser = true;
            this.player.jumpPressedAt = 0;
        }
    }

    handleElevatorJump(now) {
        if (this.player.onGroundType === "elevator") {
            const elev = this.elevatorController.findById(this.player.onGroundId);
            this.playerPhysicsController.applyElevatorJumpBoost(now, this.player, elev);
        }
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
                this.player.vx = 0;
                this.player.vy = 0;
                this.player.shooting = false;
                this.player.jumpPressedByUser = false;
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
            canStandUp: () => this.canStandUp(),
            onStandUp: () => this.applyPosture(this.playerPostures.STANDING),
        });
    }

    // Also used by updateElevators() when the player lands on a moving elevator.
    handlePlatformLanding(platform, now) {
        this.playerPhysicsController.handlePlatformLanding(platform, now, this.player);
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
            }
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
        this.projectileController.updateSpikesDamage(
            now,
            this.player,
            (now, spike, hitFromAbove) => {
                this.applyDamageToPlayer(now, spike, hitFromAbove);
            }
        );
    }

    // Move bullets, remove out-of-bounds ones, and check bullet-enemy collisions
    updateBullets(now) {
        this.projectileController.updateBullets(now, {
            worldSize: this.worldSize,
            enemies: this.enemyController.getEnemies(),
            solids: this.solids,
        });
    }

    // Trigger cannons to shoot based on shootFrequency
    updateCannons(now) {
        this.projectileController.updateCannons(now);
    }

    // Move cannon bullets and check collision with player only
    updateCannonBullets(now) {
        this.projectileController.updateCannonBullets(now, this.player, (now, bullet) => {
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
        });
    }

    updateHiddenWalls() {
        for (const wall of this.hiddenWalls) {
            wall.entered = rectsCollide(this.player, wall);
        }
    }

    withCameraCulling(drawFn) {
        return (obj, ...args) => {
            if (this.mapView) {
                drawFn.call(this, obj, ...args);
                return;
            }

            if (!this.cameraController.isVisible(obj)) {
                return;
            }

            drawFn.call(this, obj, ...args);
        };
    }

    renderByMode(obj, mapRenderer, normalDrawFn) {
        if (this.mapView) {
            mapRenderer.draw(this.ctx, obj, this.showDebug);
            return;
        }
        normalDrawFn();
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

    drawPlayer(now) {
        this.renderByMode(this.player, this.mapPlayerRenderer, () =>
            this.playerRenderer.draw(this.ctx, this.player, this.showDebug, now)
        );
    }

    drawPlatform(p) {
        this.renderByMode(p, this.mapPlatformRenderer, () =>
            this.platformRenderer.draw(this.ctx, p, this.showDebug, this.cameraController.camera)
        );
    }

    drawElevator(e) {
        this.renderByMode(e, this.mapPlatformRenderer, () =>
            this.platformRenderer.draw(this.ctx, e, this.showDebug, this.cameraController.camera)
        );
    }

    drawHiddenWall(w) {
        this.renderByMode(w, this.mapPlatformRenderer, () =>
            this.platformRenderer.drawHiddenWall(
                this.ctx,
                w,
                this.showDebug,
                this.cameraController.camera
            )
        );
    }

    drawEnemy(e, now) {
        this.renderByMode(e, this.mapEnemyRenderer, () =>
            this.enemyRenderer.draw(this.ctx, e, e.sprite, this.showDebug, now, this.player)
        );
    }

    drawCoin(c) {
        this.renderByMode(c, this.mapCoinRenderer, () =>
            this.collectibleRenderer.drawCoin(this.ctx, c, this.showDebug)
        );
    }

    drawSplinter(s, now) {
        this.renderByMode(s, this.mapSplinterRenderer, () =>
            this.collectibleRenderer.drawSplinter(this.ctx, s, this.showDebug, now)
        );
    }

    drawArtifact(a, now) {
        this.renderByMode(a, this.mapArtifactRenderer, () =>
            this.collectibleRenderer.drawArtifact(this.ctx, a, this.showDebug, now)
        );
    }

    drawHeart(s, now) {
        this.renderByMode(s, this.mapHeartRenderer, () =>
            this.collectibleRenderer.drawHeart(this.ctx, s, this.showDebug, now)
        );
    }

    drawWeaponUpgrade(s, now) {
        this.renderByMode(s, NOOP_RENDERER, () =>
            this.collectibleRenderer.drawWeaponUpgrade(this.ctx, s, this.showDebug, now)
        );
    }

    drawBullet(b) {
        this.weaponRenderer.draw(this.ctx, b);
    }

    drawCannon(cannon) {
        this.renderByMode(cannon, this.mapCannonRenderer, () =>
            this.cannonRenderer.draw(this.ctx, cannon, this.showDebug)
        );
    }

    drawCannonBullet(b) {
        this.cannonBulletRenderer.draw(this.ctx, b);
    }

    drawSpike(spike) {
        this.renderByMode(spike, this.mapSpikeRenderer, () =>
            this.spikeRenderer.draw(this.ctx, spike, this.showDebug)
        );
    }

    drawEnvPreBackgroundItem(i) {
        this.renderByMode(i, NOOP_RENDERER, () =>
            this.worldRenderer.drawEnvironmentItem(this.ctx, i)
        );
    }

    drawEnvBackgroundItem(i) {
        this.renderByMode(i, NOOP_RENDERER, () =>
            this.worldRenderer.drawEnvironmentItem(this.ctx, i)
        );
    }

    drawEnvParallaxItem(i) {
        this.renderByMode(i, NOOP_RENDERER, () =>
            this.worldRenderer.drawParallaxEnvironmentItem(
                this.ctx,
                i,
                this.cameraController.camera
            )
        );
    }

    drawTitleScreen() {
        const hasSave = CheckpointStorage.load() !== null;
        this.titleScreenRenderer.draw(this.ctx, this.canvas, hasSave);
    }

    drawWorld() {
        this.worldRenderer.drawBackground(this.ctx, this.canvas, this.cameraController.camera);
    }

    drawEnvForegroundItem(i) {
        this.renderByMode(i, NOOP_RENDERER, () =>
            this.worldRenderer.drawEnvironmentItem(this.ctx, i)
        );
    }

    draw(now = performance.now()) {
        this.sceneRenderer.draw(this.ctx, this, now);
    }

    drawLevelComplete() {
        const playTimeMs =
            this.levelCompleteAt -
            this.levelStartAt -
            this.pauseController.totalPausedTime +
            this.accumulatedPlayTime;
        this.levelCompleteRenderer.drawLevelCompleteScreen(
            this.ctx,
            this.canvas,
            this.player.coinsCount,
            this.currentLevelCoinsCount,
            this.player.splintersCount,
            this.currentLevelSplintersCount,
            this.enemyController.getEnemies().filter((e) => e.dead || e.dying).length,
            this.currentLevelEnemiesCount,
            playTimeMs,
            this.deathCount,
            this.player.artifactsCount,
            this.currentLevelArtifactsCount
        );
    }

    drawGameOver(now) {
        const elapsed = now - this.gameOverAt;
        const remaining = Math.max(0, Math.ceil((this.gameOverDelay - elapsed) / 1000));
        const playTimeMs =
            this.gameOverAt -
            this.levelStartAt -
            this.pauseController.totalPausedTime +
            this.accumulatedPlayTime;

        this.gameOverRenderer.drawGameOverScreen(
            this.ctx,
            this.canvas,
            this.player.coinsCount,
            this.currentLevelCoinsCount,
            this.player.splintersCount,
            this.currentLevelSplintersCount,
            this.enemyController.getEnemies().filter((e) => e.dead || e.dying).length,
            this.currentLevelEnemiesCount,
            remaining,
            playTimeMs,
            this.deathCount,
            this.player.artifactsCount,
            this.currentLevelArtifactsCount
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
        this.teleportController.update(now, this.player);
    }

    drawCheckpointIndicator(cp) {
        this.renderByMode(cp, this.mapCheckpointRenderer, () =>
            this.checkpointRenderer.draw(this.ctx, cp, this.showDebug)
        );
    }

    drawExit(exit) {
        this.renderByMode(exit, this.mapExitRenderer, () =>
            this.exitRenderer.draw(this.ctx, exit, this.showDebug)
        );
    }

    drawExitMessage() {
        const exit = this.exitController.findActiveExit(this.player);
        if (!exit) {
            return;
        }
        const anchorX = exit.x - this.cameraController.camera.x + exit.dw / 2;
        const anchorY = exit.y - this.cameraController.camera.y + exit.dh / 2;
        const lines = getExitLevelLines(
            this.hasEnoughCoins,
            this.hasEnoughSplinters,
            this.hasEnoughArtifacts
        );
        MessageRenderer.drawPanel(this.ctx, { lines }, anchorX, anchorY);
    }

    updateDebug() {
        DebugHudRenderer.update(this.canvas, this.showDebug, this.debug, this.player, this.mouse);
    }

    drawGameFadeIn(now) {
        const elapsed = now - this.gameFadeIn.startTime;
        const progress = Math.min(elapsed / this.gameFadeIn.duration, 1);
        this.transitionRenderer.drawFadeIn(this.ctx, this.canvas, progress);
        if (progress >= 1) {
            this.gameFadeIn.active = false;
        }
    }

    loopTitleScreen(now) {
        this.drawTitleScreen();
        const fade = this.titleScreenController.update(now);
        if (fade) {
            this.transitionRenderer.drawFadeOut(this.ctx, this.canvas, fade.progress);
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
                const count = this.pauseRenderer.menuItemCount;
                const dir = code === this.keysMap.menuUp ? -1 : 1;
                this.pauseController.moveMenuIndex(dir, count);
                this.pauseRenderer.drawPausePanel(
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
        this.pauseRenderer.drawPauseScreen(
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
        this.projectileController.adjustForPause(pauseDuration);
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
        if (this.pauseController.menuIndex === 0) {
            this.closePauseMenu();
            return;
        }

        if (this.pauseController.menuIndex === 1) {
            // Artifact gallery — account for pause time, then open gallery
            this.pauseController.close();
            this.resumeFromPause();
            this.openArtifactGallery();
            return;
        }

        this.pauseController.close();
        this.pauseController.resetClock();
        this.levelStartAt = performance.now();

        if (this.pauseController.menuIndex === 2) {
            // Reset progress — clear all saves
            this.checkpointManager.clear();
            this.deathCount = 0;
            this.accumulatedPlayTime = 0;
            this.galleryController.resetLastIndex();
        } else if (this.pauseController.menuIndex === 3) {
            // Return to main screen — restore time and deaths from checkpoint
            const cr = this.checkpointManager.getRespawn();
            this.accumulatedPlayTime = cr?.playTimeMs ?? 0;
            this.deathCount = cr?.deathCount ?? 0;
            this.titleScreenController.active = true;
        }

        this.loadLevel(this.currentLevelId);
        this.startLevel(performance.now());
        this.start();
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
        this.galleryController.captureFrame(this.canvas);
        this.galleryController.openGallery(this.collectibleController.getArtifacts());
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
