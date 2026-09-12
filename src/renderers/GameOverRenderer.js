import { drawStatsPanel } from "./StatsPanelRenderer.js";
import { MESSAGES } from "../messages.js";

export const DefaultGameOverRenderer = {
    draw(
        ctx,
        canvas,
        coinsCount,
        totalCoins,
        splintersCount,
        totalSplinters,
        enemiesCount,
        totalEnemies,
        remaining,
        playTime,
        deathCount,
        artifactsCount,
        totalArtifacts
    ) {
        drawStatsPanel(ctx, canvas, {
            title: MESSAGES.GAME_OVER.TITLE,
            titleColor: MESSAGES.GAME_OVER.TITLE_COLOR,
            subtitle: MESSAGES.GAME_OVER.SUBTITLE,
            subtitle2: MESSAGES.GAME_OVER.SUBTITLE2,
            subtitleColor: MESSAGES.GAME_OVER.SUBTITLE_COLOR,
            coinsCount,
            totalCoins,
            splintersCount,
            totalSplinters,
            artifactsCount,
            totalArtifacts,
            enemiesCount,
            totalEnemies,
            playTime,
            deathsText: MESSAGES.GAME_OVER.DEATHS_TEXT(deathCount),
            deathsColor: MESSAGES.GAME_OVER.DEATHS_COLOR,
            extraRowText: MESSAGES.STATS.COUNTDOWN_TEXT(remaining),
            extraRowColor: MESSAGES.STATS.COUNTDOWN_COLOR,
        });
    },
};
