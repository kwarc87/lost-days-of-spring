import { MessageRenderer } from "./MessageRenderer.js";
import { MESSAGES, formatPlayTime } from "../messages.js";

const PAD_X = 32;
const PAD_Y = 24;
const TITLE_H = 32;
const LINE_H = 18;
const ROW_GAP = 14;
const SECTION_GAP = 24;
const COLUMN_GAP = 40;
const TITLE_FONT = `normal 24px "Silkscreen", monospace`;
const BODY_FONT = `normal 18px "Silkscreen", monospace`;

const fraction = (part, total) => `${part} / ${total}`;

// One entry per table column; `format` turns a saved level record (see ProgressManager)
// into the cell text.
const COLUMNS = [
    {
        header: "Level",
        color: MESSAGES.LEVEL_STATS.NAME_COLOR,
        format: (levelId) => MESSAGES.LEVEL_STATS.LEVEL_NAME(levelId),
    },
    {
        header: "Time",
        color: MESSAGES.STATS.TIME_COLOR,
        format: (_levelId, record) => formatPlayTime(record.playTimeMs),
    },
    {
        header: "Deaths",
        color: MESSAGES.LEVEL_COMPLETE.DEATHS_COLOR,
        format: (_levelId, record) => String(record.deathCount),
    },
    {
        header: "Coins",
        color: MESSAGES.STATS.COINS_COLOR,
        format: (_levelId, record) => fraction(record.coins.collected, record.coins.total),
    },
    {
        header: "Splinters",
        color: MESSAGES.STATS.SPLINTERS_COLOR,
        format: (_levelId, record) => fraction(record.splinters.collected, record.splinters.total),
    },
    {
        header: "Artifacts",
        color: MESSAGES.STATS.ARTIFACTS_COLOR,
        format: (_levelId, record) => fraction(record.artifacts.collected, record.artifacts.total),
    },
    {
        header: "Enemies",
        color: MESSAGES.STATS.ENEMIES_COLOR,
        format: (_levelId, record) => fraction(record.enemies.defeated, record.enemies.total),
    },
];

export const LevelStatsRenderer = {
    // completedLevels: levelId -> record, as stored in the story progress.
    // Static screen: draw it once on top of the frozen game frame.
    draw(ctx, canvas, completedLevels) {
        const w = canvas.width;
        const h = canvas.height;
        const entries = Object.entries(completedLevels);
        const hasRows = entries.length > 0;
        const { TITLE, TITLE_COLOR, HEADER_COLOR, EMPTY_TEXT, CLOSE_HINT } = MESSAGES.LEVEL_STATS;

        ctx.save();

        const rows = entries.map(([levelId, record]) =>
            COLUMNS.map((column) => column.format(levelId, record))
        );

        ctx.font = BODY_FONT;
        const columnWidths = COLUMNS.map((column, i) =>
            Math.ceil(
                Math.max(
                    ctx.measureText(column.header).width,
                    ...rows.map((row) => ctx.measureText(row[i]).width)
                )
            )
        );
        const tableW =
            columnWidths.reduce((sum, cw) => sum + cw, 0) + COLUMN_GAP * (COLUMNS.length - 1);
        const hintW = Math.ceil(ctx.measureText(CLOSE_HINT).width);
        const emptyW = Math.ceil(ctx.measureText(EMPTY_TEXT).width);
        ctx.font = TITLE_FONT;
        const titleW = Math.ceil(ctx.measureText(TITLE).width);

        const contentW = Math.max(hasRows ? tableW : emptyW, titleW, hintW);
        const headerAndRowsH = LINE_H + (ROW_GAP + LINE_H) * rows.length;
        const panelW = contentW + PAD_X * 2;
        const panelH =
            PAD_Y +
            TITLE_H +
            SECTION_GAP +
            (hasRows ? headerAndRowsH : LINE_H) +
            SECTION_GAP +
            LINE_H +
            PAD_Y;
        const panelX = Math.round((w - panelW) / 2);
        const panelY = Math.round((h - panelH) / 2);

        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(0, 0, w, h);
        MessageRenderer.drawBackground(
            ctx,
            panelX,
            panelY,
            panelW,
            panelH,
            { color: "#fff", width: 2, steps: 3 },
            "#3b1158"
        );

        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.font = TITLE_FONT;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillText(TITLE, w / 2 + 1, panelY + PAD_Y + 1);
        ctx.fillStyle = TITLE_COLOR;
        ctx.fillText(TITLE, w / 2, panelY + PAD_Y);

        ctx.font = BODY_FONT;
        const bodyY = panelY + PAD_Y + TITLE_H + SECTION_GAP;

        if (hasRows) {
            ctx.textAlign = "left";
            let columnX = Math.round((w - tableW) / 2);
            COLUMNS.forEach((column, i) => {
                ctx.fillStyle = HEADER_COLOR;
                ctx.fillText(column.header, columnX, bodyY);
                ctx.fillStyle = column.color;
                rows.forEach((row, rowIndex) => {
                    const rowY = bodyY + (LINE_H + ROW_GAP) * (rowIndex + 1);
                    ctx.fillText(row[i], columnX, rowY);
                });
                columnX += columnWidths[i] + COLUMN_GAP;
            });
        } else {
            ctx.fillStyle = HEADER_COLOR;
            ctx.fillText(EMPTY_TEXT, w / 2, bodyY);
        }

        ctx.textAlign = "center";
        ctx.fillStyle = HEADER_COLOR;
        ctx.fillText(CLOSE_HINT, w / 2, panelY + panelH - PAD_Y - LINE_H);

        ctx.restore();
    },
};
