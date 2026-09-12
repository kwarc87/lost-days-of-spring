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
import {
    DebugGridRenderer,
    DebugHudRenderer,
} from "../renderers/DebugRenderers.js";
import { DefaultHubRenderer } from "../renderers/HudRenderers.js";
import { DefaultLevelCompleteRenderer } from "../renderers/LevelCompleteRenderers.js";
import { DefaultGameOverRenderer } from "../renderers/GameOverRenderer.js";
import { DefaultSpikeRenderer } from "../renderers/SpikeRenderers.js";
import { CheckpointRenderer } from "../renderers/CheckpointRenderer.js";
import { DefaultExitRenderer } from "../renderers/ExitRenderers.js";
import { MessageRenderer } from "../renderers/MessageRenderer.js";
import {
    CannonRenderer,
    CannonBulletRenderer,
} from "../renderers/CannonRenderers.js";
import { getExitLevelLines } from "../messages.js";
import { CheckpointStorage } from "../services/CheckpointStorage.js";
import { CheckpointManager } from "../systems/CheckpointManager.js";
import { TeleportController } from "../systems/TeleportController.js";
import { ProjectileController } from "../systems/ProjectileController.js";
import { ElevatorController } from "../systems/ElevatorController.js";
import { EnemyController } from "../systems/EnemyController.js";
import { MessageController } from "../systems/MessageController.js";
import { MapDiscovery } from "../services/MapDiscovery.js";
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
        this.deathCount = 0;
        this.mapView = false;
        this.isPaused = false;
        this.pauseMenuIndex = 0; // 0 = Resume, 1 = Restart
        this.levelComplete = false;
        this.gameOver = false;
        this.isTitleScreen = true;
        this.titleFadeOut = {
            active: false,
            pending: false,
            startTime: 0,
            duration: 750,
        };
        this.gameFadeIn = { active: false, startTime: 0, duration: 750 };
        this.levelCompleteAt = 0; // timestamp (ms) when level was completed
        this.gameOverAt = 0; // timestamp (ms) when game over occurred
        this.levelStartAt = 0; // timestamp (ms) when the level was loaded
        this.totalPausedTime = 0; // accumulated paused time (ms) within current level
        this.accumulatedPlayTime = 0; // play time (ms) carried over from previous sessions via checkpoint
        this.pauseStartAt = 0; // timestamp (ms) when the current pause started
        this.gameOverDelay = 15000; // ms until auto-restart after game over
        this.worldGroundId = "world-ground";
        this.verticalHitRecoilMultiplier = 1.5;
        this.mapDiscovery = null;
        this.isArtifactGallery = false;
        this.frozenFrame = null; // offscreen canvas reused for frozen-world overlays
        this.galleryLastIndex = 0; // remembers carousel position between gallery openings within a run

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

        // ====== MESSAGES ======
        this.messageController = new MessageController();

        // ====== TELEPORTS ======
        this.teleportController = new TeleportController();

        // ====== CAMERA ======
        this.cameraController = new CameraController(
            this.canvas.width,
            this.canvas.height,
        );
        this.displayController = new DisplayController(
            this.canvas,
            this.cameraController,
        );

        // ====== PHYSICS ======
        this.physics = PHYSICS;

        // ====== POSTURES ======
        this.playerPostures = {
            STANDING: "standing",
            CROUCH: "crouch",
        };

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
        this.artifactGallery = new ArtifactGalleryRenderer();

        this.lastTime = performance.now();
        this.accumulator = 0;
        this.simulatedTime = 0; // independent simulation clock, advanced by fixedDt per step
        this.loop = this.loop.bind(this);
        this.isRunning = false;

        this.mouse = new DebugMouseTracker(this.canvas, () => this.getCamera());
        if (this.showDebug) {
            this.attachMouseTracking(() => {
                if (!this.isRunning) {
                    this.updateDebug();
                }
            });
        }
        this.initControls();

        this.decorateDrawMethods();

        this.displayController.resizeCanvasToFit();
        this.displayController.attach();
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
        this.drawEnvPreBackgroundItem = this.withCameraCulling(
            this.drawEnvPreBackgroundItem,
        );
        this.drawEnvBackgroundItem = this.withCameraCulling(
            this.drawEnvBackgroundItem,
        );
        this.drawEnvForegroundItem = this.withCameraCulling(
            this.drawEnvForegroundItem,
        );
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
            this.clearCheckpoint();
        }

        // On first load or page reload, restore checkpoint from localStorage
        if (this.loadSavedCheckpoint(levelId)) {
            this.galleryLastIndex = 0;
        }

        // Reset death counter only when completing a level (starting fresh).
        // Otherwise restore from checkpoint so it survives page refreshes,
        // matching the same behaviour as accumulatedPlayTime.
        if (this.levelComplete) {
            this.deathCount = 0;
        } else {
            this.deathCount =
                this.getCheckpointRespawn()?.deathCount ?? this.deathCount;
        }

        this.currentLevelId = levelId;

        // Generate a fresh instance of the level data
        const levelData = LEVELS[levelId]();

        this.worldSize = levelData.worldSize;
        this.mapDiscovery = new MapDiscovery(
            this.worldSize,
            GameFactory.GRID * 3,
        );
        this.platforms = levelData.platforms ?? [];
        this.setElevators(levelData.elevators);
        this.setEnemies(levelData.enemies);
        this.coins = levelData.collectibles?.coins ?? [];
        this.splinters = levelData.collectibles?.splinters ?? [];
        this.artifacts = levelData.collectibles?.artifacts ?? [];
        this.hearts = levelData.collectibles?.hearts ?? [];
        this.weaponUpgrades = levelData?.collectibles?.weaponUpgrades ?? [];
        this.setSpikes(levelData.spikes);
        this.setMessages(levelData.messages);
        this.exits = levelData.exits ?? [];
        this.hiddenWalls = levelData.hiddenWalls ?? [];
        this.foregroundItems = levelData.foregroundItems ?? [];
        this.backgroundItems = levelData.backgroundItems ?? [];
        this.preBackgroundItems = levelData.preBackgroundItems ?? [];
        this.parallaxItems = levelData.parallax ?? [];
        this.setCannons(levelData.cannons);
        this.setTeleports(levelData.teleports);

        this.currentLevelCoinsCount = this.coins.length;
        this.currentLevelSplintersCount = this.splinters.length;
        this.currentLevelArtifactsCount = this.artifacts.length;
        this.currentLevelEnemiesCount = this.getEnemies().length;

        // Load checkpoints and extract embedded visual layers / messages
        this.setCheckpoints(levelData.checkpoints ?? []);
        const checkpointItems = this.extractCheckpointItems();
        this.preBackgroundItems.push(...checkpointItems.back);
        this.foregroundItems.push(...checkpointItems.front);
        this.getMessages().push(...checkpointItems.messages);
        this.platforms.push(...checkpointItems.platforms);
        const teleportItems = this.extractTeleportItems();
        this.foregroundItems.push(...teleportItems.foreground);
        this.platforms.push(...teleportItems.platforms);
        // Elevators first: same priority order as movePlayerY collision resolution.
        this.solids = [...this.getElevators(), ...this.platforms];

        // Restore checkpoint state (collected items, killed enemies, etc.)
        this.restoreCheckpointProgress({
            coins: this.coins,
            splinters: this.splinters,
            artifacts: this.artifacts,
            hearts: this.hearts,
            weaponUpgrades: this.weaponUpgrades,
            enemies: this.getEnemies(),
            elevators: this.getElevators(),
            messages: this.getMessages(),
            mapDiscovery: this.mapDiscovery,
        });

        this.resetPlayerProperties(levelData);

        // Clear held keys to prevent ghost input on level start
        this.clearInput();

        // Reset bullets
        this.resetBullets();

        // Reset cannon bullets
        this.resetCannonBullets();

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
            this.totalPausedTime = 0;
            this.accumulatedPlayTime =
                this.getCheckpointRespawn()?.playTimeMs ?? 0;
        } else if (wasGameOver) {
            this.totalPausedTime += now - gameOverAt;
        }
        this.pauseStartAt = 0;
        this.mapView = false;
        this.isPaused = false;
        this.pauseMenuIndex = 0;
        this.playerAtExit = false;
    }

    startLevel(now) {
        this.lastTime = now;
        this.simulatedTime = now; // sync simulation clock with wall clock at level start
        this.gameFadeIn.active = true;
        this.gameFadeIn.startTime = now;
        this.resetCannonTimers(now);
    }

    resetPlayerProperties(levelData) {
        const cr = this.getCheckpointRespawn();
        const respawnX = cr?.x ?? levelData?.playerStart?.x ?? 0;
        const respawnY = cr?.y ?? levelData?.playerStart?.y ?? 0;
        const coinsCount = cr?.coinsCount ?? 0;
        const splintersCount = cr?.splintersCount ?? 0;
        const artifactsCount = cr?.artifactsCount ?? 0;

        Object.assign(this.player, {
            x: respawnX,
            y: respawnY,
            prevX: respawnX,
            prevY: respawnY,
            vx: 0,
            vy: 0,
            posture: this.playerPostures.STANDING,
            h: this.player.originalHeight,
            w: this.player.originalWidth,
            life: this.player.maxLife,
            airborne: true,
            isHit: false,
            lastHitTime: -Infinity,
            onGroundId: null,
            onGroundType: null,
            lastGroundId: null,
            lastGroundType: null,
            coinsCount,
            splintersCount,
            artifactsCount,
            weapon: cr?.weapon ?? GameFactory.weapon(),
            facing: "right",
            jumpPressedByUser: false,
            shooting: false,
            lastShootTime: 0,
            jumpPressedAt: 0,
            lastGroundedAt: 0,
            carryVx: 0,
            carryVxInitial: 0,
            carryStartAt: 0,
            frozenForTeleport: false,
            knockbackUntil: 0,
            movingByInput: false,
            dying: false,
            dyingStartedAt: 0,
            dead: false,
        });
    }

    initControls() {
        this.inputController.attach({
            onBlur: () => this.clearInput(),
            onKeyDown: (e) => this.handleKeyDown(e),
            onKeyUp: (e) => this.markKeyUp(e.code),
        });
    }

    handleKeyDown(e) {
        this.handleGlobalToggles(e);

        if (this.isTitleScreen) {
            this.handleTitleScreenKeyDown(e);
            return;
        }

        if (this.isArtifactGallery) {
            this.handleGalleryKeyDown(e);
            return;
        }

        const wasPaused = this.isPaused;
        this.handlePauseMenuInput(e);
        if (wasPaused || this.isPaused) {
            return;
        }

        this.handleGameplayKeyDown(e);
    }

    // Toggles active regardless of game mode (title screen, gallery, pause, gameplay).
    handleGlobalToggles(e) {
        if (e.code === this.keysMap.debugToggle && !e.repeat) {
            this.showDebug = !this.showDebug;
            if (this.showDebug) {
                this.attachMouseTracking(() => {
                    if (!this.isRunning) {
                        this.updateDebug();
                    }
                });
            } else {
                this.detachMouseTracking();
            }
            this.updateDebug();
        }

        if (e.code === this.keysMap.fullscreen && !e.repeat) {
            this.toggleFullscreen();
        }
    }

    handleTitleScreenKeyDown(e) {
        if (
            e.code === this.keysMap.enter &&
            !e.repeat &&
            !this.titleFadeOut.active &&
            !this.titleFadeOut.pending
        ) {
            if (!document.fullscreenElement) {
                this.canvas
                    .requestFullscreen()
                    .then(() => {
                        navigator.keyboard?.lock?.(["Escape"]).catch(() => {});
                    })
                    .catch(() => {});
            }
            this.titleFadeOut.pending = true;
            this.clearInput();
        }
    }

    handleGalleryKeyDown(e) {
        if (e.repeat) {
            return;
        }

        if (e.code === this.keysMap.escape || e.code === this.keysMap.gallery) {
            this.closeArtifactGallery();
        } else if (e.code === this.keysMap.left) {
            this.artifactGallery.navigateLeft();
            this.animateGallery();
        } else if (e.code === this.keysMap.right) {
            this.artifactGallery.navigateRight();
            this.animateGallery();
        }
    }

    handleGameplayKeyDown(e) {
        if (e.code === this.keysMap.gallery && !e.repeat) {
            if (
                !this.levelComplete &&
                !this.gameOver &&
                !this.mapView &&
                !this.player.dying
            ) {
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

        if (
            (e.code === this.keysMap.jump || e.code === this.keysMap.jumpAlt) &&
            !e.repeat
        ) {
            this.markJumpJustPressed();
        }

        this.markKeyDown(e.code);
    }

    get hasEnoughCoins() {
        return this.player.coinsCount >= this.currentLevelCoinsCount / 2;
    }

    get hasEnoughSplinters() {
        return (
            this.player.splintersCount >= this.currentLevelSplintersCount / 2
        );
    }

    get hasEnoughArtifacts() {
        return (
            this.player.artifactsCount >= this.currentLevelArtifactsCount / 2
        );
    }

    canApplyPosture(height, width, anchor = "center") {
        const bottomY = this.player.y + this.player.h;
        let startX;
        if (anchor === "start") {
            startX = this.player.x;
        } else if (anchor === "end") {
            startX = this.player.x + this.player.w - width;
        } else {
            startX = this.player.x + this.player.w / 2 - width / 2;
        }

        const futurePlayer = {
            x: startX,
            y: bottomY - height,
            w: width,
            h: height,
        };

        for (const p of this.solids) {
            if (p.dead) {
                continue;
            }
            if (p.type === "oneDirection") {
                continue;
            }
            if (rectsCollide(futurePlayer, p)) {
                return false;
            }
        }

        for (const e of this.getEnemies()) {
            if (e.dead || e.dying) {
                continue;
            }
            if (rectsCollide(futurePlayer, e)) {
                return false;
            }
        }

        return true;
    }

    findCrouchAnchor() {
        const h = this.player.crouchHeight;
        const w = this.player.crouchWidth;
        for (const anchor of ["center", "start", "end"]) {
            if (this.canApplyPosture(h, w, anchor)) {
                return anchor;
            }
        }
        return null;
    }

    canStandUp() {
        return this.canApplyPosture(
            this.player.originalHeight,
            this.player.originalWidth,
        );
    }

    isPlayerCrouching() {
        return this.player.posture === this.playerPostures.CROUCH;
    }

    getPlayerHitboxForPosture(posture) {
        if (posture === this.playerPostures.CROUCH) {
            return {
                w: this.player.crouchWidth,
                h: this.player.crouchHeight,
            };
        }

        return {
            w: this.player.originalWidth,
            h: this.player.originalHeight,
        };
    }

    applyPlayerHeight(nextHeight) {
        // anchor should be always bottom
        const bottom = this.player.y + this.player.h;
        this.player.h = nextHeight;
        this.player.y = bottom - nextHeight;
    }

    applyPlayerWidth(nextWidth, anchor = "center") {
        let nextX;
        if (anchor === "start") {
            nextX = this.player.x;
        } else if (anchor === "end") {
            nextX = this.player.x + this.player.w - nextWidth;
        } else {
            nextX = this.player.x + this.player.w / 2 - nextWidth / 2;
        }
        this.player.w = nextWidth;
        this.player.x = nextX;
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
        if (this.isKeyDown("escape")) {
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
                if (this.getCheckpointRespawn() !== null) {
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
        if (this.consumeJumpBuffer()) {
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

        const speed = this.isPlayerCrouching()
            ? this.player.crouchSpeed
            : this.player.speed;

        if (this.isKeyDown("left") && !this.isKeyDown("right")) {
            targetVx = -speed;
            this.player.facing = "left";
        } else if (this.isKeyDown("right") && !this.isKeyDown("left")) {
            targetVx = speed;
            this.player.facing = "right";
        }

        this.player.movingByInput = targetVx !== 0;

        const groundPlatform = this.solids.find(
            (p) => p.id === this.player.onGroundId,
        );
        const acceleration =
            groundPlatform?.acceleration ?? this.player.acceleration;
        const deceleration =
            groundPlatform?.deceleration ?? this.player.deceleration;

        const lastGroundPlatform = this.solids.find(
            (p) => p.id === this.player.lastGroundId,
        );

        const lastGroundAcceleration = lastGroundPlatform?.airAcceleration;
        const lastGroundDeceleration = lastGroundPlatform?.airDeceleration;

        const delta =
            targetVx === 0
                ? this.player.airborne
                    ? (lastGroundDeceleration ?? this.player.airDeceleration)
                    : deceleration
                : this.player.airborne
                  ? (lastGroundAcceleration ?? this.player.airAcceleration)
                  : acceleration;

        if (this.player.vx < targetVx) {
            this.player.vx = Math.min(this.player.vx + delta, targetVx);
            return;
        }

        if (this.player.vx > targetVx) {
            this.player.vx = Math.max(this.player.vx - delta, targetVx);
        }
    }

    handleCrouchInput() {
        if (
            (this.isKeyDown("crouchAlt") || this.isKeyDown("crouch")) &&
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
        const hitbox = this.getPlayerHitboxForPosture(posture);
        this.player.posture = posture;
        this.applyPlayerHeight(hitbox.h);
        this.applyPlayerWidth(hitbox.w, anchor);
    }

    handleShootingInput(now) {
        const customShootingOffsetY = this.isPlayerCrouching()
            ? this.player.shootingCrouchOffsetY
            : this.player.shootingOffsetY;
        const customShootingOffsetX = this.isPlayerCrouching()
            ? this.player.shootingCrouchOffsetX
            : this.player.shootingOffsetX;
        if (this.isKeyDown("shoot") || this.isKeyDown("shootAlt")) {
            this.player.shooting = true;
            if (
                now - this.player.lastShootTime >
                this.player.weapon.shootFrequency
            ) {
                const bulletVx =
                    this.player.facing === "left"
                        ? -this.player.weapon.speed
                        : this.player.weapon.speed;
                this.spawnBullet({
                    ...this.player.weapon.ammo,
                    color: this.player.weapon.color,
                    x:
                        this.player.facing === "left"
                            ? this.player.x - customShootingOffsetX
                            : this.player.x +
                              this.player.w -
                              this.player.weapon.ammo.w +
                              customShootingOffsetX,
                    y:
                        this.player.y +
                        this.player.h / 2 +
                        customShootingOffsetY,
                    vx: bulletVx,
                });
                this.player.lastShootTime = now;
            }
        } else {
            this.player.shooting = false;
        }
    }

    handleJumpInput(now) {
        if (this.player.posture === this.playerPostures.CROUCH) {
            return;
        }
        if (now < this.player.knockbackUntil) {
            return;
        }
        const jumpBuffered =
            now - this.player.jumpPressedAt <= this.player.jumpBufferDuration;

        const isOnBooster = this.player.onGroundType === "booster";
        const leftBoosterRecently = this.player.lastGroundType === "booster";

        const hasCoyoteTime =
            now - this.player.lastGroundedAt <= this.player.coyoteDuration &&
            !leftBoosterRecently;

        const canGroundJump =
            !isOnBooster && (!this.player.airborne || hasCoyoteTime);

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
            const elev = this.getElevatorById(this.player.onGroundId);
            if (elev && elev.triggered && now >= elev.idleUntil) {
                const elevVx = elev.dirX * elev.speed * elev.direction;
                const elevVy = elev.dirY * elev.speed * elev.direction;
                // Upward elevator: subtle boost capped to 25%
                if (elevVy < 0) {
                    this.player.vy += elevVy * 0.25;
                }
                // Downward elevator: no effect
                // Sideways elevator: carry velocity
                if (elevVx !== 0) {
                    this.player.carryVxInitial = elevVx;
                    this.player.carryVx = elevVx;
                    this.player.carryStartAt = now;
                }
            }
        }
    }

    handleEnterInput(now) {
        if (this.isKeyDown("enter")) {
            if (
                this.playerAtExit &&
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
                this.clearCheckpoint();
                this.galleryLastIndex = 0;
            }
        }
    }

    // Apply gravity and enforce terminal velocity
    applyPhysics() {
        let currentGravity = this.physics.gravity;
        const isAscending = this.player.vy < 0;
        const isFalling = this.player.vy > 0;
        const jumpHeld = this.isKeyDown("jump") || this.isKeyDown("jumpAlt");

        // Variable jump height: fall faster if jump key is released while ascending
        if (isAscending && !jumpHeld && this.player.jumpPressedByUser) {
            currentGravity *= this.physics.jumpCutGravityMultiplier;
        } else if (isFalling) {
            currentGravity *= this.physics.fallGravityMultiplier;
        }

        this.player.vy += currentGravity;

        // Terminal velocity cap
        if (this.player.vy > this.physics.maxFallSpeed) {
            this.player.vy = this.physics.maxFallSpeed;
        }
    }

    // Decay the carry velocity inherited from a moving elevator
    applyCarryDecay(now) {
        if (this.player.carryVxInitial === 0) {
            return;
        }
        const t = Math.max(
            0,
            1 - (now - this.player.carryStartAt) / this.player.carryDuration,
        );
        this.player.carryVx = this.player.carryVxInitial * t;
        if (t <= 0) {
            this.player.carryVx = 0;
            this.player.carryVxInitial = 0;
        }
    }

    // Move player along the X axis and resolve platform collisions
    movePlayerX(now) {
        const prevX = this.player.prevX ?? this.player.x;

        this.player.x += this.player.vx + this.player.carryVx;

        // World bounds check (X axis)
        if (this.player.x < 0) {
            this.player.x = 0;
            this.player.vx = 0;
            this.player.carryVx = 0;
            this.player.carryVxInitial = 0;
            this.player.knockbackUntil = 0;
        } else if (this.player.x + this.player.w > this.worldSize.width) {
            this.player.x = this.worldSize.width - this.player.w;
            this.player.vx = 0;
            this.player.carryVx = 0;
            this.player.carryVxInitial = 0;
            this.player.knockbackUntil = 0;
        }

        for (const p of this.solids) {
            if (p.type === "oneDirection") {
                continue;
            }
            if (rectsCollide(this.player, p)) {
                const platformPrevX = p.previousX ?? p.x;

                const wasLeft =
                    prevX + this.player.w <= Math.max(platformPrevX, p.x);
                const wasRight =
                    prevX >= Math.min(platformPrevX + p.w, p.x + p.w);

                if (wasLeft) {
                    this.player.x = p.x - this.player.w;
                    this.player.vx = 0;
                    this.player.carryVx = 0;
                    this.player.carryVxInitial = 0;
                    this.player.knockbackUntil = 0;
                } else if (wasRight) {
                    this.player.x = p.x + p.w;
                    this.player.vx = 0;
                    this.player.carryVx = 0;
                    this.player.carryVxInitial = 0;
                    this.player.knockbackUntil = 0;
                }
            }
        }

        // Resolve player against enemies on the X axis so that large knockback
        // velocities cannot overshoot the player into a nearby enemy.
        for (const e of this.getEnemies()) {
            if (e.dead || e.dying) {
                continue;
            }
            if (!rectsCollide(this.player, e)) {
                continue;
            }

            const wasLeft = prevX + this.player.w <= e.x;
            const wasRight = prevX >= e.x + e.w;

            if (wasLeft) {
                this.player.x = e.x - this.player.w;
                this.player.vx = 0;
                this.player.carryVx = 0;
                this.player.carryVxInitial = 0;
            } else if (wasRight) {
                this.player.x = e.x + e.w;
                this.player.vx = 0;
                this.player.carryVx = 0;
                this.player.carryVxInitial = 0;
            }

            if (wasLeft || wasRight) {
                const cooldownIsActive =
                    now - this.player.lastHitTime < this.player.hitCooldown;
                if (!cooldownIsActive) {
                    this.applyDamageToPlayer(now, e);
                }
            }
        }
    }

    // Move player along the Y axis, resolve platform collisions, and check fall-off
    movePlayerY(now) {
        const previousY = this.player.prevY ?? this.player.y;
        const previousH = this.player.h;

        this.player.y += this.player.vy;
        this.player.onGroundId = null;
        this.player.onGroundType = null;
        this.player.airborne = true;

        // Worlds bounds collisions
        if (this.player.y < 0) {
            this.handleWorldCeilHit();
        } else if (this.player.y + this.player.h > this.worldSize.height) {
            this.handleWorldGroundLanding(now);
        }

        //Platforms collisions
        for (const p of this.solids) {
            if (rectsCollide(this.player, p)) {
                const platformPrevY = p.previousY ?? p.y;

                const wasAbove =
                    previousY + previousH <= Math.max(platformPrevY, p.y);
                const wasBelow =
                    previousY >= Math.min(platformPrevY, p.y) + p.h;

                // oneDirection platforms: only block when landing from above
                if (p.type === "oneDirection" && !wasAbove) {
                    continue;
                }

                // Landing on top of platform
                if (wasAbove) {
                    this.handlePlatformLanding(p, now);
                    this.handlePlatformLandingResponse(p);
                    continue;
                }

                if (wasBelow) {
                    // Hit ceiling
                    this.handleCeilingHit(p);
                }
            }
        }

        // Crouch is only allowed while grounded
        if (
            this.isPlayerCrouching() &&
            this.player.airborne &&
            this.canStandUp()
        ) {
            this.applyPosture(this.playerPostures.STANDING);
        }
    }

    handleWorldGroundLanding(now) {
        this.player.y = this.worldSize.height - this.player.h;
        this.player.vy = 0;
        this.player.jumpPressedByUser = false;
        this.player.lastGroundedAt = now;

        this.player.airborne = false;
        this.player.onGroundId = this.worldGroundId;
        this.player.onGroundType = "solid";
        this.player.lastGroundId = this.worldGroundId;
        this.player.lastGroundType = "solid";

        this.player.carryVx = 0;
        this.player.carryVxInitial = 0;
    }

    handleWorldCeilHit() {
        this.player.y = 0;
        this.player.vy = 0;
    }

    handlePlatformLanding(platform, now) {
        this.player.y = platform.y - this.player.h;
        this.player.airborne = false;
        this.player.onGroundId = platform.id;
        this.player.onGroundType = platform.type;
        this.player.lastGroundedAt = now;
        this.player.jumpPressedByUser = false;
        this.player.lastGroundType = platform.type;
        this.player.lastGroundId = platform.id;

        this.player.carryVx = 0;
        this.player.carryVxInitial = 0;

        if (platform.type === "elevator" && !platform.triggered) {
            platform.triggered = true;
        }
    }

    handlePlatformLandingResponse(platform) {
        if (platform.type === "booster") {
            this.player.vy = -platform.boostSpeed;
            return;
        }

        if (
            platform.type === "solid" ||
            platform.type === "elevator" ||
            platform.type === "oneDirection"
        ) {
            this.player.vy = 0;
            return;
        }
    }

    handleCeilingHit(platform) {
        this.player.y = platform.y + platform.h;
        this.player.vy = 0;
    }

    updateElevators(now) {
        this.elevatorController.update(now, {
            player: this.player,
            platforms: this.platforms,
            enemies: this.getEnemies(),
            isVisibleInCamera: (obj, margin) =>
                this.isVisibleInCamera(obj, margin),
            onPlatformLanding: (elevator, landingNow) => {
                this.handlePlatformLanding(elevator, landingNow);
                this.handlePlatformLandingResponse(elevator);
            },
            onPlayerHit: (hitNow, enemy) =>
                this.applyDamageToPlayer(hitNow, enemy),
        });
    }

    // Move enemies and check player-enemy collisions
    updateEnemies(now) {
        this.enemyController.update(now, {
            player: this.player,
            solids: this.solids,
            verticalHitRecoilMultiplier: this.verticalHitRecoilMultiplier,
            onPlayerHit: (hitNow, enemy, hitFromAbove, hitFromBelow) =>
                this.applyDamageToPlayer(
                    hitNow,
                    enemy,
                    hitFromAbove,
                    hitFromBelow,
                ),
        });
    }

    applyDamageToPlayer(
        now,
        source,
        hitFromAbove = false,
        hitFromBelow = false,
    ) {
        this.player.life -= source.damage;
        this.player.lastHitTime = now;
        this.player.isHit = true;
        this.player.knockbackUntil = now + this.player.knockbackControlLock;

        const recoilXForce =
            hitFromAbove || hitFromBelow
                ? source.recoilX / this.verticalHitRecoilMultiplier
                : source.recoilX;
        const recoilYForce = hitFromAbove
            ? source.recoilY * this.verticalHitRecoilMultiplier
            : source.recoilY;

        this.player.jumpPressedByUser = false;
        const hitFromLeft =
            this.player.x + this.player.w / 2 < source.x + source.w / 2;
        this.player.vx = hitFromLeft ? -recoilXForce : recoilXForce;
        this.player.vy = hitFromBelow ? 0 : -recoilYForce;

        this.checkPlayerIsDead(now);
    }

    checkPlayerIsDead(now) {
        if (this.player.life <= 0) {
            this.player.dying = true;
            this.player.dyingStartedAt = now;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.shooting = false;
            this.player.isHit = false;
            this.deathCount++;
        }
    }

    // Gathers the game state CheckpointManager needs but has no direct access to.
    buildCheckpointContext() {
        return {
            currentLevelId: this.currentLevelId,
            player: this.player,
            coins: this.coins,
            splinters: this.splinters,
            artifacts: this.artifacts,
            hearts: this.hearts,
            weaponUpgrades: this.weaponUpgrades,
            enemies: this.getEnemies(),
            elevators: this.getElevators(),
            messages: this.getMessages(),
            mapDiscovery: this.mapDiscovery,
            levelStartAt: this.levelStartAt,
            totalPausedTime: this.totalPausedTime,
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
            },
        );
    }

    // Move bullets, remove out-of-bounds ones, and check bullet-enemy collisions
    updateBullets(now) {
        this.projectileController.updateBullets(now, {
            worldSize: this.worldSize,
            enemies: this.getEnemies(),
            solids: this.solids,
        });
    }

    // Trigger cannons to shoot based on shootFrequency
    updateCannons(now) {
        this.projectileController.updateCannons(now);
    }

    // Move cannon bullets and check collision with player only
    updateCannonBullets(now) {
        this.projectileController.updateCannonBullets(
            now,
            this.player,
            (now, bullet) => {
                this.applyDamageToPlayer(now, bullet);
                return this.gameOver;
            },
        );
    }

    // Check player-collectible collisions and mark collected items
    updateCollectibles(now) {
        for (const c of this.coins) {
            if (!c.collected && rectsCollide(this.player, c)) {
                c.collected = true;
                this.player.coinsCount++;
            }
        }

        for (const s of this.splinters) {
            if (!s.collected && rectsCollide(this.player, s)) {
                s.collected = true;
                this.player.splintersCount++;
            }
        }

        for (const a of this.artifacts) {
            if (!a.collected && rectsCollide(this.player, a)) {
                a.collected = true;
                this.player.artifactsCount++;
                if (a.message) {
                    this.showArtifactMessage(a.message, a, now);
                }
            }
        }

        for (const u of this.weaponUpgrades) {
            if (!u.collected && rectsCollide(this.player, u)) {
                u.collected = true;
                this.player.weapon = u?.weapon ?? this.player.weapon;
                if (u.message) {
                    this.showWeaponMessage(u.message, now);
                }
            }
        }

        for (const h of this.hearts) {
            if (
                !h.collected &&
                rectsCollide(this.player, h) &&
                this.player.life < this.player.maxLife
            ) {
                h.collected = true;
                this.player.life++;
            }
        }
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

            if (!this.isVisibleInCamera(obj)) {
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
            elevators: this.getElevators(),
            physics: this.physics,
            isCrouching: this.isPlayerCrouching(),
        });
    }

    isVisibleInCamera(obj, margin) {
        return this.cameraController.isVisible(obj, margin);
    }

    // Single access point for camera data — keeps ownership at CameraController.
    getCamera() {
        return this.cameraController.camera;
    }

    // Single access point for checkpoint definitions — keeps ownership at CheckpointManager.
    getCheckpoints() {
        return this.checkpointManager.checkpoints;
    }

    clearCheckpoint() {
        this.checkpointManager.clear();
    }

    loadSavedCheckpoint(levelId) {
        return this.checkpointManager.loadSaved(levelId);
    }

    getCheckpointRespawn() {
        return this.checkpointManager.getRespawn();
    }

    setCheckpoints(checkpoints) {
        this.checkpointManager.setCheckpoints(checkpoints);
    }

    extractCheckpointItems() {
        return this.checkpointManager.extractItems();
    }

    restoreCheckpointProgress(context) {
        this.checkpointManager.restoreProgress(context);
    }

    // Single access point for key state — keeps ownership at InputController.
    isKeyDown(action) {
        return this.inputController.isDown(action);
    }

    clearInput() {
        this.inputController.clear();
    }

    markJumpJustPressed() {
        this.inputController.markJumpJustPressed();
    }

    markKeyDown(code) {
        this.inputController.markKeyDown(code);
    }

    markKeyUp(code) {
        this.inputController.markKeyUp(code);
    }

    consumeJumpBuffer() {
        return this.inputController.consumeJumpBuffer();
    }

    // Single access point for teleport definitions — keeps ownership at TeleportController.
    getTeleports() {
        return this.teleportController.getTeleports();
    }

    setTeleports(teleports) {
        this.teleportController.setTeleports(teleports);
    }

    extractTeleportItems() {
        return this.teleportController.extractItems();
    }

    adjustTeleportsForPause(pauseDuration) {
        this.teleportController.adjustForPause(pauseDuration);
    }

    toggleFullscreen() {
        this.displayController.toggleFullscreen();
    }

    // Single access point for debug cursor data — keeps ownership at DebugMouseTracker.
    getMouse() {
        return this.mouse;
    }

    attachMouseTracking(onMove) {
        this.mouse.attach(onMove);
    }

    detachMouseTracking() {
        this.mouse.detach();
    }

    // Single access point for projectile/hazard state — keeps ownership at ProjectileController.
    getBullets() {
        return this.projectileController.getBullets();
    }

    getCannonBullets() {
        return this.projectileController.getCannonBullets();
    }

    getCannons() {
        return this.projectileController.getCannons();
    }

    getSpikes() {
        return this.projectileController.getSpikes();
    }

    setCannons(cannons) {
        this.projectileController.setCannons(cannons);
    }

    setSpikes(spikes) {
        this.projectileController.setSpikes(spikes);
    }

    resetBullets() {
        this.projectileController.resetBullets();
    }

    resetCannonBullets() {
        this.projectileController.resetCannonBullets();
    }

    spawnBullet(bulletData) {
        this.projectileController.spawnBullet(bulletData);
    }

    resetCannonTimers(now) {
        this.projectileController.resetCannonTimers(now);
    }

    adjustCannonsForPause(pauseDuration) {
        this.projectileController.adjustForPause(pauseDuration);
    }

    // Single access point for elevator definitions — keeps ownership at ElevatorController.
    getElevators() {
        return this.elevatorController.getElevators();
    }

    setElevators(elevators) {
        this.elevatorController.setElevators(elevators);
    }

    getElevatorById(id) {
        return this.elevatorController.findById(id);
    }

    adjustElevatorsForPause(pauseDuration) {
        this.elevatorController.adjustForPause(pauseDuration);
    }

    // Single access point for enemy state — keeps ownership at EnemyController.
    getEnemies() {
        return this.enemyController.getEnemies();
    }

    setEnemies(enemies) {
        this.enemyController.setEnemies(enemies);
    }

    adjustEnemiesForPause(pauseDuration) {
        this.enemyController.adjustForPause(pauseDuration);
    }

    // Single access point for messages — keeps ownership at MessageController.
    getMessages() {
        return this.messageController.getMessages();
    }

    setMessages(messages) {
        this.messageController.setMessages(messages);
    }

    getActiveMessage() {
        return this.messageController.getActiveMessage();
    }

    getActiveArtifactMessage() {
        return this.messageController.getActiveArtifactMessage();
    }

    getActiveArtifactSource() {
        return this.messageController.getActiveArtifactSource();
    }

    showWeaponMessage(message, now) {
        this.messageController.showWeaponMessage(message, now);
    }

    showArtifactMessage(message, source, now) {
        this.messageController.showArtifactMessage(message, source, now);
    }

    adjustMessagesForPause(pauseDuration) {
        this.messageController.adjustForPause(pauseDuration);
    }

    updateDamageCooldown(now) {
        if (
            this.player.isHit &&
            now - this.player.lastHitTime >= this.player.hitCooldown
        ) {
            this.player.isHit = false;
        }
    }

    drawPlayer(now) {
        this.renderByMode(this.player, this.mapPlayerRenderer, () =>
            this.playerRenderer.draw(
                this.ctx,
                this.player,
                this.showDebug,
                now,
            ),
        );
    }

    drawPlatform(p) {
        this.renderByMode(p, this.mapPlatformRenderer, () =>
            this.platformRenderer.draw(
                this.ctx,
                p,
                this.showDebug,
                this.getCamera(),
            ),
        );
    }

    drawElevator(e) {
        this.renderByMode(e, this.mapPlatformRenderer, () =>
            this.platformRenderer.draw(
                this.ctx,
                e,
                this.showDebug,
                this.getCamera(),
            ),
        );
    }

    drawHiddenWall(w) {
        this.renderByMode(w, this.mapPlatformRenderer, () =>
            this.platformRenderer.drawHiddenWall(
                this.ctx,
                w,
                this.showDebug,
                this.getCamera(),
            ),
        );
    }

    drawEnemy(e, now) {
        this.renderByMode(e, this.mapEnemyRenderer, () =>
            this.enemyRenderer.draw(
                this.ctx,
                e,
                e.sprite,
                this.showDebug,
                now,
                this.player,
            ),
        );
    }

    drawCoin(c) {
        this.renderByMode(c, this.mapCoinRenderer, () =>
            this.collectibleRenderer.drawCoin(this.ctx, c, this.showDebug),
        );
    }

    drawSplinter(s, now) {
        this.renderByMode(s, this.mapSplinterRenderer, () =>
            this.collectibleRenderer.drawSplinter(
                this.ctx,
                s,
                this.showDebug,
                now,
            ),
        );
    }

    drawArtifact(a, now) {
        this.renderByMode(a, this.mapArtifactRenderer, () =>
            this.collectibleRenderer.drawArtifact(
                this.ctx,
                a,
                this.showDebug,
                now,
            ),
        );
    }

    drawHeart(s, now) {
        this.renderByMode(s, this.mapHeartRenderer, () =>
            this.collectibleRenderer.drawHeart(
                this.ctx,
                s,
                this.showDebug,
                now,
            ),
        );
    }

    drawWeaponUpgrade(s, now) {
        this.renderByMode(s, NOOP_RENDERER, () =>
            this.collectibleRenderer.drawWeaponUpgrade(
                this.ctx,
                s,
                this.showDebug,
                now,
            ),
        );
    }

    drawBullet(b) {
        this.weaponRenderer.draw(this.ctx, b);
    }

    drawCannon(cannon) {
        this.renderByMode(cannon, this.mapCannonRenderer, () =>
            this.cannonRenderer.draw(this.ctx, cannon, this.showDebug),
        );
    }

    drawCannonBullet(b) {
        this.cannonBulletRenderer.draw(this.ctx, b);
    }

    drawSpike(spike) {
        this.renderByMode(spike, this.mapSpikeRenderer, () =>
            this.spikeRenderer.draw(this.ctx, spike, this.showDebug),
        );
    }

    drawEnvPreBackgroundItem(i) {
        this.renderByMode(i, NOOP_RENDERER, () =>
            this.worldRenderer.drawEnvironmentItem(this.ctx, i),
        );
    }

    drawEnvBackgroundItem(i) {
        this.renderByMode(i, NOOP_RENDERER, () =>
            this.worldRenderer.drawEnvironmentItem(this.ctx, i),
        );
    }

    drawEnvParallaxItem(i) {
        this.renderByMode(i, NOOP_RENDERER, () =>
            this.worldRenderer.drawParallaxEnvironmentItem(
                this.ctx,
                i,
                this.getCamera(),
            ),
        );
    }

    drawTitleScreen() {
        const hasSave = CheckpointStorage.load() !== null;
        this.titleScreenRenderer.draw(this.ctx, this.canvas, hasSave);
    }

    drawWorld() {
        this.worldRenderer.drawBackground(
            this.ctx,
            this.canvas,
            this.getCamera(),
        );
    }

    drawEnvForegroundItem(i) {
        this.renderByMode(i, NOOP_RENDERER, () =>
            this.worldRenderer.drawEnvironmentItem(this.ctx, i),
        );
    }

    draw(now = performance.now()) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        if (this.mapView) {
            this.worldRenderer.drawMapBackground(
                this.ctx,
                this.canvas,
                this.worldSize,
            );
        } else {
            this.drawWorld();
            this.ctx.translate(-this.getCamera().x, -this.getCamera().y);
        }

        for (const i of this.parallaxItems) {
            this.drawEnvParallaxItem(i);
        }

        for (const exit of this.exits) {
            this.drawExit(exit);
        }

        for (const i of this.preBackgroundItems) {
            this.drawEnvPreBackgroundItem(i);
        }

        for (const p of this.platforms) {
            this.drawPlatform(p);
        }

        for (const i of this.backgroundItems) {
            this.drawEnvBackgroundItem(i);
        }

        for (const w of this.getBullets()) {
            this.drawBullet(w);
        }

        for (const b of this.getCannonBullets()) {
            this.drawCannonBullet(b);
        }

        for (const c of this.coins) {
            if (!c.collected) {
                this.drawCoin(c);
            }
        }

        for (const s of this.splinters) {
            if (!s.collected) {
                this.drawSplinter(s, now);
            }
        }

        for (const a of this.artifacts) {
            if (!a.collected) {
                this.drawArtifact(a, now);
            }
        }

        for (const h of this.hearts) {
            if (!h.collected) {
                this.drawHeart(h, now);
            }
        }

        for (const u of this.weaponUpgrades) {
            if (!u.collected) {
                this.drawWeaponUpgrade(u, now);
            }
        }

        for (const wall of this.hiddenWalls) {
            this.drawHiddenWall(wall);
        }

        for (const e of this.getElevators()) {
            this.drawElevator(e);
        }

        for (const spike of this.getSpikes()) {
            this.drawSpike(spike);
        }

        for (const e of this.getEnemies()) {
            if (e.dead) {
                continue;
            }
            this.drawEnemy(e, now);
        }

        for (const cannon of this.getCannons()) {
            this.drawCannon(cannon);
        }

        if (!this.mapView) {
            this.drawPlayer(now);
        }

        for (const cp of this.getCheckpoints()) {
            this.drawCheckpointIndicator(cp);
        }

        for (const i of this.foregroundItems) {
            this.drawEnvForegroundItem(i);
        }

        if (this.mapView) {
            this.worldRenderer.drawMapUndiscoveredMask(
                this.ctx,
                this.worldSize,
                this.mapDiscovery,
            );
            this.drawPlayer(now);
        }

        if (this.showDebug && !this.mapView) {
            DebugGridRenderer.draw(this.ctx, this.getCamera(), this.worldSize);
            for (const t of this.getTeleports()) {
                this.ctx.save();
                this.ctx.strokeStyle = "cyan";
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(t.x, t.y, t.w, t.h);
                this.ctx.strokeRect(t.targetX, t.targetY, t.w, t.h);
                this.ctx.restore();
            }
        }

        this.ctx.restore();

        if (
            this.playerAtExit &&
            !this.levelComplete &&
            !this.gameOver &&
            !this.isArtifactGallery
        ) {
            this.drawExitMessage();
        }

        const activeMessage = this.getActiveMessage();
        if (
            activeMessage &&
            !this.levelComplete &&
            !this.gameOver &&
            !this.mapView &&
            !this.isPaused &&
            !this.isArtifactGallery
        ) {
            this.messageRenderer.drawMessagePanel(
                this.ctx,
                this.canvas,
                activeMessage,
                this.getCamera(),
            );
        }

        const activeArtifactMessage = this.getActiveArtifactMessage();
        if (
            activeArtifactMessage &&
            !this.levelComplete &&
            !this.gameOver &&
            !this.mapView &&
            !this.isPaused &&
            !this.isArtifactGallery
        ) {
            const activeArtifactSource = this.getActiveArtifactSource();
            this.messageRenderer.drawPanel(
                this.ctx,
                {
                    title: activeArtifactMessage.title ?? null,
                    lines: activeArtifactMessage.lines,
                },
                this.canvas.width / 2 + (activeArtifactMessage.offsetX ?? 0),
                this.canvas.height - 8 + (activeArtifactMessage.offsetY ?? 0),
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
                },
            );
        }

        this.hudRenderer.draw(
            this.ctx,
            this.canvas,
            this.player,
            this.currentLevelCoinsCount,
            this.currentLevelSplintersCount,
            this.hasEnoughCoins,
            this.hasEnoughSplinters,
            this.currentLevelArtifactsCount,
            this.hasEnoughArtifacts,
        );

        if (this.levelComplete) {
            this.drawLevelComplete();
        }

        if (this.gameOver) {
            this.drawGameOver(now);
        }
    }

    drawLevelComplete() {
        const playTimeMs =
            this.levelCompleteAt -
            this.levelStartAt -
            this.totalPausedTime +
            this.accumulatedPlayTime;
        this.levelCompleteRenderer.drawLevelCompleteScreen(
            this.ctx,
            this.canvas,
            this.player.coinsCount,
            this.currentLevelCoinsCount,
            this.player.splintersCount,
            this.currentLevelSplintersCount,
            this.getEnemies().filter((e) => e.dead || e.dying).length,
            this.currentLevelEnemiesCount,
            playTimeMs,
            this.deathCount,
            this.player.artifactsCount,
            this.currentLevelArtifactsCount,
        );
    }

    drawGameOver(now) {
        const elapsed = now - this.gameOverAt;
        const remaining = Math.max(
            0,
            Math.ceil((this.gameOverDelay - elapsed) / 1000),
        );
        const playTimeMs =
            this.gameOverAt -
            this.levelStartAt -
            this.totalPausedTime +
            this.accumulatedPlayTime;

        this.gameOverRenderer.drawGameOverScreen(
            this.ctx,
            this.canvas,
            this.player.coinsCount,
            this.currentLevelCoinsCount,
            this.player.splintersCount,
            this.currentLevelSplintersCount,
            this.getEnemies().filter((e) => e.dead || e.dying).length,
            this.currentLevelEnemiesCount,
            remaining,
            playTimeMs,
            this.deathCount,
            this.player.artifactsCount,
            this.currentLevelArtifactsCount,
        );
    }

    getCurrentPlayTimeMs() {
        return (
            this.simulatedTime -
            this.levelStartAt -
            this.totalPausedTime +
            this.accumulatedPlayTime
        );
    }

    exitHitbox(exit) {
        const m = exit.triggerMargin;
        return {
            x: exit.x - m,
            y: exit.y - m,
            w: exit.dw + m * 2,
            h: exit.dh + m,
        };
    }

    findActiveExit() {
        return (
            this.exits.find((e) =>
                rectsCollide(this.player, this.exitHitbox(e)),
            ) ?? null
        );
    }

    updateExit() {
        this.playerAtExit = this.exits.some((exit) =>
            rectsCollide(this.player, this.exitHitbox(exit)),
        );
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
            this.buildCheckpointContext(),
        );
    }

    updateTeleports(now) {
        this.teleportController.update(now, this.player);
    }

    drawCheckpointIndicator(cp) {
        this.renderByMode(cp, this.mapCheckpointRenderer, () =>
            this.checkpointRenderer.draw(this.ctx, cp, this.showDebug),
        );
    }

    drawExit(exit) {
        this.renderByMode(exit, this.mapExitRenderer, () =>
            this.exitRenderer.draw(this.ctx, exit, this.showDebug),
        );
    }

    drawExitMessage() {
        const exit = this.findActiveExit();
        if (!exit) {
            return;
        }
        const anchorX = exit.x - this.getCamera().x + exit.dw / 2;
        const anchorY = exit.y - this.getCamera().y + exit.dh / 2;
        const lines = getExitLevelLines(
            this.hasEnoughCoins,
            this.hasEnoughSplinters,
            this.hasEnoughArtifacts,
        );
        MessageRenderer.drawPanel(this.ctx, { lines }, anchorX, anchorY);
    }

    updateDebug() {
        DebugHudRenderer.update(
            this.canvas,
            this.showDebug,
            this.debug,
            this.player,
            this.getMouse(),
        );
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
        if (this.titleFadeOut.pending) {
            this.titleFadeOut.active = true;
            this.titleFadeOut.startTime = now;
            this.titleFadeOut.pending = false;
        }
        if (this.titleFadeOut.active) {
            const elapsed = now - this.titleFadeOut.startTime;
            const progress = Math.min(elapsed / this.titleFadeOut.duration, 1);
            this.transitionRenderer.drawFadeOut(
                this.ctx,
                this.canvas,
                progress,
            );
            if (progress >= 1) {
                this.titleFadeOut.active = false;
                this.isTitleScreen = false;
                this.levelStartAt = now;
                this.totalPausedTime = 0;
                this.accumulatedPlayTime =
                    this.getCheckpointRespawn()?.playTimeMs ?? 0;
                this.startLevel(now);
            }
        }
    }

    loop(now) {
        if (!this.isRunning) {
            return;
        }

        if (this.isTitleScreen) {
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

        if (
            this.gameOver &&
            this.simulatedTime - this.gameOverAt >= this.gameOverDelay
        ) {
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

    handlePauseMenuInput(e) {
        if (this.isPaused) {
            if (!e.repeat) {
                this.handlePauseMenuKey(e.code);
            }
            return;
        }

        if (
            (e.code === this.keysMap.escape || e.code === this.keysMap.pause) &&
            !e.repeat &&
            !this.levelComplete &&
            !this.gameOver &&
            !this.player.dying &&
            !this.mapView
        ) {
            this.openPauseMenu();
        }
    }

    handlePauseMenuKey(code) {
        switch (code) {
            case this.keysMap.menuUp:
            case this.keysMap.menuDown: {
                const count = this.pauseRenderer.menuItemCount;
                const dir = code === this.keysMap.menuUp ? -1 : 1;
                this.pauseMenuIndex =
                    (this.pauseMenuIndex + dir + count) % count;
                this.pauseRenderer.drawPausePanel(
                    this.ctx,
                    this.canvas,
                    this.pauseMenuIndex,
                    this.getCurrentPlayTimeMs(),
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
        this.isPaused = true;
        this.pauseMenuIndex = 0;
        this.pauseStartAt = performance.now();
        this.draw(this.simulatedTime);
        this.pauseRenderer.drawPauseScreen(
            this.ctx,
            this.canvas,
            this.pauseMenuIndex,
            this.getCurrentPlayTimeMs(),
        );
    }

    resumeFromPause() {
        const pauseDuration = performance.now() - this.pauseStartAt;
        this.totalPausedTime += pauseDuration;

        this.adjustPlayerForPause(pauseDuration);
        this.adjustMessagesForPause(pauseDuration);
        this.adjustCannonsForPause(pauseDuration);
        this.adjustElevatorsForPause(pauseDuration);
        this.adjustEnemiesForPause(pauseDuration);
        this.adjustTeleportsForPause(pauseDuration);
        adjustAnimStartTime(pauseDuration);
        this.simulatedTime += pauseDuration;
        if (this.gameFadeIn.active) {
            this.gameFadeIn.startTime += pauseDuration;
        }
    }

    adjustPlayerForPause(pauseDuration) {
        if (this.player.lastHitTime) {
            this.player.lastHitTime += pauseDuration;
        }
        if (this.player.dyingStartedAt) {
            this.player.dyingStartedAt += pauseDuration;
        }
        if (this.player.lastShootTime) {
            this.player.lastShootTime += pauseDuration;
        }
        if (this.player.lastGroundedAt) {
            this.player.lastGroundedAt += pauseDuration;
        }
        if (this.player.carryStartAt) {
            this.player.carryStartAt += pauseDuration;
        }
        if (this.player.knockbackUntil) {
            this.player.knockbackUntil += pauseDuration;
        }
    }

    closePauseMenu() {
        this.isPaused = false;
        this.resumeFromPause();
        this.start();
    }

    confirmPauseMenuItem() {
        if (this.pauseMenuIndex === 0) {
            this.closePauseMenu();
            return;
        }

        if (this.pauseMenuIndex === 1) {
            // Artifact gallery — account for pause time, then open gallery
            this.isPaused = false;
            this.resumeFromPause();
            this.openArtifactGallery();
            return;
        }

        this.isPaused = false;
        this.totalPausedTime = 0;
        this.pauseStartAt = 0;
        this.levelStartAt = performance.now();

        if (this.pauseMenuIndex === 2) {
            // Reset progress — clear all saves
            this.clearCheckpoint();
            this.deathCount = 0;
            this.accumulatedPlayTime = 0;
            this.galleryLastIndex = 0;
        } else if (this.pauseMenuIndex === 3) {
            // Return to main screen — restore time and deaths from checkpoint
            const cr = this.getCheckpointRespawn();
            this.accumulatedPlayTime = cr?.playTimeMs ?? 0;
            this.deathCount = cr?.deathCount ?? 0;
            this.isTitleScreen = true;
        }

        this.loadLevel(this.currentLevelId);
        this.startLevel(performance.now());
        this.start();
    }

    toggleMapView() {
        if (!this.mapView) {
            this.mapView = true;
            this.stop();
            this.pauseStartAt = performance.now();
            this.draw(this.simulatedTime);
        } else {
            this.resumeFromPause();
            this.mapView = false;
            this.start();
        }
    }

    // Copies the current canvas into _frozenFrame (lazy-created offscreen canvas).
    // Used whenever a semi-transparent overlay needs a stable world background.
    captureFrame() {
        if (!this.frozenFrame) {
            this.frozenFrame = document.createElement("canvas");
        }
        this.frozenFrame.width = this.canvas.width;
        this.frozenFrame.height = this.canvas.height;
        this.frozenFrame.getContext("2d").drawImage(this.canvas, 0, 0);
    }

    openArtifactGallery() {
        this.isArtifactGallery = true;
        this.pauseStartAt = performance.now();
        this.stop();
        this.draw(this.simulatedTime);
        this.captureFrame();
        this.artifactGallery.open(this.artifacts, this.galleryLastIndex);
        this.drawGallery();
    }

    drawGallery() {
        this.ctx.drawImage(this.frozenFrame, 0, 0);
        this.artifactGallery.draw(this.ctx, this.canvas, performance.now());
    }

    // Burst RAF — runs only while the carousel is sliding (~150ms), then stops.
    animateGallery() {
        this.drawGallery();
        if (this.artifactGallery._animOffset !== 0) {
            requestAnimationFrame(() => this.animateGallery());
        }
    }

    closeArtifactGallery() {
        this.isArtifactGallery = false;
        this.galleryLastIndex = this.artifactGallery.selectedIndex;
        this.resumeFromPause();
        this.lastTime = performance.now();
        this.start();
    }
}
