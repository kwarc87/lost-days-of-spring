import { rectsCollide } from "../utils/collision.js";

// Owns transient on-screen messages: hitbox-triggered/timed hints and artifact pickup popups.
export class MessageController {
    constructor() {
        this.messages = [];
        this.activeMessage = null;
        this.messageShownAt = null;
        this.messagePending = null;
        this.messagePendingAt = null;
        this.activeArtifactMessage = null;
        this.artifactMessageShownAt = null;
        this.activeArtifactSource = null;
    }

    setMessages(messages) {
        this.messages = messages ?? [];
        this.activeMessage = null;
        this.messageShownAt = null;
        this.messagePending = null;
        this.messagePendingAt = null;
        this.activeArtifactMessage = null;
        this.artifactMessageShownAt = null;
        this.activeArtifactSource = null;
    }

    getMessages() {
        return this.messages;
    }

    // Marks messages already shown in a restored checkpoint memento.
    restoreShown(shownMessageIds) {
        if (!shownMessageIds) {
            return;
        }
        for (const msg of this.messages) {
            if (shownMessageIds.has(msg.id)) {
                msg.shown = true;
            }
        }
    }

    getActiveMessage() {
        return this.activeMessage;
    }

    getActiveArtifactMessage() {
        return this.activeArtifactMessage;
    }

    getActiveArtifactSource() {
        return this.activeArtifactSource;
    }

    showWeaponMessage(message, now) {
        this.activeMessage = message;
        this.messageShownAt = now;
    }

    showArtifactMessage(message, source, now) {
        this.activeArtifactMessage = message;
        this.artifactMessageShownAt = now;
        this.activeArtifactSource = source;
    }

    adjustForPause(pauseDuration) {
        if (this.messageShownAt) {
            this.messageShownAt += pauseDuration;
        }
        if (this.artifactMessageShownAt) {
            this.artifactMessageShownAt += pauseDuration;
        }
        if (this.messagePendingAt) {
            this.messagePendingAt += pauseDuration;
        }
    }

    updateArtifactMessage(now) {
        if (!this.activeArtifactMessage || this.artifactMessageShownAt === null) {
            return;
        }
        if (now - this.artifactMessageShownAt >= this.activeArtifactMessage.displayTime) {
            this.activeArtifactMessage = null;
            this.artifactMessageShownAt = null;
            this.activeArtifactSource = null;
        }
    }

    updateMessages(now, player) {
        // State machine with two tracks:
        // TIMED: activeMessage has displayTime — shown for a fixed duration, then auto-dismissed.
        //   - while timer runs: only new (different) hit dismisses current and falls through to PROXIMITY
        //   - on expiry: mark shown, clear, return
        // PROXIMITY: no displayTime — shown while player is inside hitbox, with optional entry delay.
        //   - messagePending tracks the current candidate; delay starts on first entry
        //   - activeMessage is set once delay elapses
        const hit =
            this.messages.find((message) => {
                if (message.strategy === "single" && message.shown) {
                    return false;
                }
                return rectsCollide(player, message);
            }) ?? null;

        if (this.activeMessage?.displayTime && this.messageShownAt !== null) {
            if (hit && hit !== this.activeMessage) {
                // New message triggered — dismiss current and fall through to delay handling.
                this.activeMessage.shown = true;
                this.activeMessage = null;
                this.messageShownAt = null;
                // Do NOT return — fall through so the pending/delay system processes the new hit.
            } else if (now - this.messageShownAt < this.activeMessage.displayTime) {
                return;
            } else {
                // Timer expired — mark shown and clear.
                this.activeMessage.shown = true;
                this.activeMessage = null;
                this.messageShownAt = null;
                return;
            }
        }

        if (this.activeMessage && !hit) {
            // player just left the hitbox (no displayTime)
            this.activeMessage.shown = true;
        }

        // Track when the player first entered the current message hitbox
        if (hit !== this.messagePending) {
            this.messagePending = hit;
            this.messagePendingAt = hit ? now : null;
        }

        const wasActive = this.activeMessage === hit;
        if (hit && now - this.messagePendingAt >= (hit.delay ?? 0)) {
            this.activeMessage = hit;
            if (hit.displayTime && !wasActive) {
                this.messageShownAt = now;
            }
        } else {
            this.activeMessage = null;
            this.messageShownAt = null;
        }
    }
}
