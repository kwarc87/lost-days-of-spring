import { rectsCollide } from "../utils/collision.js";

// Owns player bullets, cannons + their bullets, and spike-contact damage checks.
export class ProjectileController {
    constructor() {
        this.bullets = [];
        this.nextBulletId = 0;
        this.cannons = [];
        this.cannonBullets = [];
        this.nextCannonBulletId = 0;
        this.spikes = [];
    }

    setCannons(cannons) {
        this.cannons = cannons ?? [];
    }

    getCannons() {
        return this.cannons;
    }

    setSpikes(spikes) {
        this.spikes = spikes ?? [];
    }

    getSpikes() {
        return this.spikes;
    }

    getBullets() {
        return this.bullets;
    }

    getCannonBullets() {
        return this.cannonBullets;
    }

    resetBullets() {
        this.bullets = [];
        this.nextBulletId = 0;
    }

    resetCannonBullets() {
        this.cannonBullets = [];
        this.nextCannonBulletId = 0;
    }

    spawnBullet(bulletData) {
        this.bullets.push({ ...bulletData, id: this.nextBulletId++ });
    }

    resetCannonTimers(now) {
        for (const cannon of this.cannons) {
            cannon.lastShootTime = now - cannon.shootFrequency + cannon.delay;
        }
    }

    adjustForPause(pauseDuration) {
        for (const cannon of this.cannons) {
            cannon.lastShootTime += pauseDuration;
        }
    }

    // Move bullets, remove out-of-bounds ones, and check bullet-enemy collisions
    updateBullets(now, { worldSize, enemies, solids }) {
        for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
            const bullet = this.bullets[bulletIndex];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // Remove if outside world bounds
            if (
                bullet.x > worldSize.width ||
                bullet.x + bullet.w < 0 ||
                bullet.y > worldSize.height ||
                bullet.y + bullet.h < 0
            ) {
                this.bullets.splice(bulletIndex, 1);
                continue;
            }

            let consumedOnEnemy = false;
            // Bullet-enemy collision
            for (let i = enemies.length - 1; i >= 0; i--) {
                if (enemies[i].dead || enemies[i].dying) {
                    continue;
                }
                if (rectsCollide(bullet, enemies[i])) {
                    const enemy = enemies[i];
                    enemy.health -= bullet.damage;
                    if (enemy.health <= 0) {
                        enemy.health = 0;
                        enemy.isDamaged = false;
                        enemy.dying = true;
                        enemy.dyingStartedAtMs = now;
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
            for (let i = solids.length - 1; i >= 0; i--) {
                if (rectsCollide(bullet, solids[i])) {
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

            const cycles = Math.floor(elapsed / cannon.shootFrequency);
            cannon.lastShootTime += cycles * cannon.shootFrequency;

            const bulletW = cannon.ammo.w;
            const CANNON_BARREL_OFFSET_Y = -12;
            for (let i = 0; i < cycles; i++) {
                this.cannonBullets.push({
                    ...cannon.ammo,
                    id: this.nextCannonBulletId++,
                    x: cannon.x + cannon.w / 2 - bulletW / 2,
                    y: cannon.y + cannon.h + CANNON_BARREL_OFFSET_Y,
                    vx: 0,
                    vy: cannon.speed,
                    targetY: cannon.targetY,
                    color: cannon.color,
                });
            }
        }
    }

    // Move cannon bullets and check collision with player only.
    // `onPlayerHit(now, bullet)` applies damage and returns whether the game ended.
    updateCannonBullets(now, player, onPlayerHit) {
        for (let i = this.cannonBullets.length - 1; i >= 0; i--) {
            const bullet = this.cannonBullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            if (bullet.y > bullet.targetY) {
                this.cannonBullets.splice(i, 1);
                continue;
            }

            if (rectsCollide(bullet, player)) {
                this.cannonBullets.splice(i, 1);
                const cooldownIsActive = now - player.lastHitTime < player.hitCooldown;
                if (!cooldownIsActive) {
                    const gameOver = onPlayerHit(now, bullet);
                    if (gameOver) {
                        return;
                    }
                }
            }
        }
    }

    // Check player-spike collision and apply damage on first contact.
    // `onPlayerHit(now, spike, hitFromAbove)` applies the actual damage.
    updateSpikesDamage(now, player, onPlayerHit) {
        for (const spike of this.spikes) {
            if (rectsCollide(player, spike)) {
                const cooldownIsActive = now - player.lastHitTime < player.hitCooldown;

                if (!cooldownIsActive) {
                    const hitFromAbove = player.prevY + player.h <= spike.y;
                    onPlayerHit(now, spike, hitFromAbove);
                }
                break;
            }
        }
    }
}
