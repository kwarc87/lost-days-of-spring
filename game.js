(function (global) {
    "use strict";

    class LostDaysOfSpring {
        constructor(canvasId, debugId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext("2d");
            this.debugEl = document.getElementById(debugId);

            // ====== INPUT ======
            this.keys = {};

            // ====== PLAYER ======
            this.player = {
                x: 320,
                y: 60,
                w: 30,
                h: 45,
                vx: 0,
                vy: 0,
                color: "#005C53",
                speed: 4,
                crouch: false,
                crouchHeight: 25,
                originalHeight: 45,
                jump: 8,
                onGroundId: null,
                onGroundType: null,
                lastGroundId: null,
                lastGroundType: null,
                bounceCount: 0,
            };

            // ====== CAMERA ======
            this.CAMERA = {
                x: 0,
                y: 0,
                width: this.canvas.width,
                height: this.canvas.height,
            };

            // ====== WORLD ======
            this.WORLD_SIZE = {
                width: 2000,
                height: 600,
            };
            this.PHYSICS = {
                gravity: 0.25,
                minBounceSpeed: 0.5,
            };

            // ====== GAME LOOP CONFIG ======
            this.GAME_LOOP = {
                fixedDt: 1 / 60,
                maxFrameTime: 0.25,
            };

            this.platforms = [
                {
                    id: 2,
                    color: "#2a7049", // emerald grass
                    secondaryColor: "#1e140d", // dark dirt
                    x: 0,
                    y: 480,
                    w: 600,
                    h: 80,
                    elasticity: 0,
                    type: "normal",
                },
                {
                    id: 3,
                    color: "#2a7049",
                    secondaryColor: "#1e140d",
                    x: 800,
                    y: 480,
                    w: 300,
                    h: 80,
                    elasticity: 0,
                    type: "normal",
                },
                {
                    id: 4,
                    color: "#2a7049",
                    secondaryColor: "#1e140d",
                    x: 1180,
                    y: 480,
                    w: 300,
                    h: 80,
                    elasticity: 0,
                    type: "normal",
                },
                {
                    id: 6,
                    color: "#4682b4", // slightly bouncy - bluish rubber
                    secondaryColor: "rgba(255, 255, 255, 0.4)",
                    x: 180,
                    y: 320,
                    w: 80,
                    h: 25,
                    elasticity: 0.5,
                    type: "normal",
                },
                {
                    id: 7,
                    color: "#4682b4",
                    secondaryColor: "rgba(255, 255, 255, 0.4)",
                    x: 880,
                    y: 190,
                    w: 60,
                    h: 25,
                    elasticity: 0.5,
                    type: "normal",
                },
                {
                    id: 8,
                    color: "#d95a00", // booster - orange
                    secondaryColor: "#ffe600", // glossy yellow top
                    x: 670,
                    y: 420,
                    w: 160,
                    h: 25,
                    type: "booster",
                    boostSpeed: 11,
                },
                {
                    id: 10,
                    color: "#2a7049",
                    secondaryColor: "#1e140d",
                    x: 90,
                    y: 425,
                    w: 130,
                    h: 25,
                    elasticity: 0,
                    type: "normal",
                },
                {
                    id: 11,
                    color: "#932fa6", // highly bouncy - purple rubber
                    secondaryColor: "rgba(255, 255, 255, 0.4)",
                    x: 410,
                    y: 290,
                    w: 110,
                    h: 25,
                    elasticity: 0.9,
                    type: "normal",
                },
                {
                    id: 12,
                    color: "#932fa6",
                    secondaryColor: "rgba(255, 255, 255, 0.4)",
                    x: 1130,
                    y: 250,
                    w: 210,
                    h: 25,
                    elasticity: 0.9,
                    type: "normal",
                },
            ];

            this.enemies = [
                {
                    platformId: 10,
                    w: 24,
                    h: 30,
                    speed: 1.5,
                    color: "#8B0000",
                },
            ];

            this.lastTime = performance.now();
            this.accumulator = 0;
            this.loop = this.loop.bind(this);
            this.isRunning = false;

            this.initControls();
            this.initEnemies();
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
                const p = this.platforms.find(
                    (pl) => pl.id === enemy.platformId,
                );
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
            this.player.x = 320;
            this.player.y = 60;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.onGroundId = null;
            this.player.onGroundType = null;
            this.player.lastGroundId = null;
            this.player.lastGroundType = null;
            this.player.bounceCount = 0;

            this.initEnemies();
        }

        update() {
            // Controls
            this.player.vx = 0;
            if (this.keys["ArrowLeft"]) this.player.vx = -this.player.speed;
            if (this.keys["ArrowRight"]) this.player.vx += this.player.speed;

            if (this.keys["ControlLeft"] || this.keys["ControlRight"]) {
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
            if (
                (this.keys["ArrowUp"] || this.keys["Space"]) &&
                this.player.onGroundId !== null &&
                this.player.onGroundType !== "booster"
            ) {
                this.player.vy = -this.player.jump;
                this.player.bounceCount = 0;
                this.player.onGroundId = null;
                this.player.onGroundType = null;
            }

            // Physics
            this.player.vy += this.PHYSICS.gravity;

            // --- X AXIS ---
            this.player.x += this.player.vx;
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

            // --- Y AXIS ---
            this.player.y += this.player.vy;
            this.player.onGroundId = null;
            this.player.onGroundType = null;

            for (const p of this.platforms) {
                if (this.rectsCollide(this.player, p)) {
                    // landing on ground
                    if (this.player.vy > 0) {
                        this.player.y = p.y - this.player.h;
                        this.player.onGroundId = p.id;
                        this.player.onGroundType = p.type;
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
                        // hit ceiling
                        this.player.y = p.y + p.h;
                        this.player.vy = 0;
                        break;
                    }
                }
            }

            // --- ENEMIES UPDATE ---
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

            // fall off world
            if (this.player.y > this.WORLD_SIZE.height) {
                this.resetGame();
            }

            // --- CAMERA UPDATE ---
            this.CAMERA.x =
                this.player.x + this.player.w / 2 - this.CAMERA.width / 2;
            this.CAMERA.y =
                this.player.y + this.player.h / 2 - this.CAMERA.height / 2;

            this.CAMERA.x = Math.max(
                0,
                Math.min(
                    this.CAMERA.x,
                    this.WORLD_SIZE.width - this.CAMERA.width,
                ),
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
            this.ctx.save();

            const cx = this.player.x + this.player.w / 2;
            const cy = this.player.y + this.player.h / 2;

            if (this.player.vx < 0) {
                this.ctx.translate(cx, cy);
                this.ctx.scale(-1, 1);
                this.ctx.translate(-cx, -cy);
            }

            this.ctx.fillStyle = "#1a1a1a";
            this.ctx.fillRect(
                this.player.x,
                this.player.y,
                this.player.w,
                this.player.h,
            );

            if (this.player.vx === 0) {
                this.ctx.fillStyle = "#ffdbac";
                this.ctx.fillRect(
                    this.player.x + 6,
                    this.player.y + 2,
                    this.player.w - 12,
                    12,
                );

                this.ctx.fillStyle = "#ffffff";
                this.ctx.fillRect(
                    this.player.x + 10,
                    this.player.y + 14,
                    this.player.w - 20,
                    10,
                );

                this.ctx.fillStyle = "#000000";
                this.ctx.fillRect(
                    this.player.x + 13,
                    this.player.y + 14,
                    4,
                    12,
                );
            } else {
                this.ctx.fillStyle = "#ffdbac";
                this.ctx.fillRect(
                    this.player.x + 10,
                    this.player.y + 2,
                    this.player.w - 12,
                    12,
                );

                this.ctx.fillStyle = "#0a0a0a";
                this.ctx.fillRect(
                    this.player.x,
                    this.player.y,
                    this.player.w - 8,
                    14,
                );

                this.ctx.fillStyle = "#ffffff";
                this.ctx.fillRect(
                    this.player.x + 14,
                    this.player.y + 14,
                    this.player.w - 20,
                    10,
                );

                this.ctx.fillStyle = "#000000";
                this.ctx.fillRect(
                    this.player.x + 17,
                    this.player.y + 14,
                    4,
                    12,
                );
            }

            this.ctx.restore();
        }

        drawPlatform(p) {
            this.ctx.save();

            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.w, p.h);
            this.ctx.fillStyle = p.secondaryColor;
            this.ctx.fillRect(p.x, p.y + 8, p.w, p.h - 8);

            this.ctx.strokeStyle = "#111111";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(p.x, p.y, p.w, p.h);

            this.ctx.restore();
        }

        drawEnemy(e) {
            this.ctx.fillStyle = e.color;
            this.ctx.fillRect(e.x, e.y, e.w, e.h);

            const eyeOffset = e.vx > 0 ? 10 : 0;
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(e.x + 3 + eyeOffset, e.y + 6, 8, 8);
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(e.x + 5 + eyeOffset, e.y + 8, 4, 4);
        }

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.save();
            this.ctx.translate(-this.CAMERA.x, -this.CAMERA.y);

            this.drawPlayer();

            for (const p of this.platforms) {
                this.drawPlatform(p);
            }

            for (const e of this.enemies) {
                this.drawEnemy(e);
            }

            this.ctx.restore();
        }

        updateDebug() {
            if (!this.debugEl) return;

            this.debugEl.innerHTML = Object.entries(this.player)
                .map(
                    ([key, value]) =>
                        `<div><strong>${key}</strong> ${value}</div>`,
                )
                .join("");
        }

        loop(now) {
            if (!this.isRunning) return;

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

            global.requestAnimationFrame(this.loop);
        }

        start() {
            this.isRunning = true;
            this.lastTime = performance.now();
            global.requestAnimationFrame(this.loop);
        }

        stop() {
            this.isRunning = false;
        }

        // Toggle pause state
        togglePause() {
            if (this.isRunning) {
                this.stop();

                // Draw pause overlay
                this.ctx.save();
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = "#ffffff";
                this.ctx.font = "40px sans-serif";
                this.ctx.textAlign = "center";
                this.ctx.fillText(
                    "PAUSED",
                    this.canvas.width / 2,
                    this.canvas.height / 2,
                );
                this.ctx.restore();
            } else {
                this.start();
            }
        }
    }

    global.LostDaysOfSpring = LostDaysOfSpring;

    // Start the game instance
    const game = new LostDaysOfSpring("game", "debug");
    game.start();
})(window);
