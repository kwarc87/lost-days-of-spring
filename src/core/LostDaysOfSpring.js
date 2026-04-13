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
import {
    DebugGridRenderer,
    DebugHudRenderer,
} from "../renderers/DebugRenderers.js";
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
        this.keysMap = {
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
        this.levelCompleteDelay = 7000; // ms until auto-restart
        this.gameOverDelay = 7000; // ms until auto-restart after game over
        this.worldGroundId = "world-ground";

        // ====== PLAYER (Base static attributes set by factory) ======
        this.player = GameFactory.player({ weapon: GameFactory.weapon() });

        // ====== WEAPON ======
        this.bullets = [];
        this.nextBulletId = 0;

        // ====== CAMERA ======
        this.camera = {
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
        this.physics = {
            gravity: 0.52,
            minBounceSpeed: 2,
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

        this.lastTime = performance.now();
        this.accumulator = 0;
        this.loop = this.loop.bind(this);
        this.isRunning = false;

        this.mouse = { worldX: 0, worldY: 0 };

        this.initMouseDebug();
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

        this.worldSize = levelData.worldSize;
        this.platforms = levelData.platforms;
        this.enemies = levelData.enemies;
        this.collectibles = levelData.collectibles ?? [];
        this.bgItems = levelData.bgItems ?? [];
        this.currentLevelCollectiblesCount = this.collectibles.length;

        this.resetPlayerProperties(levelData);

        // Clear held keys to prevent ghost input on level start
        this.keys = {};

        // Initialize dynamic entity defaults
        this.initEnemies();

        // Reset bullets
        this.bullets = [];
        this.nextBulletId = 0;

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
    }

    resetPlayerProperties(levelData) {
        Object.assign(this.player, {
            x: levelData?.playerStart?.x ?? 0,
            y: levelData?.playerStart?.y ?? 0,
            vx: 0,
            vy: 0,
            posture: this.playerPostures.STANDING,
            h: this.player.originalHeight,
            w: this.player.originalWidth,
            life: this.player.maxLife,
            airborne: true,
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
            if (e.code === this.keysMap.pause && !e.repeat) {
                this.togglePause();
            }

            // Toggle map overview
            if (e.code === this.keysMap.map && !e.repeat) {
                this.mapView = !this.mapView;
            }

            if (
                e.code === this.keysMap.jump &&
                !this.keys[e.code] &&
                !e.repeat
            ) {
                this.player.jumpPressedAt = performance.now();
            }

            this.keys[e.code] = true;

            if (
                [
                    ...Object.values(this.keysMap),
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

    canApplyPosture(height, width) {
        let nextX = this.player.x;
        let nextY = this.player.y;

        const centerX = this.player.x + this.player.w / 2;
        nextX = centerX - width / 2;

        const bottomY = this.player.y + this.player.h;
        nextY = bottomY - height;

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
        return this.canApplyPosture(
            this.player.originalHeight,
            this.player.originalWidth,
        );
    }

    canCrouch() {
        return this.canApplyPosture(
            this.player.crouchHeight,
            this.player.crouchWidth,
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

    applyPlayerWidth(nextWidth) {
        // anchor should be always center
        const centerX = this.player.x + this.player.w / 2;
        this.player.w = nextWidth;
        this.player.x = centerX - nextWidth / 2;
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

        const now = performance.now();
        this.handleInput(now);
        this.applyPhysics();
        this.movePlayerX();
        this.movePlayerY(now);
        this.updateEnemies(now);
        this.updateBullets(now);
        this.updateCollectibles(now);
        this.updateCamera();
        this.updateDamageCooldown(now);
    }

    // Handle keyboard input: movement, crouch, shooting, jump
    handleInput(now) {
        this.handleHorizontalMovementInput();
        this.handleCrouchInput();
        this.handleShootingInput(now);
        this.handleJumpInput(now);
    }

    handleHorizontalMovementInput() {
        let targetVx = 0;

        if (this.keys[this.keysMap.left] && !this.keys[this.keysMap.right]) {
            targetVx = -this.player.speed;
            this.player.facing = "left";
        } else if (
            this.keys[this.keysMap.right] &&
            !this.keys[this.keysMap.left]
        ) {
            targetVx = this.player.speed;
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
            if (!this.isPlayerCrouching() && this.canCrouch()) {
                this.applyPosture(this.playerPostures.CROUCH);
            }
        } else if (this.isPlayerCrouching() && this.canStandUp()) {
            this.applyPosture(this.playerPostures.STANDING);
        }
    }

    applyPosture(posture) {
        const hitbox = this.getPlayerHitboxForPosture(posture);
        this.player.posture = posture;
        this.applyPlayerHeight(hitbox.h);
        this.applyPlayerWidth(hitbox.w);
    }

    handleShootingInput(now) {
        const customShootingOffsetY = -4;
        const customShootingOffsetX = 40;
        if (this.keys[this.keysMap.shoot]) {
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
        let currentGravity = this.physics.gravity;
        const isAscending = this.player.vy < 0;
        const isFalling = this.player.vy > 0;
        const jumpHeld = this.keys[this.keysMap.jump];

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
        this.player.x += this.player.vx;

        // World bounds check (X axis)
        if (this.player.x < 0) {
            this.player.x = 0;
            this.player.vx = 0;
        } else if (this.player.x + this.player.w > this.worldSize.width) {
            this.player.x = this.worldSize.width - this.player.w;
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
    movePlayerY(now) {
        const previousY = this.player.y;
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
        for (const p of this.platforms) {
            if (this.rectsCollide(this.player, p)) {
                const wasAbove = previousY + previousH <= p.y;
                const wasBelow = previousY >= p.y + p.h;

                // Landing on top of platform
                if (this.player.vy > 0 && wasAbove) {
                    this.handlePlatformLanding(p, now);
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
        this.player.bounceCount = 0;

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

            if (Math.abs(this.player.vy) < this.physics.minBounceSpeed) {
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
    updateEnemies(now) {
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
                        this.gameOverAt = now;
                        this.player.vx = 0;
                        this.player.vy = 0;
                        this.player.shooting = false;
                        this.player.jumpPressedByUser = false;
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

            for (let i = this.platforms.length - 1; i >= 0; i--) {
                if (this.rectsCollide(bullet, this.platforms[i])) {
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

    // Check player-collectible collisions and mark collected items
    updateCollectibles(now) {
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
            this.levelCompleteAt = now;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.shooting = false;
            this.player.jumpPressedByUser = false;
        }
    }

    updateCamera() {
        if (this.mapView) {
            return;
        }
        // X
        const desiredLookAheadX =
            this.player.facing === "right"
                ? this.camera.lookAheadXTarget
                : -this.camera.lookAheadXTarget;

        this.camera.lookAheadX +=
            (desiredLookAheadX - this.camera.lookAheadX) *
            this.camera.lookAheadXSmoothing;

        const targetX =
            this.player.x + this.player.w / 2 - this.camera.width / 2;

        const desiredCameraX = targetX + this.camera.lookAheadX;

        this.camera.x +=
            (desiredCameraX - this.camera.x) * this.camera.smoothing;

        // Y
        let desiredLookAheadY = 0;

        if (this.player.vy < 0) {
            const upRatio = Math.min(
                Math.abs(this.player.vy) / this.player.jump,
                1,
            );
            desiredLookAheadY =
                -this.camera.lookAheadYTargetUp * upRatio * upRatio;
        } else if (this.player.vy > 0) {
            const downRatio = Math.min(
                this.player.vy / this.physics.maxFallSpeed,
                1,
            );
            desiredLookAheadY =
                this.camera.lookAheadYTargetDown * downRatio * downRatio;
        }

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

        const desiredCameraY = targetY + this.camera.lookAheadY;

        this.camera.y +=
            (desiredCameraY - this.camera.y) * this.camera.smoothing;

        // world bound
        this.camera.x = Math.max(
            0,
            Math.min(this.camera.x, this.worldSize.width - this.camera.width),
        );

        this.camera.y = Math.max(
            0,
            Math.min(this.camera.y, this.worldSize.height - this.camera.height),
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
        let renderer = this.platformRenderer;
        if (p.type === "bouncy") {
            renderer = BouncyPlatformRenderer;
        } else if (p.type === "booster") {
            renderer = BoosterPlatformRenderer;
        }

        renderer.draw(this.ctx, p);
    }

    drawEnemy(e) {
        this.enemyRenderer.draw(this.ctx, e, this.showDebug);
    }

    drawCollectible(p) {
        this.collectibleRenderer.draw(this.ctx, p);
    }

    drawWeapon(w) {
        this.weaponRenderer.draw(this.ctx, w);
    }

    drawWorld() {
        this.worldRenderer.drawBackground(
            this.ctx,
            this.canvas,
            this.camera,
            this.bgItems,
        );
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
            DebugGridRenderer.draw(this.ctx, this.camera, this.worldSize);
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
            Math.ceil((this.levelCompleteDelay - elapsed) / 1000),
        );

        this.levelCompleteRenderer.drawLevelCompleteScreen(
            this.ctx,
            this.canvas,
            this.player.collectiblesCount,
            this.currentLevelCollectiblesCount,
            remaining,
        );
    }

    drawGameOver() {
        const elapsed = performance.now() - this.gameOverAt;
        const remaining = Math.max(
            0,
            Math.ceil((this.gameOverDelay - elapsed) / 1000),
        );

        this.gameOverRenderer.drawGameOverScreen(
            this.ctx,
            this.canvas,
            remaining,
        );
    }

    updateDebug(now) {
        DebugHudRenderer.update(
            now,
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
        this.updateDebug(now);

        if (
            this.levelComplete &&
            now - this.levelCompleteAt >= this.levelCompleteDelay
        ) {
            this.resetGame();
        }

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
        if (this.levelComplete || this.gameOver) {
            return;
        }
        if (this.isRunning) {
            this.stop();

            // Draw pause overlay
            this.pauseRenderer.drawPauseScreen(this.ctx, this.canvas);
        } else {
            this.start();
        }
    }
}
