// Determines which key-handling mode is currently active (title/gallery/levelStats/pause/
// gameplay) and dispatches global toggles (debug/fullscreen) that fire regardless
// of mode. Concrete per-mode key handling stays with the caller.
export class InputRouter {
    constructor(
        keysMap,
        titleScreenController,
        galleryController,
        levelStatsController,
        pauseController
    ) {
        this.keysMap = keysMap;
        this.titleScreenController = titleScreenController;
        this.galleryController = galleryController;
        this.levelStatsController = levelStatsController;
        this.pauseController = pauseController;
    }

    currentMode() {
        if (this.titleScreenController.active) {
            return "title";
        }
        if (this.galleryController.active) {
            return "gallery";
        }
        if (this.levelStatsController.active) {
            return "levelStats";
        }
        if (this.pauseController.isPaused) {
            return "pause";
        }
        return "gameplay";
    }

    handleGlobalToggles(e, onToggleDebug, onToggleFullscreen) {
        if (e.code === this.keysMap.debugToggle && !e.repeat) {
            onToggleDebug();
        }
        if (e.code === this.keysMap.fullscreen && !e.repeat) {
            onToggleFullscreen();
        }
    }
}
