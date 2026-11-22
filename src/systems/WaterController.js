const MAX_DROPS = 32;
const SPLASH_MIN_DROPS = 3;
const SPLASH_EXTRA_DROPS = 6;
const SPLASH_REFERENCE_SPEED = 20; // player speed (px/tick) that produces a full-size splash
const SPLASH_SPREAD = 48; // horizontal spread of drop spawn points (px)
const DROP_GRAVITY = 0.4; // px/tick^2, same per-tick units as player physics

// Owns the water zones of the level and the splash drops spawned when the player enters or
// leaves them. Drops live in a fixed pool (no per-frame allocations) and have no timers: each one
// ends when it falls back to the water surface, so the effect is pause-safe by construction.
export class WaterController {
    constructor() {
        this.zones = [];
        this.playerZone = null;
        this.drops = Array.from({ length: MAX_DROPS }, () => ({
            active: false,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            surfaceY: 0,
        }));
    }

    setPools(pools = []) {
        this.zones = pools.map((pool) => pool.waterZone);
        this.playerZone = null;
        for (const drop of this.drops) {
            drop.active = false;
        }
    }

    getDrops() {
        return this.drops;
    }

    update(player) {
        this.updatePlayerSplash(player);
        this.updateDrops();
    }

    updatePlayerSplash(player) {
        const zone = this.findZoneContaining(player);
        if (zone === this.playerZone) {
            return;
        }
        const splashZone = zone ?? this.playerZone;
        this.playerZone = zone;
        this.spawnSplash(player.x + player.w / 2, splashZone.y, Math.abs(player.vy));
    }

    // The player is "in water" when their feet are between the surface and the bottom of the zone.
    findZoneContaining(player) {
        const feetY = player.y + player.h;
        const centerX = player.x + player.w / 2;
        for (const zone of this.zones) {
            if (
                feetY > zone.y &&
                feetY <= zone.y + zone.h &&
                centerX >= zone.x &&
                centerX <= zone.x + zone.w
            ) {
                return zone;
            }
        }
        return null;
    }

    spawnSplash(x, surfaceY, speed) {
        const power = Math.min(speed / SPLASH_REFERENCE_SPEED, 1);
        const count = SPLASH_MIN_DROPS + Math.round(power * SPLASH_EXTRA_DROPS);
        for (let i = 0; i < count; i++) {
            const drop = this.acquireDrop();
            if (!drop) {
                return;
            }
            drop.active = true;
            drop.x = x + (Math.random() - 0.5) * SPLASH_SPREAD;
            drop.y = surfaceY;
            drop.vx = (Math.random() - 0.5) * 2 * (1 + power * 2);
            drop.vy = -(2 + power * 6) * (0.6 + Math.random() * 0.4);
            drop.surfaceY = surfaceY;
        }
    }

    acquireDrop() {
        for (const drop of this.drops) {
            if (!drop.active) {
                return drop;
            }
        }
        return null;
    }

    updateDrops() {
        for (const drop of this.drops) {
            if (!drop.active) {
                continue;
            }
            drop.vy += DROP_GRAVITY;
            drop.x += drop.vx;
            drop.y += drop.vy;
            if (drop.vy > 0 && drop.y >= drop.surfaceY) {
                drop.active = false;
            }
        }
    }
}
