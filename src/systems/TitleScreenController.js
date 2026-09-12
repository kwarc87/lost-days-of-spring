// Owns the title screen "mode" flag and its enter-key fade-out transition.
export class TitleScreenController {
    constructor() {
        this.active = true;
        this.fadeOut = { active: false, pending: false, startTime: 0, duration: 750 };
    }

    requestFadeOut() {
        this.fadeOut.pending = true;
    }

    // Advances the fade-out transition. Returns null while idle, otherwise
    // { progress, justFinished } — on justFinished the title mode is deactivated.
    update(now) {
        if (this.fadeOut.pending) {
            this.fadeOut.active = true;
            this.fadeOut.startTime = now;
            this.fadeOut.pending = false;
        }
        if (!this.fadeOut.active) {
            return null;
        }
        const elapsed = now - this.fadeOut.startTime;
        const progress = Math.min(elapsed / this.fadeOut.duration, 1);
        const justFinished = progress >= 1;
        if (justFinished) {
            this.fadeOut.active = false;
            this.active = false;
        }
        return { progress, justFinished };
    }
}
