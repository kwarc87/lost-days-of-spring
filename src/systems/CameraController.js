import { GameFactory } from "../factories/GameFactory.js";

// Owns camera position/look-ahead state and the pure math to update it.
// Callers pass player/world/elevator data explicitly — no dependency on the
// game instance, canvas, or DOM, so this can be unit-tested in isolation.
export class CameraController {
    constructor(canvasWidth, canvasHeight) {
        this.camera = {
            x: 0, // current camera X position in world
            y: 0, // current camera Y position in world
            width: canvasWidth, // viewport width in pixels
            height: canvasHeight, // viewport height in pixels

            smoothing: 0.15, // base interpolation factor for camera position (0–1)

            lookAheadX: 0, // current horizontal look-ahead offset (interpolated)
            lookAheadXTarget: 288, // horizontal look-ahead distance in pixels
            lookAheadXSmoothing: 0.02, // interpolation factor for horizontal look-ahead

            lookAheadY: 0, // current vertical look-ahead offset (interpolated)
            lookAheadYTargetUp: 128, // look-ahead distance when ascending (pixels)
            lookAheadYTargetDown: 416, // look-ahead distance when falling (pixels)
            lookAheadYSmoothing: 0.12, // vertical look-ahead smoothing (returning to center)
            lookAheadYSmoothingDown: 0.2, // faster smoothing when building downward look-ahead

            lookAheadYTargetDownCrouch: 288,

            // culling
            margin: GameFactory.GRID * 5,

            // pixel-snapping step, depends on current canvas CSS scale
            snapStep: 1,
        };
    }

    setSnapStep(snapStep) {
        this.camera.snapStep = snapStep;
    }

    calcDesiredLookAheadY(now, player, elevators, physics) {
        if (player.vy < 0) {
            const upRatio = Math.min(Math.abs(player.vy) / player.jump, 1);
            return -this.camera.lookAheadYTargetUp * upRatio * upRatio;
        }

        if (player.vy > 0) {
            const downRatio = Math.min(player.vy / physics.maxFallSpeed, 1);
            return this.camera.lookAheadYTargetDown * downRatio * downRatio;
        }

        if (player.onGroundType === "elevator") {
            const elevator = elevators.find((e) => e.id === player.onGroundId);
            if (!elevator || elevator.dirY === 0 || now < elevator.idleUntil) {
                return 0;
            }
            const elevatorVy =
                elevator.dirY * elevator.speed * elevator.direction;
            if (elevatorVy < 0) {
                const upRatio = Math.min(
                    Math.abs(elevatorVy) / physics.maxFallSpeed,
                    1,
                );
                return -this.camera.lookAheadYTargetUp * upRatio * upRatio;
            }
            const downRatio = Math.min(elevatorVy / physics.maxFallSpeed, 1);
            return this.camera.lookAheadYTargetDown * downRatio * downRatio;
        }

        return 0;
    }

    updateCameraX(player) {
        const desiredLookAheadX =
            player.facing === "right"
                ? this.camera.lookAheadXTarget
                : -this.camera.lookAheadXTarget;

        this.camera.lookAheadX +=
            (desiredLookAheadX - this.camera.lookAheadX) *
            this.camera.lookAheadXSmoothing;

        const targetX = player.x + player.w / 2 - this.camera.width / 2;

        this.camera.x +=
            (targetX + this.camera.lookAheadX - this.camera.x) *
            this.camera.smoothing;
    }

    updateCameraY(now, player, elevators, physics, isCrouching) {
        let desiredLookAheadY = this.calcDesiredLookAheadY(
            now,
            player,
            elevators,
            physics,
        );

        if (isCrouching) {
            desiredLookAheadY += this.camera.lookAheadYTargetDownCrouch;
        }

        const ySmoothing =
            desiredLookAheadY > this.camera.lookAheadY
                ? this.camera.lookAheadYSmoothingDown
                : this.camera.lookAheadYSmoothing;

        this.camera.lookAheadY +=
            (desiredLookAheadY - this.camera.lookAheadY) * ySmoothing;

        const playerFootY = player.y + player.h;
        const targetY =
            playerFootY - player.originalHeight / 2 - this.camera.height / 2;

        this.camera.y +=
            (targetY + this.camera.lookAheadY - this.camera.y) *
            this.camera.smoothing;
    }

    clampCameraToWorld(worldSize) {
        const snap = this.camera.snapStep;
        this.camera.x =
            Math.round(
                Math.max(
                    0,
                    Math.min(
                        this.camera.x,
                        worldSize.width - this.camera.width,
                    ),
                ) / snap,
            ) * snap;
        this.camera.y =
            Math.round(
                Math.max(
                    0,
                    Math.min(
                        this.camera.y,
                        worldSize.height - this.camera.height,
                    ),
                ) / snap,
            ) * snap;
    }

    resetToPlayerStart(player, worldSize) {
        const targetX = player.x + player.w / 2 - this.camera.width / 2;
        const playerFootY = player.y + player.h;
        const targetY =
            playerFootY - player.originalHeight / 2 - this.camera.height / 2;

        this.camera.x = targetX;
        this.camera.y = targetY;
        this.camera.lookAheadX = 0;
        this.camera.lookAheadY = 0;
        this.clampCameraToWorld(worldSize);
    }

    update(now, { player, worldSize, elevators, physics, isCrouching }) {
        this.updateCameraX(player);
        this.updateCameraY(now, player, elevators, physics, isCrouching);
        this.clampCameraToWorld(worldSize);
    }

    isVisible(obj, margin) {
        const w = (obj.w ?? 0) * (obj.repeatX ?? 1);
        const h = (obj.h ?? 0) * (obj.repeatY ?? 1);
        const cameraMargin = margin ?? this.camera.margin;
        return !(
            obj.x + w < this.camera.x - cameraMargin ||
            obj.x > this.camera.x + this.camera.width + cameraMargin ||
            obj.y + h < this.camera.y - cameraMargin ||
            obj.y > this.camera.y + this.camera.height + cameraMargin
        );
    }
}
