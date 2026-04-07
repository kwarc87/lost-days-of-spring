import { LEVELS } from "../levels/levelsConfig.js";
import { GameFactory } from "../factories/GameFactory.js";
import { DefaultPlayerRenderer } from "../renderers/PlayerRenderers.js";
import {
    DefaultPlatformRenderer,
    BouncyPlatformRenderer,
    BoosterPlatformRenderer,
} from "../renderers/PlatformRenderers.js";
import { DefaultEnemyRenderer } from "../renderers/EnemyRenderers.js";
import { DefaultWorldRenderer } from "../renderers/WorldRenderers.js";
import { DefaultPauseRenderer } from "../renderers/PauseRenderers.js";
import { DefaultCollectibleRenderer } from "../renderers/CollectibleRenderers.js";
import { DefaultWeaponRenderer } from "../renderers/WeaponRenderers.js";
import { DebugGridRenderer } from "../renderers/DebugRenderers.js";
import { DefaultHubRenderer } from "../renderers/HudRenderers.js";
import { DefaultLevelCompleteRenderer } from "../renderers/LevelCompleteRenderers.js";
import { DefaultGameOverRenderer } from "../renderers/GameOverRenderer.js";

export class LostDaysOfSpring {
    constructor(canvasId, showDebug = true) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.showDebug = showDebug;

        // ====== INPUT ======
        this.keys = {};
        this.KEYS = {
            left: "ArrowLeft",
            right: "ArrowRight",
            jump: "ArrowUp",
            crouch: "ArrowDown",
            crouchAlt: "KeyC",
            shoot: "Space",
            pause: "KeyP",
            map: "KeyM",
        };

        // ====== GAME STATE ======
        this.currentLevelId = null;
        this.pendingReset = false;
        this.mapView = false;
        this.levelComplete = false;
        this.gameOver = false;
        this.levelCompleteAt = 0; // timestamp (ms) when level was completed
        this.gameOverAt = 0; // timestamp (ms) when game over occurred
        this.LEVEL_COMPLETE_DELAY = 7000; // ms until auto-restart
        this.GAME_OVER_DELAY = 7000; // ms until auto-restart after game over
        this.WORLD_GROUND_ID = "world-ground";

        // ====== PLAYER (Base static attributes set by factory) ======
        this.player = GameFactory.player({ weapon: GameFactory.weapon() });

        // ====== WEAPON ======
        this.bullets = [];
        this.nextBulletId = 0;

        // ====== CAMERA ======
        this.CAMERA = {
            x: 0, // current camera X position in world
            y: 0, // current camera Y position in world
            width: this.canvas.width, // viewport width in pixels
            height: this.canvas.height, // viewport height in pixels

            smoothing: 0.15, // base interpolation factor for camera position (0–1)

            lookAheadX: 0, // current horizontal look-ahead offset (interpolated)
            lookAheadXTarget: 180, // horizontal look-ahead distance in pixels
            lookAheadXSmoothing: 0.02, // interpolation factor for horizontal look-ahead

            lookAheadY: 0, // current vertical look-ahead offset (interpolated)
            lookAheadYTargetUp: 120, // look-ahead distance when ascending (pixels)
            lookAheadYTargetDown: 220, // look-ahead distance when falling (pixels)
            lookAheadYSmoothing: 0.12, // vertical look-ahead smoothing

            lookAheadYTargetDownCrouch: 100,
        };

        // ====== PHYSICS ======
        this.PHYSICS = {
            gravity: 0.52,
            minBounceSpeed: 0.5,
            maxFallSpeed: 18,
            fallGravityMultiplier: 1.45,
            jumpCutGravityMultiplier: 2.8,
        };

        // ====== POSTURES ======
        this.PLAYER_POSTURES = {
            STANDING: "standing",
            CROUCH: "crouch",
            AIRBORNE: "airborne",
        };

        // ====== DEBUG ======
        this.DEBUG = {
            updateInterval: 50, // ms
            lastUpdate: 0,
        };

        // ====== GAME LOOP CONFIG ======
        this.GAME_LOOP = {
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

        this.lastTime = performance.now();
        this.accumulator = 0;
        this.loop = this.loop.bind(this);
        this.isRunning = false;

        this.mouse = { worldX: 0, worldY: 0 };
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.mouse.worldX = Math.round(
                (e.clientX - rect.left) * scaleX + this.CAMERA.x,
            );
            this.mouse.worldY = Math.round(
                (e.clientY - rect.top) * scaleY + this.CAMERA.y,
            );
        });

        this.initControls();

        // Start game by loading level 1
        this.loadLevel(1);
    }

    loadLevel(levelId) {
        if (!LEVELS[levelId]) {
            console.error(`[LostDaysOfSpring] Level ${levelId} not found.`);
            return;
        }

        this.currentLevelId = levelId;
        // Generate a fresh instance of the level data
        const levelData = LEVELS[levelId]();

        this.WORLD_SIZE = levelData.worldSize;
        this.platforms = levelData.platforms;
        this.enemies = levelData.enemies;
        this.collectibles = levelData.collectibles ?? [];
        this.currentLevelCollectiblesCount = this.collectibles.length;

        // Reset dynamic player properties according to level start
        Object.assign(this.player, {
            x: levelData.playerStart.x,
            y: levelData.playerStart.y,
            vx: 0,
            vy: 0,
            posture: this.PLAYER_POSTURES.STANDING,
            h: this.player.originalHeight,
            w: this.player.originalWidth,
            life: this.player.maxLife,
            isHit: false,
            lastHitTime: 0,
            onGroundId: null,
            onGroundType: null,
            lastGroundId: null,
            lastGroundType: null,
            bounceCount: 0,
            collectiblesCount: 0,
            facing: "right",
            jumpPressedByUser: false,
            shooting: false,
            lastShootTime: 0,
            jumpPressedAt: 0,
            lastGroundedAt: 0,
        });

        // Clear held keys to prevent ghost input on level start
        this.keys = {};

        // Initialize dynamic entity defaults
        this.initEnemies();

        // Reset bullets
        this.bullets = [];
        this.nextBulletId = 0;

        // Reset Camera
        this.CAMERA.x = 0;
        this.CAMERA.y = 0;
        this.CAMERA.lookAheadX = 0;
        this.CAMERA.lookAheadY = 0;

        // Reset level-complete and game-over state
        this.levelComplete = false;
        this.levelCompleteAt = 0;
        this.gameOver = false;
        this.gameOverAt = 0;
    }

    initControls() {
        window.addEventListener("keydown", (e) => {
            e.stopPropagation();

            // Dismiss level-complete screen early
            if (e.code === "Escape" && this.levelComplete && !e.repeat) {
                this.resetGame();
            }

            // Dismiss game-over screen early
            if (e.code === "Escape" && this.gameOver && !e.repeat) {
                this.resetGame();
            }

            // Toggle pause state
            if (e.code === this.KEYS.pause && !e.repeat) {
                this.togglePause();
            }

            // Toggle map overview
            if (e.code === this.KEYS.map && !e.repeat) {
                this.mapView = !this.mapView;
            }

            if (e.code === this.KEYS.jump && !this.keys[e.code] && !e.repeat) {
                this.player.jumpPressedAt = performance.now();
            }

            this.keys[e.code] = true;

            if (
                [
                    ...Object.values(this.KEYS),
                    "ControlLeft",
                    "ControlRight",
                ].includes(e.code)
            ) {
                e.preventDefault();
            }
        });

        window.addEventListener("keyup", (e) => {
            e.stopPropagation();
            this.keys[e.code] = false;
        });
    }

    initEnemies() {
        for (const enemy of this.enemies) {
            const p = this.platforms.find((pl) => pl.id === enemy.platformId);
            if (p) {
                enemy.x = p.x + p.w / 2 - enemy.w / 2;
                enemy.y = p.y - enemy.h;
                enemy.minX = p.x;
                enemy.maxX = p.x + p.w;
                enemy.vx = enemy.speed;
                enemy.health = enemy.health ?? 15;
                enemy.isDamaged = false;
                enemy.damageTime = 0;
            }
        }
    }

    rectsCollide(a, b) {
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        );
    }

    canApplyPlayerPosture(posture, anchorY = "bottom", anchorX = "center") {
        const hitbox = this.getPlayerHitboxForPosture(posture);

        return this.canApplyPosture(hitbox.h, hitbox.w, anchorY, anchorX);
    }

    canApplyPosture(height, width, anchorY = "bottom", anchorX = "center") {
        let nextX = this.player.x;
        let nextY = this.player.y;

        if (anchorX === "center") {
            const centerX = this.player.x + this.player.w / 2;
            nextX = centerX - width / 2;
        }

        if (anchorY === "bottom") {
            const bottomY = this.player.y + this.player.h;
            nextY = bottomY - height;
        }

        const futurePlayer = {
            x: nextX,
            y: nextY,
            w: width,
            h: height,
        };

        for (const p of this.platforms) {
            if (this.rectsCollide(futurePlayer, p)) {
                return false;
            }
        }

        return true;
    }

    canStandUp() {
        return this.canApplyPlayerPosture(this.PLAYER_POSTURES.STANDING);
    }

    canCrouch() {
        return this.canApplyPlayerPosture(this.PLAYER_POSTURES.CROUCH);
    }

    isPlayerCrouching() {
        return this.player.posture === this.PLAYER_POSTURES.CROUCH;
    }

    isPlayerAirborne() {
        return this.player.posture === this.PLAYER_POSTURES.AIRBORNE;
    }

    isPlayerStanding() {
        return this.player.posture === this.PLAYER_POSTURES.STANDING;
    }

    getPlayerHitboxForPosture(posture) {
        switch (posture) {
            case this.PLAYER_POSTURES.CROUCH:
                return {
                    w: this.player.crouchWidth,
                    h: this.player.crouchHeight,
                };

            case this.PLAYER_POSTURES.AIRBORNE:
                return {
                    w: this.player.originalWidth,
                    h: this.player.jumpHeight,
                };

            case this.PLAYER_POSTURES.STANDING:
            default:
                return {
                    w: this.player.originalWidth,
                    h: this.player.originalHeight,
                };
        }
    }

    applyPlayerHeight(nextHeight, anchorY = "top") {
        if (anchorY === "bottom") {
            const bottom = this.player.y + this.player.h;
            this.player.h = nextHeight;
            this.player.y = bottom - nextHeight;
            return;
        }

        this.player.h = nextHeight;
    }

    applyPlayerWidth(nextWidth, anchorX = "center") {
        if (anchorX === "center") {
            const centerX = this.player.x + this.player.w / 2;
            this.player.w = nextWidth;
            this.player.x = centerX - nextWidth / 2;
            return;
        }

        this.player.w = nextWidth;
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

        // Freeze game logic while level-complete or game-over screen is shown
        if (this.levelComplete || this.gameOver) {
            return;
        }

        this.handleInput();
        this.applyPhysics();
        this.movePlayerX();
        this.movePlayerY();
        this.updateEnemies();
        this.updateBullets();
        this.updateCollectibles();
        this.updateCamera();
        this.updateDamageCooldown();
    }

    // Handle keyboard input: movement, crouch, shooting, jump
    handleInput() {
        this.handleHorizontalMovementInput();
        this.handleCrouchInput();
        this.handleShootingInput();
        this.handleJumpInput();
    }

    handleHorizontalMovementInput() {
        let targetVx = 0;

        if (this.keys[this.KEYS.left] && !this.keys[this.KEYS.right]) {
            targetVx = -this.player.speed;
            this.player.facing = "left";
        } else if (this.keys[this.KEYS.right] && !this.keys[this.KEYS.left]) {
            targetVx = this.player.speed;
            this.player.facing = "right";
        }

        const isAirborne = this.player.onGroundId === null;

        const delta =
            targetVx === 0
                ? isAirborne
                    ? this.player.airDeceleration
                    : this.player.deceleration
                : isAirborne
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
        const onGround = this.player.onGroundId !== null;
        if (
            (this.keys[this.KEYS.crouchAlt] || this.keys[this.KEYS.crouch]) &&
            onGround
        ) {
            if (!this.isPlayerCrouching() && this.canCrouch()) {
                this.handleCrouchStart();
            }
        } else if (this.isPlayerCrouching() && this.canStandUp()) {
            this.handleCrouchEnd();
        }
    }

    handleCrouchStart() {
        this.applyPosture(
            this.PLAYER_POSTURES.CROUCH,
            this.player.crouchHeight,
            this.player.crouchWidth,
            "bottom",
        );
    }

    handleCrouchEnd() {
        this.applyPosture(
            this.PLAYER_POSTURES.STANDING,
            this.player.originalHeight,
            this.player.originalWidth,
            "bottom",
        );
    }

    handleLandingToStanding() {
        this.applyPosture(
            this.PLAYER_POSTURES.STANDING,
            this.player.originalHeight,
            this.player.originalWidth,
            "bottom",
        );
    }

    handleTransitionToAirborne() {
        this.applyPosture(
            this.PLAYER_POSTURES.AIRBORNE,
            this.player.jumpHeight,
            this.player.originalWidth,
            "bottom",
        );
    }

    handleCrouchToAirborne() {
        this.handleTransitionToAirborne();
    }

    applyPosture(posture, height, width, anchorY = "bottom") {
        this.player.posture = posture;
        this.applyPlayerHeight(height, anchorY);
        this.applyPlayerWidth(width, "center");
    }

    handleShootingInput() {
        const customShootingOffsetY = -4;
        const customShootingOffsetX = 40;
        if (this.keys[this.KEYS.shoot]) {
            this.player.shooting = true;
            const now = performance.now();
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

    handleJumpInput() {
        if (this.player.posture === this.PLAYER_POSTURES.CROUCH) {
            return;
        }
        const now = performance.now();
        const jumpBuffered =
            now - this.player.jumpPressedAt <= this.player.jumpBufferDuration;

        const isTouchingGround = this.player.onGroundId !== null;
        const isOnBooster = this.player.onGroundType === "booster";
        const leftBoosterRecently = this.player.lastGroundType === "booster";

        const hasCoyoteTime =
            now - this.player.lastGroundedAt <= this.player.coyoteDuration &&
            !leftBoosterRecently;

        const canGroundJump =
            !isOnBooster && (isTouchingGround || hasCoyoteTime);

        if (jumpBuffered && canGroundJump) {
            this.player.vy = -this.player.jump;

            this.handleTransitionToAirborne();

            this.player.bounceCount = 0;
            this.player.lastGroundedAt = 0;
            this.player.onGroundId = null;
            this.player.onGroundType = null;
            this.player.jumpPressedByUser = true;
            this.player.jumpPressedAt = 0;
        }
    }

    // Apply gravity and enforce terminal velocity
    applyPhysics() {
        let currentGravity = this.PHYSICS.gravity;
        const isAscending = this.player.vy < 0;
        const isFalling = this.player.vy > 0;
        const jumpHeld = this.keys[this.KEYS.jump];

        // Variable jump height: fall faster if jump key is released while ascending
        if (isAscending && !jumpHeld && this.player.jumpPressedByUser) {
            currentGravity *= this.PHYSICS.jumpCutGravityMultiplier;
        } else if (isFalling) {
            currentGravity *= this.PHYSICS.fallGravityMultiplier;
        }

        this.player.vy += currentGravity;

        // Terminal velocity cap
        if (this.player.vy > this.PHYSICS.maxFallSpeed) {
            this.player.vy = this.PHYSICS.maxFallSpeed;
        }
    }

    // Move player along the X axis and resolve platform collisions
    movePlayerX() {
        this.player.x += this.player.vx;

        // World bounds check (X axis)
        if (this.player.x < 0) {
            this.player.x = 0;
            this.player.vx = 0;
        } else if (this.player.x + this.player.w > this.WORLD_SIZE.width) {
            this.player.x = this.WORLD_SIZE.width - this.player.w;
            this.player.vx = 0;
        }

        for (const p of this.platforms) {
            if (this.rectsCollide(this.player, p)) {
                if (this.player.vx > 0) {
                    this.player.x = p.x - this.player.w;
                } else if (this.player.vx < 0) {
                    this.player.x = p.x + p.w;
                }
                this.player.vx = 0;
                break;
            }
        }
    }

    // Move player along the Y axis, resolve platform collisions, and check fall-off
    movePlayerY() {
        const previousY = this.player.y;
        const previousH = this.player.h;
        this.player.y += this.player.vy;
        this.player.onGroundId = null;
        this.player.onGroundType = null;

        // When leaving the ground (fell off ledge, booster launch) — switch to jumpHeight
        if (!this.isPlayerCrouching() && !this.isPlayerAirborne()) {
            this.handleTransitionToAirborne();
        }

        if (this.player.y < 0) {
            this.handleWorldCeilHit();
        } else if (this.player.y + this.player.h > this.WORLD_SIZE.height) {
            this.handleWorldGroundLanding();
        }

        for (const p of this.platforms) {
            if (this.rectsCollide(this.player, p)) {
                const wasAbove = previousY + previousH <= p.y;
                const wasBelow = previousY >= p.y + p.h;

                // Landing on top of platform
                if (this.player.vy > 0 && wasAbove) {
                    this.handlePlatformLanding(p);
                    this.handlePlatformLandingResponse(p);
                    break;
                }

                if (this.player.vy < 0 && wasBelow) {
                    // Hit ceiling
                    this.handleCeilingHit(p);
                    break;
                }
            }
        }

        if (this.isPlayerCrouching() && this.player.onGroundId === null) {
            this.handleCrouchToAirborne();
        }
    }

    handleWorldGroundLanding() {
        if (!this.isPlayerCrouching()) {
            this.handleLandingToStanding();
        }
        this.player.y = this.WORLD_SIZE.height - this.player.h;
        this.player.vy = 0;
        this.player.jumpPressedByUser = false;
        this.player.lastGroundedAt = performance.now();
        this.player.bounceCount = 0;

        this.player.onGroundId = this.WORLD_GROUND_ID;
        this.player.onGroundType = "solid";
    }

    handleWorldCeilHit() {
        this.player.y = 0;
        this.player.vy = 0;
    }

    handlePlatformLanding(platform) {
        if (!this.isPlayerCrouching()) {
            this.handleLandingToStanding();
        }

        this.player.y = platform.y - this.player.h;

        if (
            !this.isPlayerCrouching() &&
            !this.canStandUp() &&
            this.canCrouch()
        ) {
            this.handleCrouchStart();
        }

        this.player.onGroundId = platform.id;
        this.player.onGroundType = platform.type;
        this.player.lastGroundedAt = performance.now();
        this.player.jumpPressedByUser = false;
        this.player.bounceCount =
            this.player.lastGroundId !== platform.id
                ? 1
                : this.player.bounceCount + 1;
        this.player.lastGroundType = platform.type;
        this.player.lastGroundId = platform.id;
    }

    handlePlatformLandingResponse(platform) {
        if (platform.type === "booster") {
            this.player.vy = -platform.boostSpeed;
            return;
        }

        if (platform.type === "solid") {
            this.player.vy = 0;
            this.player.bounceCount = 0;
            return;
        }

        if (platform.type === "bouncy") {
            const impactSpeed = this.player.vy;

            this.player.vy =
                this.player.bounceCount === 1
                    ? -impactSpeed * platform.elasticity
                    : -impactSpeed * platform.elasticity * 0.75;

            if (Math.abs(this.player.vy) < this.PHYSICS.minBounceSpeed) {
                this.player.vy = 0;
                this.player.bounceCount = 0;
            }
        }
    }

    handleCeilingHit(platform) {
        this.player.y = platform.y + platform.h;
        this.player.vy = 0;
    }

    // Move enemies and check player-enemy collisions
    updateEnemies() {
        const now = performance.now();
        for (const enemy of this.enemies) {
            // Clear damage flash after 200ms
            if (enemy.isDamaged && now - enemy.damageTime > 200) {
                enemy.isDamaged = false;
            }

            enemy.x += enemy.vx;

            if (enemy.x <= enemy.minX) {
                enemy.x = enemy.minX;
                enemy.vx = Math.abs(enemy.speed);
            } else if (enemy.x + enemy.w >= enemy.maxX) {
                enemy.x = enemy.maxX - enemy.w;
                enemy.vx = -Math.abs(enemy.speed);
            }

            if (this.rectsCollide(this.player, enemy)) {
                const playerCenterX = this.player.x + this.player.w / 2;
                const enemyCenterX = enemy.x + enemy.w / 2;
                const playerIsLeft = playerCenterX < enemyCenterX;

                // Block player from staying inside enemy
                if (playerIsLeft) {
                    this.player.x = enemy.x - this.player.w;
                } else {
                    this.player.x = enemy.x + enemy.w;
                }

                if (now - this.player.lastHitTime >= this.player.hitCooldown) {
                    this.player.life -= 1;
                    this.player.lastHitTime = now;
                    this.player.isHit = true;

                    const hitFromLeft =
                        this.player.x + this.player.w / 2 <
                        enemy.x + enemy.w / 2;

                    this.player.vx = hitFromLeft ? -18 : 18;
                    this.player.vy = -6;

                    if (this.player.life <= 0) {
                        this.gameOver = true;
                        this.gameOverAt = performance.now();
                        return;
                    }
                }

                // Only resolve one enemy collision per tick to prevent
                // position thrashing when two enemies are adjacent.
                break;
            }
        }
    }

    // Move bullets, remove out-of-bounds ones, and check bullet-enemy collisions
    updateBullets() {
        this.bullets = this.bullets.filter((bullet) => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // Remove if outside world bounds
            if (
                bullet.x > this.WORLD_SIZE.width ||
                bullet.x < 0 ||
                bullet.y > this.WORLD_SIZE.height ||
                bullet.y < 0
            ) {
                return false;
            }

            // Bullet-enemy collision
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                if (this.rectsCollide(bullet, this.enemies[i])) {
                    const enemy = this.enemies[i];
                    enemy.health -= bullet.damage;
                    if (enemy.health <= 0) {
                        this.enemies.splice(i, 1);
                    } else {
                        enemy.isDamaged = true;
                        enemy.damageTime = performance.now();
                    }
                    return false; // bullet consumed on hit
                }
            }

            // Bullet-platform collision
            for (let i = this.platforms.length - 1; i >= 0; i--) {
                if (this.rectsCollide(bullet, this.platforms[i])) {
                    return false; // bullet consumed on hit
                }
            }

            return true;
        });
    }

    // Check player-collectible collisions and mark collected items
    updateCollectibles() {
        for (const c of this.collectibles) {
            if (!c.collected && this.rectsCollide(this.player, c)) {
                c.collected = true;
                this.player.collectiblesCount++;
            }
        }

        if (
            !this.levelComplete &&
            this.player.collectiblesCount >= this.currentLevelCollectiblesCount
        ) {
            this.levelComplete = true;
            this.levelCompleteAt = performance.now();
        }
    }

    updateCamera() {
        if (this.mapView) {
            return;
        }
        // X
        const desiredLookAheadX =
            this.player.facing === "right"
                ? this.CAMERA.lookAheadXTarget
                : -this.CAMERA.lookAheadXTarget;

        this.CAMERA.lookAheadX +=
            (desiredLookAheadX - this.CAMERA.lookAheadX) *
            this.CAMERA.lookAheadXSmoothing;

        const targetX =
            this.player.x + this.player.w / 2 - this.CAMERA.width / 2;

        const desiredCameraX = targetX + this.CAMERA.lookAheadX;

        this.CAMERA.x +=
            (desiredCameraX - this.CAMERA.x) * this.CAMERA.smoothing;

        // Y
        let desiredLookAheadY = 0;

        if (this.player.vy < 0) {
            const upRatio = Math.min(
                Math.abs(this.player.vy) / this.player.jump,
                1,
            );
            desiredLookAheadY =
                -this.CAMERA.lookAheadYTargetUp * upRatio * upRatio;
        } else if (this.player.vy > 0) {
            const downRatio = Math.min(
                this.player.vy / this.PHYSICS.maxFallSpeed,
                1,
            );
            desiredLookAheadY =
                this.CAMERA.lookAheadYTargetDown * downRatio * downRatio;
        }

        if (this.isPlayerCrouching()) {
            desiredLookAheadY += this.CAMERA.lookAheadYTargetDownCrouch;
        }

        this.CAMERA.lookAheadY +=
            (desiredLookAheadY - this.CAMERA.lookAheadY) *
            this.CAMERA.lookAheadYSmoothing;

        const playerFootY = this.player.y + this.player.h;
        const targetY =
            playerFootY -
            this.player.originalHeight / 2 -
            this.CAMERA.height / 2;

        const desiredCameraY = targetY + this.CAMERA.lookAheadY;

        this.CAMERA.y +=
            (desiredCameraY - this.CAMERA.y) * this.CAMERA.smoothing;

        // world bound
        this.CAMERA.x = Math.max(
            0,
            Math.min(this.CAMERA.x, this.WORLD_SIZE.width - this.CAMERA.width),
        );

        this.CAMERA.y = Math.max(
            0,
            Math.min(
                this.CAMERA.y,
                this.WORLD_SIZE.height - this.CAMERA.height,
            ),
        );
    }

    updateDamageCooldown() {
        const now = performance.now();
        if (
            this.player.isHit &&
            now - this.player.lastHitTime >= this.player.hitCooldown
        ) {
            this.player.isHit = false;
        }
    }

    drawPlayer() {
        if (
            this.playerRenderer &&
            typeof this.playerRenderer.draw === "function"
        ) {
            this.playerRenderer.draw(this.ctx, this.player, this.showDebug);
        }
    }

    drawPlatform(p) {
        let renderer = this.platformRenderer;
        if (p.type === "bouncy") {
            renderer = BouncyPlatformRenderer;
        } else if (p.type === "booster") {
            renderer = BoosterPlatformRenderer;
        }
        if (renderer && typeof renderer.draw === "function") {
            renderer.draw(this.ctx, p);
        }
    }

    drawEnemy(e) {
        if (
            this.enemyRenderer &&
            typeof this.enemyRenderer.draw === "function"
        ) {
            this.enemyRenderer.draw(this.ctx, e, this.showDebug);
        }
    }

    drawCollectible(p) {
        if (
            this.collectibleRenderer &&
            typeof this.collectibleRenderer.draw === "function"
        ) {
            this.collectibleRenderer.draw(this.ctx, p);
        }
    }

    drawWeapon(w) {
        if (
            this.weaponRenderer &&
            typeof this.weaponRenderer.draw === "function"
        ) {
            this.weaponRenderer.draw(this.ctx, w);
        }
    }

    drawWorld() {
        if (
            this.worldRenderer &&
            typeof this.worldRenderer.drawBackground === "function"
        ) {
            this.worldRenderer.drawBackground(
                this.ctx,
                this.canvas,
                this.CAMERA,
                this.WORLD_SIZE,
            );
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        if (this.mapView) {
            this.worldRenderer.drawMapBackground(
                this.ctx,
                this.canvas,
                this.WORLD_SIZE,
            );
        } else {
            this.drawWorld();
            this.ctx.translate(
                -Math.round(this.CAMERA.x),
                -Math.round(this.CAMERA.y),
            );
        }

        for (const p of this.platforms) {
            this.drawPlatform(p);
        }

        for (const w of this.bullets) {
            this.drawWeapon(w);
        }

        for (const c of this.collectibles) {
            if (!c.collected) {
                this.drawCollectible(c);
            }
        }

        for (const e of this.enemies) {
            this.drawEnemy(e);
        }

        this.drawPlayer();

        if (this.showDebug) {
            DebugGridRenderer.draw(this.ctx, this.CAMERA, this.WORLD_SIZE);
        }

        this.ctx.restore();

        this.hudRenderer.draw(
            this.ctx,
            this.canvas,
            this.player,
            this.currentLevelCollectiblesCount,
        );

        if (this.levelComplete) {
            this.drawLevelComplete();
        }

        if (this.gameOver) {
            this.drawGameOver();
        }
    }

    drawLevelComplete() {
        const elapsed = performance.now() - this.levelCompleteAt;
        const remaining = Math.max(
            0,
            Math.ceil((this.LEVEL_COMPLETE_DELAY - elapsed) / 1000),
        );

        if (
            this.levelCompleteRenderer &&
            typeof this.levelCompleteRenderer.drawLevelCompleteScreen ===
                "function"
        ) {
            this.levelCompleteRenderer.drawLevelCompleteScreen(
                this.ctx,
                this.canvas,
                this.player.collectiblesCount,
                this.currentLevelCollectiblesCount,
                remaining,
            );
        }
    }

    drawGameOver() {
        const elapsed = performance.now() - this.gameOverAt;
        const remaining = Math.max(
            0,
            Math.ceil((this.GAME_OVER_DELAY - elapsed) / 1000),
        );

        if (
            this.gameOverRenderer &&
            typeof this.gameOverRenderer.drawGameOverScreen === "function"
        ) {
            this.gameOverRenderer.drawGameOverScreen(
                this.ctx,
                this.canvas,
                remaining,
            );
        }
    }

    updateDebug(now) {
        if (!this.showDebug) {
            const el = document.getElementById("debug");
            if (el) {
                el.remove();
            }
            const cp = document.getElementById("cursor-pos");
            if (cp) {
                cp.remove();
            }
            return;
        }

        // Throttle debug panel updates to a human-readable interval
        if (now - this.DEBUG.lastUpdate < this.DEBUG.updateInterval) {
            return;
        }
        this.DEBUG.lastUpdate = now;

        let el = document.getElementById("debug");
        if (!el) {
            el = document.createElement("div");
            el.id = "debug";
            // Game container is the canvas parent element defined in index.html
            if (this.canvas.parentElement) {
                this.canvas.parentElement.insertBefore(el, this.canvas);
            } else {
                document.body.appendChild(el);
            }
        }

        el.textContent = "";
        for (const [key, value] of Object.entries(this.player)) {
            const row = document.createElement("div");
            const label = document.createElement("strong");
            label.textContent = key;
            row.appendChild(label);
            const display =
                value !== null && typeof value === "object"
                    ? JSON.stringify(value).replace(/,/g, ", ")
                    : String(value);
            row.appendChild(document.createTextNode(" " + display));
            el.appendChild(row);
        }

        let cp = document.getElementById("cursor-pos");
        if (!cp) {
            cp = document.createElement("div");
            cp.id = "cursor-pos";
            if (this.canvas.parentElement) {
                this.canvas.parentElement.appendChild(cp);
            } else {
                document.body.appendChild(cp);
            }
        }
        cp.textContent = "";
        const rowX = document.createElement("div");
        const lx = document.createElement("strong");
        lx.textContent = "x";
        rowX.appendChild(lx);
        rowX.appendChild(document.createTextNode(" " + this.mouse.worldX));
        cp.appendChild(rowX);
        const rowY = document.createElement("div");
        const ly = document.createElement("strong");
        ly.textContent = "y";
        rowY.appendChild(ly);
        rowY.appendChild(document.createTextNode(" " + this.mouse.worldY));
        cp.appendChild(rowY);
    }

    loop(now) {
        if (!this.isRunning) {
            return;
        }

        let frameTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        if (frameTime > this.GAME_LOOP.maxFrameTime) {
            frameTime = this.GAME_LOOP.maxFrameTime;
        }

        this.accumulator += frameTime;

        while (this.accumulator >= this.GAME_LOOP.fixedDt) {
            this.update();
            this.accumulator -= this.GAME_LOOP.fixedDt;
        }

        this.draw();
        this.updateDebug(now);

        if (
            this.levelComplete &&
            now - this.levelCompleteAt >= this.LEVEL_COMPLETE_DELAY
        ) {
            this.resetGame();
        }

        if (this.gameOver && now - this.gameOverAt >= this.GAME_OVER_DELAY) {
            this.resetGame();
        }

        window.requestAnimationFrame(this.loop);
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        window.requestAnimationFrame(this.loop);
    }

    stop() {
        this.isRunning = false;
    }

    // Toggle pause state
    togglePause() {
        if (this.isRunning) {
            this.stop();

            // Draw pause overlay
            if (
                this.pauseRenderer &&
                typeof this.pauseRenderer.drawPauseScreen === "function"
            ) {
                this.pauseRenderer.drawPauseScreen(this.ctx, this.canvas);
            }
        } else {
            this.start();
        }
    }
}
