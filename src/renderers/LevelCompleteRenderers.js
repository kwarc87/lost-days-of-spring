import { drawStatsPanel } from "./StatsPanelRenderer.js";
import { MESSAGES } from "../messages.js";

export const DefaultLevelCompleteRenderer = {
    draw: (
        ctx,
        canvas,
        coinsCount,
        totalCoins,
        splintersCount,
        totalSplinters,
        enemiesCount,
        totalEnemies,
        playTime,
        deathCount,
        artifactsCount,
        totalArtifacts
    ) => {
        drawStatsPanel(ctx, canvas, {
            title: MESSAGES.LEVEL_COMPLETE.TITLE,
            titleColor: MESSAGES.LEVEL_COMPLETE.TITLE_COLOR,
            subtitle: MESSAGES.LEVEL_COMPLETE.SUBTITLE,
            subtitle2: MESSAGES.LEVEL_COMPLETE.SUBTITLE2,
            subtitleColor: MESSAGES.LEVEL_COMPLETE.SUBTITLE_COLOR,
            coinsCount,
            totalCoins,
            splintersCount,
            totalSplinters,
            artifactsCount,
            totalArtifacts,
            enemiesCount,
            totalEnemies,
            playTime,
            deathsText: MESSAGES.LEVEL_COMPLETE.DEATHS_TEXT(deathCount),
            deathsColor: MESSAGES.LEVEL_COMPLETE.DEATHS_COLOR,
            extraRowText: MESSAGES.LEVEL_COMPLETE.RESTART_HINT.text,
            extraRowColor: MESSAGES.LEVEL_COMPLETE.RESTART_HINT.color,
        });
    },
};
