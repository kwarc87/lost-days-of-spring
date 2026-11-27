import { ProgressStorage } from "../services/ProgressStorage.js";

// Owns the story progress (current level + results of completed levels) and
// persists it through ProgressStorage. Counterpart of CheckpointManager, which
// owns the state *inside* a single level.
export class ProgressManager {
    constructor() {
        this.progress = ProgressStorage.load();
    }

    getCurrentLevelId() {
        return this.progress.currentLevelId;
    }

    hasProgress() {
        return Object.keys(this.progress.completedLevels).length > 0;
    }

    // State the player carries into the level, or null when this level has no carried state
    // (e.g. it is played outside the story order) and its preconditions apply instead.
    getLoadoutFor(levelId) {
        return levelId === this.progress.currentLevelId ? (this.progress.loadout ?? null) : null;
    }

    // stats: result of buildLevelStats(). nextLevelId is null when there is no next
    // story level (last level or a bonus level) — the current level and loadout then stay unchanged.
    // nextLevelLoadout: { maxLife, weapon } the player takes into the next level.
    recordLevelCompleted(levelId, stats, nextLevelId, nextLevelLoadout) {
        this.progress.completedLevels[levelId] = {
            completedAt: new Date().toISOString(),
            playTimeMs: stats.playTimeMs,
            deathCount: stats.deathCount,
            coins: { collected: stats.coinsCount, total: stats.currentLevelCoinsCount },
            splinters: { collected: stats.splintersCount, total: stats.currentLevelSplintersCount },
            artifacts: {
                collected: stats.artifactsCount,
                total: stats.currentLevelArtifactsCount,
                ids: stats.collectedArtifactIds,
            },
            enemies: { defeated: stats.enemiesDefeated, total: stats.currentLevelEnemiesCount },
        };
        if (nextLevelId !== null) {
            this.progress.currentLevelId = nextLevelId;
            this.progress.loadout = structuredClone(nextLevelLoadout);
        }
        ProgressStorage.save(this.progress);
    }

    reset() {
        ProgressStorage.clear();
        this.progress = ProgressStorage.load();
    }
}
