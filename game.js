const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const debugEl = document.getElementById("debug");

// ====== INPUT ======
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (
        [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Space",
            "ControlLeft",
            "ControlRight",
        ].includes(e.code)
    ) {
        e.preventDefault();
    }
});

window.addEventListener("keyup", (e) => (keys[e.code] = false));

// ====== PLAYER ======
const player = {
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
    facing: "front",
};

// ====== CAMERA ======
const CAMERA = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
};

// ====== WORLD ======
const WORLD_SIZE = {
    width: 2000,
    height: 600,
};
const PHYSICS = {
    gravity: 0.25,
    minBounceSpeed: 0.5,
};

// ====== GAME LOOP CONFIG ======
const GAME_LOOP = {
    fixedDt: 1 / 60,
    maxFrameTime: 0.25,
};

const platforms = [
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

const enemies = [
    {
        platformId: 10,
        w: 24,
        h: 30,
        speed: 1.5,
        color: "#8B0000", // creepy dark red
    },
];

function initEnemies() {
    for (const enemy of enemies) {
        const p = platforms.find((pl) => pl.id === enemy.platformId);
        if (p) {
            enemy.x = p.x + p.w / 2 - enemy.w / 2;
            enemy.y = p.y - enemy.h;
            enemy.minX = p.x;
            enemy.maxX = p.x + p.w;
            enemy.vx = enemy.speed;
        }
    }
}

initEnemies();

// ====== HELPERS ======
function rectsCollide(a, b) {
    return (
        a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
}

function canStandUp() {
    const standHeight = player.originalHeight;
    const newY = player.y - (standHeight - player.h);

    const futurePlayer = {
        x: player.x,
        y: newY,
        w: player.w,
        h: standHeight,
    };

    for (const p of platforms) {
        if (rectsCollide(futurePlayer, p)) {
            return false;
        }
    }

    return true;
}

function resetGame() {
    player.x = 320;
    player.y = 60;
    player.vx = 0;
    player.vy = 0;
    player.onGroundId = null;
    player.onGroundType = null;
    player.lastGroundId = null;
    player.lastGroundType = null;
    player.bounceCount = 0;

    initEnemies();
}

// ====== UPDATE ======
function update() {
    // Controls
    player.vx = 0;
    if (keys["ArrowLeft"]) player.vx = -player.speed;
    if (keys["ArrowRight"]) player.vx += player.speed;

    if (player.vx > 0) {
        player.facing = "right";
    } else if (player.vx < 0) {
        player.facing = "left";
    } else {
        player.facing = "front";
    }

    if (keys["ControlLeft"] || keys["ControlRight"]) {
        if (!player.crouch) {
            player.crouch = true;
            player.h = player.crouchHeight;
            player.y = player.y + (player.originalHeight - player.crouchHeight);
        }
    } else {
        if (player.crouch && canStandUp()) {
            player.crouch = false;
            player.y = player.y - (player.originalHeight - player.crouchHeight);
            player.h = player.originalHeight;
        }
    }
    if (
        (keys["ArrowUp"] || keys["Space"]) &&
        player.onGroundId !== null &&
        player.onGroundType !== "booster"
    ) {
        player.vy = -player.jump;
        player.bounceCount = 0;
        player.onGroundId = null;
        player.onGroundType = null;
    }

    // Physics
    player.vy += PHYSICS.gravity;

    // --- X AXIS ---
    player.x += player.vx;
    for (const p of platforms) {
        if (rectsCollide(player, p)) {
            if (player.vx > 0) {
                // hit wall from left
                player.x = p.x - player.w;
            } else if (player.vx < 0) {
                // hit wall from right
                player.x = p.x + p.w;
            }
            player.vx = 0;
        }
    }

    // --- Y AXIS ---
    player.y += player.vy;
    player.onGroundId = null;
    player.onGroundType = null;

    for (const p of platforms) {
        if (rectsCollide(player, p)) {
            // landing on ground
            if (player.vy > 0) {
                player.y = p.y - player.h;
                player.onGroundId = p.id;
                player.onGroundType = p.type;
                player.bounceCount =
                    player.lastGroundId !== p.id ? 1 : player.bounceCount + 1;
                player.lastGroundType = p.type;
                player.lastGroundId = p.id;

                if (p.type === "booster") {
                    player.vy = -p.boostSpeed;
                }

                if (p.type === "normal") {
                    const impactSpeed = player.vy;
                    player.vy =
                        player.bounceCount === 1
                            ? -impactSpeed * p.elasticity
                            : -impactSpeed * p.elasticity * 0.75;

                    if (Math.abs(player.vy) < PHYSICS.minBounceSpeed) {
                        player.vy = 0;
                        player.bounceCount = 0;
                    }
                }

                // only one Y AXIS collision for frame
                break;
            } else {
                // hit ceiling
                player.y = p.y + p.h;
                player.vy = 0;

                // only one Y AXIS collision for frame
                break;
            }
        }
    }

    // --- ENEMIES UPDATE ---
    for (const enemy of enemies) {
        enemy.x += enemy.vx;

        // patrol bounds
        if (enemy.x <= enemy.minX) {
            enemy.x = enemy.minX;
            enemy.vx = Math.abs(enemy.speed);
        } else if (enemy.x + enemy.w >= enemy.maxX) {
            enemy.x = enemy.maxX - enemy.w;
            enemy.vx = -Math.abs(enemy.speed);
        }

        // check collision with player
        if (rectsCollide(player, enemy)) {
            resetGame();
        }
    }

    // fall off world
    if (player.y > WORLD_SIZE.height) {
        resetGame();
    }

    // --- CAMERA UPDATE ---
    CAMERA.x = player.x + player.w / 2 - CAMERA.width / 2;
    CAMERA.y = player.y + player.h / 2 - CAMERA.height / 2;

    // Block camera, to that player can't see outside of world bounds
    CAMERA.x = Math.max(0, Math.min(CAMERA.x, WORLD_SIZE.width - CAMERA.width));
    CAMERA.y = Math.max(
        0,
        Math.min(CAMERA.y, WORLD_SIZE.height - CAMERA.height),
    );
}

function drawPlayer() {
    ctx.save();

    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;

    if (player.facing === "left") {
        ctx.translate(cx, cy);
        ctx.scale(-1, 1);
        ctx.translate(-cx, -cy);
    }

    // Suit jacket
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    if (player.facing === "front") {
        // Face - centered
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(player.x + 6, player.y + 2, player.w - 12, 12);

        // White shirt - centered
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(player.x + 10, player.y + 14, player.w - 20, 10);

        // Black tie - centered
        ctx.fillStyle = "#000000";
        ctx.fillRect(player.x + 13, player.y + 14, 4, 12);
    } else {
        // Face - facing right/left side
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(player.x + 10, player.y + 2, player.w - 12, 12);

        // Hair
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(player.x, player.y, player.w - 8, 14);

        // White shirt side angle
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(player.x + 14, player.y + 14, player.w - 20, 10);

        // Black tie side angle
        ctx.fillStyle = "#000000";
        ctx.fillRect(player.x + 17, player.y + 14, 4, 12);
    }

    ctx.restore();
}

function drawPlatform(p) {
    ctx.save();

    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.w, p.h);

    if (p.type === "booster" || p.elasticity > 0) {
        // Bouncy platforms and boosters - glossy/bright layer on top
        ctx.fillStyle = p.secondaryColor;
        ctx.fillRect(p.x, p.y, p.w, 6);
    } else {
        // Regular ground - add dirt underneath
        ctx.fillStyle = p.secondaryColor;
        ctx.fillRect(p.x, p.y + 12, p.w, p.h - 12);
    }

    // Subtle common border, tying the style together
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 1;
    ctx.strokeRect(p.x, p.y, p.w, p.h);

    ctx.restore();
}

function drawEnemy(e) {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.w, e.h);

    // Little creepy eye showing direction
    const eyeOffset = e.vx > 0 ? 10 : 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(e.x + 3 + eyeOffset, e.y + 6, 8, 8);
    ctx.fillStyle = "#000000";
    ctx.fillRect(e.x + 5 + eyeOffset, e.y + 8, 4, 4);
}

// ====== DRAW ======
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Move the world according to camera position
    ctx.translate(-CAMERA.x, -CAMERA.y);

    drawPlayer();

    // Platforms
    for (const p of platforms) {
        drawPlatform(p);
    }

    // Enemies
    for (const e of enemies) {
        drawEnemy(e);
    }

    ctx.restore();
}

function updateDebug() {
    if (!debugEl) return;

    debugEl.innerHTML = Object.entries(player)
        .map(([key, value]) => `<div><strong>${key}</strong> ${value}</div>`)
        .join("");
}

let lastTime = performance.now();
let accumulator = 0;

// ====== LOOP ======
function loop(now) {
    let frameTime = (now - lastTime) / 1000;
    lastTime = now;

    // clamp when lags / tab switch
    if (frameTime > GAME_LOOP.maxFrameTime) {
        frameTime = GAME_LOOP.maxFrameTime;
    }

    accumulator += frameTime;

    // ===== FIXED UPDATE =====
    while (accumulator >= GAME_LOOP.fixedDt) {
        update();
        accumulator -= GAME_LOOP.fixedDt;
    }

    // ===== RENDER =====
    draw();
    updateDebug();

    requestAnimationFrame(loop);
}

// start loop
requestAnimationFrame(loop);
