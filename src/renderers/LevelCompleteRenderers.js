import { drawStatsPanel } from "./StatsPanelRenderer.js";
import { MESSAGES } from "../messages.js";

export const DefaultLevelCompleteRenderer = {
    // stats: result of buildLevelStats() — see src/utils/levelStats.js
    draw: (ctx, canvas, stats) => {
        drawStatsPanel(ctx, canvas, {
            title: MESSAGES.LEVEL_COMPLETE.TITLE,
            titleColor: MESSAGES.LEVEL_COMPLETE.TITLE_COLOR,
            subtitle: MESSAGES.LEVEL_COMPLETE.SUBTITLE,
            subtitle2: MESSAGES.LEVEL_COMPLETE.SUBTITLE2,
            subtitleColor: MESSAGES.LEVEL_COMPLETE.SUBTITLE_COLOR,
            coinsCount: stats.coinsCount,
            totalCoins: stats.currentLevelCoinsCount,
            splintersCount: stats.splintersCount,
            totalSplinters: stats.currentLevelSplintersCount,
            artifactsCount: stats.artifactsCount,
            totalArtifacts: stats.currentLevelArtifactsCount,
            enemiesCount: stats.enemiesDefeated,
            totalEnemies: stats.currentLevelEnemiesCount,
            playTime: stats.playTimeMs,
            deathsText: MESSAGES.LEVEL_COMPLETE.DEATHS_TEXT(stats.deathCount),
            deathsColor: MESSAGES.LEVEL_COMPLETE.DEATHS_COLOR,
            extraRowText: MESSAGES.LEVEL_COMPLETE.RESTART_HINT.text,
            extraRowColor: MESSAGES.LEVEL_COMPLETE.RESTART_HINT.color,
        });
    },
};
