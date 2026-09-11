import { GameFactory } from "../factories/GameFactory.js";
import { rectsCollide } from "../utils/collision.js";
import { hasPassedTarget } from "../utils/patrol.js";

// Owns elevator definitions/state and their movement + player-carrying logic.
export class ElevatorController {
    constructor() {
        this.elevators = [];
        this.speedOutsideCamera = 100;
        this.cameraMargin = GameFactory.GRID * 15;
    }

    setElevators(elevators) {
        this.elevators = elevators ?? [];
    }

    getElevators() {
        return this.elevators;
    }

    findById(id) {
        return this.elevators.find((e) => e.id === id);
    }

    isPlayerOn(player, elevatorId) {
        return (
            player.onGroundType === "elevator" &&
            player.onGroundId === elevatorId
        );
    }

    adjustForPause(pauseDuration) {
        for (const e of this.elevators) {
            if (e.idleUntil) {
                e.idleUntil += pauseDuration;
            }
        }
    }

    update(
        now,
        {
            player,
            platforms,
            enemies,
            isVisibleInCamera,
            onPlatformLanding,
            onPlayerHit,
        },
    ) {
        for (const e of this.elevators) {
            e.previousX = e.x;
            e.previousY = e.y;
            if (!e.triggered) {
                continue;
            }
            if (now < e.idleUntil) {
                continue;
            }

            const offScreen = !isVisibleInCamera(e, this.cameraMargin);
            const speed = offScreen ? this.speedOutsideCamera : e.speed;

            const playerIsOnElevator = offScreen
                ? false
                : this.isPlayerOn(player, e.id);

            const moveX = e.dirX * speed * e.direction;
            const moveY = e.dirY * speed * e.direction;

            const { shouldSkip, picksUp } = offScreen
                ? { shouldSkip: false, picksUp: false }
                : this.checkPlayerBlock(
                      e,
                      player,
                      moveX,
                      moveY,
                      playerIsOnElevator,
                  );
            if (shouldSkip) {
                continue;
            }

            const previousX = e.x;
            const previousY = e.y;

            this.move(e, moveX, moveY, now);
            this.applyToPlayer(
                e,
                player,
                previousX,
                previousY,
                picksUp,
                playerIsOnElevator,
                now,
                { platforms, enemies, onPlatformLanding, onPlayerHit },
            );
        }
    }

    // Checks whether the player is in the path of the elevator.
    // Returns shouldSkip=true (and reverses direction) when the elevator must bounce,
    // or picksUp=true when the elevator should collect a standing player from below.
    checkPlayerBlock(e, player, moveX, moveY, playerIsOnElevator) {
        const nextX = e.x + moveX;
        const nextY = e.y + moveY;

        const sweptElevator = {
            x: Math.min(e.x, nextX),
            y: Math.min(e.y, nextY),
            w: e.w + Math.abs(moveX),
            h: e.h + Math.abs(moveY),
        };

        const playerBlocksElevator =
            !playerIsOnElevator && rectsCollide(player, sweptElevator);

        // Elevator moving upward reaches a player standing just above it —
        // instead of bouncing, pick the player up.
        const picksUp =
            playerBlocksElevator &&
            moveY < 0 &&
            !player.airborne &&
            player.y + player.h <= e.y;

        if (playerBlocksElevator && !picksUp) {
            if (!player.airborne) {
                e.direction = -e.direction;
            }
            return { shouldSkip: true, picksUp: false };
        }

        return { shouldSkip: false, picksUp };
    }

    // Moves the elevator by the given delta and snaps it to the endpoint when overshot.
    move(e, moveX, moveY, now) {
        e.x += moveX;
        e.y += moveY;

        const signX = Math.sign(e.dirX);
        const signY = Math.sign(e.dirY);

        const passedX = hasPassedTarget(
            e.x,
            e.direction === 1 ? e.targetX : e.startX,
            e.direction === 1 ? signX : -signX,
        );
        const passedY = hasPassedTarget(
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
    applyToPlayer(
        e,
        player,
        previousX,
        previousY,
        picksUp,
        playerIsOnElevator,
        now,
        { platforms, enemies, onPlatformLanding, onPlayerHit },
    ) {
        const actualMoveX = e.x - previousX;
        const actualMoveY = e.y - previousY;

        if (playerIsOnElevator) {
            const nextPlayer = {
                x: player.x + actualMoveX,
                y: player.y + actualMoveY,
                w: player.w,
                h: player.h,
            };
            const wouldHitPlatform = platforms.some((p) =>
                rectsCollide(nextPlayer, p),
            );
            const blockingEnemy = enemies.find(
                (enemy) =>
                    !enemy.dead &&
                    !enemy.dying &&
                    rectsCollide(nextPlayer, enemy),
            );
            if ((wouldHitPlatform || blockingEnemy) && actualMoveY < 0) {
                e.x = previousX;
                e.y = previousY;
                e.direction = -e.direction;
                if (blockingEnemy) {
                    const cooldownIsActive =
                        now - player.lastHitTime < player.hitCooldown;
                    if (!cooldownIsActive) {
                        onPlayerHit(now, blockingEnemy);
                    }
                }
            } else {
                player.x += actualMoveX;
                player.y += actualMoveY;
            }
        } else if (picksUp) {
            // Elevator arrived at player's feet from below — snap player onto elevator.
            onPlatformLanding(e, now);
        }
    }
}
