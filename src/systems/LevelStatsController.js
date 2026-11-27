// Owns the "level statistics screen is open" mode flag. Like the artifact gallery, the screen
// is static and drawn on top of the frozen game frame, so there is nothing else to keep.
export class LevelStatsController {
    constructor() {
        this.active = false;
    }

    activate() {
        this.active = true;
    }

    deactivate() {
        this.active = false;
    }
}
