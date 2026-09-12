import { rectsCollide } from "../utils/collision.js";

// Owns the player's raw movement physics: gravity, carry-velocity decay, and
// axis-separated collision resolution against solids/enemies/world bounds.
// Posture (crouch/stand) and damage are cross-cutting concerns owned by
// LostDaysOfSpring and passed in as callbacks/values.
export class PlayerPhysicsController {
    constructor(physics) {
        this.physics = physics;
    }

    // Apply gravity and enforce terminal velocity
    applyPhysics(player, jumpHeld) {
        let currentGravity = this.physics.gravity;
        const isAscending = player.vy < 0;
        const isFalling = player.vy > 0;

        // Variable jump height: fall faster if jump key is released while ascending
        if (isAscending && !jumpHeld && player.jumpPressedByUser) {
            currentGravity *= this.physics.jumpCutGravityMultiplier;
        } else if (isFalling) {
            currentGravity *= this.physics.fallGravityMultiplier;
        }

        player.vy += currentGravity;

        // Terminal velocity cap
        if (player.vy > this.physics.maxFallSpeed) {
            player.vy = this.physics.maxFallSpeed;
        }
    }

    // Zeroes velocity/carry without moving the player (e.g. freezing for a teleport).
    stopMovement(player) {
        player.vx = 0;
        player.vy = 0;
        player.carryVx = 0;
        player.carryVxInitial = 0;
    }

    // Instantly repositions the player (e.g. teleport exit) and clears momentum.
    warpTo(player, x, y) {
        player.x = x;
        player.y = y;
        player.vx = 0;
        player.vy = 0;
    }

    // Cancels the variable jump-height cut, used whenever an external force overrides player control.
    cancelJumpCut(player) {
        player.jumpPressedByUser = false;
    }

    // Applies an external velocity impulse (e.g. damage/enemy-bump knockback).
    applyKnockback(player, vx, vy, becomesAirborne = false) {
        player.vx = vx;
        player.vy = vy;
        this.cancelJumpCut(player);
        if (becomesAirborne) {
            player.airborne = true;
        }
    }

    // Decay the carry velocity inherited from a moving elevator
    applyCarryDecay(now, player) {
        if (player.carryVxInitial === 0) {
            return;
        }
        const t = Math.max(0, 1 - (now - player.carryStartAt) / player.carryDuration);
        player.carryVx = player.carryVxInitial * t;
        if (t <= 0) {
            player.carryVx = 0;
            player.carryVxInitial = 0;
        }
    }

    // Read horizontal input, resolve target speed/facing (crouch-aware), and
    // ease vx toward it. Knockback locks out player-driven horizontal input.
    handleHorizontalMovementInput(now, player, { inputController, isCrouching, solids }) {
        if (now < player.knockbackUntil) {
            return;
        }

        let targetVx = 0;
        const speed = isCrouching() ? player.crouchSpeed : player.speed;

        if (inputController.isDown("left") && !inputController.isDown("right")) {
            targetVx = -speed;
            player.facing = "left";
        } else if (inputController.isDown("right") && !inputController.isDown("left")) {
            targetVx = speed;
            player.facing = "right";
        }

        player.movingByInput = targetVx !== 0;

        this.applyHorizontalMovement(player, targetVx, solids);
    }

    // Ease vx toward targetVx using the acceleration/deceleration of the platform
    // the player is standing on (or last stood on, while airborne).
    applyHorizontalMovement(player, targetVx, solids) {
        const groundPlatform = solids.find((p) => p.id === player.onGroundId);
        const acceleration = groundPlatform?.acceleration ?? player.acceleration;
        const deceleration = groundPlatform?.deceleration ?? player.deceleration;

        const lastGroundPlatform = solids.find((p) => p.id === player.lastGroundId);
        const lastGroundAcceleration = lastGroundPlatform?.airAcceleration;
        const lastGroundDeceleration = lastGroundPlatform?.airDeceleration;

        const delta =
            targetVx === 0
                ? player.airborne
                    ? (lastGroundDeceleration ?? player.airDeceleration)
                    : deceleration
                : player.airborne
                  ? (lastGroundAcceleration ?? player.airAcceleration)
                  : acceleration;

        if (player.vx < targetVx) {
            player.vx = Math.min(player.vx + delta, targetVx);
            return;
        }

        if (player.vx > targetVx) {
            player.vx = Math.max(player.vx - delta, targetVx);
        }
    }

    // Boost vy/carryVx when jumping off a moving elevator (upward lift, sideways carry).
    applyElevatorJumpBoost(now, player, elevator) {
        if (!elevator || !elevator.triggered || now < elevator.idleUntil) {
            return;
        }
        const elevVx = elevator.dirX * elevator.speed * elevator.direction;
        const elevVy = elevator.dirY * elevator.speed * elevator.direction;
        // Upward elevator: subtle boost capped to 25%
        if (elevVy < 0) {
            player.vy += elevVy * 0.25;
        }
        // Downward elevator: no effect
        // Sideways elevator: carry velocity
        if (elevVx !== 0) {
            player.carryVxInitial = elevVx;
            player.carryVx = elevVx;
            player.carryStartAt = now;
        }
    }

    // Consume a buffered jump press (respecting crouch, knockback, coyote time,
    // and boosters) and apply the resulting vy/elevator boost.
    handleJumpInput(now, player, { isCrouching, elevatorController }) {
        if (isCrouching()) {
            return;
        }
        if (now < player.knockbackUntil) {
            return;
        }
        const jumpBuffered = now - player.jumpPressedAt <= player.jumpBufferDuration;

        const isOnBooster = player.onGroundType === "booster";
        const leftBoosterRecently = player.lastGroundType === "booster";

        const hasCoyoteTime =
            now - player.lastGroundedAt <= player.coyoteDuration && !leftBoosterRecently;

        const canGroundJump = !isOnBooster && (!player.airborne || hasCoyoteTime);

        if (jumpBuffered && canGroundJump) {
            player.vy = -player.jump;

            this.handleElevatorJump(now, player, elevatorController);

            player.airborne = true;
            player.lastGroundedAt = 0;
            player.onGroundId = null;
            player.onGroundType = null;
            player.jumpPressedByUser = true;
            player.jumpPressedAt = 0;
        }
    }

    handleElevatorJump(now, player, elevatorController) {
        if (player.onGroundType === "elevator") {
            const elev = elevatorController.findById(player.onGroundId);
            this.applyElevatorJumpBoost(now, player, elev);
        }
    }

    // Move player along the X axis and resolve platform/enemy collisions
    movePlayerX(now, player, { solids, worldSize, enemies, onPlayerHit }) {
        const prevX = player.prevX ?? player.x;

        player.x += player.vx + player.carryVx;

        // World bounds check (X axis)
        if (player.x < 0) {
            player.x = 0;
            player.vx = 0;
            player.carryVx = 0;
            player.carryVxInitial = 0;
            player.knockbackUntil = 0;
        } else if (player.x + player.w > worldSize.width) {
            player.x = worldSize.width - player.w;
            player.vx = 0;
            player.carryVx = 0;
            player.carryVxInitial = 0;
            player.knockbackUntil = 0;
        }

        for (const p of solids) {
            if (p.type === "oneDirection") {
                continue;
            }
            if (rectsCollide(player, p)) {
                const platformPrevX = p.previousX ?? p.x;

                const wasLeft = prevX + player.w <= Math.max(platformPrevX, p.x);
                const wasRight = prevX >= Math.min(platformPrevX + p.w, p.x + p.w);

                if (wasLeft) {
                    player.x = p.x - player.w;
                    player.vx = 0;
                    player.carryVx = 0;
                    player.carryVxInitial = 0;
                    player.knockbackUntil = 0;
                } else if (wasRight) {
                    player.x = p.x + p.w;
                    player.vx = 0;
                    player.carryVx = 0;
                    player.carryVxInitial = 0;
                    player.knockbackUntil = 0;
                }
            }
        }

        // Resolve player against enemies on the X axis so that large knockback
        // velocities cannot overshoot the player into a nearby enemy.
        for (const e of enemies) {
            if (e.dead || e.dying) {
                continue;
            }
            if (!rectsCollide(player, e)) {
                continue;
            }

            const wasLeft = prevX + player.w <= e.x;
            const wasRight = prevX >= e.x + e.w;

            if (wasLeft) {
                player.x = e.x - player.w;
                player.vx = 0;
                player.carryVx = 0;
                player.carryVxInitial = 0;
            } else if (wasRight) {
                player.x = e.x + e.w;
                player.vx = 0;
                player.carryVx = 0;
                player.carryVxInitial = 0;
            }

            if (wasLeft || wasRight) {
                const cooldownIsActive = now - player.lastHitTime < player.hitCooldown;
                if (!cooldownIsActive) {
                    onPlayerHit(now, e);
                }
            }
        }
    }

    // Move player along the Y axis, resolve platform collisions, and check fall-off
    movePlayerY(
        now,
        player,
        { solids, worldSize, worldGroundId, isCrouching, canStandUp, onStandUp, elevatorController }
    ) {
        const previousY = player.prevY ?? player.y;
        const previousH = player.h;

        player.y += player.vy;
        player.onGroundId = null;
        player.onGroundType = null;
        player.airborne = true;

        // Worlds bounds collisions
        if (player.y < 0) {
            this.handleWorldCeilHit(player);
        } else if (player.y + player.h > worldSize.height) {
            this.handleWorldGroundLanding(now, player, worldSize, worldGroundId);
        }

        //Platforms collisions
        for (const p of solids) {
            if (rectsCollide(player, p)) {
                const platformPrevY = p.previousY ?? p.y;

                const wasAbove = previousY + previousH <= Math.max(platformPrevY, p.y);
                const wasBelow = previousY >= Math.min(platformPrevY, p.y) + p.h;

                // oneDirection platforms: only block when landing from above
                if (p.type === "oneDirection" && !wasAbove) {
                    continue;
                }

                // Landing on top of platform
                if (wasAbove) {
                    this.handlePlatformLanding(p, now, player, elevatorController);
                    this.handlePlatformLandingResponse(p, player);
                    continue;
                }

                if (wasBelow) {
                    // Hit ceiling
                    this.handleCeilingHit(p, player);
                }
            }
        }

        // Crouch is only allowed while grounded
        if (isCrouching() && player.airborne && canStandUp()) {
            onStandUp();
        }
    }

    handleWorldGroundLanding(now, player, worldSize, worldGroundId) {
        player.y = worldSize.height - player.h;
        player.vy = 0;
        player.jumpPressedByUser = false;
        player.lastGroundedAt = now;

        player.airborne = false;
        player.onGroundId = worldGroundId;
        player.onGroundType = "solid";
        player.lastGroundId = worldGroundId;
        player.lastGroundType = "solid";

        player.carryVx = 0;
        player.carryVxInitial = 0;
    }

    handleWorldCeilHit(player) {
        player.y = 0;
        player.vy = 0;
    }

    // Also called externally when the player lands on a moving elevator.
    handlePlatformLanding(platform, now, player, elevatorController) {
        player.y = platform.y - player.h;
        player.airborne = false;
        player.onGroundId = platform.id;
        player.onGroundType = platform.type;
        player.lastGroundedAt = now;
        player.jumpPressedByUser = false;
        player.lastGroundType = platform.type;
        player.lastGroundId = platform.id;

        player.carryVx = 0;
        player.carryVxInitial = 0;

        if (platform.type === "elevator") {
            elevatorController.trigger(platform.id);
        }
    }

    // Also called externally when the player lands on a moving elevator.
    handlePlatformLandingResponse(platform, player) {
        if (platform.type === "booster") {
            player.vy = -platform.boostSpeed;
            return;
        }

        if (
            platform.type === "solid" ||
            platform.type === "elevator" ||
            platform.type === "oneDirection"
        ) {
            player.vy = 0;
            return;
        }
    }

    handleCeilingHit(platform, player) {
        player.y = platform.y + platform.h;
        player.vy = 0;
    }
}
