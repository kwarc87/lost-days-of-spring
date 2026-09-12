import { rectsCollide } from "../utils/collision.js";

// Owns the player's posture system: crouch/stand hitbox switching and the
// collision checks that decide whether a posture change is currently possible.
export class PlayerPostureController {
    constructor(postures, playerPhysicsController) {
        this.postures = postures;
        this.playerPhysicsController = playerPhysicsController;
    }

    isCrouching(player) {
        return player.posture === this.postures.CROUCH;
    }

    // Crouch is only allowed while grounded; stand back up as soon as there's room.
    handleCrouchInput(player, solids, enemies, inputController) {
        const crouchHeld = inputController.isDown("crouchAlt") || inputController.isDown("crouch");

        if (crouchHeld && !player.airborne) {
            if (!this.isCrouching(player)) {
                const anchor = this.findCrouchAnchor(player, solids, enemies);
                if (anchor !== null) {
                    this.applyPosture(player, this.postures.CROUCH, anchor);
                }
            }
        } else if (this.isCrouching(player) && this.canStandUp(player, solids, enemies)) {
            this.applyPosture(player, this.postures.STANDING);
        }
    }

    canStandUp(player, solids, enemies) {
        return this.canApplyPosture(
            player,
            solids,
            enemies,
            player.originalHeight,
            player.originalWidth
        );
    }

    findCrouchAnchor(player, solids, enemies) {
        const h = player.crouchHeight;
        const w = player.crouchWidth;
        for (const anchor of ["center", "start", "end"]) {
            if (this.canApplyPosture(player, solids, enemies, h, w, anchor)) {
                return anchor;
            }
        }
        return null;
    }

    // Checks whether the player's hitbox at the given size/anchor would collide
    // with any solid or enemy, without actually applying the posture change.
    canApplyPosture(player, solids, enemies, height, width, anchor = "center") {
        const bottomY = player.y + player.h;
        let startX;
        if (anchor === "start") {
            startX = player.x;
        } else if (anchor === "end") {
            startX = player.x + player.w - width;
        } else {
            startX = player.x + player.w / 2 - width / 2;
        }

        const futurePlayer = {
            x: startX,
            y: bottomY - height,
            w: width,
            h: height,
        };

        for (const p of solids) {
            if (p.dead) {
                continue;
            }
            if (p.type === "oneDirection") {
                continue;
            }
            if (rectsCollide(futurePlayer, p)) {
                return false;
            }
        }

        for (const e of enemies) {
            if (e.dead || e.dying) {
                continue;
            }
            if (rectsCollide(futurePlayer, e)) {
                return false;
            }
        }

        return true;
    }

    applyPosture(player, posture, anchor = "center") {
        const hitbox = this.getHitboxForPosture(player, posture);
        player.posture = posture;
        this.applyHeight(player, hitbox.h);
        this.applyWidth(player, hitbox.w, anchor);
    }

    getHitboxForPosture(player, posture) {
        if (posture === this.postures.CROUCH) {
            return {
                w: player.crouchWidth,
                h: player.crouchHeight,
            };
        }

        return {
            w: player.originalWidth,
            h: player.originalHeight,
        };
    }

    applyHeight(player, nextHeight) {
        // anchor should be always bottom
        const bottom = player.y + player.h;
        player.h = nextHeight;
        this.playerPhysicsController.setPosition(player, player.x, bottom - nextHeight);
    }

    applyWidth(player, nextWidth, anchor = "center") {
        let nextX;
        if (anchor === "start") {
            nextX = player.x;
        } else if (anchor === "end") {
            nextX = player.x + player.w - nextWidth;
        } else {
            nextX = player.x + player.w / 2 - nextWidth / 2;
        }
        player.w = nextWidth;
        this.playerPhysicsController.setPosition(player, nextX, player.y);
    }
}
