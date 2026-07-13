import { DefaultCollectibleRenderer } from "./CollectibleRenderers.js";
import { MessageRenderer } from "./MessageRenderer.js";
import { MESSAGES } from "../messages.js";

const COLLECTED_OK_COLOR = "#72eb84";

export const DefaultHubRenderer = {
    draw(
        ctx,
        canvas,
        player,
        currentLevelCollectiblesCount,
        currentLevelSplintersCount,
        hasEnoughCoins,
        hasEnoughSplinters,
        currentLevelArtifactsCount,
        hasEnoughArtifacts,
    ) {
        const collected = player.coinsCount;
        const total = currentLevelCollectiblesCount;

        ctx.save();

        // ── Hearts panel (top-left) ──────────────────────────────────────────
        const life = player.life ?? 0;
        const maxLife = player.maxLife ?? 6;
        const heartW = 32; // 8px × HEART_SCALE 4
        const heartH = 32;
        const heartGap = 8;
        const heartPadX = 14;
        const heartPadY = 10;
        const heartsPanelW =
            heartPadX * 2 + maxLife * heartW + (maxLife - 1) * heartGap;
        const heartsPanelH = heartPadY * 2 + heartH;
        const heartsPanelX = 12;
        const heartsPanelY = 12;

        MessageRenderer.drawBackground(
            ctx,
            heartsPanelX,
            heartsPanelY,
            heartsPanelW,
            heartsPanelH,
            { color: "#3b1158", width: 2, steps: 3 },
            "#3b1158",
        );

        for (let i = 0; i < maxLife; i++) {
            const hx = heartsPanelX + heartPadX + i * (heartW + heartGap);
            const hy = heartsPanelY + heartPadY;
            ctx.globalAlpha = i < life ? 1 : 0.25;
            DefaultCollectibleRenderer.drawHeart(
                ctx,
                { x: hx, y: hy, id: 0, w: heartW, h: heartH },
                false,
                0,
            );
        }
        ctx.globalAlpha = 1;

        // ── Player name ───────────────────────────────────────────────────────
        ctx.font = `500 24px "Silkscreen", monospace`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const nameX = heartsPanelX + heartsPanelW + 12;
        const nameY = Math.round(heartsPanelY + heartsPanelH / 2);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        ctx.lineJoin = "miter";
        ctx.strokeText("COLIN LA MEHR", nameX, nameY);
        ctx.fillStyle = "#f0cc8b";
        ctx.fillText("COLIN LA MEHR", nameX, nameY);
        // ────────────────────────────────────────────────────────────────────

        // ── Coin + splinter panel (top-right) ────────────────────────────────
        const ICON_SIZE = 48;
        const panelPadX = 14;
        const panelPadY = 14;

        ctx.font = `24px "Silkscreen", monospace`;

        const coinTextW = Math.ceil(
            ctx.measureText(`${total} / ${total}`).width,
        );
        const splinterTextW = Math.ceil(
            ctx.measureText(
                `${currentLevelSplintersCount} / ${currentLevelSplintersCount}`,
            ).width,
        );
        const artifactTextW = Math.ceil(
            ctx.measureText(
                `${currentLevelArtifactsCount} / ${currentLevelArtifactsCount}`,
            ).width,
        );
        const hasArtifacts = (currentLevelArtifactsCount ?? 0) > 0;
        const rowW = Math.max(
            ICON_SIZE + 8 + coinTextW,
            ICON_SIZE + 8 + splinterTextW,
            ...(hasArtifacts ? [ICON_SIZE + 8 + artifactTextW] : []),
        );
        const rowGap = 12;
        const boxW = panelPadX * 2 + rowW;
        const boxH = hasArtifacts
            ? panelPadY * 2 +
              ICON_SIZE +
              rowGap +
              ICON_SIZE +
              rowGap +
              ICON_SIZE
            : panelPadY * 2 + ICON_SIZE + rowGap + ICON_SIZE;
        const boxX = Math.round(canvas.width - boxW - 12);
        const boxY = 12;

        MessageRenderer.drawBackground(
            ctx,
            boxX,
            boxY,
            boxW,
            boxH,
            { color: "#3b1158", width: 2, steps: 3 },
            "#3b1158",
        );

        ctx.textBaseline = "middle";
        const textRightX = boxX + boxW - panelPadX;
        const iconX = boxX + panelPadX;

        // Coin row
        const coinIconY = boxY + panelPadY;
        DefaultCollectibleRenderer.drawCoin(ctx, {
            x: iconX,
            y: coinIconY,
            w: ICON_SIZE,
            h: ICON_SIZE,
        });
        const coinSuffix = ` / ${total}`;
        ctx.textAlign = "right";
        ctx.fillStyle = "#f0cc8b";
        ctx.fillText(coinSuffix, textRightX, coinIconY + ICON_SIZE / 2);
        ctx.fillStyle = hasEnoughCoins
            ? COLLECTED_OK_COLOR
            : MESSAGES.STATS.ENEMIES_COLOR;
        ctx.fillText(
            String(collected),
            textRightX - ctx.measureText(coinSuffix).width,
            coinIconY + ICON_SIZE / 2,
        );

        // Splinter row
        const splinterIconY = coinIconY + ICON_SIZE + rowGap;
        DefaultCollectibleRenderer.drawSplinter(ctx, {
            x: iconX,
            y: splinterIconY,
        });
        ctx.fillStyle = "#f0cc8b";
        const splinterSuffix = ` / ${currentLevelSplintersCount ?? 0}`;
        ctx.fillText(splinterSuffix, textRightX, splinterIconY + ICON_SIZE / 2);
        ctx.fillStyle = hasEnoughSplinters
            ? COLLECTED_OK_COLOR
            : MESSAGES.STATS.ENEMIES_COLOR;
        ctx.fillText(
            String(player.splintersCount ?? 0),
            textRightX - ctx.measureText(splinterSuffix).width,
            splinterIconY + ICON_SIZE / 2,
        );

        // Artifact row
        const artifactIconY = splinterIconY + ICON_SIZE + rowGap;
        if (currentLevelArtifactsCount > 0) {
            DefaultCollectibleRenderer.drawArtifact(
                ctx,
                {
                    x: iconX,
                    y: artifactIconY,
                    cordX: 400,
                    cordY: 48,
                },
                false,
                0,
            );
            ctx.fillStyle = "#f0cc8b";
            const artifactSuffix = ` / ${currentLevelArtifactsCount ?? 0}`;
            ctx.fillText(
                artifactSuffix,
                textRightX,
                artifactIconY + ICON_SIZE / 2,
            );
            ctx.fillStyle = hasEnoughArtifacts
                ? COLLECTED_OK_COLOR
                : MESSAGES.STATS.ENEMIES_COLOR;
            ctx.fillText(
                String(player.artifactsCount ?? 0),
                textRightX - ctx.measureText(artifactSuffix).width,
                artifactIconY + ICON_SIZE / 2,
            );
        }

        ctx.restore();
    },
};
