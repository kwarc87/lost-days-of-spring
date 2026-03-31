import { LEVELS } from "../levels/levelsConfig.js";
import { GameFactory } from "../factories/GameFactory.js";
import { DefaultPlayerRenderer } from "../renderers/PlayerRenderers.js";
import { DefaultPlatformRenderer } from "../renderers/PlatformRenderers.js";
import { DefaultEnemyRenderer } from "../renderers/EnemyRenderers.js";
import { DefaultWorldRenderer } from "../renderers/WorldRenderers.js";
import { DefaultPauseRenderer } from "../renderers/PauseRenderers.js";
import { DefaultCollectibleRenderer } from "../renderers/CollectibleRenderers.js";
import { DefaultWeaponRenderer } from "../renderers/WeaponRenderers.js";

export class LostDaysOfSpring {
    constructor(canvasId, showDebug = true) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.showDebug = showDebug;

        // ====== INPUT ======
        this.keys = {};

        // ====== GAME STATE ======
        this.currentLevelId = null;

        // ====== PLAYER (Base static attributes set by factory) ======
        this.player = GameFactory.player({ weapon: GameFactory.weapon() });

        // ====== WEAPON ======
        this.bullets = [];
        this.nextBulletId = 0;

        // ====== CAMERA ======
        this.CAMERA = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height,
        };

        // ====== PHYSICS ======
        this.PHYSICS = {
            gravity: 0.6,
            minBounceSpeed: 0.5,
            maxFallSpeed: 16,
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

        this.lastTime = performance.now();
        this.accumulator = 0;
        this.loop = this.loop.bind(this);
        this.isRunning = false;

        this.initControls();

        // Start game by loading level 1
        this.loadLevel(1);
    }

    loadLevel(levelId) {
        if (!LEVELS[levelId]) {
            return;
        }

        this.currentLevelId = levelId;
        // Generate a fresh instance of the level data
        const levelData = LEVELS[levelId]();

        this.WORLD_SIZE = levelData.worldSize;
        this.platforms = levelData.platforms;
        this.enemies = levelData.enemies;
        this.collectibles = levelData.collectibles;

        // Reset dynamic player properties according to level start
        Object.assign(this.player, {
            x: levelData.playerStart.x,
            y: levelData.playerStart.y,
            vx: 0,
            vy: 0,
            crouch: false,
            h: this.player.originalHeight,
            onGroundId: null,
            onGroundType: null,
            lastGroundId: null,
            lastGroundType: null,
            bounceCount: 0,
            collectiblesCount: 0,
            life: 6,
            facing: "right",
        });

        // Initialize dynamic entity defaults
        this.initEnemies();

        // Reset bullets
        this.bullets = [];
        this.nextBulletId = 0;

        // Reset Camera
        this.CAMERA.x = 0;
        this.CAMERA.y = 0;
    }

    setPlayerRenderer(rendererStrategy) {
        this.playerRenderer = rendererStrategy;
    }

    setPlatformRenderer(rendererStrategy) {
        this.platformRenderer = rendererStrategy;
    }

    setEnemyRenderer(rendererStrategy) {
        this.enemyRenderer = rendererStrategy;
    }

    setWorldRenderer(rendererStrategy) {
        this.worldRenderer = rendererStrategy;
    }

    setPauseRenderer(rendererStrategy) {
        this.pauseRenderer = rendererStrategy;
    }

    initControls() {
        window.addEventListener("keydown", (e) => {
            e.stopPropagation();

            // Toggle pause state
            if (e.code === "KeyP" && !e.repeat) {
                this.togglePause();
            }

            this.keys[e.code] = true;
            if (
                [
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight",
                    "Space",
                    "ControlLeft",
                    "ControlRight",
                    "KeyP",
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

    canStandUp() {
        const standHeight = this.player.originalHeight;
        const newY = this.player.y - (standHeight - this.player.h);

        const futurePlayer = {
            x: this.player.x,
            y: newY,
            w: this.player.w,
            h: standHeight,
        };

        for (const p of this.platforms) {
            if (this.rectsCollide(futurePlayer, p)) {
                return false;
            }
        }

        return true;
    }

    resetGame() {
        // Simply reload the current level to reset positions, enemies, etc.
        this.loadLevel(this.currentLevelId);
    }

    update() {
        this.handleInput();
        this.applyPhysics();
        this.movePlayerX();
        this.movePlayerY();
        this.updateEnemies();
        this.updateBullets();
        this.updateCollectibles();
        this.updateCamera();
    }

    // Handle keyboard input: movement, crouch, shooting, jump
    handleInput() {
        this.player.vx = 0;
        if (this.keys["ArrowLeft"]) {
            this.player.vx = -this.player.speed;
            this.player.facing = "left";
        }
        if (this.keys["ArrowRight"]) {
            this.player.vx += this.player.speed;
            this.player.facing = "right";
        }

        if (this.keys["KeyS"] || this.keys["ArrowDown"]) {
            if (!this.player.crouch) {
                this.player.crouch = true;
                this.player.h = this.player.crouchHeight;
                this.player.y =
                    this.player.y +
                    (this.player.originalHeight - this.player.crouchHeight);
            }
        } else {
            if (this.player.crouch && this.canStandUp()) {
                this.player.crouch = false;
                this.player.y =
                    this.player.y -
                    (this.player.originalHeight - this.player.crouchHeight);
                this.player.h = this.player.originalHeight;
            }
        }

        // Shooting
        if (this.keys["Space"]) {
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
                            ? this.player.x
                            : this.player.x +
                              this.player.w -
                              this.player.weapon.ammo.w,
                    y: this.player.y + this.player.h / 2,
                    vx: bulletVx,
                });
                this.player.lastShootTime = now;
            }
        } else {
            this.player.shooting = false;
        }

        if (
            this.keys["ArrowUp"] &&
            this.player.onGroundId !== null &&
            this.player.onGroundType !== "booster"
        ) {
            this.player.vy = -this.player.jump;
            this.player.bounceCount = 0;
            this.player.onGroundId = null;
            this.player.onGroundType = null;
            this.player.isJumping = true;
        }
    }

    // Apply gravity and enforce terminal velocity
    applyPhysics() {
        let currentGravity = this.PHYSICS.gravity;

        // Variable jump height: fall faster if jump key is released while ascending
        if (
            this.player.vy < 0 &&
            !this.keys["ArrowUp"] &&
            !this.keys["Space"] &&
            this.player.isJumping
        ) {
            currentGravity *= 2;
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
        } else if (this.player.x + this.player.w > this.WORLD_SIZE.width) {
            this.player.x = this.WORLD_SIZE.width - this.player.w;
        }

        for (const p of this.platforms) {
            if (this.rectsCollide(this.player, p)) {
                if (this.player.vx > 0) {
                    this.player.x = p.x - this.player.w;
                } else if (this.player.vx < 0) {
                    this.player.x = p.x + p.w;
                }
                this.player.vx = 0;
            }
        }
    }

    // Move player along the Y axis, resolve platform collisions, and check fall-off
    movePlayerY() {
        this.player.y += this.player.vy;
        this.player.onGroundId = null;
        this.player.onGroundType = null;

        for (const p of this.platforms) {
            if (this.rectsCollide(this.player, p)) {
                // Landing on top of platform
                if (this.player.vy > 0) {
                    this.player.y = p.y - this.player.h;
                    this.player.onGroundId = p.id;
                    this.player.onGroundType = p.type;
                    this.player.isJumping = false;
                    this.player.bounceCount =
                        this.player.lastGroundId !== p.id
                            ? 1
                            : this.player.bounceCount + 1;
                    this.player.lastGroundType = p.type;
                    this.player.lastGroundId = p.id;

                    if (p.type === "booster") {
                        this.player.vy = -p.boostSpeed;
                    }

                    if (p.type === "normal") {
                        const impactSpeed = this.player.vy;
                        this.player.vy =
                            this.player.bounceCount === 1
                                ? -impactSpeed * p.elasticity
                                : -impactSpeed * p.elasticity * 0.75;

                        if (
                            Math.abs(this.player.vy) <
                            this.PHYSICS.minBounceSpeed
                        ) {
                            this.player.vy = 0;
                            this.player.bounceCount = 0;
                        }
                    }
                    break;
                } else {
                    // Hit ceiling
                    this.player.y = p.y + p.h;
                    this.player.vy = 0;
                    break;
                }
            }
        }

        // Fall off the bottom of the world
        if (this.player.y > this.WORLD_SIZE.height) {
            this.resetGame();
        }
    }

    // Move enemies and check player-enemy collisions
    updateEnemies() {
        for (const enemy of this.enemies) {
            enemy.x += enemy.vx;

            if (enemy.x <= enemy.minX) {
                enemy.x = enemy.minX;
                enemy.vx = Math.abs(enemy.speed);
            } else if (enemy.x + enemy.w >= enemy.maxX) {
                enemy.x = enemy.maxX - enemy.w;
                enemy.vx = -Math.abs(enemy.speed);
            }

            if (this.rectsCollide(this.player, enemy)) {
                this.resetGame();
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
                    this.enemies.splice(i, 1);
                    return false; // bullet consumed on hit
                }
            }

            return true;
        });
    }

    // Check player-collectible collisions and mark collected items
    updateCollectibles() {
        for (const c of this.collectibles || []) {
            if (!c.collected && this.rectsCollide(this.player, c)) {
                c.collected = true;
                this.player.collectiblesCount++;
            }
        }
    }

    // Center camera on player and clamp to world bounds
    updateCamera() {
        this.CAMERA.x =
            this.player.x + this.player.w / 2 - this.CAMERA.width / 2;
        this.CAMERA.y =
            this.player.y + this.player.h / 2 - this.CAMERA.height / 2;

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

    drawPlayer() {
        if (
            this.playerRenderer &&
            typeof this.playerRenderer.draw === "function"
        ) {
            this.playerRenderer.draw(this.ctx, this.player);
        }
    }

    drawPlatform(p) {
        if (
            this.platformRenderer &&
            typeof this.platformRenderer.draw === "function"
        ) {
            this.platformRenderer.draw(this.ctx, p);
        }
    }

    drawEnemy(e) {
        if (
            this.enemyRenderer &&
            typeof this.enemyRenderer.draw === "function"
        ) {
            this.enemyRenderer.draw(this.ctx, e);
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
            );
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        this.drawWorld();

        this.ctx.translate(-this.CAMERA.x, -this.CAMERA.y);

        for (const p of this.platforms) {
            this.drawPlatform(p);
        }

        for (const w of this.bullets) {
            this.drawWeapon(w);
        }

        for (const c of this.collectibles || []) {
            if (!c.collected) {
                this.drawCollectible(c);
            }
        }

        for (const e of this.enemies) {
            this.drawEnemy(e);
        }

        this.drawPlayer();

        this.ctx.restore();
    }

    updateDebug() {
        if (!this.showDebug) {
            const el = document.getElementById("debug");
            if (el) {
                el.remove();
            }
            return;
        }

        let el = document.getElementById("debug");
        if (!el) {
            el = document.createElement("div");
            el.id = "debug";
            // Kontener gry jest rodzicem canvasa w index.html
            if (this.canvas.parentElement) {
                this.canvas.parentElement.insertBefore(el, this.canvas);
            } else {
                document.body.appendChild(el);
            }
        }

        el.innerHTML = Object.entries(this.player)
            .map(
                ([key, value]) => `<div><strong>${key}</strong> ${value}</div>`,
            )
            .join("");
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
        this.updateDebug();

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
