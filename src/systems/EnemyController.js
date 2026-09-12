import { rectsCollide } from "../utils/collision.js";
import { hasPassedTarget } from "../utils/patrol.js";

// Owns enemy definitions/state: patrol movement plus player-enemy collision resolution.
export class EnemyController {
    constructor() {
        this.enemies = [];
    }

    setEnemies(enemies) {
        this.enemies = enemies ?? [];
    }

    getEnemies() {
        return this.enemies;
    }

    // Restores alive/dead state for enemies from a checkpoint memento.
    restoreAliveState(aliveEnemyIds) {
        if (!aliveEnemyIds) {
            return;
        }
        for (const e of this.enemies) {
            const isAlive = aliveEnemyIds.has(e.id);
            e.dead = !isAlive;
            e.dying = false;
            e.dyingStartedAtMs = null;
        }
    }

    adjustForPause(pauseDuration) {
        for (const e of this.enemies) {
            if (e.dyingStartedAtMs) {
                e.dyingStartedAtMs += pauseDuration;
            }
        }
    }

    update(
        now,
        { player, solids, verticalHitRecoilMultiplier, onPlayerHit, playerPhysicsController }
    ) {
        this.patrol(now);
        this.resolvePlayerCollision(
            now,
            player,
            solids,
            verticalHitRecoilMultiplier,
            onPlayerHit,
            playerPhysicsController
        );
    }

    // Applies damage to an enemy and transitions it into the dying state on death.
    applyDamage(now, enemy, damage) {
        enemy.health -= damage;
        if (enemy.health <= 0) {
            enemy.health = 0;
            enemy.isDamaged = false;
            enemy.dying = true;
            enemy.dyingStartedAtMs = now;
        } else {
            enemy.isDamaged = true;
            enemy.damageTime = now;
        }
    }

    // Moves enemies along their patrol path and reverses direction at the endpoints.
    patrol(now) {
        for (const enemy of this.enemies) {
            if (enemy.dead) {
                continue;
            }

            enemy.wasCollidingWithPlayer = enemy.collidingWithPlayerThisFrame;
            enemy.collidingWithPlayerThisFrame = false;

            if (enemy.dying) {
                if (now - enemy.dyingStartedAtMs >= enemy.dyingDurationMs) {
                    enemy.dying = false;
                    enemy.dead = true;
                }
                continue;
            }

            // Clear damage flash after 200ms
            if (enemy.isDamaged && now - enemy.damageTime > 200) {
                enemy.isDamaged = false;
            }

            enemy.prevX = enemy.x;
            enemy.prevY = enemy.y;

            const moveX = enemy.dirX * enemy.speed * enemy.direction;
            const moveY = enemy.dirY * enemy.speed * enemy.direction;

            enemy.x += moveX;
            enemy.y += moveY;

            const signX = Math.sign(enemy.dirX);
            const signY = Math.sign(enemy.dirY);

            const passedX = hasPassedTarget(
                enemy.x,
                enemy.direction === 1 ? enemy.targetX : enemy.startX,
                enemy.direction === 1 ? signX : -signX
            );

            const passedY = hasPassedTarget(
                enemy.y,
                enemy.direction === 1 ? enemy.targetY : enemy.startY,
                enemy.direction === 1 ? signY : -signY
            );

            if (passedX && passedY) {
                if (enemy.direction === 1) {
                    enemy.x = enemy.targetX;
                    enemy.y = enemy.targetY;
                    enemy.direction = -1;
                } else {
                    enemy.x = enemy.startX;
                    enemy.y = enemy.startY;
                    enemy.direction = 1;
                }
            }
        }
    }

    resolvePlayerCollision(
        now,
        player,
        solids,
        verticalHitRecoilMultiplier,
        onPlayerHit,
        playerPhysicsController
    ) {
        const cooldownIsActive = now - player.lastHitTime < player.hitCooldown;

        // Pass 1: mark ALL colliding enemies and record entry side.
        // Must be separate from resolution so enemies that are reached after
        // a `break` still get their wasCollidingWithPlayer state updated.
        for (const enemy of this.enemies) {
            if (enemy.dead || enemy.dying) {
                continue;
            }
            if (!rectsCollide(player, enemy)) {
                continue;
            }

            enemy.collidingWithPlayerThisFrame = true;

            // Record entry side once at first frame of contact.
            if (!enemy.wasCollidingWithPlayer) {
                enemy.playerEnteredFromLeft = player.prevX + player.w <= enemy.prevX;
                enemy.playerEnteredFromAbove = player.prevY + player.h <= enemy.prevY;
                enemy.playerEnteredFromBelow = player.prevY >= enemy.prevY + enemy.h;
            }
        }

        // Pass 2: damage from the first colliding enemy, overlap resolution for all.
        for (const enemy of this.enemies) {
            if (enemy.dead || enemy.dying) {
                continue;
            }
            if (!enemy.collidingWithPlayerThisFrame) {
                continue;
            }

            if (!cooldownIsActive) {
                onPlayerHit(now, enemy, enemy.playerEnteredFromAbove, enemy.playerEnteredFromBelow);
                break;
            }

            // Cooldown active: resolve overlap without damage.
            // No break — all colliding enemies are resolved so sandwiched
            // collisions (player between two enemies) are handled correctly.
            this.resolveCollisionX(enemy, player, solids);
            this.resolveCollisionY(
                enemy,
                player,
                solids,
                verticalHitRecoilMultiplier,
                playerPhysicsController
            );
        }
    }

    resolveCollisionX(enemy, player, solids) {
        // Vertical entry — Y phase handles it.
        if (enemy.playerEnteredFromAbove || enemy.playerEnteredFromBelow) {
            return;
        }

        const targetX = enemy.playerEnteredFromLeft
            ? enemy.x - player.w // came from left → push back left
            : enemy.x + enemy.w; // came from right → push back right

        const playerAtTarget = {
            x: targetX,
            y: player.y,
            w: player.w,
            h: player.h,
        };

        const blocked =
            solids.some((p) => rectsCollide(playerAtTarget, p)) ||
            this.enemies.some(
                (e) => e !== enemy && !e.dead && !e.dying && rectsCollide(playerAtTarget, e)
            );

        if (!blocked) {
            player.x = targetX;
        } else if (enemy.dirX !== 0) {
            // No room for player — snap enemy clear and reverse.
            // Skip for vertical-only enemies (dirX === 0): snapping their X or
            // reversing direction would corrupt their vertical patrol.
            enemy.x = enemy.playerEnteredFromLeft ? player.x + player.w : player.x - enemy.w;
            if (!enemy.dying) {
                enemy.direction = -enemy.direction;
            }
        }
    }

    resolveCollisionY(enemy, player, solids, verticalHitRecoilMultiplier, playerPhysicsController) {
        if (!enemy.playerEnteredFromAbove && !enemy.playerEnteredFromBelow) {
            return;
        }

        const targetY = enemy.playerEnteredFromAbove ? enemy.y - player.h : enemy.y + enemy.h;

        const playerAtTarget = {
            x: player.x,
            y: targetY,
            w: player.w,
            h: player.h,
        };

        const blocked =
            solids.some((p) => rectsCollide(playerAtTarget, p)) ||
            this.enemies.some(
                (e) => e !== enemy && !e.dead && !e.dying && rectsCollide(playerAtTarget, e)
            );

        if (blocked && enemy.dirY !== 0) {
            // No room for player — snap enemy clear and reverse.
            // Skip for horizontal-only enemies (dirY === 0): snapping their Y or
            // reversing direction would corrupt their horizontal patrol.
            enemy.y = enemy.playerEnteredFromAbove
                ? player.y + player.h // No room above — snap enemy below player.
                : player.y - enemy.h; // No room below — snap enemy above player.
            if (!enemy.dying) {
                enemy.direction = -enemy.direction;
            }
        } else if (!blocked) {
            player.y = targetY;
        }

        if (enemy.playerEnteredFromAbove && !blocked) {
            playerPhysicsController.applyKnockback(
                player,
                player.vx,
                -enemy.recoilY * verticalHitRecoilMultiplier,
                true
            );
        }

        if (enemy.playerEnteredFromBelow && !blocked && player.vy < 0) {
            player.vy = 0;
        }
    }
}
