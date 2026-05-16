import { LEVELS } from "../levels/levelsConfig.js";
import { GameFactory } from "../factories/GameFactory.js";
import { DefaultPlayerRenderer } from "../renderers/PlayerRenderers.js";
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
import { DefaultExitRenderer } from "../renderers/ExitRenderers.js";
import { MessageRenderer } from "../renderers/MessageRenderer.js";
import {
    CannonRenderer,
    CannonBulletRenderer,
} from "../renderers/CannonRenderers.js";
import { getExitLevelLines } from "../messages.js";

export class LostDaysOfSpring {
    constructor(canvasId, showDebug = true) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.showDebug = showDebug;

        // ====== INPUT ======
        this.keys = {};
        this.keysMap = {
            left: "ArrowLeft",
            right: "ArrowRight",
            jump: "Space",
            jumpAlt: "KeyZ",
            crouch: "ArrowDown",
            crouchAlt: "KeyC",
            shoot: "KeyX",
            shootAlt: "AltRight",
            pause: "KeyP",
            map: "KeyM",
            escape: "Escape",
            enter: "Enter",
        };

        // ====== GAME STATE ======
        this.currentLevelId = null;
        this.pendingReset = false;
        this.mapView = false;
        this.levelComplete = false;
        this.gameOver = false;
        this.levelCompleteAt = 0; // timestamp (ms) when level was completed
        this.gameOverAt = 0; // timestamp (ms) when game over occurred
        this.levelStartAt = 0; // timestamp (ms) when the level was loaded
        this.totalPausedTime = 0; // accumulated paused time (ms) within current level
        this.pauseStartAt = 0; // timestamp (ms) when the current pause started
        this.gameOverDelay = 7000; // ms until auto-restart after game over
        this.worldGroundId = "world-ground";

        // ====== PLAYER (Base static attributes set by factory) ======
        this.player = GameFactory.player({ weapon: GameFactory.weapon() });

        // ====== WEAPON ======
        this.bullets = [];
        this.nextBulletId = 0;

        // ====== CANNONS ======
        this.cannons = [];
        this.cannonBullets = [];
        this.nextCannonBulletId = 0;

        // ====== CAMERA ======
        this.camera = {
            x: 0, // current camera X position in world
            y: 0, // current camera Y position in world
            width: this.canvas.width, // viewport width in pixels
            height: this.canvas.height, // viewport height in pixels

            smoothing: 0.15, // base interpolation factor for camera position (0–1)

            lookAheadX: 0, // current horizontal look-ahead offset (interpolated)
            lookAheadXTarget: 216, // horizontal look-ahead distance in pixels
            lookAheadXSmoothing: 0.02, // interpolation factor for horizontal look-ahead

            lookAheadY: 0, // current vertical look-ahead offset (interpolated)
            lookAheadYTargetUp: 96, // look-ahead distance when ascending (pixels)
            lookAheadYTargetDown: 312, // look-ahead distance when falling (pixels)
            lookAheadYSmoothing: 0.12, // vertical look-ahead smoothing

            lookAheadYTargetDownCrouch: 216,

            // culling
            margin: GameFactory.GRID * 10,
        };

        // ====== PHYSICS ======
        this.physics = {
            gravity: 0.52,
            maxFallSpeed: 18,
            fallGravityMultiplier: 1.45,
            jumpCutGravityMultiplier: 2.8,
        };

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
        this.exitRenderer = DefaultExitRenderer;
        this.messageRenderer = MessageRenderer;
        this.cannonRenderer = CannonRenderer;
        this.cannonBulletRenderer = CannonBulletRenderer;

        this.lastTime = performance.now();
        this.accumulator = 0;
        this.loop = this.loop.bind(this);
        this.isRunning = false;

        this.mouse = { worldX: 0, worldY: 0 };

        this.initMouseDebug();
        this.initControls();

        this.decorateDrawMethods();
    }

    decorateDrawMethods() {
        this.drawPlatform = this.withCameraCulling(this.drawPlatform);
        this.drawElevator = this.withCameraCulling(this.drawElevator);
        this.drawEnemy = this.withCameraCulling(this.drawEnemy);
        this.drawCoins = this.withCameraCulling(this.drawCoins);
        this.drawSplinters = this.withCameraCulling(this.drawSplinters);
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
        this.drawHearts = this.withCameraCulling(this.drawHearts);
        this.drawHiddenWall = this.withCameraCulling(this.drawHiddenWall);
    }

    loadLevel(levelId) {
        if (!LEVELS[levelId]) {
            // eslint-disable-next-line no-console
            console.error(`[LostDaysOfSpring] Level ${levelId} not found.`);
            return;
        }

        this.currentLevelId = levelId;
        // Generate a fresh instance of the level data
        const levelData = LEVELS[levelId]();

        this.worldSize = levelData.worldSize;
        this.platforms = levelData.platforms;
        this.elevators = levelData.elevators;
        // Elevators first: same priority order as movePlayerY collision resolution.
        this.solids = [...this.elevators, ...this.platforms];
        this.enemies = levelData.enemies;
        this.coins = levelData.collectibles.coins ?? [];
        this.splinters = levelData.collectibles.splinters ?? [];
        this.hearts = levelData.collectibles.hearts ?? [];
        this.spikes = levelData.spikes ?? [];
        this.messages = levelData.messages ?? [];
        this.activeMessage = null;
        this.exits = levelData.exits ?? [];
        this.hiddenWalls = levelData.hiddenWalls ?? [];
        this.foregroundItems = levelData.foregroundItems ?? [];
        this.backgroundItems = levelData.backgroundItems ?? [];
        this.preBackgroundItems = levelData.preBackgroundItems ?? [];
        this.cannons = levelData.cannons ?? [];
        this.currentLevelCoinsCount = this.coins.length;
        this.currentLevelSplintersCount = this.splinters.length;
        this.currentLevelEnemiesCount = this.enemies.length;

        this.resetPlayerProperties(levelData);

        // Clear held keys to prevent ghost input on level start
        this.keys = {};

        // Reset bullets
        this.bullets = [];
        this.nextBulletId = 0;

        // Reset cannon bullets
        this.cannonBullets = [];
        this.nextCannonBulletId = 0;
        for (const cannon of this.cannons) {
            cannon.lastShootTime =
                performance.now() - cannon.shootFrequency + cannon.delay;
        }

        // Reset Camera
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.lookAheadX = 0;
        this.camera.lookAheadY = 0;

        // Reset level-complete and game-over state
        this.levelComplete = false;
        this.levelCompleteAt = 0;
        this.gameOver = false;
        this.gameOverAt = 0;
        this.levelStartAt = performance.now();
        this.totalPausedTime = 0;
        this.pauseStartAt = 0;
        this.mapView = false;
        this.playerAtExit = false;
    }

    resetPlayerProperties(levelData) {
        Object.assign(this.player, {
            x: levelData?.playerStart?.x ?? 0,
            y: levelData?.playerStart?.y ?? 0,
            prevX: levelData?.playerStart?.x ?? 0,
            prevY: levelData?.playerStart?.y ?? 0,
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
            coinsCount: 0,
            splintersCount: 0,
            facing: "right",
            jumpPressedByUser: false,
            shooting: false,
            lastShootTime: 0,
            jumpPressedAt: 0,
            lastGroundedAt: 0,
        });
    }

    initControls() {
        this._preventDefaultKeys = new Set([
            ...Object.values(this.keysMap),
            "ControlLeft",
            "ControlRight",
        ]);

        window.addEventListener("blur", () => {
            this.keys = {};
        });

        window.addEventListener("keydown", (e) => {
            e.stopPropagation();

            // Toggle pause state
            if (e.code === this.keysMap.pause && !e.repeat) {
                this.togglePause();
            }

            // Toggle map overview
            if (e.code === this.keysMap.map && !e.repeat) {
                this.toggleMapView();
            }

            if (
                (e.code === this.keysMap.jump ||
                    e.code === this.keysMap.jumpAlt) &&
                !this.keys[e.code] &&
                !e.repeat
            ) {
                this.player.jumpPressedAt = performance.now();
            }

            this.keys[e.code] = true;

            if (this._preventDefaultKeys.has(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener("keyup", (e) => {
            e.stopPropagation();
            this.keys[e.code] = false;
        });
    }

    initMouseDebug() {
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.mouse.worldX = Math.round(
                (e.clientX - rect.left) * scaleX + this.camera.x,
            );
            this.mouse.worldY = Math.round(
                (e.clientY - rect.top) * scaleY + this.camera.y,
            );
            if (!this.isRunning) {
                this.updateDebug();
            }
        });
    }

    get hasEnoughCoins() {
        return this.player.coinsCount >= this.currentLevelCoinsCount / 2;
    }

    get hasEnoughSplinters() {
        return (
            this.player.splintersCount >= this.currentLevelSplintersCount / 2
        );
    }

    rectsCollide(a, b) {
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
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

        for (const p of [...this.solids, ...this.enemies]) {
            if (p.type === "oneDirection") {
                continue;
            }
            if (this.rectsCollide(futurePlayer, p)) {
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

    isPlayerOnElevator(elevator) {
        return (
            this.player.onGroundType === "elevator" &&
            this.player.onGroundId === elevator.id
        );
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

    update() {
        // Process deferred reset at the top of the tick before any logic runs
        if (this.pendingReset) {
            this.pendingReset = false;
            this.loadLevel(this.currentLevelId);
            return;
        }

        // Dismiss level-complete or game-over screen
        if (this.keys[this.keysMap.escape]) {
            if (this.levelComplete || this.gameOver) {
                this.resetGame();
                return;
            }
        }

        // Freeze game logic while level-complete or game-over screen is shown
        if (this.levelComplete || this.gameOver) {
            return;
        }

        const now = performance.now();
        this.handleInput(now);
        this.applyPhysics();

        this.player.prevX = this.player.x;
        this.player.prevY = this.player.y;

        this.updateElevators(now);

        this.movePlayerX();
        this.movePlayerY(now);

        this.updateEnemies(now);
        this.updateSpikesDamage(now);

        this.updateBullets(now);
        this.updateCannons(now);
        this.updateCannonBullets(now);
        this.updateCollectibles();
        this.updateHiddenWalls();
        this.updateExit();
        this.updateMessages();

        this.updateCamera(now);
        this.updateDamageCooldown(now);
    }

    // Handle keyboard input: movement, crouch, shooting, jump
    handleInput(now) {
        this.handleHorizontalMovementInput();
        this.handleCrouchInput();
        this.handleShootingInput(now);
        this.handleJumpInput(now);
        this.handleEnterInput();
    }

    handleHorizontalMovementInput() {
        let targetVx = 0;

        const speed = this.isPlayerCrouching()
            ? this.player.crouchSpeed
            : this.player.speed;

        if (this.keys[this.keysMap.left] && !this.keys[this.keysMap.right]) {
            targetVx = -speed;
            this.player.facing = "left";
        } else if (
            this.keys[this.keysMap.right] &&
            !this.keys[this.keysMap.left]
        ) {
            targetVx = speed;
            this.player.facing = "right";
        }

        const delta =
            targetVx === 0
                ? this.player.airborne
                    ? this.player.airDeceleration
                    : this.player.deceleration
                : this.player.airborne
                  ? this.player.airAcceleration
                  : this.player.acceleration;

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
            (this.keys[this.keysMap.crouchAlt] ||
                this.keys[this.keysMap.crouch]) &&
            !this.player.airborne
        ) {
            if (
                !this.isPlayerCrouching() &&
                this.player.onGroundType !== "enemy"
            ) {
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
        if (this.keys[this.keysMap.shoot] || this.keys[this.keysMap.shootAlt]) {
            this.player.shooting = true;
            if (
                now - this.player.lastShootTime >
                this.player.weapon.shootFrequency
            ) {
                const bulletVx =
                    this.player.facing === "left"
                        ? -this.player.weapon.speed
                        : this.player.weapon.speed;
                this.bullets.push({
                    ...this.player.weapon.ammo,
                    id: this.nextBulletId++,
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

            this.player.airborne = true;
            this.player.lastGroundedAt = 0;
            this.player.onGroundId = null;
            this.player.onGroundType = null;
            this.player.jumpPressedByUser = true;
            this.player.jumpPressedAt = 0;
        }
    }

    handleEnterInput() {
        if (this.keys[this.keysMap.enter]) {
            if (
                this.playerAtExit &&
                this.hasEnoughCoins &&
                this.hasEnoughSplinters
            ) {
                this.levelComplete = true;
                this.levelCompleteAt = performance.now();
                this.player.vx = 0;
                this.player.vy = 0;
                this.player.shooting = false;
                this.player.jumpPressedByUser = false;
            }
        }
    }

    // Apply gravity and enforce terminal velocity
    applyPhysics() {
        let currentGravity = this.physics.gravity;
        const isAscending = this.player.vy < 0;
        const isFalling = this.player.vy > 0;
        const jumpHeld =
            this.keys[this.keysMap.jump] || this.keys[this.keysMap.jumpAlt];

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

    // Move player along the X axis and resolve platform collisions
    movePlayerX() {
        const prevX = this.player.prevX ?? this.player.x;

        this.player.x += this.player.vx;

        // World bounds check (X axis)
        if (this.player.x < 0) {
            this.player.x = 0;
            this.player.vx = 0;
        } else if (this.player.x + this.player.w > this.worldSize.width) {
            this.player.x = this.worldSize.width - this.player.w;
            this.player.vx = 0;
        }

        for (const p of this.solids) {
            if (p.type === "oneDirection") {
                continue;
            }
            if (this.rectsCollide(this.player, p)) {
                const platformPrevX = p.previousX ?? p.x;

                const wasLeft =
                    prevX + this.player.w <= Math.max(platformPrevX, p.x);
                const wasRight =
                    prevX >= Math.min(platformPrevX + p.w, p.x + p.w);

                if (wasLeft) {
                    this.player.x = p.x - this.player.w;
                    this.player.vx = 0;
                } else if (wasRight) {
                    this.player.x = p.x + p.w;
                    this.player.vx = 0;
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
            if (this.rectsCollide(this.player, p)) {
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

    hasPassedTarget(current, target, directionSign) {
        if (directionSign > 0) {
            return current >= target;
        }
        if (directionSign < 0) {
            return current <= target;
        }
        return true;
    }

    updateElevators(now) {
        for (const e of this.elevators) {
            e.previousX = e.x;
            e.previousY = e.y;
            if (!e.triggered) {
                continue;
            }
            if (now < e.idleUntil) {
                continue;
            }

            const playerIsOnElevator = this.isPlayerOnElevator(e);
            const moveX = e.dirX * e.speed * e.direction;
            const moveY = e.dirY * e.speed * e.direction;

            const { shouldSkip, picksUp } = this.checkElevatorPlayerBlock(
                e,
                moveX,
                moveY,
                playerIsOnElevator,
            );
            if (shouldSkip) {
                continue;
            }

            const previousX = e.x;
            const previousY = e.y;

            this.moveElevator(e, moveX, moveY, now);
            this.applyElevatorToPlayer(
                e,
                previousX,
                previousY,
                picksUp,
                playerIsOnElevator,
                now,
            );
        }
    }

    // Checks whether the player is in the path of the elevator.
    // Returns shouldSkip=true (and reverses direction) when the elevator must bounce,
    // or picksUp=true when the elevator should collect a standing player from below.
    checkElevatorPlayerBlock(e, moveX, moveY, playerIsOnElevator) {
        const nextX = e.x + moveX;
        const nextY = e.y + moveY;

        const sweptElevator = {
            x: Math.min(e.x, nextX),
            y: Math.min(e.y, nextY),
            w: e.w + Math.abs(moveX),
            h: e.h + Math.abs(moveY),
        };

        const playerBlocksElevator =
            !playerIsOnElevator &&
            this.rectsCollide(this.player, sweptElevator);

        // Elevator moving upward reaches a player standing just above it —
        // instead of bouncing, pick the player up.
        const picksUp =
            playerBlocksElevator &&
            moveY < 0 &&
            !this.player.airborne &&
            this.player.y + this.player.h <= e.y;

        if (playerBlocksElevator && !picksUp) {
            if (!this.player.airborne) {
                e.direction = -e.direction;
            }
            return { shouldSkip: true, picksUp: false };
        }

        return { shouldSkip: false, picksUp };
    }

    // Moves the elevator by the given delta and snaps it to the endpoint when overshot.
    moveElevator(e, moveX, moveY, now) {
        e.x += moveX;
        e.y += moveY;

        const signX = Math.sign(e.dirX);
        const signY = Math.sign(e.dirY);

        const passedX = this.hasPassedTarget(
            e.x,
            e.direction === 1 ? e.targetX : e.startX,
            e.direction === 1 ? signX : -signX,
        );
        const passedY = this.hasPassedTarget(
            e.y,
            e.direction === 1 ? e.targetY : e.startY,
            e.direction === 1 ? signY : -signY,
        );

        if (passedX && passedY) {
            if (e.direction === 1) {
                e.x = e.targetX;
                e.y = e.targetY;
                e.direction = -1;
            } else {
                e.x = e.startX;
                e.y = e.startY;
                e.direction = 1;
            }

            e.idleUntil = now + e.waitTime;
        }
    }

    // Carries a riding player along with the elevator, or snaps a picked-up player onto it.
    applyElevatorToPlayer(
        e,
        previousX,
        previousY,
        picksUp,
        playerIsOnElevator,
        now,
    ) {
        const actualMoveX = e.x - previousX;
        const actualMoveY = e.y - previousY;

        if (playerIsOnElevator) {
            const nextPlayer = {
                x: this.player.x + actualMoveX,
                y: this.player.y + actualMoveY,
                w: this.player.w,
                h: this.player.h,
            };
            const wouldHitPlatform = this.platforms.some((p) =>
                this.rectsCollide(nextPlayer, p),
            );
            if (wouldHitPlatform && actualMoveY < 0) {
                // Vertical elevator is pushing the player into a ceiling:
                // reverse the elevator. movePlayerY cannot fix this because prevY
                // was saved before the co-move, so wasAbove/wasBelow tests would fail.
                // When moving downward, movePlayerY handles landing normally — no reversal needed.
                e.x = previousX;
                e.y = previousY;
                e.direction = -e.direction;
            } else {
                this.player.x += actualMoveX;
                this.player.y += actualMoveY;
            }
        } else if (picksUp) {
            // Elevator arrived at player's feet from below — snap player onto elevator.
            this.handlePlatformLanding(e, now);
            this.handlePlatformLandingResponse(e);
        }
    }

    // Move enemies and check player-enemy collisions
    updateEnemies(now) {
        for (const enemy of this.enemies) {
            // Clear damage flash after 200ms
            if (enemy.isDamaged && now - enemy.damageTime > 200) {
                enemy.isDamaged = false;
            }

            enemy.wasCollidingWithPlayer = enemy.collidingWithPlayerThisFrame;
            enemy.collidingWithPlayerThisFrame = false;

            enemy.prevX = enemy.x;
            enemy.prevY = enemy.y;
            enemy.x += enemy.vx;

            if (enemy.x <= enemy.minX) {
                enemy.x = enemy.minX;
                enemy.vx = enemy.speed;
            } else if (enemy.x + enemy.w >= enemy.maxX) {
                enemy.x = enemy.maxX - enemy.w;
                enemy.vx = -enemy.speed;
            }
        }

        this.resolvePlayerEnemyCollision(now);
    }

    resolvePlayerEnemyCollision(now) {
        const cooldownIsActive =
            now - this.player.lastHitTime < this.player.hitCooldown;

        // Pass 1: mark ALL colliding enemies and record entry side.
        // Must be separate from resolution so enemies that are reached after
        // a `break` still get their wasCollidingWithPlayer state updated.
        for (const enemy of this.enemies) {
            if (!this.rectsCollide(this.player, enemy)) {
                continue;
            }

            enemy.collidingWithPlayerThisFrame = true;

            // Record entry side once at first frame of contact.
            if (!enemy.wasCollidingWithPlayer) {
                enemy.playerEnteredFromLeft =
                    this.player.prevX + this.player.w <= enemy.prevX;
                enemy.playerEnteredFromAbove =
                    this.player.prevY + this.player.h <= enemy.prevY;
                enemy.playerEnteredFromBelow =
                    this.player.prevY >= enemy.prevY + enemy.h;
            }
        }

        // Pass 2: resolve against the first colliding enemy only.
        for (const enemy of this.enemies) {
            if (!enemy.collidingWithPlayerThisFrame) {
                continue;
            }

            if (!cooldownIsActive) {
                this.applyDamageToPlayer(now, enemy, true);
                break;
            }

            // Cooldown active: resolve overlap without damage.
            this.resolveEnemyCollisionX(enemy);
            this.resolveEnemyCollisionY(enemy, now);

            break;
        }
    }

    resolveEnemyCollisionX(enemy) {
        // Vertical entry — Y phase handles it.
        if (enemy.playerEnteredFromAbove || enemy.playerEnteredFromBelow) {
            return;
        }

        const targetX = enemy.playerEnteredFromLeft
            ? enemy.x - this.player.w // came from left → push back left
            : enemy.x + enemy.w; // came from right → push back right

        const blocked =
            this.solids.some((p) =>
                this.rectsCollide(
                    {
                        x: targetX,
                        y: this.player.y,
                        w: this.player.w,
                        h: this.player.h,
                    },
                    p,
                ),
            ) ||
            this.enemies.some(
                (e) =>
                    e !== enemy &&
                    this.rectsCollide(
                        {
                            x: targetX,
                            y: this.player.y,
                            w: this.player.w,
                            h: this.player.h,
                        },
                        e,
                    ),
            );

        if (!blocked) {
            this.player.x = targetX;
        } else {
            // No room for player — snap enemy clear and reverse.
            enemy.x = enemy.playerEnteredFromLeft
                ? this.player.x + this.player.w
                : this.player.x - enemy.w;
            enemy.vx = -enemy.vx;
        }
    }

    resolveEnemyCollisionY(enemy, now) {
        if (enemy.playerEnteredFromAbove) {
            this.player.airborne = false;
            this.player.jumpPressedByUser = false;
            this.player.lastGroundedAt = now;
            this.player.onGroundType = "enemy";
            this.player.onGroundId = enemy.id;
            this.player.lastGroundType = "enemy";
            this.player.lastGroundId = enemy.id;
            this.player.y = enemy.y - this.player.h;
            this.player.vy = 0;
        } else if (enemy.playerEnteredFromBelow) {
            this.player.y = enemy.y + enemy.h;
            this.player.vy = 0;
        }
    }

    applyDamageToPlayer(now, source, extraRecoilIfAbove = false) {
        this.player.life -= source.damage;
        this.player.lastHitTime = now;
        this.player.isHit = true;

        const hitFromAbove = this.player.prevY + this.player.h <= source.y;

        const recoilXForce =
            extraRecoilIfAbove && hitFromAbove
                ? source.recoilX / 1.5
                : source.recoilX;
        const recoilYForce =
            extraRecoilIfAbove && hitFromAbove
                ? source.recoilY * 1.5
                : source.recoilY;

        this.player.jumpPressedByUser = false;
        const hitFromLeft =
            this.player.x + this.player.w / 2 < source.x + source.w / 2;
        this.player.vx = hitFromLeft ? -recoilXForce : recoilXForce;
        this.player.vy = -recoilYForce;

        this.checkPlayerIsDead(now);
    }

    checkPlayerIsDead(now) {
        if (this.player.life <= 0) {
            this.gameOver = true;
            this.gameOverAt = now;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.shooting = false;
        }
    }

    updateSpikesDamage(now) {
        for (const spike of this.spikes) {
            if (this.rectsCollide(this.player, spike)) {
                const cooldownIsActive =
                    now - this.player.lastHitTime < this.player.hitCooldown;

                if (!cooldownIsActive) {
                    this.applyDamageToPlayer(now, spike);
                    if (this.gameOver) {
                        return;
                    }
                }
                break;
            }
        }
    }

    // Move bullets, remove out-of-bounds ones, and check bullet-enemy collisions
    updateBullets(now) {
        for (
            let bulletIndex = this.bullets.length - 1;
            bulletIndex >= 0;
            bulletIndex--
        ) {
            const bullet = this.bullets[bulletIndex];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // Remove if outside world bounds
            if (
                bullet.x > this.worldSize.width ||
                bullet.x + bullet.w < 0 ||
                bullet.y > this.worldSize.height ||
                bullet.y + bullet.h < 0
            ) {
                this.bullets.splice(bulletIndex, 1);
                continue;
            }

            let consumedOnEnemy = false;
            // Bullet-enemy collision
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                if (this.rectsCollide(bullet, this.enemies[i])) {
                    const enemy = this.enemies[i];
                    enemy.health -= bullet.damage;
                    if (enemy.health <= 0) {
                        this.enemies.splice(i, 1);
                    } else {
                        enemy.isDamaged = true;
                        enemy.damageTime = now;
                    }
                    consumedOnEnemy = true; // bullet consumed on hit
                    this.bullets.splice(bulletIndex, 1);
                    break;
                }
            }

            if (consumedOnEnemy) {
                continue;
            }

            let consumedOnPlatform = false;
            for (let i = this.solids.length - 1; i >= 0; i--) {
                if (this.rectsCollide(bullet, this.solids[i])) {
                    this.bullets.splice(bulletIndex, 1);
                    consumedOnPlatform = true;
                    break;
                }
            }

            if (consumedOnPlatform) {
                continue;
            }
        }
    }

    // Trigger cannons to shoot based on shootFrequency
    updateCannons(now) {
        for (const cannon of this.cannons) {
            const elapsed = now - cannon.lastShootTime;
            if (elapsed < cannon.shootFrequency) {
                continue;
            }

            // Advance by whole multiples of shootFrequency to maintain phase offset
            cannon.lastShootTime +=
                Math.floor(elapsed / cannon.shootFrequency) *
                cannon.shootFrequency;

            const bulletW = cannon.ammo.w;

            this.cannonBullets.push({
                ...cannon.ammo,
                id: this.nextCannonBulletId++,
                x: cannon.x + cannon.w / 2 - bulletW / 2,
                y: cannon.y + cannon.h,
                vx: 0,
                vy: cannon.speed,
                targetY: cannon.targetY,
                recoilX: 0,
                recoilY: 5,
                color: cannon.color,
            });
        }
    }

    // Move cannon bullets and check collision with player only
    updateCannonBullets(now) {
        for (let i = this.cannonBullets.length - 1; i >= 0; i--) {
            const bullet = this.cannonBullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            if (bullet.y > bullet.targetY) {
                this.cannonBullets.splice(i, 1);
                continue;
            }

            if (this.rectsCollide(bullet, this.player)) {
                this.cannonBullets.splice(i, 1);
                const cooldownIsActive =
                    now - this.player.lastHitTime < this.player.hitCooldown;
                if (!cooldownIsActive) {
                    this.applyDamageToPlayer(now, bullet);
                    if (this.gameOver) {
                        return;
                    }
                }
            }
        }
    }

    // Check player-collectible collisions and mark collected items
    updateCollectibles() {
        for (const c of this.coins) {
            if (!c.collected && this.rectsCollide(this.player, c)) {
                c.collected = true;
                this.player.coinsCount++;
            }
        }

        for (const s of this.splinters) {
            if (!s.collected && this.rectsCollide(this.player, s)) {
                s.collected = true;
                this.player.splintersCount++;
            }
        }

        for (const h of this.hearts) {
            if (
                !h.collected &&
                this.rectsCollide(this.player, h) &&
                this.player.life < this.player.maxLife
            ) {
                h.collected = true;
                this.player.life++;
            }
        }
    }

    updateHiddenWalls() {
        for (const wall of this.hiddenWalls) {
            wall.entered = this.rectsCollide(this.player, wall);
        }
    }

    withCameraCulling(drawFn, { noCullingInMapView = true } = {}) {
        return (obj, ...args) => {
            if (noCullingInMapView && this.mapView) {
                drawFn.call(this, obj, ...args);
                return;
            }

            if (!this.isVisibleInCamera(obj)) {
                return;
            }

            drawFn.call(this, obj, ...args);
        };
    }

    calcDesiredLookAheadY(now) {
        if (this.player.vy < 0) {
            const upRatio = Math.min(
                Math.abs(this.player.vy) / this.player.jump,
                1,
            );
            return -this.camera.lookAheadYTargetUp * upRatio * upRatio;
        }

        if (this.player.vy > 0) {
            const downRatio = Math.min(
                this.player.vy / this.physics.maxFallSpeed,
                1,
            );
            return this.camera.lookAheadYTargetDown * downRatio * downRatio;
        }

        if (this.player.onGroundType === "elevator") {
            const elevator = this.elevators.find(
                (e) => e.id === this.player.onGroundId,
            );
            if (!elevator || elevator.dirY === 0 || now < elevator.idleUntil) {
                return 0;
            }
            const elevatorVy =
                elevator.dirY * elevator.speed * elevator.direction;
            if (elevatorVy < 0) {
                const upRatio = Math.min(
                    Math.abs(elevatorVy) / this.physics.maxFallSpeed,
                    1,
                );
                return -this.camera.lookAheadYTargetUp * upRatio * upRatio;
            }
            const downRatio = Math.min(
                elevatorVy / this.physics.maxFallSpeed,
                1,
            );
            return this.camera.lookAheadYTargetDown * downRatio * downRatio;
        }

        return 0;
    }

    updateCameraX() {
        const desiredLookAheadX =
            this.player.facing === "right"
                ? this.camera.lookAheadXTarget
                : -this.camera.lookAheadXTarget;

        this.camera.lookAheadX +=
            (desiredLookAheadX - this.camera.lookAheadX) *
            this.camera.lookAheadXSmoothing;

        const targetX =
            this.player.x + this.player.w / 2 - this.camera.width / 2;

        this.camera.x +=
            (targetX + this.camera.lookAheadX - this.camera.x) *
            this.camera.smoothing;
    }

    updateCameraY(now) {
        let desiredLookAheadY = this.calcDesiredLookAheadY(now);

        if (this.isPlayerCrouching()) {
            desiredLookAheadY += this.camera.lookAheadYTargetDownCrouch;
        }

        this.camera.lookAheadY +=
            (desiredLookAheadY - this.camera.lookAheadY) *
            this.camera.lookAheadYSmoothing;

        const playerFootY = this.player.y + this.player.h;
        const targetY =
            playerFootY -
            this.player.originalHeight / 2 -
            this.camera.height / 2;

        this.camera.y +=
            (targetY + this.camera.lookAheadY - this.camera.y) *
            this.camera.smoothing;
    }

    clampCameraToWorld() {
        this.camera.x = Math.max(
            0,
            Math.min(this.camera.x, this.worldSize.width - this.camera.width),
        );
        this.camera.y = Math.max(
            0,
            Math.min(this.camera.y, this.worldSize.height - this.camera.height),
        );
    }

    updateCamera(now) {
        if (this.mapView) {
            return;
        }

        this.updateCameraX();
        this.updateCameraY(now);
        this.clampCameraToWorld();
    }

    isVisibleInCamera(obj) {
        const w = obj.w ?? 0;
        const h = obj.h ?? 0;
        return !(
            obj.x + w < this.camera.x - this.camera.margin ||
            obj.x > this.camera.x + this.camera.width + this.camera.margin ||
            obj.y + h < this.camera.y - this.camera.margin ||
            obj.y > this.camera.y + this.camera.height + this.camera.margin
        );
    }

    updateDamageCooldown(now) {
        if (
            this.player.isHit &&
            now - this.player.lastHitTime >= this.player.hitCooldown
        ) {
            this.player.isHit = false;
        }
    }

    drawPlayer() {
        this.playerRenderer.draw(this.ctx, this.player, this.showDebug);
    }

    drawPlatform(p) {
        if (this.mapView) {
            this.platformRenderer.drawMap(this.ctx, p, this.showDebug);
            return;
        }
        this.platformRenderer.draw(this.ctx, p, this.showDebug, this.camera);
    }

    drawElevator(e) {
        if (this.mapView) {
            this.platformRenderer.drawMap(this.ctx, e, this.showDebug);
            return;
        }
        this.platformRenderer.draw(this.ctx, e, this.showDebug, this.camera);
    }

    drawHiddenWall(wall) {
        if (this.mapView) {
            this.platformRenderer.drawMap(this.ctx, wall, this.showDebug);
            return;
        }
        this.platformRenderer.drawHiddenWall(
            this.ctx,
            wall,
            this.showDebug,
            this.camera,
        );
    }

    drawEnemy(e) {
        if (this.mapView) {
            if (this.showDebug) {
                this.enemyRenderer.draw(this.ctx, e);
            }
            return;
        }
        this.enemyRenderer.draw(this.ctx, e, this.showDebug);
    }

    drawCoins(c) {
        if (this.mapView) {
            if (this.showDebug) {
                this.collectibleRenderer.drawMapCoin(this.ctx, c);
            }
            return;
        }
        this.collectibleRenderer.drawCoin(this.ctx, c, this.showDebug);
    }

    drawSplinters(s) {
        if (this.mapView) {
            if (this.showDebug) {
                this.collectibleRenderer.drawMapSplinter(this.ctx, s);
            }
            return;
        }
        this.collectibleRenderer.drawSplinter(this.ctx, s, this.showDebug);
    }

    drawHearts(s) {
        if (this.mapView) {
            if (this.showDebug) {
                this.collectibleRenderer.drawMapHeart(this.ctx, s);
            }
            return;
        }
        this.collectibleRenderer.drawHeart(this.ctx, s, this.showDebug);
    }

    drawBullet(b) {
        this.weaponRenderer.draw(this.ctx, b);
    }

    drawCannon(cannon) {
        if (this.mapView) {
            this.cannonRenderer.drawMapCannon(this.ctx, cannon);
            return;
        }
        this.cannonRenderer.draw(this.ctx, cannon);
    }

    drawCannonBullet(b) {
        this.cannonBulletRenderer.draw(this.ctx, b);
    }

    drawSpike(spike) {
        if (this.mapView) {
            this.spikeRenderer.drawMapSpike(this.ctx, spike);
            return;
        }
        this.spikeRenderer.draw(this.ctx, spike, this.showDebug);
    }

    drawEnvPreBackgroundItem(i) {
        if (this.mapView) {
            return;
        }
        this.worldRenderer.drawEnvironmentItem(this.ctx, i);
    }

    drawEnvBackgroundItem(i) {
        if (this.mapView) {
            return;
        }
        this.worldRenderer.drawEnvironmentItem(this.ctx, i);
    }

    drawWorld() {
        this.worldRenderer.drawBackground(this.ctx, this.canvas, this.camera);
    }

    drawEnvForegroundItem(i) {
        if (this.mapView) {
            return;
        }
        this.worldRenderer.drawEnvironmentItem(this.ctx, i);
    }

    draw() {
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
            this.ctx.translate(
                -Math.round(this.camera.x),
                -Math.round(this.camera.y),
            );
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

        for (const wall of this.hiddenWalls) {
            this.drawHiddenWall(wall);
        }

        for (const i of this.backgroundItems) {
            this.drawEnvBackgroundItem(i);
        }

        for (const w of this.bullets) {
            this.drawBullet(w);
        }

        for (const b of this.cannonBullets) {
            this.drawCannonBullet(b);
        }

        for (const c of this.coins) {
            if (!c.collected) {
                this.drawCoins(c);
            }
        }

        for (const s of this.splinters) {
            if (!s.collected) {
                this.drawSplinters(s);
            }
        }

        for (const h of this.hearts) {
            if (!h.collected) {
                this.drawHearts(h);
            }
        }

        for (const e of this.elevators) {
            this.drawElevator(e);
        }

        for (const spike of this.spikes) {
            this.drawSpike(spike);
        }

        for (const e of this.enemies) {
            this.drawEnemy(e);
        }

        for (const cannon of this.cannons) {
            this.drawCannon(cannon);
        }

        for (const wall of this.hiddenWalls) {
            this.drawHiddenWall(wall);
        }

        this.drawPlayer();

        for (const i of this.foregroundItems) {
            this.drawEnvForegroundItem(i);
        }

        if (this.showDebug) {
            DebugGridRenderer.draw(this.ctx, this.camera, this.worldSize);
        }

        this.ctx.restore();

        if (this.playerAtExit && !this.levelComplete && !this.gameOver) {
            this.drawExitMessage();
        }

        if (this.activeMessage && !this.levelComplete && !this.gameOver) {
            this.messageRenderer.drawMessagePanel(
                this.ctx,
                this.canvas,
                this.activeMessage,
                this.camera,
            );
        }

        this.hudRenderer.draw(
            this.ctx,
            this.canvas,
            this.player,
            this.currentLevelCoinsCount,
            this.currentLevelSplintersCount,
        );

        if (this.levelComplete) {
            this.drawLevelComplete();
        }

        if (this.gameOver) {
            this.drawGameOver();
        }
    }

    drawLevelComplete() {
        const playTimeMs =
            this.levelCompleteAt - this.levelStartAt - this.totalPausedTime;
        this.levelCompleteRenderer.drawLevelCompleteScreen(
            this.ctx,
            this.canvas,
            this.player.coinsCount,
            this.currentLevelCoinsCount,
            this.player.splintersCount,
            this.currentLevelSplintersCount,
            this.currentLevelEnemiesCount - this.enemies.length,
            this.currentLevelEnemiesCount,
            playTimeMs,
        );
    }

    drawGameOver() {
        const elapsed = performance.now() - this.gameOverAt;
        const remaining = Math.max(
            0,
            Math.ceil((this.gameOverDelay - elapsed) / 1000),
        );
        const playTimeMs =
            this.gameOverAt - this.levelStartAt - this.totalPausedTime;

        this.gameOverRenderer.drawGameOverScreen(
            this.ctx,
            this.canvas,
            this.player.coinsCount,
            this.currentLevelCoinsCount,
            this.player.splintersCount,
            this.currentLevelSplintersCount,
            this.currentLevelEnemiesCount - this.enemies.length,
            this.currentLevelEnemiesCount,
            remaining,
            playTimeMs,
        );
    }

    exitHitbox(exit) {
        const m = exit.triggerMargin;
        return {
            x: exit.x - m,
            y: exit.y - m,
            w: exit.w * GameFactory.SCALE + m * 2,
            h: exit.h * GameFactory.SCALE + m,
        };
    }

    findActiveExit() {
        return (
            this.exits.find((e) =>
                this.rectsCollide(this.player, this.exitHitbox(e)),
            ) ?? null
        );
    }

    updateExit() {
        this.playerAtExit = this.exits.some((exit) =>
            this.rectsCollide(this.player, this.exitHitbox(exit)),
        );
    }

    updateMessages() {
        const hit =
            this.messages.find((message) => {
                if (message.strategy === "single" && message.shown) {
                    return false;
                }
                return this.rectsCollide(this.player, message);
            }) ?? null;

        if (this.activeMessage && !hit) {
            // player just left the hitbox
            this.activeMessage.shown = true;
        }

        this.activeMessage = hit;
    }

    drawExit(exit) {
        this.exitRenderer.draw(this.ctx, exit, this.showDebug);
    }

    drawExitMessage() {
        const exit = this.findActiveExit();
        if (!exit) {
            return;
        }
        const anchorX =
            exit.x - this.camera.x + (exit.w * GameFactory.SCALE) / 2;
        const anchorY =
            exit.y - this.camera.y + (exit.h * GameFactory.SCALE) / 2;
        const lines = getExitLevelLines(
            this.hasEnoughCoins,
            this.hasEnoughSplinters,
        );
        MessageRenderer.drawPanel(this.ctx, { lines }, anchorX, anchorY);
    }

    updateDebug() {
        DebugHudRenderer.update(
            this.canvas,
            this.showDebug,
            this.debug,
            this.player,
            this.mouse,
        );
    }

    loop(now) {
        if (!this.isRunning) {
            return;
        }

        let frameTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        if (frameTime > this.gameLoop.maxFrameTime) {
            frameTime = this.gameLoop.maxFrameTime;
        }

        this.accumulator += frameTime;

        while (this.accumulator >= this.gameLoop.fixedDt) {
            this.update();
            this.accumulator -= this.gameLoop.fixedDt;
        }

        this.draw();
        this.updateDebug();

        if (this.gameOver && now - this.gameOverAt >= this.gameOverDelay) {
            this.resetGame();
        }

        window.requestAnimationFrame(this.loop);
    }

    start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.lastTime = performance.now();
        window.requestAnimationFrame(this.loop);
    }

    stop() {
        this.isRunning = false;
    }

    // Toggle pause state
    togglePause() {
        if (this.levelComplete || this.gameOver || this.mapView) {
            return;
        }
        if (this.isRunning) {
            this.stop();
            this.pauseStartAt = performance.now();

            // Draw pause overlay
            this.pauseRenderer.drawPauseScreen(this.ctx, this.canvas);
        } else {
            this.totalPausedTime += performance.now() - this.pauseStartAt;
            this.start();
        }
    }

    toggleMapView() {
        if (!this.mapView) {
            // prevent to open minimap when pause is active
            if (!this.isRunning) {
                return;
            }
            this.mapView = true;
            this.stop();
            this.pauseStartAt = performance.now();
            this.draw();
        } else {
            this.totalPausedTime += performance.now() - this.pauseStartAt;
            this.mapView = false;
            this.start();
        }
    }
}
