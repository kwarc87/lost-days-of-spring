// Owns pause-menu UI state and the "frozen clock" bookkeeping shared by every
// feature that suspends gameplay time (pause menu, map view, artifact gallery).
export class PauseController {
    constructor() {
        this.isPaused = false;
        this.menuIndex = 0;
        this.startAt = 0;
        this.totalPausedTime = 0;
    }

    // Resets menu/freeze state on level (re)load. totalPausedTime is managed
    // separately by the caller, since its reset depends on why the level loaded.
    resetMenu() {
        this.isPaused = false;
        this.menuIndex = 0;
        this.startAt = 0;
    }

    resetClock() {
        this.totalPausedTime = 0;
        this.startAt = 0;
    }

    // Marks the start of a time-freeze window (pause menu, map view, gallery).
    beginFreeze(now) {
        this.startAt = now;
    }

    // Ends the freeze window, folding its duration into totalPausedTime.
    endFreeze(now) {
        const duration = now - this.startAt;
        this.totalPausedTime += duration;
        return duration;
    }

    open(now) {
        this.isPaused = true;
        this.menuIndex = 0;
        this.beginFreeze(now);
    }

    close() {
        this.isPaused = false;
    }

    moveMenuIndex(direction, itemCount) {
        this.menuIndex = (this.menuIndex + direction + itemCount) % itemCount;
    }

    // Shifts the player's own pause-sensitive timestamps forward by the freeze duration.
    adjustPlayerTimers(player, pauseDuration) {
        if (player.lastHitTime) {
            player.lastHitTime += pauseDuration;
        }
        if (player.dyingStartedAt) {
            player.dyingStartedAt += pauseDuration;
        }
        if (player.lastShootTime) {
            player.lastShootTime += pauseDuration;
        }
        if (player.lastGroundedAt) {
            player.lastGroundedAt += pauseDuration;
        }
        if (player.carryStartAt) {
            player.carryStartAt += pauseDuration;
        }
        if (player.knockbackUntil) {
            player.knockbackUntil += pauseDuration;
        }
        if (player.animStartTime) {
            player.animStartTime += pauseDuration;
        }
    }

    // Ends the freeze window and propagates its duration to the player plus every
    // other pause-sensitive system (each expected to expose adjustForPause).
    resumeAll(now, player, pausables) {
        const pauseDuration = this.endFreeze(now);
        this.adjustPlayerTimers(player, pauseDuration);
        for (const pausable of pausables) {
            pausable.adjustForPause(pauseDuration);
        }
        return pauseDuration;
    }
}
