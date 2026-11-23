import { rectsCollide } from "../utils/collision.js";

// Owns hack panel (hacking terminal) definitions and the hacking state machine:
// idle -> hacking (key held inside hackZone, progress 0..1) -> active (linked temporary
// platforms on for activationDuration) -> idle. Releasing the key or leaving the zone
// resets progress. In "deactivate" mode the linked platforms are turned off for
// activationDuration instead (and back on afterwards).
export class HackPanelController {
    constructor(temporaryPlatformController) {
        this.temporaryPlatformController = temporaryPlatformController;
        this.hackPanels = [];
    }

    setHackPanels(hackPanels) {
        this.hackPanels = hackPanels ?? [];
    }

    getHackPanels() {
        return this.hackPanels;
    }

    // Returns the messages embedded in panel defs so the caller can register them.
    extractMessages() {
        return this.hackPanels.filter((panel) => panel.message).map((panel) => panel.message);
    }

    adjustForPause(pauseDuration) {
        for (const panel of this.hackPanels) {
            if (panel.hackStartedAt !== null) {
                panel.hackStartedAt += pauseDuration;
            }
            if (panel.activeUntil !== null) {
                panel.activeUntil += pauseDuration;
            }
        }
    }

    update(now, { player, isHackKeyDown, onPlayerBlocked }) {
        for (const panel of this.hackPanels) {
            if (panel.active) {
                this.updateActive(now, panel, player, onPlayerBlocked);
            } else {
                this.updateHacking(now, panel, player, isHackKeyDown, onPlayerBlocked);
            }
        }
    }

    // True while the player is actively hacking a panel (and should be locked in place).
    isHacking(player, isHackKeyDown) {
        return this.hackPanels.some((panel) => this.canHack(panel, player, isHackKeyDown));
    }

    // Hacking can only start while standing still on the ground; once started it continues
    // (the player is locked in place) for as long as the key is held inside the zone.
    // Getting hit (isHit covers the knockback window) interrupts it.
    canHack(panel, player, isHackKeyDown) {
        if (
            panel.active ||
            player.isHit ||
            !isHackKeyDown ||
            !rectsCollide(player, panel.hackZone)
        ) {
            return false;
        }
        return panel.hackStartedAt !== null || (!player.airborne && player.vx === 0);
    }

    updateActive(now, panel, player, onPlayerBlocked) {
        const remaining = panel.activeUntil - now;
        if (remaining <= 0) {
            this.setActive(panel, false, player, onPlayerBlocked);
            return;
        }
        panel.activeRatio = remaining / panel.activationDuration;
    }

    updateHacking(now, panel, player, isHackKeyDown, onPlayerBlocked) {
        if (!this.canHack(panel, player, isHackKeyDown)) {
            panel.hackStartedAt = null;
            panel.hackProgress = 0;
            return;
        }
        if (panel.hackStartedAt === null) {
            panel.hackStartedAt = now;
        }
        panel.hackProgress = Math.min((now - panel.hackStartedAt) / panel.hackDuration, 1);
        if (panel.hackProgress >= 1) {
            panel.activeUntil = now + panel.activationDuration;
            this.setActive(panel, true, player, onPlayerBlocked);
        }
    }

    setActive(panel, active, player, onPlayerBlocked) {
        panel.active = active;
        panel.hackStartedAt = null;
        panel.hackProgress = 0;
        panel.activeRatio = active ? 1 : 0;
        if (!active) {
            panel.activeUntil = null;
        }
        const platformsActive = panel.mode === "deactivate" ? !active : active;
        const appeared = this.temporaryPlatformController.setActive(
            panel.platformIds,
            platformsActive
        );
        // A wall that appears inside the player pushes them out (one-direction platforms don't block).
        const wall = appeared.find((p) => p.type !== "oneDirection" && rectsCollide(player, p));
        if (wall) {
            onPlayerBlocked(wall);
        }
    }
}
