import { drawStatsPanel } from "./StatsPanelRenderer.js";
import { MESSAGES } from "../messages.js";

export const DefaultGameOverRenderer = {
    // stats: result of buildLevelStats() — see src/utils/levelStats.js
    draw(ctx, canvas, stats, remaining) {
        drawStatsPanel(ctx, canvas, {
            title: MESSAGES.GAME_OVER.TITLE,
            titleColor: MESSAGES.GAME_OVER.TITLE_COLOR,
            subtitle: MESSAGES.GAME_OVER.SUBTITLE,
            subtitle2: MESSAGES.GAME_OVER.SUBTITLE2,
            subtitleColor: MESSAGES.GAME_OVER.SUBTITLE_COLOR,
            coinsCount: stats.coinsCount,
            totalCoins: stats.currentLevelCoinsCount,
            splintersCount: stats.splintersCount,
            totalSplinters: stats.currentLevelSplintersCount,
            artifactsCount: stats.artifactsCount,
            totalArtifacts: stats.currentLevelArtifactsCount,
            enemiesCount: stats.enemiesDefeated,
            totalEnemies: stats.currentLevelEnemiesCount,
            playTime: stats.playTimeMs,
            deathsText: MESSAGES.GAME_OVER.DEATHS_TEXT(stats.deathCount),
            deathsColor: MESSAGES.GAME_OVER.DEATHS_COLOR,
            extraRowText: MESSAGES.STATS.COUNTDOWN_TEXT(remaining),
            extraRowColor: MESSAGES.STATS.COUNTDOWN_COLOR,
        });
    },
};
