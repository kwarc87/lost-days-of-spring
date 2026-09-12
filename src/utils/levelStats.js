// Pure time/stat calculations shared by the level-complete, game-over, and pause-menu HUD.
export function computePlayTimeMs(now, levelStartAt, totalPausedTime, accumulatedPlayTime) {
    return now - levelStartAt - totalPausedTime + accumulatedPlayTime;
}

// context: { player, enemies, currentLevelCoinsCount, currentLevelSplintersCount,
// currentLevelArtifactsCount, currentLevelEnemiesCount, levelStartAt, totalPausedTime,
// accumulatedPlayTime, deathCount }
export function buildLevelStats(completedAt, context) {
    const {
        player,
        enemies,
        currentLevelCoinsCount,
        currentLevelSplintersCount,
        currentLevelArtifactsCount,
        currentLevelEnemiesCount,
        levelStartAt,
        totalPausedTime,
        accumulatedPlayTime,
        deathCount,
    } = context;

    return {
        coinsCount: player.coinsCount,
        currentLevelCoinsCount,
        splintersCount: player.splintersCount,
        currentLevelSplintersCount,
        enemiesDefeated: enemies.filter((e) => e.dead || e.dying).length,
        currentLevelEnemiesCount,
        playTimeMs: computePlayTimeMs(
            completedAt,
            levelStartAt,
            totalPausedTime,
            accumulatedPlayTime
        ),
        deathCount,
        artifactsCount: player.artifactsCount,
        currentLevelArtifactsCount,
    };
}
